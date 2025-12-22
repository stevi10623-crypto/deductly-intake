'use client'

import Link from 'next/link'
import { Plus, User, FileText, Calendar, ExternalLink, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ClientExportButton } from '@/components/client-export-button'

export default function ClientsPage() {
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
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white">Clients</h2>
                    <p className="text-neutral-400">Manage your client list and monitor intake progress.</p>
                </div>
                <div className="flex gap-3">
                    <ClientExportButton clients={clients ?? []} />
                    <Link
                        href="/admin/clients/create"
                        className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors"
                    >
                        <Plus size={16} />
                        Add Client
                    </Link>
                </div>
            </div>

            {clients && clients.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                    {clients.map((client: any) => {
                        const intake = client.intakes?.[0]
                        const status = intake?.status || 'no_intake'

                        return (
                            <div key={client.id} className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-4 sm:p-6 hover:border-neutral-700 transition-colors">
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-600/10 flex items-center justify-center text-blue-500 flex-shrink-0">
                                            <User size={20} />
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="text-base sm:text-lg font-semibold text-white truncate">{client.name}</h3>
                                            <p className="text-neutral-400 text-sm truncate">{client.email}</p>

                                            <div className="flex flex-wrap items-center gap-3 mt-3">
                                                <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                                                    <Calendar size={14} />
                                                    Tax Year: {intake?.tax_year || 'N/A'}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                                                    <FileText size={14} />
                                                    {status === 'submitted' ? 'Submitted' : status === 'in_progress' ? 'In Progress' : 'Not Started'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2 ml-14 sm:ml-0">
                                        <span className={cn(
                                            "px-2.5 py-0.5 rounded-full text-xs font-medium",
                                            status === 'submitted' ? "bg-green-500/10 text-green-500" :
                                                status === 'in_progress' ? "bg-blue-500/10 text-blue-500" :
                                                    "bg-neutral-500/10 text-neutral-500"
                                        )}>
                                            {status.replace('_', ' ').toUpperCase()}
                                        </span>

                                        <div className="flex items-center gap-2">
                                            <Link
                                                href={`/admin/clients/detail?id=${client.id}`}
                                                className="text-xs text-blue-500 hover:text-blue-400 font-medium"
                                            >
                                                View Details
                                            </Link>
                                            <span className="text-neutral-700">|</span>
                                            <Link
                                                href={`/intake?token=${intake?.token}`}
                                                target="_blank"
                                                className="text-xs text-neutral-500 hover:text-white flex items-center gap-1"
                                            >
                                                Public Link <ExternalLink size={12} />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            ) : (
                <div className="text-center py-20 bg-neutral-900/30 border border-dashed border-neutral-800 rounded-lg">
                    <User className="mx-auto text-neutral-600 mb-4" size={48} />
                    <h3 className="text-lg font-medium text-white">No clients found</h3>
                    <p className="text-neutral-500 mt-1 max-w-xs mx-auto">
                        Get started by adding your first client and sending them an intake link.
                    </p>
                    <Link
                        href="/admin/clients/create"
                        className="inline-flex items-center gap-2 mt-6 text-blue-500 hover:text-blue-400 font-medium"
                    >
                        <Plus size={16} /> Add your first client
                    </Link>
                </div>
            )}
        </div>
    )
}

function cn(...classes: any[]) {
    return classes.filter(Boolean).join(' ')
}
