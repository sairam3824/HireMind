"use client";

import { useState, useEffect, Suspense } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
    Briefcase,
    Mail,
    Lock,
    Eye,
    EyeOff,
    ArrowRight,
    ArrowLeft,
    Loader2,
    Sparkles,
    ShieldCheck,
    Zap,
    TrendingUp,
    AlertCircle,
    CheckCircle2,
    X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Footer from "@/components/Footer";
import styles from "../auth.module.css";

function LoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirect = searchParams.get("redirect") || "/";
    const { user, loading: authLoading } = useAuth();

    useEffect(() => {
        if (!authLoading && user) {
            router.replace(redirect);
        }
    }, [user, authLoading, router, redirect]);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Forgot Password Modal State
    const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
    const [forgotEmail, setForgotEmail] = useState("");
    const [forgotLoading, setForgotLoading] = useState(false);
    const [forgotSuccess, setForgotSuccess] = useState(false);
    const [forgotError, setForgotError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email: email.trim(),
                password: password.trim(),
            });

            if (error) {
                setError(error.message);
                setLoading(false);
            } else {
                router.push(redirect);
                router.refresh();
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to sign in. Please try again.";
            setError(message);
            setLoading(false);
        }
    };

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setForgotLoading(true);
        setForgotError(null);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail.trim(), {
                redirectTo: `${window.location.origin}/login`,
            });
            if (error) {
                setForgotError(error.message);
            } else {
                setForgotSuccess(true);
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to send reset email.";
            setForgotError(message);
        } finally {
            setForgotLoading(false);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loader2 className="animate-spin text-blue-500" size={32} />
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.bgMesh} />
            <div className={styles.bgGrid} />

            {/* Top Navigation */}
            <header className={styles.topNav}>
                <Link href="/" className={styles.brandLogo}>
                    <div className={styles.brandIconWrap}>
                        <Briefcase size={20} />
                    </div>
                    <span>HireMind</span>
                </Link>

                <Link href="/" className={styles.backLink}>
                    <ArrowLeft size={16} />
                    <span>Back to Home</span>
                </Link>
            </header>

            {/* Main Auth Section */}
            <main className={styles.contentWrapper}>
                {/* Left Side: Hero / Value Props */}
                <div className={styles.heroShowcase}>
                    <div className={styles.heroBadge}>
                        <Sparkles size={14} />
                        <span>AI-Powered Career Intelligence</span>
                    </div>

                    <div>
                        <h1 className={styles.heroTitle}>
                            Elevate your job search <br />
                            <span className={styles.heroGradientText}>with precision AI.</span>
                        </h1>
                        <p className={styles.heroSubtitle}>
                            Sign in to analyze resumes, track match scores, and unlock tailored tech opportunities from top employers worldwide.
                        </p>
                    </div>

                    <div className={styles.valueProps}>
                        <div className={styles.valueItem}>
                            <div className={styles.valueIconWrap}>
                                <Zap size={18} />
                            </div>
                            <div className={styles.valueText}>
                                <h4>Instant ATS Score & Gap Analysis</h4>
                                <p>Get comprehensive scoring breakdown & actionable feedback within seconds.</p>
                            </div>
                        </div>

                        <div className={styles.valueItem}>
                            <div className={styles.valueIconWrap}>
                                <ShieldCheck size={18} />
                            </div>
                            <div className={styles.valueText}>
                                <h4>Curated Tech Job Board</h4>
                                <p>Discover verified listings filtered by technology, role level, and compensation.</p>
                            </div>
                        </div>

                        <div className={styles.valueItem}>
                            <div className={styles.valueIconWrap}>
                                <TrendingUp size={18} />
                            </div>
                            <div className={styles.valueText}>
                                <h4>Progress & History Tracking</h4>
                                <p>Monitor your resume optimizations over time to maximize your interview conversion rate.</p>
                            </div>
                        </div>
                    </div>

                    <div className={styles.statsRibbon}>
                        <div className={statItemStyle}>
                            <div className={styles.statValue}>98.4%</div>
                            <div className={styles.statLabel}>ATS Accuracy</div>
                        </div>
                        <div className={statItemStyle}>
                            <div className={styles.statValue}>12,000+</div>
                            <div className={styles.statLabel}>Active Tech Roles</div>
                        </div>
                        <div className={statItemStyle}>
                            <div className={styles.statValue}>&lt; 2.5s</div>
                            <div className={styles.statLabel}>AI Scan Speed</div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Auth Card */}
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h2 className={styles.cardTitle}>Welcome back</h2>
                        <p className={styles.cardSubtitle}>
                            Enter your credentials to access your HireMind account
                        </p>
                    </div>

                    <form onSubmit={handleLogin} className={styles.form}>
                        {error && (
                            <div className={styles.alertError}>
                                <AlertCircle size={18} className={styles.alertIcon} />
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Email Field */}
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Email Address</label>
                            <div className={styles.inputWrapper}>
                                <Mail size={18} className={styles.inputIcon} />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={styles.input}
                                    placeholder="name@company.com"
                                    autoComplete="email"
                                    autoCapitalize="none"
                                    autoCorrect="off"
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className={styles.inputGroup}>
                            <div className={styles.labelRow}>
                                <label className={styles.label}>Password</label>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setForgotEmail(email);
                                        setIsForgotModalOpen(true);
                                    }}
                                    className={styles.forgotLink}
                                >
                                    Forgot password?
                                </button>
                            </div>
                            <div className={styles.inputWrapper}>
                                <Lock size={18} className={styles.inputIcon} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={styles.input}
                                    placeholder="••••••••••••"
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    className={styles.passwordToggle}
                                    onClick={() => setShowPassword(!showPassword)}
                                    tabIndex={-1}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Remember Me */}
                        <label className={styles.checkboxGroup}>
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className={styles.checkboxInput}
                            />
                            <span>Keep me signed in on this device</span>
                        </label>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className={styles.submitButton}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin" size={18} />
                                    <span>Signing in...</span>
                                </>
                            ) : (
                                <>
                                    <span>Sign In</span>
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className={styles.cardFooter}>
                        Don&apos;t have an account?
                        <Link href={`/signup?redirect=${encodeURIComponent(redirect)}`} className={styles.authSwitchLink}>
                            Create an account
                        </Link>
                    </div>
                </div>
            </main>

            {/* Forgot Password Modal */}
            {isForgotModalOpen && (
                <div className={styles.modalOverlay} onClick={() => setIsForgotModalOpen(false)}>
                    <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
                        <button
                            className={styles.modalClose}
                            onClick={() => setIsForgotModalOpen(false)}
                            aria-label="Close"
                        >
                            <X size={20} />
                        </button>

                        <h3 className={styles.cardTitle} style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>
                            Reset your password
                        </h3>
                        <p className={styles.cardSubtitle} style={{ marginBottom: "1.5rem" }}>
                            Enter the email associated with your account and we&apos;ll send you a link to reset your password.
                        </p>

                        {forgotSuccess ? (
                            <div className={styles.alertSuccess}>
                                <CheckCircle2 size={18} className={styles.alertIcon} />
                                <div>
                                    <strong>Reset link sent!</strong>
                                    <p style={{ marginTop: "0.25rem", fontSize: "0.75rem" }}>
                                        Please check your inbox at <strong>{forgotEmail}</strong>.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleForgotPassword} className={styles.form}>
                                {forgotError && (
                                    <div className={styles.alertError}>
                                        <AlertCircle size={18} className={styles.alertIcon} />
                                        <span>{forgotError}</span>
                                    </div>
                                )}

                                <div className={styles.inputGroup}>
                                    <label className={styles.label}>Email Address</label>
                                    <div className={styles.inputWrapper}>
                                        <Mail size={18} className={styles.inputIcon} />
                                        <input
                                            type="email"
                                            required
                                            value={forgotEmail}
                                            onChange={(e) => setForgotEmail(e.target.value)}
                                            className={styles.input}
                                            placeholder="you@example.com"
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={forgotLoading || !forgotEmail}
                                    className={styles.submitButton}
                                >
                                    {forgotLoading ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            <span>Sending link...</span>
                                        </>
                                    ) : (
                                        "Send Reset Link"
                                    )}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
}

const statItemStyle = styles.statItem;

export default function LoginPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-black flex items-center justify-center">
                    <Loader2 className="animate-spin text-blue-500" size={32} />
                </div>
            }
        >
            <LoginContent />
        </Suspense>
    );
}
