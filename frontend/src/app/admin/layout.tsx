"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Lock, LogOut } from 'lucide-react'
import Link from 'next/link'
import styles from './admin.module.css'

// Hardcoded credentials
const ADMIN_USERNAME = "admin"
const ADMIN_PASSWORD = "password"

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [loading, setLoading] = useState(true)
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [authError, setAuthError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const router = useRouter()

    useEffect(() => {
        // Check for existing session in localStorage
        const session = localStorage.getItem('admin_session')
        if (session === 'true') {
            setIsAuthenticated(true)
        }
        setLoading(false)
    }, [])

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        setAuthError(null)

        // Simulate network delay for better UX
        await new Promise(resolve => setTimeout(resolve, 500))

        if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
            localStorage.setItem('admin_session', 'true')
            setIsAuthenticated(true)
        } else {
            setAuthError('Invalid username or password')
        }
        setIsSubmitting(false)
    }

    const handleLogout = () => {
        localStorage.removeItem('admin_session')
        setIsAuthenticated(false)
        setUsername('')
        setPassword('')
        router.refresh()
    }

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <Loader2 className="animate-spin" size={32} />
            </div>
        )
    }

    if (!isAuthenticated) {
        return (
            <div className={styles.loginContainer}>
                <div className={styles.loginCard}>
                    <div className={styles.loginHeader}>
                        <div className={styles.iconWrapper}>
                            <Lock size={24} />
                        </div>
                        <h1 className={styles.title}>Admin Access</h1>
                        <p className={styles.subtitle}>Enter credentials to continue</p>
                    </div>

                    <form onSubmit={handleLogin} className={styles.form}>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Username</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className={styles.input}
                                placeholder="admin"
                                required
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={styles.input}
                                placeholder="password"
                                required
                            />
                        </div>

                        {authError && (
                            <div className={styles.errorBox}>
                                {authError}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={styles.button}
                        >
                            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : 'Sign In'}
                        </button>
                    </form>
                </div>
            </div>
        )
    }

    return (
        <div className={styles.container}>
            <header className={styles.dashboardHeader}>
                <Link href="/admin" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div>
                        <h1 className={styles.dashboardTitle}>Admin Dashboard</h1>
                        <p className={styles.subtitle}>Manage your application settings and feedback</p>
                    </div>
                </Link>
                <button
                    onClick={handleLogout}
                    className={styles.signOutButton}
                >
                    <LogOut size={16} />
                    Sign Out
                </button>
            </header>

            {children}
        </div>
    )
}
