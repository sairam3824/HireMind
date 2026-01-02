import styles from "../page.module.css";
import Link from "next/link";

export default function PrivacyPolicy() {
    return (
        <div className={styles.container}>
            <main className={styles.main} style={{ flexDirection: 'column', alignItems: 'flex-start', maxWidth: '800px', margin: '0 auto' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', color: '#fff' }}>Privacy Policy</h1>
                <p style={{ color: '#a1a1aa', lineHeight: '1.6', marginBottom: '1rem' }}>Last updated: {new Date().toLocaleDateString()}</p>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#e4e4e7' }}>1. Introduction</h2>
                    <p style={{ color: '#a1a1aa', lineHeight: '1.6' }}>
                        Welcome to Job Cloud. We respect your privacy and are committed to protecting your personal data.
                        This privacy policy will inform you as to how we look after your personal data when you visit our website
                        and tell you about your privacy rights and how the law protects you.
                    </p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#e4e4e7' }}>2. Data We Collect</h2>
                    <p style={{ color: '#a1a1aa', lineHeight: '1.6' }}>
                        We may collect, use, store and transfer different kinds of personal data about you which we have grouped together follows:
                        <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
                            <li>Identity Data includes first name, last name, username or similar identifier.</li>
                            <li>Contact Data includes email address and telephone numbers.</li>
                            <li>Technical Data includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location, browser plug-in types and versions, operating system and platform and other technology on the devices you use to access this website.</li>
                        </ul>
                    </p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#e4e4e7' }}>3. How We Use Your Data</h2>
                    <p style={{ color: '#a1a1aa', lineHeight: '1.6' }}>
                        We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
                        <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
                            <li>Where we need to perform the contract we are about to enter into or have entered into with you.</li>
                            <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
                            <li>Where we need to comply with a legal or regulatory obligation.</li>
                        </ul>
                    </p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#e4e4e7' }}>4. Data Security</h2>
                    <p style={{ color: '#a1a1aa', lineHeight: '1.6' }}>
                        We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed.
                        In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know.
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
