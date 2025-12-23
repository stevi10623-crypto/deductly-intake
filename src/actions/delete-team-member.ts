'use server'

import { verifyAdmin } from './verify-admin'
import { revalidatePath } from 'next/cache'

export async function deleteTeamMember(userId: string) {
    console.log(`[DeleteTeam] Starting for userId: ${userId}`);
    try {
        const { adminClient } = await verifyAdmin()

        // 1. Explicitly delete from profiles first to ensure clean removal
        const { error: profileError } = await adminClient
            .from('profiles')
            .delete()
            .eq('id', userId)

        if (profileError) {
            console.error('[DeleteTeamMember] Profile deletion error:', profileError)
            return { error: `Profile deletion failed: ${profileError.message}` }
        }

        // 2. Delete from Auth
        const { error: authError } = await adminClient.auth.admin.deleteUser(userId)
        if (authError) {
            console.error('[DeleteTeamMember] Auth deletion error:', authError)
            return { error: `Auth deletion failed: ${authError.message}` }
        }

        console.log('[DeleteTeamMember] Success. Revalidating path...');
        revalidatePath('/admin/users')
        return { success: true }
    } catch (error: any) {
        console.error('[DeleteTeamMember] Exception:', error)
        return { error: error.message }
    }
}
