'use client'

import { Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"

export function ClientDeleteButton({ clientId, clientName }: { clientId: string, clientName: string }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
    const supabase = createClient()

    useEffect(() => {
        async function checkRole() {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single()
                setIsAdmin(profile?.role === 'admin')
            }
        }
        checkRole()
    }, [])

    const handleDelete = async () => {
        if (!confirm(`Are you sure you want to permanently delete ${clientName}? This cannot be undone.`)) {
            return
        }

        setLoading(true)
        try {
            const { error } = await supabase
                .from('clients')
                .delete()
                .eq('id', clientId)

            if (!error) {
                router.push('/admin/clients')
            } else {
                alert(`Error: ${error.message}`)
            }
        } catch (error) {
            console.error("Delete failed", error)
            alert("Failed to delete client.")
        } finally {
            setLoading(false)
        }
    }

    if (isAdmin === false) return null; // Hide for non-admins
    if (isAdmin === null) return null;  // Don't show while loading role

    return (
        <button
            onClick={handleDelete}
            disabled={loading}
            className="flex items-center gap-2 text-red-500 hover:text-red-400 hover:bg-white/5 py-2 px-4 rounded-md transition-colors text-sm font-medium border border-red-500/20 hover:border-red-500/50"
        >
            <Trash2 size={16} />
            {loading ? 'Deleting...' : 'Delete Client'}
        </button>
    )
}
