import { createClient } from '@/lib/supabase/client'

export async function getIntakeByToken(token: string) {
    try {
        const supabase = createClient()
        const { data, error } = await supabase
            .rpc('get_intake_by_token', { lookup_token: token })
            .single()

        if (error) return { success: false, error: error.message }
        if (!data) return { success: false, error: 'Intake not found' }

        return { success: true, data }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}

export async function saveIntakeData(token: string, data: Record<string, any>) {
    try {
        const supabase = createClient()
        const { error } = await supabase
            .rpc('update_intake_data', {
                lookup_token: token,
                new_data: data
            })

        if (error) return { success: false, error: error.message }
        return { success: true }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}

export async function submitIntake(token: string) {
    try {
        const supabase = createClient()
        const { error } = await supabase
            .from('intakes')
            .update({ status: 'submitted', updated_at: new Date().toISOString() })
            .eq('token', token)

        if (error) return { success: false, error: error.message }
        return { success: true }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}
