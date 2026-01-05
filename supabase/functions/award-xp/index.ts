import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS configuration - restrict to known origins
const allowedOrigins = [
  'https://avsuyudchzyoyakxotfm.lovable.app',
  /^https:\/\/.*\.lovable\.app$/,
  /^https:\/\/.*\.lovable\.dev$/,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:8080',
  'http://localhost:8081',
];

function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('origin') || '';
  const isAllowed = allowedOrigins.some(allowed => {
    if (typeof allowed === 'string') return origin === allowed;
    return allowed.test(origin);
  });
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : '',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
  };
}

// Allowed event types - must match frontend constants
const ALLOWED_EVENT_TYPES = ['project_created', 'project_completed', 'referral_success', 'daily_login'] as const;
type EventType = typeof ALLOWED_EVENT_TYPES[number];

// XP amounts per event type (server-side source of truth)
const XP_AMOUNTS: Record<EventType, number> = {
  project_created: 100,
  project_completed: 150,
  referral_success: 200,
  daily_login: 25,
};

// Allowed badge types
const ALLOWED_BADGE_TYPES = ['first_project', 'level_5', 'level_10', 'xp_5000', 'referral_success', 'daily_streak_7'] as const;

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('Missing authorization header');
      return new Response(
        JSON.stringify({ ok: false, message: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with user's JWT
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Client for user verification
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });
    
    // Service client for database operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Verify user
    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ ok: false, message: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ============================================
    // SECURITY: Check maintenance mode
    // ============================================
    const { data: maintenanceData } = await supabaseAdmin
      .from('system_settings')
      .select('value')
      .eq('key', 'maintenance_mode')
      .single();

    const maintenanceEnabled = (maintenanceData?.value as { enabled?: boolean })?.enabled ?? false;

    if (maintenanceEnabled) {
      // Check if user is admin
      const { data: roleData } = await supabaseAdmin
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (!roleData) {
        console.log('Security: Maintenance mode active, blocking non-admin user', user.id);
        return new Response(
          JSON.stringify({ ok: false, message: 'System is under maintenance. Please try again later.' }),
          { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Parse and validate request
    const body = await req.json();
    const { event_type } = body;

    // Validate event type
    if (!event_type || !ALLOWED_EVENT_TYPES.includes(event_type)) {
      console.error('Invalid event type:', event_type);
      return new Response(
        JSON.stringify({ ok: false, message: 'Invalid event type' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const xpAmount = XP_AMOUNTS[event_type as EventType];
    console.log(`Awarding ${xpAmount} XP for ${event_type} to user ${user.id}`);

    // Get current user XP
    let { data: xpData, error: xpError } = await supabaseAdmin
      .from('user_xp')
      .select('total_xp, level')
      .eq('user_id', user.id)
      .maybeSingle();

    // Create XP record if doesn't exist
    if (!xpData) {
      const { data: newXpData, error: insertError } = await supabaseAdmin
        .from('user_xp')
        .insert({ user_id: user.id, total_xp: 0, level: 1 })
        .select('total_xp, level')
        .single();
      
      if (insertError) {
        console.error('Error creating XP record:', insertError);
        return new Response(
          JSON.stringify({ ok: false, message: 'Failed to initialize XP' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      xpData = newXpData;
    }

    // Calculate new XP and level
    const newTotalXP = (xpData?.total_xp || 0) + xpAmount;
    const newLevel = Math.floor(newTotalXP / 1000) + 1;
    const leveledUp = newLevel > (xpData?.level || 1);

    // Insert XP event
    const { error: eventError } = await supabaseAdmin
      .from('xp_events')
      .insert({
        user_id: user.id,
        event_type,
        xp_gained: xpAmount
      });

    if (eventError) {
      console.error('Error inserting XP event:', eventError);
    }

    // Update user XP
    const { error: updateError } = await supabaseAdmin
      .from('user_xp')
      .update({ total_xp: newTotalXP, level: newLevel })
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Error updating XP:', updateError);
      return new Response(
        JSON.stringify({ ok: false, message: 'Failed to update XP' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check and award badges
    const badgesToAward: string[] = [];

    // First project badge
    if (event_type === 'project_created') {
      const { data: existingBadge } = await supabaseAdmin
        .from('user_badges')
        .select('id')
        .eq('user_id', user.id)
        .eq('badge_type', 'first_project')
        .maybeSingle();
      
      if (!existingBadge) {
        badgesToAward.push('first_project');
      }
    }

    // Referral success badge
    if (event_type === 'referral_success') {
      const { data: existingBadge } = await supabaseAdmin
        .from('user_badges')
        .select('id')
        .eq('user_id', user.id)
        .eq('badge_type', 'referral_success')
        .maybeSingle();
      
      if (!existingBadge) {
        badgesToAward.push('referral_success');
      }
    }

    // Level badges
    if (leveledUp && (newLevel === 5 || newLevel === 10)) {
      const badgeType = `level_${newLevel}`;
      const { data: existingBadge } = await supabaseAdmin
        .from('user_badges')
        .select('id')
        .eq('user_id', user.id)
        .eq('badge_type', badgeType)
        .maybeSingle();
      
      if (!existingBadge) {
        badgesToAward.push(badgeType);
      }
    }

    // XP milestone badge
    if (newTotalXP >= 5000) {
      const { data: existingBadge } = await supabaseAdmin
        .from('user_badges')
        .select('id')
        .eq('user_id', user.id)
        .eq('badge_type', 'xp_5000')
        .maybeSingle();
      
      if (!existingBadge) {
        badgesToAward.push('xp_5000');
      }
    }

    // Award badges
    for (const badgeType of badgesToAward) {
      await supabaseAdmin
        .from('user_badges')
        .insert({ user_id: user.id, badge_type: badgeType });
      console.log(`Awarded badge: ${badgeType}`);
    }

    return new Response(
      JSON.stringify({
        ok: true,
        xp_gained: xpAmount,
        total_xp: newTotalXP,
        level: newLevel,
        leveled_up: leveledUp,
        badges_awarded: badgesToAward
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in award-xp function:', error);
    const corsHeaders = getCorsHeaders(req);
    return new Response(
      JSON.stringify({ ok: false, message: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
