'use server'

import { verifyAdmin } from './verify-admin'

export async function updateTeamMemberRole(userId: string, newRole: string) {
    console.log(`[RoleUpdate] Starting for userId: ${userId} to role: ${newRole}`);
    try {
        const { adminClient, user: initiator } = await verifyAdmin();
        console.log(`[RoleUpdate] Admin verified. Initiator: ${initiator.email}`);

        const { data, error: updateError } = await adminClient
            .from('profiles')
            .update({ role: newRole })
            .eq('id', userId)
            .select();

        if (updateError) {
            console.error('[RoleUpdate] Error updating profile:', updateError);
            return { error: updateError.message };
        }

        console.log('[RoleUpdate] Profile updated successfully. Result:', data);
        return { success: true };
    } catch (error: any) {
        console.error('[RoleUpdate] Exception:', error);
        return { error: error.message };
    }
}
