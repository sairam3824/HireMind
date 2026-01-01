"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Search, MapPin, Calendar, Briefcase, X, ExternalLink, Globe, User, Clock, TrendingUp, Layers } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import styles from "./page.module.css";
import Link from "next/link";

type Job = {
    id: string;
    title: string;
    company: string;
    location: string;
    crawled_date: string;
    job_url: string;
    description?: string;
    site?: string;
    job_type?: string;
    min_amount?: number;
    max_amount?: number;
    currency?: string;
    interval?: string;
    job_level?: string;
};

type CompanyGroup = {
    name: string;
    jobs: Job[];
};

export default function CompaniesPage() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<CompanyGroup[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (query.trim()) {
                searchCompanies(query);
            } else {
                setResults([]);
                setHasSearched(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [query]);

    // Handle ESC key to close modal
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setSelectedJob(null);
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, []);

    const searchCompanies = async (searchTerm: string) => {
        setLoading(true);
        setHasSearched(true);

        try {
            // Search for jobs where company name matches
            const { data, error } = await supabase
                .from("jobs")
                .select("*")
                .ilike("company", `%${searchTerm}%`)
                .order("crawled_date", { ascending: false })
                .limit(1000);

            if (error) throw error;

            if (data) {
                // Group by company
                const groups: Record<string, Job[]> = {};
                data.forEach(job => {
                    if (!groups[job.company]) {
                        groups[job.company] = [];
                    }
                    groups[job.company].push(job);
                });

                const groupArray = Object.keys(groups).map(company => ({
                    name: company,
                    jobs: groups[company]
                }));

                setResults(groupArray);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const formatSalary = (job: Job) => {
        if (!job.min_amount && !job.max_amount) return "Not Disclosed";
        const currencyMap: Record<string, string> = { "USD": "$", "INR": "₹", "EUR": "€", "GBP": "£" };
        const symbol = currencyMap[job.currency || "USD"] || job.currency || "$";

        if (job.min_amount && job.max_amount) {
            if (job.min_amount === job.max_amount) {
                return `${symbol}${job.min_amount.toLocaleString()} / ${job.interval || 'yr'}`;
            }
            return `${symbol}${job.min_amount.toLocaleString()} - ${symbol}${job.max_amount.toLocaleString()} / ${job.interval || 'yr'}`;
        }
        if (job.min_amount) return `Min ${symbol}${job.min_amount.toLocaleString()} / ${job.interval || 'yr'}`;
        if (job.max_amount) return `Max ${symbol}${job.max_amount.toLocaleString()} / ${job.interval || 'yr'}`;
        return "Not Disclosed";
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Company Search</h1>
                <div className={styles.searchContainer}>
                    <Search className={styles.searchIcon} size={20} />
                    <input
                        type="text"
                        className={styles.searchInput}
                        placeholder="Search for a company..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        autoFocus
                    />
                </div>
            </header>

            <div className={styles.resultsArea}>
                {loading ? (
                    <div className={styles.loadingState}>
                        Searching...
                    </div>
                ) : results.length > 0 ? (
                    results.map((group) => (
                        <div key={group.name} className={styles.companyGroup}>
                            <div className={styles.companyHeader}>
                                <div className={styles.companyName}>
                                    <Briefcase size={20} color="var(--primary)" />
                                    {group.name}
                                </div>
                                <span className={styles.jobCount}>{group.jobs.length} Jobs Found</span>
                            </div>
                            <div className={styles.jobsGrid}>
                                {group.jobs.map(job => (
                                    <div
                                        key={job.id}
                                        className={styles.jobCard}
                                        onClick={() => setSelectedJob(job)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <h3 className={styles.jobTitle}>{job.title}</h3>
                                        <div className={styles.jobMeta}>
                                            <div className={styles.metaItem}>
                                                <MapPin size={14} />
                                                {job.location}
                                            </div>
                                            <div className={styles.metaItem}>
                                                <Calendar size={14} />
                                                {job.crawled_date}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                ) : hasSearched && query.trim() ? (
                    <div className={styles.loadingState}>
                        No companies found matching "{query}"
                    </div>
                ) : (
                    <div className={styles.loadingState}>
                        Enter a company name to see their history.
                    </div>
                )}
            </div>

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
                        <a href="#">Privacy Policy</a>
                        <a href="#">Terms & Conditions</a>
                    </div>
                </div>
            </footer>

            {/* Job Details Modal */}
            {selectedJob && (
                <div className={styles.modalOverlay} onClick={() => setSelectedJob(null)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <button className={styles.closeButton} onClick={() => setSelectedJob(null)}>
                            <X size={24} />
                        </button>

                        <div className={styles.modalBody}>
                            <div className={styles.detailsHeader}>
                                <h2>{selectedJob.title}</h2>
                                <div className={styles.detailsMeta}>
                                    <span>{selectedJob.company}</span>
                                    <span className={styles.dot}>•</span>
                                    <span>{selectedJob.location}</span>
                                    <span className={styles.dot}>•</span>
                                    <span>{selectedJob.crawled_date}</span>
                                </div>

                                <a
                                    href={selectedJob.job_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.applyLink}
                                >
                                    Apply on Company Site <ExternalLink size={16} />
                                </a>
                            </div>

                            <div className={styles.scrollArea}>
                                <div className={styles.infoGrid}>
                                    <div className={styles.infoBox}>
                                        <div className={styles.boxHeader}>
                                            <span className={styles.infoLabel}>Source</span>
                                            <Globe size={16} className={styles.boxIcon} />
                                        </div>
                                        <span className={styles.infoValue}>
                                            {selectedJob.site || "N/A"}
                                        </span>
                                    </div>
                                    <div className={styles.infoBox}>
                                        <div className={styles.boxHeader}>
                                            <span className={styles.infoLabel}>Experience</span>
                                            <TrendingUp size={16} className={styles.boxIcon} />
                                        </div>
                                        <span className={styles.infoValue}>
                                            {selectedJob.job_level || "Not specified"}
                                        </span>
                                    </div>
                                    <div className={styles.infoBox}>
                                        <div className={styles.boxHeader}>
                                            <span className={styles.infoLabel}>Job Type</span>
                                            <Clock size={16} className={styles.boxIcon} />
                                        </div>
                                        <span className={styles.infoValue}>
                                            {selectedJob.job_type || "Fulltime"}
                                        </span>
                                    </div>
                                    <div className={styles.infoBox}>
                                        <div className={styles.boxHeader}>
                                            <span className={styles.infoLabel}>Remote</span>
                                            <MapPin size={16} className={styles.boxIcon} />
                                        </div>
                                        <span className={styles.infoValue}>
                                            No
                                        </span>
                                    </div>
                                    <div className={styles.infoBox}>
                                        <div className={styles.boxHeader}>
                                            <span className={styles.infoLabel}>Role</span>
                                            <User size={16} className={styles.boxIcon} />
                                        </div>
                                        <span className={styles.infoValue} title={selectedJob.title}>
                                            {selectedJob.title}
                                        </span>
                                    </div>
                                    <div className={styles.infoBox}>
                                        <div className={styles.boxHeader}>
                                            <span className={styles.infoLabel}>Function</span>
                                            <Layers size={16} className={styles.boxIcon} />
                                        </div>
                                        <span className={styles.infoValue}>
                                            N/A
                                        </span>
                                    </div>
                                </div>

                                <span className={styles.sectionTitle}>Job Description</span>
                                <div className={styles.descriptionText}>
                                    <ReactMarkdown>
                                        {selectedJob.description || "No description available."}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
