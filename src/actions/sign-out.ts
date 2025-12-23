'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function signOut() {
    const supabase = await createClient()
    const { error } = await supabase.auth.signOut()

    if (error) {
        console.error('Sign out server error:', error)
    }

    // Force redirect from server to ensure cookies are wiped correctly
    redirect('/login?logout=success')
}
