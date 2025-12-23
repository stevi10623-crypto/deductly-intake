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
        console.error('[VerifyAdmin] CRITICAL: SUPABASE_SERVICE_ROLE_KEY is missing from environment variables.');
        throw new Error('Server configuration error: Missing service role key');
    }

    console.log('[VerifyAdmin] Service role key found. Creating admin client...');

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

    console.log('[VerifyAdmin] Checking role for user:', user.id);

    const { data: profile, error } = await adminClient
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (error) {
        console.error('[VerifyAdmin] Profile fetch error:', error);
        throw new Error(`Profile check failed: ${error.message}`);
    }

    if (profile?.role !== 'admin') {
        console.warn('[VerifyAdmin] Non-admin access attempt by:', user.email);
        throw new Error('Unauthorized: Admin access required');
    }

    return { user, adminClient }
}
