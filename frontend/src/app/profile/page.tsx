"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Loader2, Save, Lock, User as UserIcon, Shield, CheckCircle, AlertCircle, Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import styles from "./profile.module.css";
import Footer from "@/components/Footer";


export default function ProfilePage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("user");

    // Password change states
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // UI states
    const [loadingData, setLoadingData] = useState(true);
    const [updatingProfile, setUpdatingProfile] = useState(false);
    const [updatingPassword, setUpdatingPassword] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        if (!authLoading) {
            if (!user) {
                router.replace("/login?redirect=/profile");
            } else {
                fetchProfile();
            }
        }
    }, [user, authLoading, router]);

    const fetchProfile = async () => {
        if (!user) return;

        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('first_name, last_name, email, role')
                .eq('id', user.id)
                .single();

            if (error) throw error;

            if (data) {
                setFirstName(data.first_name || "");
                setLastName(data.last_name || "");
                setEmail(data.email || user.email || "");
                setRole(data.role || "user");
            }
        } catch (error) {
            console.error("Error fetching profile:", error);
            setMessage({ type: 'error', text: 'Failed to load profile data' });
        } finally {
            setLoadingData(false);
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setUpdatingProfile(true);
        setMessage(null);

        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    first_name: firstName.trim(),
                    last_name: lastName.trim(),
                })
                .eq('id', user.id);

            if (error) throw error;

            setMessage({ type: 'success', text: 'Profile information updated successfully' });
            setTimeout(() => setMessage(null), 3000);
        } catch (error: any) {
            console.error("Error updating profile:", error);
            setMessage({ type: 'error', text: error.message || 'Failed to update profile' });
        } finally {
            setUpdatingProfile(false);
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        if (newPassword.length < 6) {
            setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
            return;
        }

        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'Passwords do not match' });
            return;
        }

        setUpdatingPassword(true);

        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (error) throw error;

            setMessage({ type: 'success', text: 'Security settings updated successfully' });
            setNewPassword("");
            setConfirmPassword("");
            setTimeout(() => setMessage(null), 3000);
        } catch (error: any) {
            console.error("Error updating password:", error);
            setMessage({ type: 'error', text: error.message || 'Failed to update password' });
        } finally {
            setUpdatingPassword(false);
        }
    };

    if (authLoading || loadingData) {
        return <div className="min-h-screen bg-[#09090b] flex items-center justify-center"><Loader2 className="animate-spin text-blue-500" size={32} /></div>;
    }

    return (
        <>

            <div className={styles.container}>
                <div className={styles.contentWrapper}>
                    <div className={styles.header}>
                        <h1 className={styles.title}>Account Settings</h1>
                        <p className={styles.subtitle}>Manage your profile, preferences, and security settings</p>
                    </div>

                    {message && (
                        <div className={message.type === 'error' ? styles.errorMessage : styles.successMessage}>
                            {message.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
                            {message.text}
                        </div>
                    )}

                    <div className={styles.grid}>
                        {/* LEFT COLUMN: Profile Info */}
                        <div className={styles.card}>
                            <div className={styles.avatarHeader}>
                                <div className={styles.avatar}>
                                    {firstName ? firstName[0].toUpperCase() : email[0].toUpperCase()}
                                </div>
                                <div className={styles.avatarInfo}>
                                    <h3 className={styles.avatarName}>
                                        {firstName && lastName ? `${firstName} ${lastName}` : 'User Profile'}
                                    </h3>
                                    <p className={styles.avatarEmail}>{email}</p>
                                    <span className={styles.badge}>
                                        {role === 'admin' ? 'Administrator' : 'Active Member'}
                                    </span>
                                </div>
                            </div>

                            <form onSubmit={handleUpdateProfile} className={styles.form}>
                                <div className={styles.sectionHeader}>
                                    <UserIcon size={20} className="text-blue-400" />
                                    <h2 className={styles.sectionTitle}>Personal Information</h2>
                                </div>

                                <div className={styles.row}>
                                    <div className={styles.inputGroup}>
                                        <label className={styles.label}>First Name</label>
                                        <input
                                            type="text"
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            className={styles.input}
                                            placeholder="Enter your first name"
                                        />
                                    </div>

                                    <div className={styles.inputGroup}>
                                        <label className={styles.label}>Last Name</label>
                                        <input
                                            type="text"
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                            className={styles.input}
                                            placeholder="Enter your last name"
                                        />
                                    </div>
                                </div>

                                <div className={styles.inputGroup}>
                                    <label className={styles.label}>Email Address</label>
                                    <input
                                        type="email"
                                        value={email}
                                        disabled
                                        className={styles.input}
                                    />
                                    <p className="text-xs text-zinc-500 mt-1 pl-1">Email cannot be changed manually.</p>
                                </div>

                                <button
                                    type="submit"
                                    disabled={updatingProfile}
                                    className={`${styles.button} ${styles.primaryButton}`}
                                >
                                    {updatingProfile ? <Loader2 className="animate-spin" size={20} /> : (
                                        <>
                                            <Save size={18} />
                                            Save Changes
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>

                        {/* RIGHT COLUMN: Security */}
                        <div className={styles.card}>
                            <div className={styles.sectionHeader}>
                                <Shield size={20} className="text-purple-400" />
                                <h2 className={styles.sectionTitle}>Security</h2>
                            </div>

                            <form onSubmit={handleUpdatePassword} className={styles.form}>
                                <div className="p-4 bg-white/5 rounded-lg border border-white/5 mb-2">
                                    <div className="flex items-start gap-3">
                                        <Sparkles size={18} className="text-yellow-400 mt-1 shrink-0" />
                                        <div>
                                            <h4 className="text-sm font-medium text-white mb-1">Password Tips</h4>
                                            <p className="text-xs text-zinc-400 leading-relaxed">
                                                Use at least 8 characters, one uppercase letter, one number, and one special character for maximum security.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.inputGroup}>
                                    <label className={styles.label}>New Password</label>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className={styles.input}
                                        placeholder="••••••••"
                                        minLength={6}
                                        autoComplete="new-password"
                                    />
                                </div>

                                <div className={styles.inputGroup}>
                                    <label className={styles.label}>Confirm New Password</label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className={styles.input}
                                        placeholder="••••••••"
                                        minLength={6}
                                        autoComplete="new-password"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={updatingPassword}
                                    className={`${styles.button} ${styles.secondaryButton}`}
                                >
                                    {updatingPassword ? <Loader2 className="animate-spin" size={20} /> : (
                                        <>
                                            <Lock size={18} />
                                            Update Password
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        </>
    );
}
