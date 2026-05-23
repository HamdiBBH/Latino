import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function check() {
  const { data: reservations, error } = await supabase
            .from("reservations")
            .select("*, beach_installations(title)")
            .eq("guest_email", "bbh.design2009@gmail.com")
            .in("status", ["pending", "confirmed"])
            .gte("reservation_date", new Date().toISOString().split("T")[0])
            .order("reservation_date", { ascending: true })
            .limit(1);
  console.log("Error:", error);
  console.log("Reservations:", reservations);
}
check();
