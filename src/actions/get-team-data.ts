'use server'

import { verifyAdmin } from './verify-admin'

export async function getTeamManagementData() {
    try {
        const { adminClient } = await verifyAdmin()

        // Fetch all profiles using service role (bypasses RLS)
        const { data: profiles, error: profilesError } = await adminClient
            .from('profiles')
            .select('*')
            .order('full_name')

        if (profilesError) throw profilesError

        // Fetch all invites
        const { data: invites, error: invitesError } = await adminClient
            .from('invites')
            .select('*')
            .order('created_at', { ascending: false })

        if (invitesError && invitesError.code !== '42P01') {
            console.error('Error fetching invites:', invitesError)
        }

        return {
            profiles: profiles || [],
            invites: invites || []
        }
    } catch (error: any) {
        console.error('getTeamManagementData error:', error)
        return { error: error.message }
    }
}
