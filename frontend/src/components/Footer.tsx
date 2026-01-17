import Link from "next/link";
import styles from "./Footer.module.css";

export default function Footer() {
    return (
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
    );
}
