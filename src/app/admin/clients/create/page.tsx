'use client'

import Link from 'next/link'
import { ArrowLeft, Copy, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CreateClientPage() {
    const router = useRouter()
    const supabase = createClient()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<{ token: string; clientId: string } | null>(null)
    const [copied, setCopied] = useState(false)

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setLoading(true)
        setError(null)

        const formData = new FormData(event.currentTarget)
        const name = formData.get('name') as string
        const email = formData.get('email') as string
        const taxYear = parseInt(formData.get('taxYear') as string)

        try {
            // Get current user
            const { data: { user }, error: authError } = await supabase.auth.getUser()
            if (authError || !user) throw new Error('You must be logged in')

            // Create client
            const { data: client, error: clientError } = await supabase
                .from('clients')
                .insert({
                    name,
                    email,
                    firm_admin_id: user.id
                })
                .select()
                .maybeSingle()

            if (clientError) throw clientError

            // Create intake for this client
            const { data: intake, error: intakeError } = await supabase
                .from('intakes')
                .insert({
                    client_id: client.id,
                    tax_year: taxYear,
                    status: 'not_started'
                })
                .select()
                .maybeSingle()

            if (intakeError) throw intakeError

            setSuccess({ token: intake.token, clientId: client.id })
        } catch (err: any) {
            console.error('Error:', err)
            setError(err.message || 'Failed to create client')
        } finally {
            setLoading(false)
        }
    }

    const copyIntakeLink = () => {
        const link = `${window.location.origin}/intake?token=${success?.token}`
        navigator.clipboard.writeText(link)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    if (success) {
        return (
            <div className="max-w-2xl mx-auto space-y-8">
                <div>
                    <Link href="/admin/clients" className="text-sm text-neutral-400 hover:text-white flex items-center gap-1 mb-4">
                        <ArrowLeft size={14} /> Back to Clients
                    </Link>
                    <h2 className="text-2xl font-bold text-white">Client Created Successfully!</h2>
                    <p className="text-neutral-400">Share the intake link below with your client.</p>
                </div>

                <div className="bg-neutral-950 border border-green-800 rounded-lg p-6 space-y-4">
                    <div className="flex items-center gap-2 text-green-500 mb-4">
                        <CheckCircle size={20} />
                        <span className="font-medium">Client profile and intake created</span>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-neutral-300">Secure Intake Link</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                readOnly
                                value={`${window.location.origin}/intake?token=${success.token}`}
                                className="flex-1 bg-neutral-900 border border-neutral-800 rounded-md px-3 py-2 text-white text-sm font-mono"
                                title="Secure Intake Link"
                            />
                            <button
                                onClick={copyIntakeLink}
                                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2"
                            >
                                {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                                {copied ? 'Copied!' : 'Copy'}
                            </button>
                        </div>
                        <p className="text-xs text-neutral-500">This unique link allows your client to securely access and complete their intake.</p>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <Link
                            href="/admin/clients"
                            className="bg-neutral-800 hover:bg-neutral-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                        >
                            Back to Clients
                        </Link>
                        <Link
                            href="/admin/clients/create"
                            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-md text-sm font-medium"
                        >
                            Add Another Client
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div>
                <Link href="/admin/clients" className="text-sm text-neutral-400 hover:text-white flex items-center gap-1 mb-4">
                    <ArrowLeft size={14} /> Back to Clients
                </Link>
                <h2 className="text-2xl font-bold text-white">Add New Client</h2>
                <p className="text-neutral-400">Create a new client profile to start an intake.</p>
            </div>

            <form onSubmit={handleSubmit} className="bg-neutral-950 border border-neutral-800 rounded-lg p-6 space-y-6">
                {error && (
                    <div className="bg-red-950 border border-red-800 rounded-md p-3 text-sm text-red-400">
                        {error}
                    </div>
                )}

                <div className="space-y-1">
                    <label htmlFor="clientName" className="text-xs text-neutral-500 uppercase font-bold">Client Full Name</label>
                    <input
                        id="clientName"
                        name="clientName"
                        type="text"
                        title="Client Full Name"
                        required
                        className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-sm text-white focus:ring-1 focus:ring-blue-600"
                        placeholder="e.g. John Doe"
                    />
                </div>
                <div className="space-y-1">
                    <label htmlFor="clientEmail" className="text-xs text-neutral-500 uppercase font-bold">Email Address</label>
                    <input
                        id="clientEmail"
                        name="clientEmail"
                        type="email"
                        title="Email Address"
                        required
                        className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-sm text-white focus:ring-1 focus:ring-blue-600"
                        placeholder="john@example.com"
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="taxYear" className="text-sm font-medium text-neutral-300">Tax Year *</label>
                    <select
                        id="taxYear"
                        name="taxYear"
                        required
                        defaultValue="2024"
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    >
                        <option value="2024">2024</option>
                        <option value="2023">2023</option>
                        <option value="2022">2022</option>
                    </select>
                </div>

                <div className="pt-4 flex justify-end gap-3">
                    <Link href="/admin/clients" className="px-4 py-2 text-sm font-medium text-neutral-400 hover:text-white">
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-500 disabled:bg-neutral-700 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md text-sm font-medium"
                    >
                        {loading ? 'Creating...' : 'Create Client'}
                    </button>
                </div>
            </form>
        </div>
    )
}
