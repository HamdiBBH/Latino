import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function check() {
  const { data } = await supabase.from('reservations').select('reservation_date, status').eq('guest_email', 'bbh.design2009@gmail.com').order('reservation_date', { ascending: false });
  console.log("Reservations:", data);
}
check();
