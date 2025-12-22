const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://amcfgicqycelczvjjaoo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtY2ZnaWNxeWNlbGN6dmpqYW9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxMDYxNTAsImV4cCI6MjA4MTY4MjE1MH0.TZujQVXeR65X20ict8G8zdz2aZEmKJb3tcg3IHUUTCs';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRole() {
    const email = 'rebecca@jvbeckllc.com';
    const password = '12345678';

    // Login to get the user's ID and access context
    const { data: { user }, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (loginError) {
        console.error('Login failed:', loginError.message);
        return;
    }

    if (!user) {
        console.error('User not found after login?');
        return;
    }

    console.log('Logged in user ID:', user.id);

    // Fetch profile
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (profileError) {
        console.error('Error fetching profile:', profileError.message);
        // If profile doesn't exist, we might need to create it (though logic says it should exist)
    } else {
        console.log('Current Profile:', profile);
    }
}

checkRole().catch(console.error);
