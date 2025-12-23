'use server'

import { verifyAdmin } from './verify-admin'

export async function updateTeamMemberRole(userId: string, newRole: string) {
    try {
        const { adminClient } = await verifyAdmin()

        const { error: updateError } = await adminClient
            .from('profiles')
            .update({ role: newRole })
            .eq('id', userId)

        if (updateError) {
            console.error('Error updating role:', updateError)
            return { error: updateError.message }
        }

        return { success: true }
    } catch (error: any) {
        console.error('updateTeamMemberRole error:', error)
        return { error: error.message }
    }
}
