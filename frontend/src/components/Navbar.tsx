"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Briefcase, Menu, X } from "lucide-react";
import styles from "./Navbar.module.css";

export default function Navbar() {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
                </div>
            )}
        </nav>
    );
}
