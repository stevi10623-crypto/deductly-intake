'use client'

import { ExternalLink, FileText, User, Loader2 } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

export default function AdminDashboardPage() {
    const [clients, setClients] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const supabase = createClient()

    useEffect(() => {
        async function fetchClients() {
            try {
                const { data: { user }, error: authError } = await supabase.auth.getUser()
                if (authError || !user) throw new Error('Not authenticated')

                const { data, error: fetchError } = await supabase
                    .from('clients')
                    .select(`
                        *,
                        intakes (
                            id,
                            tax_year,
                            status,
                            token,
                            updated_at
                        )
                    `)
                    .order('created_at', { ascending: false })

                if (fetchError) throw fetchError
                setClients(data || [])
            } catch (err: any) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        fetchClients()
    }, [])

    // Calculate stats
    const totalClients = clients?.length || 0
    const intakesInProgress = clients?.filter((c: any) => c.intakes?.[0]?.status === 'in_progress').length || 0
    const completed = clients?.filter((c: any) => ['submitted', 'reviewed'].includes(c.intakes?.[0]?.status)).length || 0

    // Get recent activity (last 5 clients sorted by intake updated_at or created_at)
    const recentActivity = [...(clients || [])].sort((a: any, b: any) => {
        const dateA = new Date(a.intakes?.[0]?.updated_at || a.created_at).getTime()
        const dateB = new Date(b.intakes?.[0]?.updated_at || b.created_at).getTime()
        return dateB - dateA
    }).slice(0, 5)

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="animate-spin text-neutral-500" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="bg-red-950 border border-red-800 rounded-md p-4 text-red-400">
                Error: {error}
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-white">Dashboard</h2>
                <p className="text-neutral-400">Welcome back. Here is an overview of tax intake status.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Total Clients" value={totalClients.toString()} />
                <StatCard title="Intakes In Progress" value={intakesInProgress.toString()} />
                <StatCard title="Completed" value={completed.toString()} />
            </div>

            <div className="mt-8">
                <h3 className="text-lg font-medium text-white mb-4">Recent Activity</h3>
                <div className="bg-neutral-950 border border-neutral-800 rounded-lg overflow-hidden">
                    {recentActivity.length > 0 ? (
                        <div className="divide-y divide-neutral-800">
                            {recentActivity.map((client: any) => {
                                const intake = client.intakes?.[0]
                                const status = intake?.status || 'no_intake'
                                const updated = new Date(intake?.updated_at || client.created_at).toLocaleDateString()

                                return (
                                    <div key={client.id} className="p-4 flex items-center justify-between hover:bg-neutral-900/50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-400">
                                                <User size={20} />
                                            </div>
                                            <div>
                                                <p className="text-white font-medium">{client.name}</p>
                                                <p className="text-neutral-500 text-xs">Updated {updated}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className={cn(
                                                "px-2.5 py-0.5 rounded-full text-xs font-medium",
                                                status === 'submitted' ? "bg-green-500/10 text-green-500" :
                                                    status === 'in_progress' ? "bg-blue-500/10 text-blue-500" :
                                                        "bg-neutral-500/10 text-neutral-500"
                                            )}>
                                                {status.replace('_', ' ').toUpperCase()}
                                            </span>
                                            <Link href={`/admin/clients/detail?id=${client.id}`} className="text-neutral-400 hover:text-white">
                                                <ExternalLink size={16} />
                                            </Link>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="p-8 text-center text-neutral-500">
                            No recent activity found.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value }: { title: string; value: string }) {
    return (
        <div className="bg-neutral-950 border border-neutral-800 p-6 rounded-lg">
            <p className="text-sm font-medium text-neutral-500">{title}</p>
            <p className="text-3xl font-bold text-white mt-2">{value}</p>
        </div>
    );
}

function cn(...classes: any[]) {
    return classes.filter(Boolean).join(' ')
}
