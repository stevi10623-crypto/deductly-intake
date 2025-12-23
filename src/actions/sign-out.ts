'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function signOut() {
    console.log('[SignOut] Starting server-side logout...');
    const supabase = await createClient()

    // 1. Tell Supabase to invalidate the session
    await supabase.auth.signOut()

    // 2. Explicitly wipe all cookies starting with 'sb-' for this domain
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();

    console.log(`[SignOut] Wiping ${allCookies.length} cookies...`);

    for (const cookie of allCookies) {
        if (cookie.name.includes('sb-')) {
            cookieStore.set({
                name: cookie.name,
                value: '',
                expires: new Date(0),
                path: '/'
            });
        }
    }

    console.log('[SignOut] Logout complete. Redirecting to /login');

    // Force redirect from server to ensure cookies are wiped correctly
    redirect('/login?logout=success')
}
