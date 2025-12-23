'use server'

import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'

export async function updateTeamMemberRole(userId: string, newRole: string) {
    if (newRole !== 'admin' && newRole !== 'office') {
        return { error: 'Invalid role' }
    }

    // 1. Verify the current user is an admin
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Unauthorized' }
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'admin') {
        return { error: 'Unauthorized: Only admins can update roles' }
    }

    // 2. Perform update using Admin Client
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceRoleKey) {
        return { error: 'Server configuration error: Missing service role key' }
    }

    const adminClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceRoleKey,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    )

    const { error: updateError } = await adminClient
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId)

    if (updateError) {
        console.error('Error updating role:', updateError)
        return { error: updateError.message }
    }

    return { success: true }
}
