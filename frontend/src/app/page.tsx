
"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";
import { FileText, ArrowRight, Loader2, CheckCircle, Upload, AlertCircle, Award, Building, Briefcase, Construction } from "lucide-react";
import Modal from "@/components/Modal";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Home() {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [loadingStep, setLoadingStep] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const LOADING_STEPS = [
        "Uploading Resume...",
        "Parsing PDF...",
        "Extracting Text...",
        "Cleaning & Normalizing Data...",
        "Identifying Sections...",
        "Extracting Skills...",
        "Detecting Experience & Projects...",
        "Generating Resume Embeddings...",
        "Matching Skills with Job Roles...",
        "Analyzing ATS Keywords...",
        "Checking Resume Strength...",
        "Predicting Role Fit Score...",
        "Finding Strong-Match Jobs...",
        "Analyzing Career Trends...",
        "Building Skill Gap Report...",
        "Finalizing AI Insights..."
    ];


    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (loading) {
            setLoadingStep(0);
            interval = setInterval(() => {
                setLoadingStep((prev) => {
                    // Once we reach the end, cycle back to "Analyzing Content..." (index 2)
                    // This prevents "Uploading..." (0) and "Parsing PDF..." (1) from showing again
                    if (prev === LOADING_STEPS.length - 1) {
                        return 2;
                    }
                    return prev + 1;
                });
            }, 2000);
        }
        return () => clearInterval(interval);
    }, [loading]);

    const router = useRouter();

    const handleMatchJobs = () => {
        setIsModalOpen(true);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setError(null);
            setResult(null);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append("file", file);

        try {
            // Use environment variable or default to local open-resume instance
            // Note: In production, ensure this URL points to your deployed Render service
            const apiUrl = process.env.NEXT_PUBLIC_RESUME_PARSER_URL || "http://localhost:3000/api/parser";

            const response = await fetch(apiUrl, {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                // Try to get error details from JSON response
                let errorDetails = "Failed to parse resume";
                try {
                    const errorJson = await response.json();
                    if (errorJson.error) errorDetails = errorJson.error;
                    if (errorJson.details) errorDetails += `: ${errorJson.details}`;
                } catch (e) {
                    // Ignore json parse error
                }
                throw new Error(errorDetails);
            }

            const data = await response.json();
            setResult(data);
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : "Failed to connect to the parser service.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <main className={styles.main}>
                <div className={styles.hero}>
                    {/* Left Column: Browse Jobs */}
                    <div className={styles.leftColumn}>
                        <Link href="/jobs" className={styles.sideCard}>
                            <Briefcase size={48} className={styles.cardIcon} />
                            <h2>Browse Jobs</h2>
                            <p>Discover thousands of job opportunities tailored to your skills and preferences.</p>
                            <span className={styles.primaryButton}>
                                Explore Jobs <ArrowRight size={18} />
                            </span>
                        </Link>
                    </div>

                    {/* Center Column: Resume Parser */}
                    <div className={styles.centerColumn}>
                        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                            <div style={{
                                width: '80px', height: '80px', background: 'rgba(37, 99, 235, 0.1)',
                                borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                border: '1px solid rgba(37, 99, 235, 0.2)', margin: '0 auto 1.5rem auto'
                            }}>
                                <FileText size={40} color="var(--primary)" />
                            </div>
                            <h1 style={{ fontSize: 'clamp(2rem, 5vw, 2.5rem)', fontWeight: 800, color: 'white', marginBottom: '1rem' }}>Resume Parser</h1>
                            <p style={{ color: '#a1a1aa', maxWidth: '400px', margin: '0 auto', lineHeight: '1.6' }}>
                                Upload your resume to evaluate its ATS score and match with job opportunities.
                            </p>
                        </div>

                        {!result ? (
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '1.5rem',
                                width: '100%',
                            }}>
                                <input
                                    type="file"
                                    accept=".pdf"
                                    onChange={handleFileChange}
                                    style={{ display: 'none' }}
                                    id="resume-upload"
                                />
                                <label
                                    htmlFor="resume-upload"
                                    style={{
                                        cursor: 'pointer',
                                        padding: '2.5rem 2rem',
                                        border: '2px dashed #3f3f46',
                                        borderRadius: '16px',
                                        width: '100%',
                                        textAlign: 'center',
                                        background: 'rgba(255, 255, 255, 0.02)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '1rem',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    <Upload size={40} className="text-gray-400" />
                                    <span style={{ fontSize: '1.1rem', fontWeight: 500, color: 'white' }}>
                                        {file ? file.name : "Click to Upload Resume (PDF)"}
                                    </span>
                                </label>

                                {file && (
                                    <button
                                        onClick={handleUpload}
                                        disabled={loading}
                                        className={styles.primaryButton}
                                        style={{ width: '100%', justifyContent: 'center' }}
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className={styles.spinner} /> {LOADING_STEPS[loadingStep]}
                                            </>
                                        ) : (
                                            "Analyze Resume"
                                        )}
                                    </button>
                                )}

                                {loading && (
                                    <p style={{ fontSize: '0.9rem', color: '#e4e4e7', textAlign: 'center', marginTop: '0.5rem', opacity: 0.9 }}>
                                        Processing your resume… Results may take up to 2 minutes. (Beta Version)
                                    </p>
                                )}
                                {error && (
                                    <div style={{
                                        color: '#ef4444',
                                        marginTop: '0.5rem',
                                        background: 'rgba(239, 68, 68, 0.1)',
                                        padding: '1rem',
                                        borderRadius: '8px',
                                        fontSize: '0.9rem',
                                        width: '100%',
                                        textAlign: 'center'
                                    }}>
                                        <AlertCircle size={16} style={{ display: 'inline', marginRight: '5px', verticalAlign: 'text-bottom' }} />
                                        {error}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div style={{
                                width: '100%',
                                display: 'grid',
                                gap: '1.5rem',
                            }}>
                                {/* Score Card */}
                                <div style={{
                                    background: '#18181b',
                                    padding: '2rem',
                                    borderRadius: '16px',
                                    border: '1px solid #27272a',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    textAlign: 'center'
                                }}>
                                    <h3 style={{ fontSize: '1.1rem', color: '#a1a1aa', marginBottom: '1rem' }}>ATS Match Score</h3>
                                    <div style={{
                                        width: '120px',
                                        height: '120px',
                                        borderRadius: '50%',
                                        border: `8px solid ${result.score?.totalScore > 70 ? '#22c55e' : result.score?.totalScore > 40 ? '#eab308' : '#ef4444'}`,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: 'bold',
                                        color: '#fff',
                                        marginBottom: '1rem'
                                    }}>
                                        <span style={{ fontSize: '2.5rem', lineHeight: '1' }}>{result.score?.totalScore || 0}</span>
                                        <span style={{ fontSize: '0.8rem', color: '#a1a1aa', marginTop: '4px' }}>± 5</span>
                                    </div>
                                    <p style={{ fontSize: '0.9rem', color: '#71717a' }}>
                                        {result.score?.totalScore > 70 ? 'Excellent! Your resume is well-optimized.' :
                                            result.score?.totalScore > 40 ? 'Good start, but needs improvement.' : 'Needs significant updates.'}
                                    </p>
                                </div>

                                {/* Details Card */}
                                <div style={{
                                    background: '#18181b',
                                    padding: '1.5rem',
                                    borderRadius: '16px',
                                    border: '1px solid #27272a'
                                }}>
                                    <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        <Award size={20} className="text-blue-400" /> Score Breakdown
                                    </h3>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        {result.score?.breakdown && Object.entries(result.score.breakdown).map(([key, value]) => (
                                            <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                                <span style={{ textTransform: 'capitalize', color: '#d4d4d8' }}>
                                                    {key.replace(/([A-Z])/g, ' $1').trim()}
                                                </span>
                                                <span style={{ fontWeight: 'bold', color: (value as number) > 0 ? '#4ade80' : '#71717a' }}>
                                                    +{value as number} pts
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    {result.score?.feedback && result.score.feedback.length > 0 && (
                                        <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #27272a' }}>
                                            <h4 style={{ fontSize: '0.95rem', color: '#f87171', marginBottom: '0.5rem' }}>Improvements Needed:</h4>
                                            <ul style={{ paddingLeft: '1.2rem', color: '#a1a1aa', fontSize: '0.9rem' }}>
                                                {result.score.feedback.map((fb: string, i: number) => (
                                                    <li key={i}>{fb}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                                        <button
                                            onClick={handleMatchJobs}
                                            className={styles.primaryButton}
                                            style={{ flex: 1, justifyContent: 'center', fontSize: '0.9rem', padding: '0.8rem', border: 'none', cursor: 'pointer' }}
                                        >
                                            Match with Jobs
                                        </button>
                                        <button
                                            onClick={() => { setFile(null); setResult(null); }}
                                            style={{
                                                padding: '0.8rem',
                                                borderRadius: '0.5rem',
                                                border: '1px solid #3f3f46',
                                                background: 'transparent',
                                                color: 'white',
                                                cursor: 'pointer',
                                                fontSize: '0.9rem'
                                            }}
                                        >
                                            Reset
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Browse Companies */}
                    <div className={styles.rightColumn}>
                        <Link href="/companies" className={styles.sideCard}>
                            <Building size={48} className={styles.cardIcon} />
                            <h2>Top Compaines</h2>
                            <p>Explore top leading companies and their active job listings in one place.</p>
                            <span className={`${styles.primaryButton} ${styles.secondaryButton}`}>
                                See Companies <ArrowRight size={18} />
                            </span>
                        </Link>
                    </div>
                </div>
            </main>

            <footer className={styles.footer}>
                <div className={styles.footerContent}>
                    <div className={styles.capstone}>
                        Developed as a Capstone Project
                    </div>

                    <div className={styles.centerBlock}>
                        <div className={styles.copy}>
                            &copy; {new Date().getFullYear()} Job Cloud. All rights reserved.
                        </div>
                    </div>

                    <div className={styles.footerLinks}>
                        <Link href="/privacy-policy">Privacy Policy</Link>
                        <Link href="/terms-conditions">Terms & Conditions</Link>
                    </div>
                </div>
            </footer>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{
                        width: '60px',
                        height: '60px',
                        background: 'rgba(234, 179, 8, 0.1)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '1.5rem',
                        color: '#eab308'
                    }}>
                        <Construction size={32} />
                    </div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'white', marginBottom: '0.75rem' }}>
                        Feature Coming Soon
                    </h2>
                    <p style={{ color: '#a1a1aa', fontSize: '1rem', lineHeight: '1.6', marginBottom: '2rem' }}>
                        The AI Job Matching feature is currently under construction. In the meantime, you can browse all available jobs manually.
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
                        <button
                            onClick={() => router.push('/jobs')}
                            className={styles.primaryButton}
                            style={{ flex: 1, justifyContent: 'center', border: 'none', cursor: 'pointer' }}
                        >
                            Browse Jobs
                        </button>
                        <button
                            onClick={() => setIsModalOpen(false)}
                            style={{
                                background: 'transparent',
                                border: '1px solid #3f3f46',
                                color: '#e4e4e7',
                                padding: '0.75rem 1.5rem',
                                borderRadius: '8px',
                                fontWeight: 500,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                flex: 1
                            }}
                        >
                            Close
                        </button>
                    </div>
                </div>
            </Modal>
        </div >
    );
}
