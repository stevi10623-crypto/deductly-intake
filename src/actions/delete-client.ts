'use server'

import { verifyAdmin } from './verify-admin'

export async function deleteClient(clientId: string) {
    try {
        const { adminClient } = await verifyAdmin()

        const { error: deleteError } = await adminClient
            .from('clients')
            .delete()
            .eq('id', clientId)

        if (deleteError) {
            console.error('Error deleting client:', deleteError)
            return { error: deleteError.message }
        }

        return { success: true }
    } catch (error: any) {
        console.error('deleteClient error:', error)
        return { error: error.message }
    }
}
