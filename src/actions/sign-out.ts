'use server'

import { createClient as createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function signOut() {
    const supabase = await createServerClient()

    try {
        await supabase.auth.signOut()
    } catch (error) {
        console.error('Sign out error:', error)
        // Continue anyway - we'll redirect to login
    }

    redirect('/login')
}
