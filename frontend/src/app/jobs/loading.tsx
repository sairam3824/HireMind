import styles from './page.module.css';

export default function JobsLoading() {
    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <div className={styles.searchBar}>
                        {/* Skeleton search bar */}
                        <div style={{
                            display: 'flex',
                            gap: '12px',
                            padding: '12px 20px',
                            background: 'rgba(255, 255, 255, 0.03)',
                            borderRadius: '16px',
                            width: '100%'
                        }}>
                            {[1, 2, 3, 4].map(i => (
                                <div
                                    key={i}
                                    style={{
                                        height: '40px',
                                        flex: 1,
                                        background: 'linear-gradient(90deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 100%)',
                                        backgroundSize: '200% 100%',
                                        animation: 'shimmer 1.5s infinite',
                                        borderRadius: '8px'
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </header>

            <main className={styles.main}>
                <div className={styles.jobList}>
                    <div className={styles.listHeader}>
                        <div style={{
                            height: '28px',
                            width: '120px',
                            background: 'linear-gradient(90deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 100%)',
                            backgroundSize: '200% 100%',
                            animation: 'shimmer 1.5s infinite',
                            borderRadius: '6px'
                        }} />
                        <div style={{
                            height: '20px',
                            width: '80px',
                            background: 'linear-gradient(90deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 100%)',
                            backgroundSize: '200% 100%',
                            animation: 'shimmer 1.5s infinite',
                            borderRadius: '6px'
                        }} />
                    </div>

                    {/* Skeleton cards */}
                    <div className={styles.cardsContainer}>
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className={styles.skeletonCard}>
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '12px',
                                    padding: '20px'
                                }}>
                                    <div style={{
                                        height: '24px',
                                        width: '70%',
                                        background: 'linear-gradient(90deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 100%)',
                                        backgroundSize: '200% 100%',
                                        animation: 'shimmer 1.5s infinite',
                                        borderRadius: '6px'
                                    }} />
                                    <div style={{
                                        height: '18px',
                                        width: '45%',
                                        background: 'linear-gradient(90deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 100%)',
                                        backgroundSize: '200% 100%',
                                        animation: 'shimmer 1.5s infinite',
                                        borderRadius: '6px'
                                    }} />
                                    <div style={{
                                        display: 'flex',
                                        gap: '8px'
                                    }}>
                                        <div style={{
                                            height: '26px',
                                            width: '80px',
                                            background: 'linear-gradient(90deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 100%)',
                                            backgroundSize: '200% 100%',
                                            animation: 'shimmer 1.5s infinite',
                                            borderRadius: '20px'
                                        }} />
                                        <div style={{
                                            height: '26px',
                                            width: '60px',
                                            background: 'linear-gradient(90deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 100%)',
                                            backgroundSize: '200% 100%',
                                            animation: 'shimmer 1.5s infinite',
                                            borderRadius: '20px'
                                        }} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles.jobDetails} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <p style={{ color: 'rgba(255,255,255,0.4)' }}>Select a job to view details</p>
                </div>
            </main>

            <style>{`
                @keyframes shimmer {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }
            `}</style>
        </div>
    );
}
