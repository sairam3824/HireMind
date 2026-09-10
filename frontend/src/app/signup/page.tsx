"use client";

import { useState, useEffect, Suspense } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
    Briefcase,
    Mail,
    Lock,
    User,
    Eye,
    EyeOff,
    Check,
    ArrowRight,
    ArrowLeft,
    Loader2,
    Sparkles,
    ShieldCheck,
    Zap,
    TrendingUp,
    AlertCircle,
    CheckCircle2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Footer from "@/components/Footer";
import styles from "../auth.module.css";

function SignupContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirect = searchParams.get("redirect") || "/";
    const { user, loading: authLoading } = useAuth();

    useEffect(() => {
        if (!authLoading && user) {
            router.replace(redirect);
        }
    }, [user, authLoading, router, redirect]);

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [agreeTerms, setAgreeTerms] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // Password Validation Logic
    const hasMinLength = password.length >= 8;
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const isPasswordValid = hasMinLength && hasNumber && hasSpecialChar;

    // Password Strength Score: 0 to 3
    const strengthScore = [hasMinLength, hasNumber, hasSpecialChar].filter(Boolean).length;
    const strengthLevel =
        password.length === 0
            ? ""
            : strengthScore === 1
            ? "Weak"
            : strengthScore === 2
            ? "Medium"
            : "Strong";

    const strengthColor =
        strengthScore === 1
            ? "#ef4444"
            : strengthScore === 2
            ? "#eab308"
            : strengthScore === 3
            ? "#22c55e"
            : "transparent";

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isPasswordValid) {
            setError("Please ensure your password meets all security requirements.");
            return;
        }

        if (!agreeTerms) {
            setError("Please accept the terms and conditions to create an account.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const { data, error } = await supabase.auth.signUp({
                email: email.trim(),
                password: password.trim(),
                options: {
                    data: {
                        first_name: firstName.trim(),
                        last_name: lastName.trim(),
                    },
                },
            });

            if (error) {
                setError(error.message);
                setLoading(false);
                return;
            }

            // With email confirmation disabled, session exists immediately
            if (data.session) {
                router.replace(redirect);
                return;
            }

            // Fallback attempt to sign in immediately
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: email.trim(),
                password: password.trim(),
            });

            if (!signInError) {
                router.replace(redirect);
                return;
            }

            setSuccess(true);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "An unexpected error occurred during signup.";
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loader2 className="animate-spin text-blue-500" size={32} />
            </div>
        );
    }

    if (success) {
        return (
            <div className={styles.container}>
                <div className={styles.bgMesh} />
                <div className={styles.bgGrid} />

                <header className={styles.topNav}>
                    <Link href="/" className={styles.brandLogo}>
                        <div className={styles.brandIconWrap}>
                            <Briefcase size={20} />
                        </div>
                        <span>HireMind</span>
                    </Link>
                </header>

                <main className={`${styles.contentWrapper} ${styles.contentWrapperSingle}`}>
                    <div className={`${styles.card} ${styles.successCard}`}>
                        <div className={styles.successIconWrap}>
                            <CheckCircle2 size={36} />
                        </div>

                        <h2 className={styles.successTitle}>Check your inbox</h2>
                        <p className={styles.successText}>
                            We&apos;ve dispatched a confirmation link to <span className={styles.successEmailBadge}>{email}</span>. Click the link in your email to activate your HireMind account.
                        </p>

                        <div className={styles.form}>
                            <Link href="/login" className={styles.submitButton} style={{ textDecoration: "none" }}>
                                <span>Proceed to Sign In</span>
                                <ArrowRight size={18} />
                            </Link>

                            <Link href="/" className={styles.backLink} style={{ justifyContent: "center" }}>
                                <ArrowLeft size={16} />
                                <span>Back to Home</span>
                            </Link>
                        </div>
                    </div>
                </main>

                <Footer />
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
                {/* Left Side: Hero / Showcase */}
                <div className={styles.heroShowcase}>
                    <div className={styles.heroBadge}>
                        <Sparkles size={14} />
                        <span>Accelerate Your Career</span>
                    </div>

                    <div>
                        <h1 className={styles.heroTitle}>
                            Land your dream role <br />
                            <span className={styles.heroGradientText}>faster with HireMind.</span>
                        </h1>
                        <p className={styles.heroSubtitle}>
                            Join thousands of ambitious engineers, designers, and managers using AI to optimize their resumes and discover hand-picked tech opportunities.
                        </p>
                    </div>

                    <div className={styles.valueProps}>
                        <div className={styles.valueItem}>
                            <div className={styles.valueIconWrap}>
                                <Zap size={18} />
                            </div>
                            <div className={styles.valueText}>
                                <h4>Deep ATS Resume Analysis</h4>
                                <p>Actionable keyword insights, structural diagnostics, and AI-predicted role matches.</p>
                            </div>
                        </div>

                        <div className={styles.valueItem}>
                            <div className={styles.valueIconWrap}>
                                <ShieldCheck size={18} />
                            </div>
                            <div className={styles.valueText}>
                                <h4>Curated Direct Opportunities</h4>
                                <p>Direct links to hiring teams at top tier tech companies without spam.</p>
                            </div>
                        </div>

                        <div className={styles.valueItem}>
                            <div className={styles.valueIconWrap}>
                                <TrendingUp size={18} />
                            </div>
                            <div className={styles.valueText}>
                                <h4>Personalized Career Analytics</h4>
                                <p>Continuous performance benchmarking to help you stand out from the applicant pool.</p>
                            </div>
                        </div>
                    </div>

                    <div className={styles.statsRibbon}>
                        <div className={styles.statItem}>
                            <div className={styles.statValue}>100% Free</div>
                            <div className={styles.statLabel}>Core AI Scans</div>
                        </div>
                        <div className={styles.statItem}>
                            <div className={styles.statValue}>12,000+</div>
                            <div className={styles.statLabel}>Active Tech Roles</div>
                        </div>
                        <div className={styles.statItem}>
                            <div className={styles.statValue}>4.9/5</div>
                            <div className={styles.statLabel}>Candidate Rating</div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Signup Card */}
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h2 className={styles.cardTitle}>Create an account</h2>
                        <p className={styles.cardSubtitle}>
                            Get started in seconds. No credit card required.
                        </p>
                    </div>

                    <form onSubmit={handleSignup} className={styles.form}>
                        {error && (
                            <div className={styles.alertError}>
                                <AlertCircle size={18} className={styles.alertIcon} />
                                <span>{error}</span>
                            </div>
                        )}

                        {/* First and Last Name */}
                        <div className={styles.row}>
                            <div className={styles.inputGroup}>
                                <label className={styles.label}>First Name</label>
                                <div className={styles.inputWrapper}>
                                    <User size={18} className={styles.inputIcon} />
                                    <input
                                        type="text"
                                        required
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        className={styles.input}
                                        placeholder="Alex"
                                        autoComplete="given-name"
                                    />
                                </div>
                            </div>
                            <div className={styles.inputGroup}>
                                <label className={styles.label}>Last Name</label>
                                <div className={styles.inputWrapper}>
                                    <User size={18} className={styles.inputIcon} />
                                    <input
                                        type="text"
                                        required
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        className={styles.input}
                                        placeholder="Morgan"
                                        autoComplete="family-name"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Email Address */}
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
                                    placeholder="alex.morgan@company.com"
                                    autoComplete="email"
                                    autoCapitalize="none"
                                    autoCorrect="off"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Password</label>
                            <div className={styles.inputWrapper}>
                                <Lock size={18} className={styles.inputIcon} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={styles.input}
                                    placeholder="Create a strong password"
                                    autoComplete="new-password"
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

                            {/* Dynamic Password Strength & Criteria */}
                            {password.length > 0 && (
                                <div className={styles.strengthContainer}>
                                    <div className={styles.strengthLabelRow}>
                                        <span className={styles.strengthLabelText}>Password strength</span>
                                        <span className={styles.strengthLevelText} style={{ color: strengthColor }}>
                                            {strengthLevel}
                                        </span>
                                    </div>
                                    <div className={styles.strengthMeterBar}>
                                        <div
                                            className={styles.strengthMeterFill}
                                            style={{
                                                width: `${(strengthScore / 3) * 100}%`,
                                                backgroundColor: strengthColor,
                                            }}
                                        />
                                    </div>

                                    <div className={styles.checklist}>
                                        <div className={`${styles.checklistItem} ${hasMinLength ? styles.checklistItemMet : ""}`}>
                                            <div className={`${styles.checkIconWrapper} ${hasMinLength ? styles.checkIconWrapperMet : ""}`}>
                                                <Check size={10} />
                                            </div>
                                            <span>At least 8 characters</span>
                                        </div>
                                        <div className={`${styles.checklistItem} ${hasNumber ? styles.checklistItemMet : ""}`}>
                                            <div className={`${styles.checkIconWrapper} ${hasNumber ? styles.checkIconWrapperMet : ""}`}>
                                                <Check size={10} />
                                            </div>
                                            <span>At least one number</span>
                                        </div>
                                        <div className={`${styles.checklistItem} ${hasSpecialChar ? styles.checklistItemMet : ""}`}>
                                            <div className={`${styles.checkIconWrapper} ${hasSpecialChar ? styles.checkIconWrapperMet : ""}`}>
                                                <Check size={10} />
                                            </div>
                                            <span>At least one special character</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Terms checkbox */}
                        <label className={styles.checkboxGroup}>
                            <input
                                type="checkbox"
                                checked={agreeTerms}
                                onChange={(e) => setAgreeTerms(e.target.checked)}
                                className={styles.checkboxInput}
                            />
                            <span className={styles.termsText}>
                                I agree to the{" "}
                                <Link href="/terms-conditions" className={styles.termsLink} target="_blank">
                                    Terms & Conditions
                                </Link>{" "}
                                and{" "}
                                <Link href="/privacy-policy" className={styles.termsLink} target="_blank">
                                    Privacy Policy
                                </Link>
                            </span>
                        </label>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading || !isPasswordValid || !agreeTerms}
                            className={styles.submitButton}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin" size={18} />
                                    <span>Creating account...</span>
                                </>
                            ) : (
                                <>
                                    <span>Create Account</span>
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className={styles.cardFooter}>
                        Already have an account?
                        <Link href={`/login?redirect=${encodeURIComponent(redirect)}`} className={styles.authSwitchLink}>
                            Sign in
                        </Link>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

export default function SignupPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-black flex items-center justify-center">
                    <Loader2 className="animate-spin text-blue-500" size={32} />
                </div>
            }
        >
            <SignupContent />
        </Suspense>
    );
}
