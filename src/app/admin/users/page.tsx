'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User, Shield, ShieldAlert, Trash2, Loader2, UserPlus } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function UserManagementPage() {
    const [users, setUsers] = useState<any[]>([])
    const [currentUser, setCurrentUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        async function fetchData() {
            try {
                const { data: { user: authUser } } = await supabase.auth.getUser()
                if (!authUser) {
                    router.push('/login')
                    return
                }

                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', authUser.id)
                    .single()

                setCurrentUser(profile)

                if (profile?.role !== 'admin') {
                    setError('Unauthorized: You do not have permission to access this page.')
                    setLoading(false)
                    return
                }

                const { data: allProfiles, error: profilesError } = await supabase
                    .from('profiles')
                    .select('*')
                    .order('full_name')

                if (profilesError) throw profilesError
                setUsers(allProfiles || [])
            } catch (err: any) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    const toggleRole = async (userId: string, currentRole: string) => {
        const newRole = currentRole === 'admin' ? 'office' : 'admin'
        if (!confirm(`Change this user's role to ${newRole.toUpperCase()}?`)) return

        try {
            const { error } = await supabase
                .from('profiles')
                .update({ role: newRole })
                .eq('id', userId)

            if (error) throw error
            setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u))
        } catch (err: any) {
            alert(`Error: ${err.message}`)
        }
    }

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
                {error}
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-white">Team Management</h2>
                <p className="text-neutral-400">Manage firm administrators and office staff.</p>
            </div>

            <div className="bg-neutral-950 border border-neutral-800 rounded-lg overflow-hidden">
                <div className="p-4 border-b border-neutral-800 bg-neutral-900/50 flex items-center justify-between">
                    <h3 className="text-sm font-medium text-white font-mono uppercase tracking-wider">Firm Members</h3>
                    <div className="text-xs text-neutral-500 italic">Only admins can modify roles</div>
                </div>

                <div className="divide-y divide-neutral-800">
                    {users.map((user) => (
                        <div key={user.id} className="p-4 flex items-center justify-between hover:bg-neutral-900/50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-400">
                                    <User size={20} />
                                </div>
                                <div>
                                    <p className="text-white font-medium">{user.full_name || 'Unnamed User'}</p>
                                    <p className="text-neutral-500 text-xs">{user.email}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2">
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1.5 ${user.role === 'admin'
                                            ? "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                                            : "bg-neutral-500/10 text-neutral-500 border border-neutral-800"
                                        }`}>
                                        {user.role === 'admin' ? <Shield size={12} /> : <User size={12} />}
                                        {user.role.toUpperCase()}
                                    </span>
                                </div>

                                {currentUser.id !== user.id && (
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => toggleRole(user.id, user.role)}
                                            className="text-xs text-neutral-400 hover:text-white underline underline-offset-4"
                                        >
                                            Change Role
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-blue-950/20 border border-blue-900/30 rounded-lg p-6">
                <div className="flex items-start gap-4">
                    <ShieldAlert className="text-blue-500 flex-shrink-0" size={24} />
                    <div>
                        <h4 className="text-blue-400 font-medium mb-1 border-b border-blue-900/50 pb-1">Adding New Members</h4>
                        <p className="text-blue-300/70 text-sm leading-relaxed">
                            New staff members should sign up via the login page. Once they create an account, they will appear here as "OFFICE" users by default. You can then promote them to "ADMIN" if needed.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
