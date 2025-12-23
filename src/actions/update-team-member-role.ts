'use server'

import { verifyAdmin } from './verify-admin'
import { revalidatePath } from 'next/cache'

export async function updateTeamMemberRole(userId: string, newRole: string) {
    console.log(`[UpdateRole] Changing userId: ${userId} to role: ${newRole}`);
    try {
        const { adminClient } = await verifyAdmin()

        const { data, error: updateError } = await adminClient
            .from('profiles')
            .update({ role: newRole })
            .eq('id', userId)
            .select()

        if (updateError) {
            console.error('[UpdateRole] Database error:', updateError)
            return { error: updateError.message }
        }

        console.log('[UpdateRole] Success. Data:', data);
        revalidatePath('/admin/users')
        return { success: true }
    } catch (error: any) {
        console.error('[UpdateRole] Exception:', error)
        return { error: error.message }
    }
}
