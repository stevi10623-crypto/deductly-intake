'use server'

import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'

export async function createTeamMember(formData: FormData) {
    const email = formData.get('email') as string
    const name = formData.get('name') as string
    const role = formData.get('role') as string

    if (!email || !name || !role) {
        return { error: 'Missing required fields' }
    }

    // 1. Verify the current user is an admin using standard Request client
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Unauthorized' }
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'admin') {
        return { error: 'Unauthorized: Only admins can add team members' }
    }

    // 2. Create the new user using the Admin Client (Service Role)
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!serviceRoleKey) {
        console.error('Missing SUPABASE_SERVICE_ROLE_KEY')
        return { error: 'Server configuration error: Missing service role key' }
    }

    const adminClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceRoleKey,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    )

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
    // Note: The trigger usually handles profile creation, but we want to force the role immediately
    // and ensure the name is set correctly.

    // We'll update the profile that the trigger likely just created, or insert if it missed
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
        // Check if user was created but profile failed - strict cleanup might be unexpected so we warn
        return {
            success: true,
            message: 'User created but profile update failed. They may need to contact support.',
            tempPassword
        }
    }

    // Clean up any invites if they existed
    await adminClient.from('invites').delete().eq('email', email)

    return {
        success: true,
        message: 'Team member added successfully',
        tempPassword
    }
}
