'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import IntakeWizard from '@/components/intake-wizard'
import { getIntakeByToken } from '@/lib/intake-client'

function IntakeContent() {
    const searchParams = useSearchParams()
    const token = searchParams.get('token')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [data, setData] = useState<any>(null)

    useEffect(() => {
        if (!token) {
            setLoading(false)
            return
        }

        async function load() {
            if (!token) return
            const result = await getIntakeByToken(token)
            if (result.success) {
                setData(result.data)
            } else {
                setError(result.error || 'Failed to load')
            }
            setLoading(false)
        }

        load()
    }, [token])

    if (loading) {
        return (
            <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
                <div className="text-white animate-pulse">Loading...</div>
            </div>
        )
    }

    if (!token || error || !data) {
        return (
            <div className="min-h-screen bg-neutral-950 flex items-center justify-center px-4">
                <div className="max-w-md w-full text-center space-y-4">
                    <div className="text-6xl">🔒</div>
                    <h1 className="text-2xl font-bold text-white">
                        {error === 'Intake not found' ? 'Invalid or Expired Link' : 'Unable to Access'}
                    </h1>
                    <p className="text-neutral-400">
                        {!token
                            ? 'No access token provided.'
                            : 'This intake link is invalid or has expired. Please contact your accountant.'}
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-neutral-950">
            <div className="max-w-3xl mx-auto pt-10 px-4">
                <Image
                    src="https://storage.googleapis.com/jjswart/c1b522_903f82c37aab4da28ae9886f72add797~mv2.avif"
                    alt="JJ Swart Deductify"
                    width={180}
                    height={50}
                    className="mb-8"
                />
            </div>
            {/* Supabase returns { data: ... } wrapped object sometimes, let's ensure we pass the inner data */}
            <IntakeWizard token={token} initialData={data.data || {}} />
        </div>
    )
}

export default function IntakePage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-neutral-950" />}>
            <IntakeContent />
        </Suspense>
    )
}
