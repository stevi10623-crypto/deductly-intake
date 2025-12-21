'use client'

import { createClient } from "@/lib/supabase/client"
import { Loader2 } from "lucide-react"
import { useState } from "react"

export function ProfileSettingsForm({ initialData }: { initialData: any }) {
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const supabase = createClient()

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setLoading(true)
        setMessage(null)

        const formData = new FormData(event.currentTarget)
        const fullName = formData.get('fullName') as string
        const phone = formData.get('phone') as string
        const email = formData.get('email') as string
        const newPassword = formData.get('newPassword') as string
        const confirmPassword = formData.get('confirmPassword') as string

        try {
            const { data: { user }, error: authError } = await supabase.auth.getUser()
            if (authError || !user) throw new Error('Not authenticated')

            if (!fullName) throw new Error('Full name is required')

            // Handle Password Change first if provided
            if (newPassword) {
                if (newPassword !== confirmPassword) throw new Error('Passwords do not match')
                if (newPassword.length < 6) throw new Error('Password must be at least 6 characters')

                const { error: passwordError } = await supabase.auth.updateUser({ password: newPassword })
                if (passwordError) throw passwordError
            }

            // Update basic profile info
            const { error: profileError } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    full_name: fullName,
                    phone: phone,
                    updated_at: new Date().toISOString()
                })

            if (profileError) throw profileError

            // Handle Email Change if different
            if (email && email !== user.email) {
                const { error: emailError } = await supabase.auth.updateUser({ email: email })
                if (emailError) throw new Error(`Profile updated, but email failed: ${emailError.message}`)
                setMessage({ type: 'success', text: 'Profile updated. Check both emails to confirm address change.' })
            } else {
                setMessage({ type: 'success', text: newPassword ? 'Settings and password updated successfully' : 'Settings updated successfully' })
            }
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || 'Failed to update settings' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-400">Firm Name / Display Name</label>
                    <input
                        name="fullName"
                        type="text"
                        defaultValue={initialData?.full_name || ''}
                        placeholder="e.g. Acme Tax Services"
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-md px-3 py-2 text-neutral-300 focus:outline-none focus:border-blue-500/50"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-400">Phone Number</label>
                    <input
                        name="phone"
                        type="tel"
                        defaultValue={initialData?.phone || ''}
                        placeholder="(555) 123-4567"
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-md px-3 py-2 text-neutral-300 focus:outline-none focus:border-blue-500/50"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-400">Email Address</label>
                <input
                    name="email"
                    type="email"
                    defaultValue={initialData?.email || ''}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-md px-3 py-2 text-neutral-300 focus:outline-none focus:border-blue-500/50"
                />
                <p className="text-xs text-neutral-500">
                    Note: Changing email will require clicking a confirmation link sent to the new address.
                </p>
            </div>

            <div className="pt-6 border-t border-neutral-900 space-y-4">
                <h3 className="text-sm font-medium text-white">Security</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-neutral-400">New Password</label>
                        <input
                            name="newPassword"
                            type="password"
                            placeholder="••••••••"
                            className="w-full bg-neutral-950 border border-neutral-800 rounded-md px-3 py-2 text-neutral-300 focus:outline-none focus:border-blue-500/50"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-neutral-400">Confirm Password</label>
                        <input
                            name="confirmPassword"
                            type="password"
                            placeholder="••••••••"
                            className="w-full bg-neutral-950 border border-neutral-800 rounded-md px-3 py-2 text-neutral-300 focus:outline-none focus:border-blue-500/50"
                        />
                    </div>
                </div>
                <p className="text-xs text-neutral-500">Leave blank to keep your current password.</p>
            </div>

            {message && (
                <div className={`p-3 rounded-md text-sm ${message.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                    {message.text}
                </div>
            )}

            <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading && <Loader2 size={16} className="animate-spin" />}
                Save Changes
            </button>
        </form>
    )
}
