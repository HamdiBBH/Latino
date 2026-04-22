require('dotenv').config({ path: '.env.local' });

async function run() {
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    
    // Test the exact query
    const { data: reservation, error: fetchErr } = await supabase
        .from("reservations")
        .select("*, packages!reservations_package_id_fkey(name)")
        .limit(1)
        .single();
        
    console.log("Error:", fetchErr);
    console.log("Data:", reservation);
}
run();
