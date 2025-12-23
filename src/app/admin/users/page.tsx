'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User, Shield, ShieldAlert, Trash2, Loader2, UserPlus, Mail, Edit2, Check, X, Key, Copy } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { deleteTeamMember } from '@/actions/delete-team-member'
import { updateTeamMemberRole } from '@/actions/update-team-member-role'
import { resetTeamMemberPassword } from '@/actions/reset-team-member-password'

export default function UserManagementPage() {
    const [users, setUsers] = useState<any[]>([])
    const [invites, setInvites] = useState<any[]>([])
    const [currentUser, setCurrentUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isAdding, setIsAdding] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editName, setEditName] = useState('')
    const [copiedEmail, setCopiedEmail] = useState<string | null>(null)

    const supabase = createClient()
    const router = useRouter()

    const copyInviteLink = (email: string) => {
        const link = `${window.location.origin}/login?signup=true&email=${encodeURIComponent(email)}`
        navigator.clipboard.writeText(link)
        setCopiedEmail(email)
        setTimeout(() => setCopiedEmail(null), 2000)
    }

    const fetchData = useCallback(async () => {
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
                .maybeSingle()

            setCurrentUser(profile)

            if (!profile) {
                setError('Profile not found. Please try logging out and back in.')
                setLoading(false)
                return
            }

            if (profile.role !== 'admin') {
                setError('Unauthorized: You do not have permission to access this page.')
                setLoading(false)
                return
            }

            // Fetch actual users
            const { data: allProfiles, error: profilesError } = await supabase
                .from('profiles')
                .select('*')
                .order('full_name')

            if (profilesError) throw profilesError
            setUsers(allProfiles || [])

            // Fetch pending invites
            const { data: allInvites, error: invitesError } = await supabase
                .from('invites')
                .select('*')
                .order('created_at', { ascending: false })

            if (invitesError) {
                // If the table doesn't exist, we'll see a specific error here
                if (invitesError.code === '42P01') {
                    console.warn('Invitations table not found. Please run the SQL setup script.')
                } else {
                    console.error('Error fetching invites:', invitesError)
                }
                setInvites([])
            } else {
                setInvites(allInvites || [])
            }
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message)
            } else {
                setError('An unknown error occurred')
            }
        } finally {
            setLoading(false)
        }
    }, [supabase, router])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const toggleRole = async (userId: string, currentRole: string) => {
        const newRole = currentRole === 'admin' ? 'office' : 'admin'
        if (!confirm(`Change this user's role to ${newRole.toUpperCase()}?`)) return

        try {
            const result = await updateTeamMemberRole(userId, newRole)
            if (result.error) throw new Error(result.error)

            setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u))
            alert(`Successfully changed role to ${newRole.toUpperCase()}`)
        } catch (err: any) {
            alert(`Error changing role: ${err.message}`)
        }
    }

    const deleteUser = async (userId: string, name: string) => {
        if (!confirm(`Are you sure you want to remove ${name}? This will revoke their access immediately.`)) return

        try {
            const result = await deleteTeamMember(userId)
            if (result.error) throw new Error(result.error)

            setUsers(users.filter(u => u.id !== userId))
        } catch (err: any) {
            alert(`Error: ${err.message}`)
        }
    }

    const deleteInvite = async (email: string) => {
        if (!confirm(`Cancel invitation for ${email}?`)) return
        try {
            const { error: deleteError } = await supabase.from('invites').delete().eq('email', email)
            if (deleteError) throw deleteError
            setInvites(invites.filter(i => i.email !== email))
        } catch (err: unknown) {
            if (err instanceof Error) {
                alert(err.message)
            }
        }
    }

    const [tempPassword, setTempPassword] = useState<string | null>(null)
    const [newMemberEmail, setNewMemberEmail] = useState<string | null>(null)

    const handleAddMember = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)

        try {
            const { createTeamMember } = await import('@/actions/create-team-member')

            console.log('Creating team member with:', {
                email: formData.get('email'),
                name: formData.get('name'),
                role: formData.get('role')
            })

            const result = await createTeamMember(formData)

            console.log('Create team member result:', result)

            if (result.error) {
                alert(`Error: ${result.error}`)
                return
            }

            if (result.success) {
                if (result.tempPassword) {
                    setTempPassword(result.tempPassword)
                    setNewMemberEmail(formData.get('email') as string)
                }
                setIsAdding(false)
                fetchData() // Refresh list
                if (!result.tempPassword) {
                    alert('Team member added successfully!')
                }
            } else {
                alert('Unknown error: No success or error returned')
            }
        } catch (err: any) {
            console.error('Add member exception:', err)
            alert(`An unexpected error occurred: ${err?.message || 'Unknown'}`)
        }
    }

    const startEditing = (user: any) => {
        setEditingId(user.id)
        setEditName(user.full_name || '')
    }

    const saveName = async (userId: string) => {
        try {
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ full_name: editName })
                .eq('id', userId)

            if (updateError) throw updateError
            setUsers(users.map(u => u.id === userId ? { ...u, full_name: editName } : u))
            setEditingId(null)
        } catch (err: unknown) {
            if (err instanceof Error) {
                alert(err.message)
            }
        }
    }

    const triggerPasswordReset = async (email: string) => {
        if (!confirm(`Send a password reset link to ${email}?`)) return
        try {
            const result = await resetTeamMemberPassword(email)
            if (result.error) throw new Error(result.error)
            alert('Password reset email sent!')
        } catch (err: any) {
            alert(err.message)
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
        <div className="space-y-6">
            {tempPassword && (
                <div className="bg-green-950/30 border border-green-900/50 rounded-lg p-6 mb-6 animate-in fade-in zoom-in-95">
                    <div className="flex items-start gap-4">
                        <div className="bg-green-900/50 p-2 rounded-full text-green-400">
                            <Key size={24} />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-green-400 mb-2">User Created Successfully!</h3>
                            <p className="text-neutral-300 text-sm mb-4">
                                The account for <span className="text-white font-medium">{newMemberEmail}</span> has been created.
                                <br />They can log in immediately with this temporary password:
                            </p>
                            <div className="flex items-center gap-3">
                                <code className="bg-black/50 border border-green-500/20 px-4 py-3 rounded text-xl font-mono text-white tracking-wider select-all">
                                    {tempPassword}
                                </code>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(tempPassword)
                                        alert('Password copied!')
                                    }}
                                    className="text-neutral-400 hover:text-white p-2 hover:bg-white/5 rounded transition-colors"
                                    title="Copy Password"
                                >
                                    <Copy size={20} />
                                </button>
                            </div>
                            <p className="text-neutral-500 text-xs mt-4">
                                Please share this password with them securely. They should change it after logging in.
                            </p>
                            <button
                                onClick={() => {
                                    setTempPassword(null)
                                    setNewMemberEmail(null)
                                }}
                                className="mt-4 text-sm text-green-500 hover:text-green-400 underline"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white">Team Management</h2>
                    <p className="text-neutral-400 text-sm">Manage firm administrators and office staff.</p>
                </div>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-md font-medium transition-colors text-sm sm:text-base"
                >
                    <UserPlus size={18} />
                    <span className="sm:inline">Add Team Member</span>
                </button>
            </div>

            {isAdding && (
                <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 animate-in fade-in slide-in-from-top-4">
                    <h3 className="text-lg font-medium text-white mb-4">Invite New Member</h3>
                    <form onSubmit={handleAddMember} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-1">
                            <label className="block text-xs font-medium text-neutral-400 uppercase mb-1">Full Name</label>
                            <input name="name" required className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-white" placeholder="John Doe" />
                        </div>
                        <div className="md:col-span-1">
                            <label className="block text-xs font-medium text-neutral-400 uppercase mb-1">Email</label>
                            <input name="email" type="email" required className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-white" placeholder="email@firm.com" />
                        </div>
                        <div className="md:col-span-1">
                            <label htmlFor="invite-role" className="block text-xs font-medium text-neutral-400 uppercase mb-1">Role</label>
                            <select id="invite-role" name="role" title="Select role" className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-white">
                                <option value="office">Office Staff</option>
                                <option value="admin">Administrator</option>
                            </select>
                        </div>
                        <div className="flex items-end gap-2">
                            <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded font-medium">Add</button>
                            <button type="button" onClick={() => setIsAdding(false)} className="bg-neutral-800 hover:bg-neutral-700 text-white px-4 py-2 rounded font-medium text-sm">Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-neutral-950 border border-neutral-800 rounded-lg overflow-hidden">
                <div className="p-4 border-b border-neutral-800 bg-neutral-900/50">
                    <h3 className="text-sm font-medium text-white font-mono uppercase tracking-wider">Active Members ({users.length})</h3>
                </div>

                <div className="divide-y divide-neutral-800">
                    {users.map((user) => (
                        <div key={user.id} className="p-4 hover:bg-neutral-900/50 transition-colors group">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-400 flex-shrink-0">
                                        <User size={20} />
                                    </div>
                                    <div className="min-w-0">
                                        {editingId === user.id ? (
                                            <div className="flex items-center gap-2">
                                                <input
                                                    autoFocus
                                                    value={editName}
                                                    title="Edit full name"
                                                    placeholder="Full Name"
                                                    onChange={(e) => setEditName(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && saveName(user.id)}
                                                    className="bg-neutral-900 border border-neutral-700 rounded px-2 py-0.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 w-32 sm:w-auto"
                                                />
                                                <button onClick={() => saveName(user.id)} title="Save name" className="text-green-500 hover:text-green-400"><Check size={16} /></button>
                                                <button onClick={() => setEditingId(null)} title="Cancel editing" className="text-red-500 hover:text-red-400"><X size={16} /></button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <p className="text-white font-medium truncate">{user.full_name || 'Unnamed User'}</p>
                                                <button
                                                    onClick={() => startEditing(user)}
                                                    title="Edit User Name"
                                                    className="text-neutral-600 hover:text-neutral-400 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Edit2 size={14} />
                                                </button>
                                            </div>
                                        )}
                                        <p className="text-neutral-500 text-xs truncate">{user.email}</p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-2 ml-13 sm:ml-0">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 ${user.role === 'admin'
                                        ? "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                                        : "bg-neutral-500/10 text-neutral-500 border border-neutral-800"
                                        }`}>
                                        {user.role === 'admin' ? <Shield size={12} /> : <User size={12} />}
                                        {user.role.toUpperCase()}
                                    </span>

                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => triggerPasswordReset(user.email)}
                                            title="Send Reset Password Email"
                                            className="p-1.5 text-neutral-500 hover:text-yellow-500 hover:bg-yellow-500/10 rounded-md transition-all"
                                        >
                                            <Key size={14} />
                                        </button>

                                        {currentUser?.id !== user.id && (
                                            <>
                                                <button
                                                    onClick={() => toggleRole(user.id, user.role)}
                                                    className="text-xs text-neutral-500 hover:text-white px-1.5 py-1 hover:bg-neutral-800 rounded"
                                                >
                                                    Switch
                                                </button>
                                                <button
                                                    onClick={() => deleteUser(user.id, user.full_name || user.email)}
                                                    title="Revoke Access"
                                                    className="p-1.5 text-neutral-500 hover:text-red-500 hover:bg-red-500/10 rounded-md transition-all"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {invites.length > 0 && (
                <div className="bg-neutral-950 border border-neutral-800 rounded-lg overflow-hidden animate-in fade-in slide-in-from-bottom-4">
                    <div className="p-4 border-b border-neutral-800 bg-neutral-900/50">
                        <h3 className="text-sm font-medium text-yellow-500 font-mono uppercase tracking-wider">Pending Invitations ({invites.length})</h3>
                    </div>
                    <div className="divide-y divide-neutral-800">
                        {invites.map((invite) => (
                            <div key={invite.email} className="p-4 flex items-center justify-between hover:bg-neutral-900/50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-yellow-500/50">
                                        <Mail size={20} />
                                    </div>
                                    <div>
                                        <p className="text-white font-medium">{invite.full_name || 'Unnamed Staff'}</p>
                                        <p className="text-neutral-500 text-xs">{invite.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-xs text-neutral-500 italic">Pre-registered: {invite.role.toUpperCase()}</span>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => copyInviteLink(invite.email)}
                                            title="Copy Registration Link"
                                            className={`flex items-center gap-2 p-2 rounded-md transition-all ${copiedEmail === invite.email ? 'bg-green-500/10 text-green-500' : 'text-neutral-500 hover:text-blue-500 hover:bg-blue-500/10'}`}
                                        >
                                            {copiedEmail === invite.email ? <Check size={16} /> : <Copy size={16} />}
                                            <span className="text-xs font-medium">{copiedEmail === invite.email ? 'Copied!' : 'Copy Link'}</span>
                                        </button>
                                        <button
                                            onClick={() => deleteInvite(invite.email)}
                                            title="Cancel Invite"
                                            className="p-2 text-neutral-500 hover:text-red-500 hover:bg-red-500/10 rounded-md transition-all"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="bg-blue-950/20 border border-blue-900/30 rounded-lg p-6">
                <div className="flex items-start gap-4">
                    <ShieldAlert className="text-blue-500 flex-shrink-0" size={24} />
                    <div>
                        <h4 className="text-blue-400 font-medium mb-1 border-b border-blue-900/50 pb-1">Team Management Guide</h4>
                        <ul className="text-blue-300/70 text-sm space-y-2 mt-2">
                            <li>• <strong>Adding Members</strong>: Click &quot;Add Team Member&quot; to set their name and role. Tell them to sign up with that exact email.</li>
                            <li>• <strong>Renaming</strong>: Hover over a name and click the pencil icon to fix names like &quot;Unnamed User&quot;.</li>
                            <li>• <strong>Passwords</strong>: Click the key icon to send a reset link if a staff member forgets their password.</li>
                            <li>• <strong>Revoking Access</strong>: Click the trash icon to remove a staff member&apos;s profile and block dashboard access.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}
