'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import styles from './users.module.css';
import { Loader2, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';

type Profile = {
    id: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
    role: string;
    created_at: string;
};

type SortConfig = {
    key: keyof Profile;
    direction: 'asc' | 'desc';
} | null;

export default function UsersPage() {
    const [users, setUsers] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortConfig, setSortConfig] = useState<SortConfig>(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setUsers(data || []);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSort = (key: keyof Profile) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getSortedUsers = (list: Profile[]) => {
        if (!sortConfig) return list;

        return [...list].sort((a, b) => {
            let valueA = a[sortConfig.key];
            let valueB = b[sortConfig.key];

            // Handle null values
            if (valueA === null) valueA = '';
            if (valueB === null) valueB = '';

            // Case insensitive string comparison
            if (typeof valueA === 'string' && typeof valueB === 'string') {
                valueA = valueA.toLowerCase();
                valueB = valueB.toLowerCase();
            }

            if (valueA < valueB) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (valueA > valueB) {
                return sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const SortIcon = ({ columnKey }: { columnKey: keyof Profile }) => {
        if (sortConfig?.key !== columnKey) return <ArrowUpDown size={14} className={styles.sortIcon} />;
        return sortConfig.direction === 'asc'
            ? <ArrowUp size={14} className={styles.sortIcon} color="#60a5fa" />
            : <ArrowDown size={14} className={styles.sortIcon} color="#60a5fa" />;
    };

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>
                    <Loader2 className="animate-spin" size={32} />
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>All Users</h1>
                <p className={styles.subtitle}>View and manage registered users</p>
            </header>

            {users.length === 0 ? (
                <div className={styles.empty}>
                    <p>No users found.</p>
                </div>
            ) : (
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th onClick={() => handleSort('email')}>
                                    <div className={styles.headerContent}>
                                        Email <SortIcon columnKey="email" />
                                    </div>
                                </th>
                                <th onClick={() => handleSort('first_name')}>
                                    <div className={styles.headerContent}>
                                        First Name <SortIcon columnKey="first_name" />
                                    </div>
                                </th>
                                <th onClick={() => handleSort('last_name')}>
                                    <div className={styles.headerContent}>
                                        Last Name <SortIcon columnKey="last_name" />
                                    </div>
                                </th>
                                <th onClick={() => handleSort('role')}>
                                    <div className={styles.headerContent}>
                                        Role <SortIcon columnKey="role" />
                                    </div>
                                </th>
                                <th onClick={() => handleSort('created_at')}>
                                    <div className={styles.headerContent}>
                                        Joined <SortIcon columnKey="created_at" />
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {getSortedUsers(users).map((user) => (
                                <tr key={user.id}>
                                    <td className={styles.emailCell}>{user.email}</td>
                                    <td>{user.first_name || '-'}</td>
                                    <td>{user.last_name || '-'}</td>
                                    <td>
                                        <span className={`${styles.roleBadge} ${user.role === 'admin' ? styles.roleAdmin : styles.roleUser}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className={styles.dateCell}>{formatDate(user.created_at)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
