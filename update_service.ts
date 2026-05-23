import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function run() {
  const { data, error } = await supabase
    .from('services')
    .update({ 
      title: 'Loisirs & Divertissement', 
      description: 'Balade en mer, Jet ski, Paddle, Billard, Piscine et Coins photos pour immortaliser vos moments.',
      icon: 'Gamepad2'
    })
    .eq('title', 'DJ & Événements');
    
  console.log('Update result:', { data, error });
}
run();
