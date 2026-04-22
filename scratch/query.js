const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
async function run() {
  const { data: installations } = await supabase.from('installations').select('*');
  console.log("Installations:", JSON.stringify(installations, null, 2));

  const { data: reservations } = await supabase.from('reservations').select('*').limit(3);
  console.log("Reservations:", JSON.stringify(reservations, null, 2));
}
run();
