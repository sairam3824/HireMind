import styles from './page.module.css';

export default function Loading() {
    return (
        <div className={styles.container} style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)'
        }}>
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1.5rem'
            }}>
                {/* Animated Logo/Spinner */}
                <div style={{
                    width: '60px',
                    height: '60px',
                    border: '3px solid rgba(96, 165, 250, 0.2)',
                    borderTopColor: '#60a5fa',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                }} />

                {/* Brand Text */}
                <h2 style={{
                    background: 'linear-gradient(90deg, #60a5fa, #a78bfa)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontSize: '1.5rem',
                    fontWeight: 600,
                    margin: 0
                }}>
                    HireMind
                </h2>

                <p style={{
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontSize: '0.875rem',
                    margin: 0
                }}>
                    Loading your experience...
                </p>
            </div>

            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
