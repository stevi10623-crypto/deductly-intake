'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

function LoginContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const supabase = createClient()
    const [isSignup, setIsSignup] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [message, setMessage] = useState<string | null>(null)

    useEffect(() => {
        const signupMode = searchParams.get('signup') === 'true'
        const emailParam = searchParams.get('email')
        if (signupMode) setIsSignup(true)
    }, [searchParams])

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setLoading(true)
        setError(null)
        setMessage(null)

        const formData = new FormData(event.currentTarget)
        const email = formData.get('email') as string
        const password = formData.get('password') as string
        const fullName = formData.get('fullName') as string

        try {
            if (isSignup) {
                const { error: signUpError } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullName,
                        },
                    },
                })
                if (signUpError) throw signUpError
                setMessage('Check your email to confirm your account')
            } else {
                const { error: signInError } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                })
                if (signInError) throw signInError
                router.push('/admin')
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-neutral-950 flex items-center justify-center px-4">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-white mb-2">Deductly Intake</h1>
                    <p className="text-neutral-400">
                        {isSignup ? 'Create your account' : 'Sign in to your account'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="bg-neutral-900 border border-neutral-800 rounded-lg p-8 space-y-6">
                    {error && (
                        <div className="bg-red-950 border border-red-800 rounded-md p-3 text-sm text-red-400">
                            {error}
                        </div>
                    )}

                    {message && (
                        <div className="bg-green-950 border border-green-800 rounded-md p-3 text-sm text-green-400">
                            {message}
                        </div>
                    )}

                    {isSignup && (
                        <div className="space-y-2">
                            <label htmlFor="fullName" className="text-sm font-medium text-neutral-300">
                                Full Name
                            </label>
                            <input
                                type="text"
                                id="fullName"
                                name="fullName"
                                required
                                className="w-full bg-neutral-950 border border-neutral-800 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                                placeholder="John Doe"
                            />
                        </div>
                    )}

                    <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium text-neutral-300">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            required
                            defaultValue={searchParams.get('email') || ''}
                            className="w-full bg-neutral-950 border border-neutral-800 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                            placeholder="you@example.com"
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="password" title="Enter your password" data-testid="password-label" className="text-sm font-medium text-neutral-300">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            required
                            minLength={6}
                            className="w-full bg-neutral-950 border border-neutral-800 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-neutral-700 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md font-medium transition-colors"
                    >
                        {loading ? 'Please wait...' : isSignup ? 'Create Account' : 'Sign In'}
                    </button>

                    <div className="text-center">
                        <button
                            type="button"
                            onClick={() => {
                                setIsSignup(!isSignup)
                                setError(null)
                                setMessage(null)
                            }}
                            className="text-sm text-blue-500 hover:text-blue-400"
                        >
                            {isSignup ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                        </button>
                    </div>
                </form>

                <div className="text-center text-sm text-neutral-500">
                    <Link href="/" className="hover:text-neutral-400">
                        ← Back to home
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-neutral-950 flex items-center justify-center text-neutral-500">Loading...</div>}>
            <LoginContent />
        </Suspense>
    )
}
