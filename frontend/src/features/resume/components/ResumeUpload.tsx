"use client";

import { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface ResumeUploadProps {
    onUploadComplete: (keywords: string[]) => void;
}

export default function ResumeUpload({ onUploadComplete }: ResumeUploadProps) {
    const [dragging, setDragging] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragging(false);
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
        if (!file) return;

        setUploading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            // Use env var for API URL, fallback to localhost for dev
            const API_URL = process.env.NEXT_PUBLIC_RESUME_PARSER_URL || 'http://localhost:8000';

            const response = await fetch(`${API_URL}/api/parser`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to parse resume');
            }

            const data = await response.json();

            // Extract keywords from the response
            // The response structure from main.py is: { resume: {}, score: {}, keywords: [] }
            // or sometimes it might be just { ... } depending on the implementation details we saw earlier.
            // Looking at main.py lines 208: "keywords": keywords

            if (data.keywords && Array.isArray(data.keywords)) {
                onUploadComplete(data.keywords);
            } else {
                // Fallback if keywords aren't directly there, though they should be based on the code I read
                setError('Could not extract keywords from resume.');
            }

        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Error communicating with parser service. Make sure it is running on port 8000.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto bg-white/5 rounded-xl border border-white/10 p-6">
            <h3 className="text-xl font-semibold mb-4 text-white">Upload Resume</h3>

            <div
                className={`
                    border-2 border-dashed rounded-lg p-8 text-center transition-colors
                    ${dragging ? 'border-blue-500 bg-blue-500/10' : 'border-white/20 hover:border-white/40'}
                    ${error ? 'border-red-500/50' : ''}
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
                />

                {!file ? (
                    <label htmlFor="resume-upload" className="cursor-pointer flex flex-col items-center gap-3">
                        <Upload size={32} className="text-gray-400" />
                        <p className="text-sm text-gray-300">
                            Drag & drop your resume (PDF) here, or <span className="text-blue-400 underline">browse</span>
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

            <button
                onClick={handleUpload}
                disabled={!file || uploading}
                className={`
                    mt-4 w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all
                    ${!file || uploading
                        ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20'}
                `}
            >
                {uploading ? (
                    <>
                        <Loader2 size={18} className="animate-spin" />
                        Analyzing...
                    </>
                ) : (
                    <>
                        Match with Jobs
                        <CheckCircle size={18} />
                    </>
                )}
            </button>
        </div>
    );
}
