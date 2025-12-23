'use server'

import { verifyAdmin } from './verify-admin'

export async function resetTeamMemberPassword(email: string) {
    try {
        const { adminClient } = await verifyAdmin()

        // Send password reset email
        const { error: resetError } = await adminClient.auth.resetPasswordForEmail(email, {
            redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || ''}/login`,
        })

        if (resetError) {
            console.error('Error sending reset email:', resetError)
            return { error: resetError.message }
        }

        return { success: true }
    } catch (error: any) {
        console.error('resetTeamMemberPassword error:', error)
        return { error: error.message }
    }
}
