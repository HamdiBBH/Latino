import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { updateReservationStatus } from '../app/actions/reservations';

config({ path: ".env.local" });

async function run() {
    // We need a valid reservation ID. Let's find one.
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    
    const { data } = await supabase.from('reservations').select('id').limit(1).single();
    if (!data) {
        console.log("No reservation found");
        return;
    }
    
    console.log("Testing confirmation for ID:", data.id);
    const result = await updateReservationStatus(data.id, 'confirmed');
    console.log("Result:", result);
}
run();
