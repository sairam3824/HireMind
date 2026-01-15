"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import styles from './companies.module.css'
import { Loader2, Search, Briefcase } from 'lucide-react'

interface CompanyStats {
    name: string
    jobCount: number
}

export default function CompaniesPage() {
    const [companies, setCompanies] = useState<CompanyStats[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        fetchCompanies()
    }, [])

    const fetchCompanies = async () => {
        try {
            const companyMap = new Map<string, Set<string>>()
            let from = 0
            const step = 1000
            let fetching = true

            while (fetching) {
                const { data, error } = await supabase
                    .from('jobs')
                    .select('company, job_url')
                    .range(from, from + step - 1)

                if (error) throw error

                if (data && data.length > 0) {
                    data.forEach((job: any) => {
                        if (job.company && job.job_url) {
                            if (!companyMap.has(job.company)) {
                                companyMap.set(job.company, new Set())
                            }
                            companyMap.get(job.company)?.add(job.job_url)
                        }
                    })

                    if (data.length < step) {
                        fetching = false
                    }
                    from += step
                } else {
                    fetching = false
                }
            }

            const sortedCompanies = Array.from(companyMap.entries())
                .map(([name, urlSet]) => ({ name, jobCount: urlSet.size }))
                .sort((a, b) => a.name.localeCompare(b.name))

            setCompanies(sortedCompanies)
        } catch (error) {
            console.error('Error fetching companies:', error)
        } finally {
            setLoading(false)
        }
    }

    const filteredCompanies = companies.filter(company =>
        company.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (loading) {
        return (
            <div className={styles.loading}>
                <Loader2 className="animate-spin" size={32} />
            </div>
        )
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Companies</h1>
                <div className={styles.searchContainer}>
                    <input
                        type="text"
                        placeholder="Search companies..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={styles.searchInput}
                    />
                </div>
            </div>

            {filteredCompanies.length === 0 ? (
                <div className={styles.empty}>
                    <p>No companies found matching "{searchQuery}"</p>
                </div>
            ) : (
                <div className={styles.grid}>
                    {filteredCompanies.map((company) => (
                        <Link
                            key={company.name}
                            href={`/admin/companies/${encodeURIComponent(company.name)}`}
                            className={styles.companyCard}
                        >
                            <h2 className={styles.companyName}>{company.name}</h2>
                            <div className={styles.jobCount}>
                                <Briefcase size={16} />
                                <span>{company.jobCount} open positions</span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}
