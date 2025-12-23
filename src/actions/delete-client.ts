'use server'

import { verifyAdmin } from './verify-admin'
import { revalidatePath } from 'next/cache'

export async function deleteClient(clientId: string) {
    console.log(`[DeleteClient] Starting for clientId: ${clientId}`);
    try {
        const { adminClient, user: initiator } = await verifyAdmin();
        console.log(`[DeleteClient] Admin verified. Initiator: ${initiator.email}`);

        // 1. Explicitly delete associated intakes first (redundant but safe)
        const { error: intakeError } = await adminClient
            .from('intakes')
            .delete()
            .eq('client_id', clientId);

        if (intakeError) {
            console.warn('[DeleteClient] Warning: Intake deletion error:', intakeError);
        }

        // 2. Delete the client record
        const { error: deleteError } = await adminClient
            .from('clients')
            .delete()
            .eq('id', clientId);

        if (deleteError) {
            console.error('[DeleteClient] Error deleting client:', deleteError);
            return { error: deleteError.message };
        }

        console.log('[DeleteClient] Client deleted successfully');
        revalidatePath('/admin/clients');
        return { success: true };
    } catch (error: any) {
        console.error('[DeleteClient] Exception:', error);
        return { error: error.message };
    }
}
