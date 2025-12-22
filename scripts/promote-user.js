const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://amcfgicqycelczvjjaoo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtY2ZnaWNxeWNlbGN6dmpqYW9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxMDYxNTAsImV4cCI6MjA4MTY4MjE1MH0.TZujQVXeR65X20ict8G8zdz2aZEmKJb3tcg3IHUUTCs';

const supabase = createClient(supabaseUrl, supabaseKey);

async function promoteToAdmin() {
    const email = 'rebecca@jvbeckllc.com';
    const password = '12345678';

    // Login to get ID
    const { data: { user }, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (loginError) {
        console.error('Login failed:', loginError.message);
        return;
    }

    console.log('Logged in user ID:', user.id);

    // Update profile
    // Note: The 'profiles' RLS usually allows users to update their own profile, 
    // BUT we might face restriction if only admins can update roles.
    // However, let's try updating it. Since we don't have the Service Role Key,
    // we are relying on RLS policies or a function that we can trigger.

    // Wait, the `nuclear_fix.sql` showed:
    // create policy "Profiles_OWNER" on profiles for all using (auth.uid() = id) with check (auth.uid() = id);
    // This implies a user can update their OWN profile.

    const { data, error } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', user.id)
        .select();

    if (error) {
        console.error('Error updating role:', error.message);
    } else {
        console.log('Role updated successfully:', data);
    }
}

promoteToAdmin().catch(console.error);
