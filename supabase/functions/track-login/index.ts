import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the IP address from various headers (in order of reliability)
    const cfConnectingIp = req.headers.get('cf-connecting-ip');
    const xRealIp = req.headers.get('x-real-ip');
    const xForwardedFor = req.headers.get('x-forwarded-for');
    const remoteAddr = req.headers.get('remote-addr');
    
    // Use the first available IP
    let ipAddress = cfConnectingIp || xRealIp || remoteAddr || 'Unknown';
    
    // x-forwarded-for can contain multiple IPs, take the first one
    if (!ipAddress || ipAddress === 'Unknown') {
      if (xForwardedFor) {
        ipAddress = xForwardedFor.split(',')[0].trim();
      }
    }
    
    console.log('Track login - IP detection:', { cfConnectingIp, xRealIp, xForwardedFor, remoteAddr, final: ipAddress });

    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('Missing authorization header');
      return new Response(
        JSON.stringify({ ok: false, message: 'Unauthorized' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    // Initialize Supabase client with service role for admin operations
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify JWT token and get user
    const jwt = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(jwt);
    
    if (authError || !user) {
      console.error('Invalid token:', authError?.message);
      return new Response(
        JSON.stringify({ ok: false, message: 'Invalid token' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    console.log('Tracking login for user:', user.id, 'IP:', ipAddress);

    // Update user's login info using the RPC function
    const { data, error } = await supabaseClient.rpc('update_user_login_info', {
      _user_id: user.id,
      _ip_address: ipAddress
    });

    if (error) {
      console.error('Error updating login info:', error);
      return new Response(
        JSON.stringify({ ok: false, message: 'Failed to update login info' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    console.log('Login tracked successfully for user:', user.id);

    return new Response(
      JSON.stringify({ ok: true, ip: ipAddress }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('Track login error:', error);
    return new Response(
      JSON.stringify({ ok: false, message: 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
