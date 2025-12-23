'use server'

import { verifyAdmin } from './verify-admin'
import { revalidatePath } from 'next/cache'

export async function deleteTeamMember(userId: string) {
    console.log(`[DeleteTeam] Starting for userId: ${userId}`);
    try {
        const { adminClient, user: initiator } = await verifyAdmin();
        console.log(`[DeleteTeam] Admin verified. Initiator: ${initiator.email}`);

        // 1. Explicitly delete from profiles table first (in case of cascade issues)
        const { error: profileError } = await adminClient
            .from('profiles')
            .delete()
            .eq('id', userId);

        if (profileError) {
            console.warn('[DeleteTeam] Warning: Profile deletion error (may already be gone):', profileError);
        }

        // 2. Delete from Auth
        const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId);

        if (deleteError) {
            console.error('[DeleteTeam] Error deleting auth user:', deleteError);
            return { error: deleteError.message };
        }

        console.log('[DeleteTeam] User deleted successfully');
        revalidatePath('/admin/users');
        return { success: true };
    } catch (error: any) {
        console.error('[DeleteTeam] Exception:', error);
        return { error: error.message };
    }
}
