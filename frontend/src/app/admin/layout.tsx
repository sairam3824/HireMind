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
    const [fakePassword, setFakePassword] = useState('')
    const [authError, setAuthError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [loadingText, setLoadingText] = useState('Initiating...')
    const [countdown, setCountdown] = useState(60)
    const [exploded, setExploded] = useState(false)
    const router = useRouter()

    useEffect(() => {
        // Check for existing session in localStorage
        const session = localStorage.getItem('admin_session')
        if (session === 'true') {
            setIsAuthenticated(true)
        }
        setLoading(false)

        // Bomb countdown
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer)
                    setExploded(true)
                    // Play explosion sound
                    // Play synthesized explosion sound (no external file needed)
                    try {
                        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
                        if (AudioContext) {
                            const ctx = new AudioContext();
                            const osc = ctx.createOscillator();
                            const gain = ctx.createGain();

                            // Create noise buffer for explosion
                            const bufferSize = ctx.sampleRate * 2; // 2 seconds
                            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
                            const data = buffer.getChannelData(0);
                            for (let i = 0; i < bufferSize; i++) {
                                data[i] = Math.random() * 2 - 1;
                            }

                            const noise = ctx.createBufferSource();
                            noise.buffer = buffer;

                            // Filter to make it sound like an explosion (lowpass)
                            const filter = ctx.createBiquadFilter();
                            filter.type = 'lowpass';
                            filter.frequency.value = 1000;

                            noise.connect(filter);
                            filter.connect(gain);
                            gain.connect(ctx.destination);

                            // Envelope for explosion (loud attack, long decay)
                            gain.gain.setValueAtTime(1, ctx.currentTime);
                            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1);

                            noise.start();
                            noise.stop(ctx.currentTime + 2);
                        }
                    } catch (e) {
                        console.error("Audio synth failed", e);
                    }
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(timer)
    }, [])

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        setAuthError(null)

        const funnyMessages = [
            "Intercepting satellite signals...",
            "Downloading more RAM...",
            "Consulting the spirits...",
            "Asking PM for permission...",
            "Cracking the matrix..."
        ];

        for (const msg of funnyMessages) {
            setLoadingText(msg);
            await new Promise(resolve => setTimeout(resolve, 600));
        }

        if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
            localStorage.setItem('admin_session', 'true')
            setIsAuthenticated(true)
        } else {
            setAuthError('Skill issue detected. Git gud.')
        }
        setIsSubmitting(false)
    }

    const handleLogout = () => {
        localStorage.removeItem('admin_session')
        setIsAuthenticated(false)
        setUsername('')
        setPassword('')
        setFakePassword('')
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
        if (exploded) {
            return (
                <div className={`${styles.loadingContainer} ${styles.shake}`}>
                    <div className={styles.blastOverlay}></div>
                    <div className={styles.explodedContainer}>
                        <div style={{ fontSize: '5rem', marginBottom: '2rem' }}>🎭 🦹‍♂️</div>
                        <div className={styles.explodedText}>YOU ARE HACKED</div>
                        <p>Vercel production database has been wiped.</p>
                        <p>FBI agents have been dispatched to your location.</p>
                        <p style={{ marginTop: '2rem', color: '#6b7280' }}>(Just kidding. Refresh the page to try again.)</p>
                    </div>
                </div>
            )
        }

        return (
            <div className={styles.loginContainer}>
                <div className={styles.loginCard} style={{ borderColor: '#ef4444', boxShadow: '0 0 20px rgba(239, 68, 68, 0.2)' }}>
                    <div className={styles.loginHeader}>
                        <div className={styles.iconWrapper} style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                            <Lock size={24} />
                        </div>
                        <h1 className={styles.title} style={{ color: '#ef4444' }}>⚠️ SELF DESTRUCT SEQUENCE ⚠️</h1>
                        <p className={styles.subtitle} style={{ color: '#f87171' }}>Vercel Deployment Purge Imminent</p>
                        <div className={styles.bombTimer}>
                            00:{countdown.toString().padStart(2, '0')}
                        </div>
                    </div>

                    <form onSubmit={handleLogin} className={styles.form}>

                        <div className={styles.inputGroup}>
                            <label className={styles.label} style={{ color: '#ef4444' }}>Authorization Code Alpha</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className={styles.input}
                                placeholder="Input Command Authority"
                                style={{ borderColor: '#7f1d1d' }}
                                required
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.label} style={{ color: '#ef4444' }}>Authorization Code Beta</label>
                            <input
                                type="text"
                                value={'*'.repeat(password.length)}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (val.length < password.length) {
                                        setPassword(password.slice(0, val.length));
                                    } else {
                                        setPassword(password + val.slice(password.length));
                                    }
                                }}
                                className={styles.input}
                                placeholder="Input Override Sequence"
                                style={{ borderColor: '#7f1d1d' }}
                                required
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.label} style={{ color: '#ef4444' }}>Do NOT Cut This Wire</label>
                            <input
                                type="text"
                                value={'*'.repeat(fakePassword.length)}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (val.length < fakePassword.length) {
                                        setFakePassword(fakePassword.slice(0, val.length));
                                    } else {
                                        setFakePassword(fakePassword + val.slice(fakePassword.length));
                                    }
                                }}
                                className={styles.input}
                                placeholder="Cutting this speeds up timer..."
                                style={{ borderColor: '#7f1d1d' }}
                                required
                            />
                        </div>

                        {authError && (
                            <div className={styles.errorBox} style={{ backgroundColor: '#450a0a', borderColor: '#ef4444', color: '#fca5a5' }}>
                                {authError}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={styles.redButton}
                        >
                            {isSubmitting ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="animate-spin" size={20} />
                                    <span>{loadingText}</span>
                                </div>
                            ) : 'ABORT DESTRUCTION'}
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
