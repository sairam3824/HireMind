import styles from "../page.module.css";
import Link from "next/link";

export default function TermsConditions() {
    return (
        <div className={styles.container}>
            <main className={styles.main} style={{ flexDirection: 'column', alignItems: 'flex-start', maxWidth: '800px', margin: '0 auto' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', color: '#fff' }}>Terms and Conditions</h1>
                <p style={{ color: '#a1a1aa', lineHeight: '1.6', marginBottom: '1rem' }}>Last updated: {new Date().toLocaleDateString()}</p>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#e4e4e7' }}>1. Agreement to Terms</h2>
                    <p style={{ color: '#a1a1aa', lineHeight: '1.6' }}>
                        These Terms and Conditions constitute a legally binding agreement made between you, whether personally or on behalf of an entity (“you”) and Job Cloud ("we," "us" or "our"),
                        concerning your access to and use of the Job Cloud website as well as any other media form, media channel, mobile website or mobile application related, linked, or otherwise connected thereto (collectively, the “Site”).
                    </p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#e4e4e7' }}>2. Intellectual Property Rights</h2>
                    <p style={{ color: '#a1a1aa', lineHeight: '1.6' }}>
                        Unless otherwise indicated, the Site is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the Site (collectively, the “Content”)
                        and the trademarks, service marks, and logos contained therein (the “Marks”) are owned or controlled by us or licensed to us, and are protected by copyright and trademark laws.
                    </p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#e4e4e7' }}>3. User Representations</h2>
                    <p style={{ color: '#a1a1aa', lineHeight: '1.6' }}>
                        By using the Site, you represent and warrant that:
                        <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
                            <li>All registration information you submit will be true, accurate, current, and complete.</li>
                            <li>You will maintain the accuracy of such information and promptly update such registration information as necessary.</li>
                            <li>You represent and warrant that you have the legal capacity and you agree to comply with these Terms of Use.</li>
                            <li>You are not a minor in the jurisdiction in which you reside.</li>
                        </ul>
                    </p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#e4e4e7' }}>4. Prohibited Activities</h2>
                    <p style={{ color: '#a1a1aa', lineHeight: '1.6' }}>
                        You may not access or use the Site for any purpose other than that for which we make the Site available. The Site may not be used in connection with any commercial endeavors except those that are specifically endorsed or approved by us.
                    </p>
                </section>

                <Link href="/" className={styles.primaryButton} style={{ alignSelf: 'flex-start', display: 'inline-flex' }}>
                    Back to Home
                </Link>
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
        </div>
    );
}
