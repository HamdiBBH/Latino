import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function check() {
  const { data: users } = await supabase.auth.admin.listUsers();
  const emails = users.users.map(u => u.email);
  console.log("Users:", emails);

  for (const email of emails) {
      const { data } = await supabase.from('reservations').select('*').eq('guest_email', email);
      console.log(`Reservations for ${email}:`, data?.length);
  }
}
check();
