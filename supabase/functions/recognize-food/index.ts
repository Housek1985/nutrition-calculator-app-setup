// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
// import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'; // Ni več potrebno za to začasno rešitev

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Začasno bomo preskočili dejansko prepoznavanje slike in vrnili prednastavljena živila.
    // const { imageBase64 } = await req.json(); // Ni več potrebno za to začasno rešitev

    // Simuliramo prepoznana živila
    const mockRecognizedFoods = [
      "Chicken Breast",
      "Apple",
      "Oatmeal",
      "Broccoli",
      "Salmon"
    ];

    return new Response(JSON.stringify({ recognizedFoods: mockRecognizedFoods }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in recognize-food function:', error);
    return new Response(JSON.stringify({ error: 'Internal server error', details: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});