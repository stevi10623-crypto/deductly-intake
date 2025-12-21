'use client'

import { createClient } from "@/lib/supabase/client"
import { Loader2 } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"

export function AppSettingsForm({ initialData }: { initialData: any }) {
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const router = useRouter()
    const supabase = createClient()

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setLoading(true)
        setMessage(null)

        const formData = new FormData(event.currentTarget)
        const defaultTaxYear = formData.get('defaultTaxYear') ? parseInt(formData.get('defaultTaxYear') as string) : undefined
        const emailNotifications = formData.get('emailNotifications') === 'true'

        try {
            const { data: { user }, error: authError } = await supabase.auth.getUser()
            if (authError || !user) throw new Error('Not authenticated')

            const { error: profileError } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    default_tax_year: defaultTaxYear,
                    email_notifications: emailNotifications,
                    updated_at: new Date().toISOString()
                })

            if (profileError) throw profileError

            setMessage({ type: 'success', text: 'Configuration saved successfully' })
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || 'Failed to save configuration' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
            {/* Hidden fields required by the shared update action */}
            <input type="hidden" name="fullName" value={initialData?.full_name || ''} />
            <input type="hidden" name="phone" value={initialData?.phone || ''} />
            <input type="hidden" name="email" value={initialData?.email || ''} />

            <div className="space-y-1">
                <label htmlFor="firmLegalName" className="text-xs text-neutral-500 uppercase font-bold">Firm Legal Name (Internal)</label>
                <input
                    id="firmLegalName"
                    name="firmLegalName"
                    type="text"
                    title="Firm Legal Name"
                    defaultValue={initialData?.firm_legal_name || ''}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-sm text-white focus:ring-1 focus:ring-blue-600"
                    placeholder="e.g. Acme Tax Services LLC"
                />
            </div>
            <div className="space-y-1">
                <label htmlFor="portalMode" className="text-xs text-neutral-500 uppercase font-bold">Portal Mode</label>
                <select
                    id="portalMode"
                    name="portalMode"
                    title="Portal Mode"
                    defaultValue={initialData?.portal_mode || "tax_intake"}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-sm text-white focus:ring-1 focus:ring-blue-600"
                >
                    <option value="tax_intake">Tax Intake Mode (Default)</option>
                    <option value="bookkeeping">Bookkeeping Mode</option>
                </select>
            </div>

            <div className="space-y-2">
                <label htmlFor="defaultTaxYear" className="text-sm font-medium text-neutral-400">Default Tax Year</label>
                <input
                    id="defaultTaxYear"
                    name="defaultTaxYear"
                    type="number"
                    title="Default Tax Year"
                    defaultValue={initialData?.default_tax_year || new Date().getFullYear()}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-md px-3 py-2 text-neutral-300 focus:outline-none focus:border-blue-500/50"
                    placeholder={new Date().getFullYear().toString()}
                />
                <p className="text-xs text-neutral-600">Used when creating new client files.</p>
            </div>

            <div className="flex items-center justify-between p-4 bg-neutral-950 border border-neutral-800 rounded-lg">
                <div className="space-y-0.5">
                    <label htmlFor="emailNotifications" className="text-sm font-medium text-neutral-300">Email Notifications</label>
                    <p className="text-xs text-neutral-500">Receive emails when clients submit intakes.</p>
                </div>
                <div className="flex items-center">
                    <input
                        id="emailNotifications"
                        name="emailNotifications"
                        type="checkbox"
                        title="Email Notifications"
                        value="true"
                        defaultChecked={initialData?.email_notifications !== false} // Default to true if undefined
                        className="w-5 h-5 rounded border-neutral-700 bg-neutral-800 text-blue-600 focus:ring-blue-500/50"
                    />
                </div>
            </div>

            {message && (
                <div className={`p-3 rounded-md text-sm ${message.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                    {message.text}
                </div>
            )}

            <button
                type="submit"
                disabled={loading}
                className="bg-neutral-800 hover:bg-neutral-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading && <Loader2 size={16} className="animate-spin" />}
                Save Configuration
            </button>
        </form>
    )
}
