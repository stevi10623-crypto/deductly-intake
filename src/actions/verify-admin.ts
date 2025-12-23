import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'

export async function verifyAdmin() {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Unauthorized')
    }

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceRoleKey) {
        throw new Error('Server configuration error: Missing service role key')
    }

    // Use Admin Client to check profile to bypass RLS
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

    const { data: profile, error } = await adminClient
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (error || profile?.role !== 'admin') {
        throw new Error('Unauthorized: Admin access required')
    }

    return { user, adminClient }
}
