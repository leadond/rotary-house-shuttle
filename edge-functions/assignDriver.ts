import { serve } from 'https://deno.land/std/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js';

serve(async (req) => {
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

  const { ride_id } = await req.json();
  const { data: ride } = await supabase.from('rides').select('*').eq('id', ride_id).single();
  const { data: drivers } = await supabase
    .from('vehicles')
    .select('id, location, driver_id')
    .eq('status', 'available');

  // TODO: Add actual distance-based selection
  const closest = drivers[0];

  await supabase.from('rides').update({ driver_id: closest.driver_id, status: 'assigned' }).eq('id', ride_id);
  await supabase.from('vehicles').update({ status: 'on_trip' }).eq('id', closest.id);

  return new Response(JSON.stringify({ assigned: closest.driver_id }), { status: 200 });
});
