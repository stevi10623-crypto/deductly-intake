'use server'

import { createClient as createServerClient } from '@/lib/supabase/server'

export async function signOut() {
    const supabase = await createServerClient()

    try {
        await supabase.auth.signOut()
        return { success: true }
    } catch (error) {
        console.error('Sign out error:', error)
        return { success: false }
    }
}
