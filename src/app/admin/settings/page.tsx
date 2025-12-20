'use client'

import { ProfileSettingsForm } from "@/components/settings/profile-form"
import { AppSettingsForm } from "@/components/settings/app-settings-form"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Loader2 } from "lucide-react"

export default function SettingsPage() {
    const [profile, setProfile] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const supabase = createClient()

    useEffect(() => {
        async function fetchProfile() {
            try {
                const { data: { user }, error: authError } = await supabase.auth.getUser()
                if (authError || !user) throw new Error('Not authenticated')

                const { data, error: fetchError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single()

                if (fetchError) throw fetchError
                setProfile(data)
            } catch (err: any) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        fetchProfile()
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
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-white">Settings</h1>

            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-4">
                <h2 className="text-xl font-semibold text-white">Firm Profile</h2>
                <ProfileSettingsForm initialData={profile} />
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-4">
                <h2 className="text-xl font-semibold text-white">Application Configuration</h2>
                <AppSettingsForm initialData={profile} />
            </div>
        </div>
    )
}
