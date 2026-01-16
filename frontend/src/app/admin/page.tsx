"use client"

import Link from 'next/link'
import { MessageSquare, Lock, Building2, Users } from 'lucide-react'
import styles from './admin.module.css'

export default function AdminPage() {
    return (
        <div className={styles.grid}>
            <Link
                href="/admin/feedback"
                className={styles.card}
            >
                <div className={styles.cardIcon}>
                    <MessageSquare size={24} color="#2563eb" />
                </div>
                <h2 className={styles.cardTitle}>Feedback</h2>
                <p className={styles.cardDesc}>View user feedback, role requests, and location requests.</p>
            </Link>

            <Link
                href="/admin/companies"
                className={styles.card}
            >
                <div className={styles.cardIcon}>
                    <Building2 size={24} color="#2563eb" />
                </div>
                <h2 className={styles.cardTitle}>Companies</h2>
                <p className={styles.cardDesc}>Browse jobs by company and manage company details.</p>
            </Link>

            <Link
                href="/admin/users"
                className={styles.card}
            >
                <div className={styles.cardIcon}>
                    <Users size={24} color="#2563eb" />
                </div>
                <h2 className={styles.cardTitle}>Users</h2>
                <p className={styles.cardDesc}>View all registered users and their roles.</p>
            </Link>


        </div>
    )
}
