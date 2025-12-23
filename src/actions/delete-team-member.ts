'use server'

import { verifyAdmin } from './verify-admin'

export async function deleteTeamMember(userId: string) {
    try {
        const { adminClient } = await verifyAdmin()

        const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId)

        if (deleteError) {
            console.error('Error deleting user:', deleteError)
            return { error: deleteError.message }
        }

        return { success: true }
    } catch (error: any) {
        console.error('deleteTeamMember error:', error)
        return { error: error.message }
    }
}
