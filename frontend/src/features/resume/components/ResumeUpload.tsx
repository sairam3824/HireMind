"use client";

import { useState, useEffect, useCallback } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import Link from 'next/link';

export interface ResumeAnalysisResult {
    resume: {
        profile: {
            name?: string;
            email?: string;
            phone?: string;
            location?: string;
        };
        text: string;
    };
    score: {
        totalScore: number;
        breakdown: {
            contactInfo: number;
            structure: number;
            experience: number;
            keywords: number;
            impact: number;
        };
        feedback: string[];
    };
    keywords: string[];
    softSkills?: string[];
    predictedRoles?: string[];
}

interface ResumeUploadProps {
    onUploadComplete: (result: ResumeAnalysisResult) => void;
}

interface ResumeScore {
    id: string;
    resume_name: string;
    total_score: number;
    created_at: string;
    score_details: any;
}

export default function ResumeUpload({ onUploadComplete }: ResumeUploadProps) {
    const { user, loading: authLoading } = useAuth();
    const [dragging, setDragging] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [statusMessage, setStatusMessage] = useState<string>("");
    const [canUpload, setCanUpload] = useState(true);
    const [checkingEligibility, setCheckingEligibility] = useState(true);
    const [scoreHistory, setScoreHistory] = useState<ResumeScore[]>([]);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [usageCount, setUsageCount] = useState<number>(0);



    const checkEligibility = useCallback(async () => {
        if (!user) return;
        try {
            // Get profile with last upload timestamp
            const { data: profile } = await supabase
                .from('profiles')
                .select('role, last_resume_upload_at')
                .eq('id', user.id)
                .single();

            const role = profile?.role || 'user';
            setUserRole(role);

            // Check if last upload was today
            const lastUpload = profile?.last_resume_upload_at;

            if (!lastUpload) {
                // Never uploaded before - allow
                setCanUpload(true);
                setError(null);
            } else {
                // Check if last upload was today
                const lastUploadDate = new Date(lastUpload).toDateString();
                const today = new Date().toDateString();

                if (lastUploadDate === today) {
                    // Already uploaded today - block
                    setCanUpload(false);
                    setError(`Daily limit reached. Come back tomorrow!`);
                } else {
                    // Last upload was on a different day - allow
                    setCanUpload(true);
                    setError(null);
                }
            }
        } catch (err) {
            console.error("Error checking upload eligibility:", err);
        } finally {
            setCheckingEligibility(false);
        }
    }, [user]);

    const fetchScoreHistory = useCallback(async () => {
        if (!user) return;
        try {
            const { data, error } = await supabase
                .from('resume_scores')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(3);

            if (data) {
                setScoreHistory(data);
            }
        } catch (err) {
            console.error("Error fetching resume history:", err);
        }
    }, [user]);

    useEffect(() => {
        if (authLoading) return;

        if (user) {
            checkEligibility();
            fetchScoreHistory();
        } else {
            setCheckingEligibility(false);
        }
    }, [user, authLoading, checkEligibility, fetchScoreHistory]);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        if (canUpload) setDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragging(false);

        if (!canUpload) return;

        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile && droppedFile.type === 'application/pdf') {
            setFile(droppedFile);
            setError(null);
        } else {
            setError('Please upload a valid PDF file.');
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile && selectedFile.type === 'application/pdf') {
            setFile(selectedFile);
            setError(null);
        } else {
            setError('Please upload a valid PDF file.');
        }
    };

    const handleUpload = async () => {
        if (!file || !canUpload || !user) return;

        setUploading(true);
        setError(null);
        setStatusMessage("Uploading resume...");

        const formData = new FormData();
        formData.append('file', file);
        formData.append('user_id', user.id); // Send user_id for backend processing

        try {
            let API_URL = process.env.NEXT_PUBLIC_RESUME_PARSER_URL || 'http://localhost:8000';
            // Remove trailing slash
            API_URL = API_URL.replace(/\/$/, '');
            // Remove /api/parser if present (legacy env var fix)
            API_URL = API_URL.replace(/\/api\/parser$/, '');

            setStatusMessage("Analyzing resume with AI... This may take a moment.");

            // Call the synchronous resume parser API
            const response = await fetch(`${API_URL}/api/parser`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to analyze resume');
            }

            const resultData = await response.json();

            // Save score to database
            if (resultData.score?.totalScore) {
                try {
                    // Insert into resume_scores with correct schema
                    await supabase.from('resume_scores').insert({
                        user_id: user.id,
                        resume_name: file.name,
                        total_score: resultData.score.totalScore,
                        score_details: resultData, // Store full result as JSONB
                    });

                    // Update last_resume_upload_at in profiles
                    await supabase
                        .from('profiles')
                        .update({ last_resume_upload_at: new Date().toISOString() })
                        .eq('id', user.id);
                } catch (dbErr) {
                    console.error("Failed to save score to database:", dbErr);
                }
            }

            // Success handling
            console.log("Analysis complete");

            // Re-check eligibility (will disable further uploads)
            checkEligibility();

            // Refresh history to show the new one
            await fetchScoreHistory();

            if (resultData) {
                onUploadComplete(resultData as ResumeAnalysisResult);
            }

        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Error communicating with parser service.');
        } finally {
            setUploading(false);
            setStatusMessage("");
        }
    };

    if (checkingEligibility) {
        return (
            <div className="w-full max-w-md mx-auto bg-white/5 rounded-xl border border-white/10 p-12 flex justify-center">
                <Loader2 size={24} className="animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 w-full max-w-md mx-auto">
            <div className="bg-white/5 rounded-xl border border-white/10 p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-white">Upload Resume</h3>
                </div>

                <div
                    className={`
                        border-2 border-dashed rounded-lg p-8 text-center transition-colors
                        ${dragging ? 'border-blue-500 bg-blue-500/10' : 'border-white/20 hover:border-white/40'}
                        ${error ? 'border-red-500/50' : ''}
                        ${!canUpload ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <input
                        type="file"
                        id="resume-upload"
                        className="hidden"
                        accept=".pdf"
                        onChange={handleFileChange}
                        disabled={!canUpload}
                    />

                    {!file ? (
                        <label htmlFor="resume-upload" className={`cursor-pointer flex flex-col items-center gap-3 ${!canUpload ? 'pointer-events-none' : ''}`}>
                            <Upload size={32} className="text-gray-400" />
                            <p className="text-sm text-gray-300">
                                {canUpload
                                    ? <>Drag & drop your resume (PDF) here, or <span className="text-blue-400 underline">browse</span></>
                                    : "Daily upload limit reached"
                                }
                            </p>
                        </label>
                    ) : (
                        <div className="flex flex-col items-center gap-3">
                            <FileText size={32} className="text-blue-400" />
                            <p className="text-sm text-white font-medium">{file.name}</p>
                            <button
                                onClick={() => setFile(null)}
                                className="text-xs text-red-400 hover:text-red-300"
                                disabled={uploading}
                            >
                                Remove file
                            </button>
                        </div>
                    )}
                </div>

                {error && (
                    <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-200 text-sm">
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}

                {uploading && statusMessage && (
                    <div className="mt-4 text-center text-sm text-blue-300 animate-pulse">
                        {statusMessage}
                    </div>
                )}

                <button
                    onClick={handleUpload}
                    disabled={!file || uploading || !canUpload}
                    className={`
                        mt-4 w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all
                        ${!file || uploading || !canUpload
                            ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20'}
                    `}
                >
                    {uploading ? (
                        <>
                            <Loader2 size={18} className="animate-spin" />
                            Processing...
                        </>
                    ) : (
                        <>
                            Match with Jobs
                            <CheckCircle size={18} />
                        </>
                    )}
                </button>
                {!canUpload && userRole !== 'admin' && (
                    <p className="text-xs text-center text-gray-500 mt-2">
                        {usageCount >= 2 ? "Upgrade to Admin for unlimited uploads." : "Daily upload limit reached."}
                    </p>
                )}
            </div>

            {/* Resume History */}
            {scoreHistory.length > 0 && (
                <div className="bg-white/5 rounded-xl border border-white/10 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-medium text-white flex items-center gap-2">
                            <FileText size={18} className="text-blue-400" />
                            Recent Scans
                        </h4>
                        <Link href="/resume-dashboard" className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors bg-blue-500/10 hover:bg-blue-500/20 px-3 py-1.5 rounded-md border border-blue-500/20">
                            Dashboard
                        </Link>
                    </div>
                    <div className="space-y-3">
                        {scoreHistory.map((score) => {
                            const hasFullDetails = score.score_details && (score.score_details.resume || score.score_details.keywords);

                            return (
                                <div
                                    key={score.id}
                                    onClick={() => onUploadComplete(score.score_details as ResumeAnalysisResult)}
                                    className={`
                                        flex items-center justify-between p-3 rounded-lg border border-white/5 transition-all
                                        bg-white/5 hover:bg-white/10 cursor-pointer hover:border-blue-500/30
                                    `}
                                >
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-medium text-white truncate max-w-[180px]">
                                                {score.resume_name || "Resume"}
                                            </p>
                                        </div>
                                        <p className="text-xs text-gray-400">
                                            {new Date(score.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-baseline gap-2">
                                            <span className={`text-lg font-bold ${score.total_score >= 70 ? 'text-green-400' :
                                                score.total_score >= 40 ? 'text-yellow-400' : 'text-red-400'
                                                }`}>
                                                {score.total_score}
                                            </span>
                                            <span className="text-[10px] text-gray-500 uppercase tracking-wider">Score</span>
                                        </div>
                                        {hasFullDetails && <ArrowRight size={14} className="text-gray-500" />}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
