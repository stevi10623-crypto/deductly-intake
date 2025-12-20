'use client'

import Link from 'next/link'
import { ChevronLeft, User, Mail, Calendar, FileText, CheckCircle, Clock, Download, ExternalLink, Loader2 } from 'lucide-react'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { INTAKE_SECTIONS } from '@/lib/rules-engine'
import { SingleClientExportButton } from '@/components/single-client-export-button'
import { ClientDeleteButton } from '@/components/client-delete-button'

function ClientDetailContent() {
    const searchParams = useSearchParams()
    const id = searchParams.get('id')
    const [client, setClient] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const supabase = createClient()

    useEffect(() => {
        if (!id) {
            setLoading(false)
            return
        }

        async function fetchClient() {
            try {
                const { data, error: fetchError } = await supabase
                    .from('clients')
                    .select(`
                        *,
                        intakes (
                            id,
                            tax_year,
                            status,
                            token,
                            data,
                            created_at,
                            updated_at
                        )
                    `)
                    .eq('id', id)
                    .single()

                if (fetchError) throw fetchError
                setClient(data)
            } catch (err: any) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        fetchClient()
    }, [id])

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="animate-spin text-neutral-500" />
            </div>
        )
    }

    if (error || !client || !id) {
        return (
            <div className="bg-red-950 border border-red-800 rounded-md p-4 text-red-400">
                Error: {!id ? 'No client identity provided' : error || 'Client not found'}
                <div className="mt-4">
                    <Link href="/admin/clients" className="text-neutral-300 hover:text-white underline">
                        Back to Clients
                    </Link>
                </div>
            </div>
        )
    }

    const intake = client.intakes?.[0]
    const intakeData = intake?.data || {}

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-20">
            {/* Header / Back Link */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between w-full">
                    <Link
                        href="/admin/clients"
                        className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors text-sm w-fit"
                    >
                        <ChevronLeft size={16} /> Back to Clients
                    </Link>
                    <ClientDeleteButton clientId={client.id} clientName={client.name} />
                </div>

                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white">{client.name}</h1>
                        <div className="flex items-center gap-4 mt-2 text-neutral-400">
                            <div className="flex items-center gap-1.5">
                                <Mail size={16} />
                                {client.email}
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Calendar size={16} />
                                Tax Year: {intake?.tax_year}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-3 text-right">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${intake?.status === 'submitted' ? "bg-green-500/10 text-green-500 border border-green-500/20" :
                            intake?.status === 'in_progress' ? "bg-blue-500/10 text-blue-500 border border-blue-500/20" :
                                "bg-neutral-500/10 text-neutral-500 border border-neutral-800"
                            }`}>
                            {intake?.status.replace('_', ' ').toUpperCase()}
                        </span>
                        <div className="text-xs text-neutral-500">
                            Last Updated: {intake?.updated_at ? new Date(intake.updated_at).toLocaleString() : 'Never'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Stats/Summary Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
                    <div className="text-neutral-500 text-xs font-medium uppercase tracking-wider mb-2">Submission Status</div>
                    <div className="flex items-center gap-3">
                        {intake?.status === 'submitted' ? (
                            <CheckCircle className="text-green-500" size={20} />
                        ) : (
                            <Clock className="text-blue-500" size={20} />
                        )}
                        <span className="text-white font-medium">
                            {intake?.status === 'submitted' ? 'Complete & Finalized' : 'Still in Progress'}
                        </span>
                    </div>
                </div>

                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
                    <div className="text-neutral-500 text-xs font-medium uppercase tracking-wider mb-2">Public Access</div>
                    <div className="flex items-center gap-3">
                        <ExternalLink className="text-neutral-400" size={20} />
                        <Link
                            href={`/intake?token=${intake?.token}`}
                            target="_blank"
                            className="text-blue-500 hover:underline text-sm truncate"
                        >
                            Open Client View
                        </Link>
                    </div>
                </div>

                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
                    <div className="text-neutral-500 text-xs font-medium uppercase tracking-wider mb-2">Export Data</div>
                    <SingleClientExportButton client={client} intakeData={intakeData} />
                </div>
            </div>

            {/* Content Explorer */}
            <div className="space-y-10">
                <h2 className="text-xl font-semibold text-white border-b border-neutral-800 pb-2">Intake Responses</h2>

                {INTAKE_SECTIONS.map((section) => {
                    // Check if this section has any data or was active
                    // If it's a business section but user is Personal Only, skip
                    if (section.category === 'business' && intakeData.taxType !== 'Personal + Business (Self-Employed/Freelance)') {
                        return null;
                    }

                    // Check if the gating question was answered 'No'
                    const gatingValue = section.gatingQuestion ? intakeData[section.gatingQuestion.id] : true;

                    return (
                        <div key={section.id} className="bg-neutral-950 border border-neutral-800 rounded-xl overflow-hidden">
                            <div className="bg-neutral-900 px-6 py-4 border-b border-neutral-800 flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-medium text-white">{section.title}</h3>
                                    <p className="text-xs text-neutral-400">{section.category.toUpperCase()}</p>
                                </div>
                                {section.gatingQuestion && (
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${gatingValue === true ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                                        }`}>
                                        {section.gatingQuestion.text}: {gatingValue === true ? 'Yes' : gatingValue === false ? 'No' : 'N/A'}
                                    </span>
                                )}
                            </div>

                            <div className="px-6 py-6">
                                {gatingValue === true ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                                        {section.fields.map(field => {
                                            const value = intakeData[field.id];
                                            return (
                                                <div key={field.id} className="space-y-1">
                                                    <div className="text-xs text-neutral-500 font-medium">{field.label}</div>
                                                    <div className="text-white font-medium min-h-[1.5rem]">
                                                        {value === undefined || value === '' ? (
                                                            <span className="text-neutral-700 italic">No response</span>
                                                        ) : field.type === 'textarea' ? (
                                                            <p className="whitespace-pre-wrap text-neutral-300 text-sm leading-relaxed">{value}</p>
                                                        ) : field.type === 'currency' ? (
                                                            new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value))
                                                        ) : String(value)}
                                                    </div>
                                                </div>
                                            )
                                        })}

                                        {/* Document Placeholder */}
                                        <div className="col-span-full pt-4 mt-4 border-t border-neutral-800/50">
                                            <div className="text-xs text-neutral-500 font-medium mb-3">Uploaded Documents</div>
                                            <div className="flex flex-wrap gap-4">
                                                {intakeData[`${section.id}_files`] && intakeData[`${section.id}_files`].length > 0 ? (
                                                    intakeData[`${section.id}_files`].map((file: any, idx: number) => {
                                                        const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://YOUR_PROJECT_ID.supabase.co';
                                                        const fileUrl = `${baseUrl}/storage/v1/object/public/intake-documents/${file.path}`;
                                                        console.log(`[Debug] File link for ${file.name}:`, fileUrl);

                                                        return (
                                                            <a
                                                                key={idx}
                                                                href={fileUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 rounded-md px-3 py-2 text-sm text-neutral-300 hover:text-white hover:border-neutral-600 transition-all"
                                                            >
                                                                <FileText size={14} className="text-blue-500" />
                                                                <span className="truncate max-w-[150px]">{file.name}</span>
                                                                <span className="text-xs text-neutral-500">({(file.size / 1024).toFixed(0)} KB)</span>
                                                                <Download size={14} className="text-neutral-500" />
                                                            </a>
                                                        );
                                                    })
                                                ) : (
                                                    <div className="text-sm text-neutral-600 italic">No files uploaded for this section.</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="py-2 text-neutral-500 text-sm italic">
                                        This section was skipped by the client.
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>

            <div className="flex justify-center pt-10">
                <div className="text-neutral-600 text-xs flex items-center gap-2">
                    <FileText size={14} /> End of Submission Data
                </div>
            </div>
        </div>
    )
}

export default function ClientDetailPage() {
    return (
        <Suspense fallback={
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="animate-spin text-neutral-500" />
            </div>
        }>
            <ClientDetailContent />
        </Suspense>
    )
}
