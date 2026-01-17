"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import styles from "./page.module.css";
import Link from "next/link";
import ReactMarkdown from 'react-markdown';
import {
    ArrowLeft,
    Briefcase,
    MapPin,
    Clock,
    ExternalLink,
    Bookmark,
    Globe,
    User,
    TrendingUp,
    Layers,
    Share2,
    CheckCircle,
    ChevronRight,
    Search,
    CheckSquare,
    Square
} from "lucide-react";

type Job = {
    id: string;
    title: string;
    company: string;
    location: string;
    crawled_date: string;
    job_url: string;
    job_type?: string;
    company_logo?: string;
    site?: string;
    description?: string;
    job_url_direct?: string;
    is_remote?: boolean;
    job_level?: string;
    role?: string;
    job_function?: string;
};

const SUGGESTED_ROLES = [
    "Software Engineer",
    "Data Scientist",
    "Product Manager",
    "Sales",
    "Marketing",
    "Designer"
];

const JOB_TYPES = [
    "Fulltime",
    "Contract",
    "Internship",
    "Parttime"
];

const JOB_LEVELS = [
    "Entry level",
    "Associate",
    "Mid-Senior level",
    "Director",
    "Executive"
];

// Helper to format job type nicely (e.g. "contract" -> "Contract")
const formatJobType = (type: string | null | undefined) => {
    if (!type) return "N/A";
    return type.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
};

export default function CompanyDetailsPage() {
    const params = useParams();
    const companyName = decodeURIComponent(params.companyName as string);
    const router = useRouter();
    const { user } = useAuth();

    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSaved, setIsSaved] = useState(false);
    const [saving, setSaving] = useState(false);

    // Selection State
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());
    const [showToast, setShowToast] = useState(false);

    // Filter State
    const [searchQuery, setSearchQuery] = useState("");
    const [locationQuery, setLocationQuery] = useState("");
    const [jobTypeQuery, setJobTypeQuery] = useState("");
    const [jobLevelQuery, setJobLevelQuery] = useState("");

    // Simple Filter Toggles (Single Select for simplicity in this context or Multi - matching Jobs page)
    const [selectedJobTypes, setSelectedJobTypes] = useState<string[]>([]);
    const [selectedJobLevels, setSelectedJobLevels] = useState<string[]>([]);

    const toggleSelection = (item: string, list: string[], setList: (l: string[]) => void) => {
        if (list.includes(item)) {
            setList(list.filter(i => i !== item));
        } else {
            setList([...list, item]);
        }
    };

    // Suggestion Visibility State
    const [showJobTypeSuggestions, setShowJobTypeSuggestions] = useState(false);
    const [showJobLevelSuggestions, setShowJobLevelSuggestions] = useState(false);


    // Fetch Jobs
    useEffect(() => {
        const fetchCompanyJobs = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('jobs')
                .select('*')
                .ilike('company', companyName)
                .order('crawled_date', { ascending: false });

            if (error) {
                console.error("Error fetching jobs:", error);
            } else {
                setJobs(data || []);
            }
            setLoading(false);
        };

        if (companyName) {
            fetchCompanyJobs();
        }
    }, [companyName]);

    // Check if company is saved
    useEffect(() => {
        const checkSavedStatus = async () => {
            if (!user || !companyName) return;

            const { data } = await supabase
                .from('saved_companies')
                .select('id')
                .eq('user_id', user.id)
                .eq('company_name', companyName)
                .maybeSingle();

            if (data) {
                setIsSaved(true);
            } else {
                setIsSaved(false);
            }
        };

        checkSavedStatus();
    }, [user, companyName]);

    // Fetch saved jobs for individual job saving
    useEffect(() => {
        const fetchSavedJobs = async () => {
            if (!user) {
                setSavedJobIds(new Set());
                return;
            }
            const { data } = await supabase.from('saved_jobs').select('job_id').eq('user_id', user.id);
            if (data) {
                setSavedJobIds(new Set(data.map(d => d.job_id)));
            }
        };
        fetchSavedJobs();
    }, [user]);


    // Filter Logic
    const filteredJobs = jobs.filter(job => {
        const normSearch = searchQuery.trim().toLowerCase();
        const normLocation = locationQuery.trim().toLowerCase();

        const jobTitle = (job.title || "").toLowerCase();
        const jobLocation = (job.location || "").toLowerCase();
        const jobType = (job.job_type || "").toLowerCase();
        const jobLevel = (job.job_level || "").toLowerCase();

        // Title Search
        const matchesTitle = normSearch ? jobTitle.includes(normSearch) : true;

        // Location Search
        const matchesLocation = normLocation ? jobLocation.includes(normLocation) : true;

        // Job Type Match
        let matchesJobType = true;
        if (selectedJobTypes.length > 0) {
            matchesJobType = selectedJobTypes.some(type => jobType.includes(type.toLowerCase()));
        } else if (jobTypeQuery) {
            matchesJobType = jobType.includes(jobTypeQuery.toLowerCase());
        }

        // Job Level Match
        let matchesJobLevel = true;
        if (selectedJobLevels.length > 0) {
            matchesJobLevel = selectedJobLevels.some(level => jobLevel.includes(level.toLowerCase()));
        } else if (jobLevelQuery) {
            matchesJobLevel = jobLevel.includes(jobLevelQuery.toLowerCase());
        }

        return matchesTitle && matchesLocation && matchesJobType && matchesJobLevel;
    });


    const handleToggleSaveCompany = async () => {
        if (!user) {
            router.push(`/login?redirect=/companies/${encodeURIComponent(companyName)}`);
            return;
        }

        if (saving) return;
        setSaving(true);

        if (isSaved) {
            // Remove
            const { error } = await supabase
                .from('saved_companies')
                .delete()
                .eq('user_id', user.id)
                .eq('company_name', companyName);

            if (!error) {
                setIsSaved(false);
            }
        } else {
            // Add
            const { error } = await supabase
                .from('saved_companies')
                .insert({
                    user_id: user.id,
                    company_name: companyName
                });

            if (!error) {
                setIsSaved(true);
            } else {
                console.error("Error saving company:", error);
                alert("Could not save company.");
            }
        }
        setSaving(false);
    };

    const handleToggleSaveJob = async (jobId: string) => {
        if (!user) {
            router.push(`/login?redirect=/companies/${encodeURIComponent(companyName)}`);
            return;
        }

        const isSavedJob = savedJobIds.has(jobId);

        if (isSavedJob) {
            const { error } = await supabase.from('saved_jobs').delete().match({ user_id: user.id, job_id: jobId });
            if (!error) {
                setSavedJobIds(prev => {
                    const next = new Set(prev);
                    next.delete(jobId);
                    return next;
                });
            }
        } else {
            const { error } = await supabase.from('saved_jobs').insert({ user_id: user.id, job_id: jobId });
            if (!error) {
                setSavedJobIds(prev => {
                    const next = new Set(prev);
                    next.add(jobId);
                    return next;
                });
            }
        }
    };

    const handleApply = (e: React.MouseEvent, url: string) => {
        e.preventDefault();
        if (!user) {
            const returnUrl = encodeURIComponent(window.location.href);
            router.push(`/login?redirect=${returnUrl}`);
        } else {
            window.open(url, '_blank', 'noopener,noreferrer');
        }
    };

    const handleSelectJob = (job: Job | null) => {
        setSelectedJob(job);
    };

    const handleShare = async () => {
        if (!selectedJob) return;
        const shareUrl = `${window.location.origin}/jobs?jobId=${selectedJob.id}`;
        try {
            await navigator.clipboard.writeText(shareUrl);
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
        } catch (err) {
            console.error("Failed to copy link: ", err);
        }
    };

    // Swipe Logic for Mobile
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);

    const onTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    }

    const onTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    }

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isRightSwipe = distance < -50;

        if (isRightSwipe) {
            handleSelectJob(null);
        }
    }

    if (loading) {
        return <div className={styles.loading}>Loading company details...</div>;
    }

    const companyLogo = jobs.find(j => j.company_logo)?.company_logo;

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div style={{ maxWidth: '1600px', margin: '0 auto', width: '100%', paddingBottom: '1rem' }}>
                    <Link href="/saved-companies" className={styles.backLink}>
                        <ArrowLeft size={16} />
                        Back to Saved Companies
                    </Link>
                </div>

                <div className={styles.companyInfo}>
                    <div className={styles.logoWrapper}>
                        {companyLogo ? (
                            <img
                                src={companyLogo}
                                alt={`${companyName} logo`}
                                className={styles.logoImage}
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.nextElementSibling?.removeAttribute('style');
                                }}
                            />
                        ) : null}
                        <Briefcase
                            size={32}
                            style={{ display: companyLogo ? 'none' : 'block', opacity: 0.5 }}
                        />
                    </div>
                    <div>
                        <h1 className={styles.companyName}>{companyName}</h1>
                        <p className={styles.jobCount}>
                            {jobs.length} total positions, {filteredJobs.length} match filters
                        </p>
                    </div>
                    <div className={styles.actions}>
                        <button
                            className={`${styles.saveButton} ${isSaved ? styles.activeSave : ''}`}
                            onClick={handleToggleSaveCompany}
                            disabled={saving}
                        >
                            <Bookmark size={20} fill={isSaved ? "currentColor" : "none"} />
                            {isSaved ? "Saved" : "Save Company"}
                        </button>
                    </div>
                </div>
            </header>

            <main className={styles.main}>
                {/* Left Column: Job List */}
                <div className={styles.jobList}>

                    {/* Filters Section */}
                    <div className={styles.filtersContainer}>
                        <div className={styles.filterInputGroup}>
                            <Search size={16} className={styles.filterIcon} />
                            <input
                                type="text"
                                placeholder="Search job title"
                                className={styles.filterInput}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className={styles.filterInputGroup}>
                            <MapPin size={16} className={styles.filterIcon} />
                            <input
                                type="text"
                                placeholder="Filter location"
                                className={styles.filterInput}
                                value={locationQuery}
                                onChange={(e) => setLocationQuery(e.target.value)}
                            />
                        </div>

                        <div className={styles.filterInputGroup}>
                            <Clock size={16} className={styles.filterIcon} />
                            <input
                                type="text"
                                placeholder="Job type"
                                className={styles.filterInput}
                                value={jobTypeQuery}
                                onChange={(e) => setJobTypeQuery(e.target.value)}
                                onFocus={(e) => {
                                    setShowJobTypeSuggestions(true);
                                    e.target.select();
                                }}
                                onBlur={() => setTimeout(() => setShowJobTypeSuggestions(false), 200)}
                            />
                            {showJobTypeSuggestions && (
                                <div className={styles.suggestionsPopup}>
                                    {JOB_TYPES.map((type) => (
                                        <div
                                            key={type}
                                            className={styles.suggestionItem}
                                            onMouseDown={(e) => {
                                                e.preventDefault();
                                                toggleSelection(type, selectedJobTypes, setSelectedJobTypes);
                                                setJobTypeQuery(""); // Clear text input after checking box? or keep it?
                                                // Actually let's just use the checkbox logic primarily
                                            }}
                                        >
                                            {selectedJobTypes.includes(type) ? (
                                                <CheckSquare size={16} style={{ color: '#60a5fa' }} />
                                            ) : (
                                                <Square size={16} style={{ color: '#52525b' }} />
                                            )}
                                            {type}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className={styles.filterInputGroup}>
                            <Briefcase size={16} className={styles.filterIcon} />
                            <input
                                type="text"
                                placeholder="Experience"
                                className={styles.filterInput}
                                value={jobLevelQuery}
                                onChange={(e) => setJobLevelQuery(e.target.value)}
                                onFocus={(e) => {
                                    setShowJobLevelSuggestions(true);
                                    e.target.select();
                                }}
                                onBlur={() => setTimeout(() => setShowJobLevelSuggestions(false), 200)}
                            />
                            {showJobLevelSuggestions && (
                                <div className={styles.suggestionsPopup}>
                                    {JOB_LEVELS.map((level) => (
                                        <div
                                            key={level}
                                            className={styles.suggestionItem}
                                            onMouseDown={(e) => {
                                                e.preventDefault();
                                                toggleSelection(level, selectedJobLevels, setSelectedJobLevels);
                                                setJobLevelQuery("");
                                            }}
                                        >
                                            {selectedJobLevels.includes(level) ? (
                                                <CheckSquare size={16} style={{ color: '#60a5fa' }} />
                                            ) : (
                                                <Square size={16} style={{ color: '#52525b' }} />
                                            )}
                                            {level}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>


                    {filteredJobs.length > 0 ? (
                        <div className={styles.cardsContainer}>
                            {filteredJobs.map((job) => (
                                <div
                                    key={job.id}
                                    onClick={() => handleSelectJob(job)}
                                    className={`${styles.card} ${selectedJob?.id === job.id ? styles.activeCard : ''}`}
                                >
                                    <div className={styles.cardHeader}>
                                        <div>
                                            <h3 className={styles.jobTitle}>{job.title}</h3>
                                        </div>
                                        {selectedJob?.id === job.id && (
                                            <ChevronRight className={styles.activeIcon} size={20} />
                                        )}
                                    </div>
                                    <p className={styles.companyNameSmall}>
                                        {job.location}
                                    </p>
                                    <div className={styles.tags}>
                                        <span className={styles.tag}>
                                            <Clock size={12} style={{ marginRight: 4 }} />
                                            {formatJobType(job.job_type)}
                                        </span>
                                        <span className={styles.tag}>
                                            <Globe size={12} style={{ marginRight: 4 }} />
                                            {job.site || "Job Board"}
                                        </span>
                                    </div>
                                    <div className={styles.postedDate}>
                                        Posted {job.crawled_date}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className={styles.emptyState}>
                            <h2>No jobs match your filters</h2>
                            <p>Try adjusting your search or filters to see more results.</p>
                        </div>
                    )}
                </div>

                {/* Right Column: Job Details */}
                <div
                    className={`${styles.jobDetails} ${selectedJob ? styles.showOnMobile : ''}`}
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    onTouchEnd={onTouchEnd}
                >
                    {selectedJob ? (
                        <div className={styles.detailsContainer}>
                            <div className={styles.detailsHeader}>
                                <div className={styles.backButton} onClick={() => handleSelectJob(null)}>
                                    <ArrowLeft size={16} /> Back to jobs
                                </div>

                                <h1 style={{ lineHeight: 1.2 }}>{selectedJob.title}</h1>

                                <div className={styles.detailsMeta}>
                                    <span>{selectedJob.company}</span>
                                    <span className={styles.dot}>•</span>
                                    <span>{selectedJob.location}</span>
                                </div>

                                <div className={styles.actionButtons}>
                                    {selectedJob.job_url_direct && selectedJob.job_url_direct !== 'NULL' && (
                                        <a
                                            href={selectedJob.job_url_direct}
                                            onClick={(e) => handleApply(e, selectedJob.job_url_direct!)}
                                            className={styles.applyButton}
                                        >
                                            Apply Direct
                                            <ExternalLink size={18} />
                                        </a>
                                    )}
                                    <a
                                        href={selectedJob.job_url}
                                        onClick={(e) => handleApply(e, selectedJob.job_url)}
                                        className={
                                            (selectedJob.job_url_direct && selectedJob.job_url_direct !== 'NULL')
                                                ? styles.saveButton // fallback style button if direct exists
                                                : styles.applyButton
                                        }
                                    >
                                        {selectedJob.site ? `Apply on ${selectedJob.site}` : "Apply now"}
                                        <ExternalLink size={18} />
                                    </a>

                                    <button
                                        onClick={() => handleToggleSaveJob(selectedJob.id)}
                                        className={styles.saveButton}
                                        title={savedJobIds.has(selectedJob.id) ? "Unsave Job" : "Save Job"}
                                        style={{ padding: '0.75rem', justifyContent: 'center' }}
                                    >
                                        <Bookmark
                                            size={20}
                                            fill={savedJobIds.has(selectedJob.id) ? "currentColor" : "none"}
                                            color={savedJobIds.has(selectedJob.id) ? "#3b82f6" : "currentColor"}
                                        />
                                    </button>

                                    <div style={{ position: 'relative' }}>
                                        <button
                                            onClick={handleShare}
                                            className={styles.saveButton}
                                            title="Share Job"
                                            style={{ padding: '0.75rem', justifyContent: 'center' }}
                                        >
                                            <Share2 size={20} />
                                        </button>
                                        {showToast && (
                                            <div style={{
                                                position: 'absolute',
                                                top: '-40px',
                                                left: '50%',
                                                transform: 'translateX(-50%)',
                                                background: '#27272a',
                                                color: 'white',
                                                padding: '0.5rem 1rem',
                                                borderRadius: '0.5rem',
                                                fontSize: '0.875rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                whiteSpace: 'nowrap',
                                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
                                            }}>
                                                <CheckCircle size={16} color="#4ade80" />
                                                Link Copied!
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className={styles.detailsContent}>
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
                                            {formatJobType(selectedJob.job_type)}
                                        </span>
                                    </div>
                                    <div className={styles.infoBox}>
                                        <div className={styles.boxHeader}>
                                            <span className={styles.infoLabel}>Remote</span>
                                            <MapPin size={16} className={styles.boxIcon} />
                                        </div>
                                        <span className={styles.infoValue}>
                                            {selectedJob.is_remote ? "Yes" : "No"}
                                        </span>
                                    </div>
                                    <div className={styles.infoBox}>
                                        <div className={styles.boxHeader}>
                                            <span className={styles.infoLabel}>Role</span>
                                            <User size={16} className={styles.boxIcon} />
                                        </div>
                                        <span className={styles.infoValue}>
                                            {selectedJob.role || "N/A"}
                                        </span>
                                    </div>
                                    <div className={styles.infoBox}>
                                        <div className={styles.boxHeader}>
                                            <span className={styles.infoLabel}>Function</span>
                                            <Layers size={16} className={styles.boxIcon} />
                                        </div>
                                        <span className={styles.infoValue}>
                                            {selectedJob.job_function || "N/A"}
                                        </span>
                                    </div>
                                </div>

                                <div className={styles.descriptionText}>
                                    <h3>Job Description</h3>
                                    <ReactMarkdown>
                                        {selectedJob.description || "No description available."}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className={styles.emptyDetails}>
                            <Briefcase size={64} opacity={0.2} />
                            <p>Select a job to view details</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
