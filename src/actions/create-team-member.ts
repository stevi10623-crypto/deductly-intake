'use server'

import { verifyAdmin } from './verify-admin'
import { revalidatePath } from 'next/cache'

export async function createTeamMember(formData: FormData) {
    const email = formData.get('email') as string
    const name = formData.get('name') as string
    const role = formData.get('role') as string

    if (!email || !name || !role) {
        return { error: 'Missing required fields' }
    }

    try {
        const { adminClient } = await verifyAdmin()

        // Generate a temporary password
        const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8)

        // Create the user (auto-confirmed)
        const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
            email,
            password: tempPassword,
            email_confirm: true,
            user_metadata: {
                full_name: name
            }
        })

        if (createError) {
            console.error('Error creating user:', createError)
            return { error: createError.message }
        }

        if (!newUser.user) {
            return { error: 'Failed to create user object' }
        }

        // 3. Insert into profiles with the correct role
        const { error: profileError } = await adminClient
            .from('profiles')
            .upsert({
                id: newUser.user.id,
                email: email,
                full_name: name,
                role: role,
                updated_at: new Date().toISOString()
            })

        if (profileError) {
            console.error('Error updating profile:', profileError)
            return {
                success: true,
                message: 'User created but profile update failed. They may need to contact support.',
                tempPassword
            }
        }

        // Clean up any invites if they existed
        await adminClient.from('invites').delete().eq('email', email)

        revalidatePath('/admin/users');

        return {
            success: true,
            message: 'Team member added successfully',
            tempPassword
        }
    } catch (error: any) {
        console.error('createTeamMember error:', error)
        return { error: error.message }
    }
}
