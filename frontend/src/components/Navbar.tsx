"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Briefcase, Menu, X, LogIn, UserPlus, LogOut } from "lucide-react";
import FeedbackWidget from "@/components/FeedbackWidget";
import { useAuth } from "@/context/AuthContext";
import styles from "./Navbar.module.css";

export default function Navbar() {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { user, signOut } = useAuth();

    const isActive = (path: string) => {
        if (path === "/" && pathname === "/") return true;
        if (path !== "/" && pathname.startsWith(path)) return true;
        return false;
    };

    return (
        <nav className={styles.navbar}>
            <div className={styles.navContainer}>
                <Link href="/" className={styles.logo}>
                    <Briefcase size={24} color="#2563eb" />
                    <span>HireMind</span>
                </Link>

                {/* Mobile Menu Toggle */}
                <button
                    className={styles.mobileMenuToggle}
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    aria-label="Toggle menu"
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>

                {/* Desktop Nav */}
                <div className={styles.navLinks}>
                    <Link
                        href="/"
                        className={`${styles.navLink} ${isActive("/") ? styles.active : ""}`}
                    >
                        Resume Match
                    </Link>
                    <Link
                        href="/jobs"
                        className={`${styles.navLink} ${isActive("/jobs") ? styles.active : ""}`}
                    >
                        Jobs
                    </Link>
                    <Link
                        href="/companies"
                        className={`${styles.navLink} ${isActive("/companies") ? styles.active : ""}`}
                    >
                        Companies
                    </Link>

                    {/* Saved Jobs - Only if logged in? Or always? Let's show always for now or redirect if not auth */}
                    {user && (
                        <Link
                            href="/saved-jobs"
                            className={`${styles.navLink} ${isActive("/saved-jobs") ? styles.active : ""}`}
                        >
                            Saved
                        </Link>
                    )}

                    <div className={styles.feedbackWrapper}>
                        <FeedbackWidget />
                    </div>

                    {/* Auth Section */}
                    <div className={styles.authSection}>
                        {user ? (
                            <div className={styles.authGroup}>
                                <span className={styles.userEmail}>{user.email?.split('@')[0]}</span>
                                <button onClick={signOut} className={styles.logoutBtn}>
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <div className={styles.authGroup}>
                                <Link href="/login" className={styles.navLink}>
                                    Login
                                </Link>
                                <Link href="/signup" className={styles.signupBtn}>
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Nav Overlay */}
            {isMobileMenuOpen && (
                <div className={styles.mobileMenu}>
                    <Link
                        href="/"
                        className={`${styles.mobileNavLink} ${isActive("/") ? styles.active : ""}`}
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        Resume Match
                    </Link>
                    <Link
                        href="/jobs"
                        className={`${styles.mobileNavLink} ${isActive("/jobs") ? styles.active : ""}`}
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        Jobs
                    </Link>
                    <Link
                        href="/companies"
                        className={`${styles.mobileNavLink} ${isActive("/companies") ? styles.active : ""}`}
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        Companies
                    </Link>
                    {user && (
                        <Link
                            href="/saved-jobs"
                            className={`${styles.mobileNavLink} ${isActive("/saved-jobs") ? styles.active : ""}`}
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Saved
                        </Link>
                    )}

                    <div className={styles.mobileSection}>
                        <FeedbackWidget className={styles.mobileNavLink} />
                    </div>

                    <div className={styles.mobileSection}>
                        {user ? (
                            <div className={styles.mobileAuthButtons}>
                                <span className={styles.userEmailMobile}>{user.email}</span>
                                <button
                                    onClick={() => { signOut(); setIsMobileMenuOpen(false); }}
                                    className={`${styles.mobileNavLink} ${styles.logoutBtnMobile}`}
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <div className={styles.mobileAuthButtons}>
                                <Link
                                    href="/login"
                                    className={styles.mobileNavLink}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Login
                                </Link>
                                <Link
                                    href="/signup"
                                    className={`${styles.mobileNavLink} ${styles.signupBtnMobile}`}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
