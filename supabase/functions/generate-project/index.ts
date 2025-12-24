import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ============================================
// SECURITY: Input Validation Schema
// ============================================
const generateProjectSchema = z.object({
  level: z.enum(['beginner', 'intermediate', 'veteran']),
  projectType: z.string()
    .min(1, 'Project type is required')
    .max(100, 'Project type must be less than 100 characters')
    .regex(/^[a-zA-Z0-9\s\-_]+$/, 'Project type contains invalid characters'),
  industry: z.string()
    .min(1, 'Industry is required')
    .max(100, 'Industry must be less than 100 characters')
    .regex(/^[a-zA-Z0-9\s\-_&]+$/, 'Industry contains invalid characters'),
});

// ============================================
// SECURITY: Sanitize input to prevent injection
// ============================================
function sanitizeInput(input: string): string {
  return input
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>'"]/g, '')   // Remove potentially dangerous chars
    .trim();
}

// ============================================
// SECURITY: Create safe error response
// ============================================
function errorResponse(status: number, message: string): Response {
  return new Response(
    JSON.stringify({ 
      ok: false, 
      status, 
      message 
    }),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status 
    }
  );
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ============================================
    // SECURITY: Token-based authentication
    // ============================================
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('Security: Missing authorization header');
      return errorResponse(401, 'Unauthorized: Missing authorization header');
    }

    // Initialize Supabase client with service role for admin operations
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // ============================================
    // SECURITY: Verify JWT token and get user
    // ============================================
    const jwt = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(jwt);
    
    if (authError || !user) {
      console.error('Security: Invalid token', authError?.message);
      return errorResponse(401, 'Unauthorized: Invalid token');
    }

    const userId = user.id;
    console.log('Authenticated user:', userId);

    // ============================================
    // SECURITY: Check if user is banned/suspended
    // ============================================
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('status, generation_enabled')
      .eq('user_id', userId)
      .single();

    if (profileError) {
      console.error('Profile check error:', profileError);
      return errorResponse(500, 'Failed to verify user status');
    }

    if (profile?.status === 'suspended') {
      console.log('Security: User is suspended', userId);
      return errorResponse(403, 'Your account has been suspended. Contact support for assistance.');
    }

    if (profile?.generation_enabled === false) {
      console.log('Security: User generation disabled', userId);
      return errorResponse(403, 'Project generation has been disabled for your account.');
    }

    // ============================================
    // SECURITY: Parse and validate input
    // ============================================
    let requestData;
    try {
      requestData = await req.json();
    } catch {
      return errorResponse(400, 'Invalid JSON payload');
    }

    // Sanitize inputs before validation
    if (requestData.projectType) {
      requestData.projectType = sanitizeInput(requestData.projectType);
    }
    if (requestData.industry) {
      requestData.industry = sanitizeInput(requestData.industry);
    }

    // Validate with Zod schema
    const validationResult = generateProjectSchema.safeParse(requestData);
    if (!validationResult.success) {
      console.error('Security: Validation failed', validationResult.error.errors);
      return errorResponse(400, `Invalid input: ${validationResult.error.errors.map(e => e.message).join(', ')}`);
    }
    
    const { level, projectType, industry } = validationResult.data;
    console.log('Validated input:', { level, projectType, industry, userId });

    // ============================================
    // SAFE CREDIT SYSTEM: Check availability ONLY (no deduction yet)
    // Credits are ONLY deducted after successful brief generation
    // ============================================
    const { data: quotaCheckResult, error: quotaCheckError } = await supabaseClient
      .rpc('check_quota_availability', {
        _user_id: userId,
        _level: level
      });

    if (quotaCheckError) {
      console.error('Quota check error:', quotaCheckError);
      return errorResponse(500, 'Failed to check quota');
    }

    if (!quotaCheckResult.ok) {
      console.log('Quota denied:', quotaCheckResult.message);
      return errorResponse(quotaCheckResult.status, quotaCheckResult.message);
    }

    console.log('Quota check passed (not consumed yet):', quotaCheckResult.message);

    // ============================================
    // Create project with "generating" status
    // ============================================
    const { data: project, error: dbError } = await supabaseClient
      .from('projects')
      .insert({
        user_id: userId,
        title: `${projectType} Project`,
        description: `A ${level} level ${projectType} project for ${industry}`,
        type: projectType,
        level: level,
        industry: industry,
        status: 'generating',
        brief_data: null,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return errorResponse(500, 'Failed to create project');
    }

    console.log('Project created with ID:', project.id);

    // ============================================
    // Call n8n webhook (secure URL from env)
    // ============================================
    const n8nWebhookBaseUrl = Deno.env.get('N8N_WEBHOOK_URL');
    if (!n8nWebhookBaseUrl) {
      console.error('N8N_WEBHOOK_URL environment variable is not set');
      
      // Update project status to failed - NO credits lost
      await supabaseClient
        .from('projects')
        .update({ status: 'failed' })
        .eq('id', project.id);
      
      return errorResponse(500, 'Webhook configuration error');
    }

    const n8nWebhookUrl = new URL(n8nWebhookBaseUrl);
    n8nWebhookUrl.searchParams.append('level', level);
    n8nWebhookUrl.searchParams.append('projectType', projectType);
    n8nWebhookUrl.searchParams.append('industry', industry);
    n8nWebhookUrl.searchParams.append('projectId', project.id);
    n8nWebhookUrl.searchParams.append('timestamp', new Date().toISOString());
    
    console.log('Calling n8n webhook...');
    
    let n8nResponse;
    try {
      n8nResponse = await fetch(n8nWebhookUrl.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (fetchError) {
      console.error('n8n webhook fetch failed:', fetchError);
      
      // Update project status to failed - NO credits lost
      await supabaseClient
        .from('projects')
        .update({ status: 'failed' })
        .eq('id', project.id);
      
      return errorResponse(500, 'Failed to connect to brief generation service');
    }

    if (!n8nResponse.ok) {
      const errorText = await n8nResponse.text();
      console.error('n8n webhook failed:', n8nResponse.status, errorText);
      
      // Update project status to failed - NO credits lost
      await supabaseClient
        .from('projects')
        .update({ status: 'failed' })
        .eq('id', project.id);
      
      return errorResponse(500, 'Failed to generate brief');
    }

    // Parse n8n response
    let briefData;
    try {
      briefData = await n8nResponse.json();
    } catch (parseError) {
      console.error('Failed to parse n8n response:', parseError);
      
      // Update project status to failed - NO credits lost
      await supabaseClient
        .from('projects')
        .update({ status: 'failed' })
        .eq('id', project.id);
      
      return errorResponse(500, 'Invalid response from brief generation service');
    }

    console.log('Received brief data from n8n');

    // Extract first element if briefData is an array
    const briefDataObject = Array.isArray(briefData) ? briefData[0] : briefData;

    // Validate that we have actual brief content
    if (!briefDataObject || Object.keys(briefDataObject).length === 0) {
      console.error('Empty brief data received');
      
      // Update project status to failed - NO credits lost
      await supabaseClient
        .from('projects')
        .update({ status: 'failed' })
        .eq('id', project.id);
      
      return errorResponse(500, 'Empty brief received from generation service');
    }

    // Update project with brief data and completed status
    const { error: updateError } = await supabaseClient
      .from('projects')
      .update({
        brief_data: briefDataObject,
        status: 'completed',
      })
      .eq('id', project.id);

    if (updateError) {
      console.error('Failed to update project with brief:', updateError);
      
      // Mark as failed - NO credits lost
      await supabaseClient
        .from('projects')
        .update({ status: 'failed' })
        .eq('id', project.id);
      
      return errorResponse(500, 'Failed to save brief data');
    }

    console.log('Project updated with brief data successfully');

    // ============================================
    // SAFE CREDIT SYSTEM: Only NOW consume quota/credits
    // This ensures credits are only deducted after successful generation
    // ============================================
    const { data: consumeResult, error: consumeError } = await supabaseClient
      .rpc('consume_quota_after_success', {
        _user_id: userId,
        _level: level
      });

    if (consumeError) {
      console.error('Error consuming quota (brief already saved):', consumeError);
      // Don't fail the request - the brief was successfully generated
      // Log this for manual review if needed
    } else {
      console.log('Quota/credits consumed after successful generation:', consumeResult);
    }

    const creditsUsed = consumeResult?.credits_used || 0;

    // ============================================
    // Award XP for project creation
    // ============================================
    try {
      // Update user XP directly in database
      const { data: xpData, error: xpFetchError } = await supabaseClient
        .from('user_xp')
        .select('total_xp, level')
        .eq('user_id', userId)
        .maybeSingle();

      if (xpFetchError) {
        console.error('Error fetching user XP:', xpFetchError);
      } else {
        const XP_VALUES: Record<string, number> = {
          beginner: 50,
          intermediate: 100,
          veteran: 200
        };
        const xpGain = XP_VALUES[level] || 50;
        
        const currentXP = xpData?.total_xp || 0;
        const currentLevel = xpData?.level || 1;
        const newTotalXP = currentXP + xpGain;
        
        // Calculate new level (1000 XP per level)
        const newLevel = Math.floor(newTotalXP / 1000) + 1;
        const leveledUp = newLevel > currentLevel;
        
        if (xpData) {
          // Update existing XP
          await supabaseClient
            .from('user_xp')
            .update({ total_xp: newTotalXP, level: newLevel })
            .eq('user_id', userId);
        } else {
          // Create new XP record
          await supabaseClient
            .from('user_xp')
            .insert({ user_id: userId, total_xp: xpGain, level: newLevel });
        }
        
        // Log XP event
        await supabaseClient
          .from('xp_events')
          .insert({ user_id: userId, event_type: 'project_created', xp_gained: xpGain });
        
        // Check for first_project badge
        const { count: projectCount } = await supabaseClient
          .from('projects')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId);
        
        if (projectCount === 1) {
          // Award first_project badge
          const { error: badgeError } = await supabaseClient
            .from('user_badges')
            .insert({ user_id: userId, badge_type: 'first_project' });
          
          if (!badgeError) {
            console.log('First project badge awarded');
          }
        }
        
        console.log(`XP awarded: ${xpGain}, New total: ${newTotalXP}, Level: ${newLevel}, Leveled up: ${leveledUp}`);
      }
    } catch (xpError) {
      console.error('Error awarding XP:', xpError);
      // Don't fail the request if XP award fails
    }

    // ============================================
    // Return success response
    // ============================================
    return new Response(
      JSON.stringify({ 
        ok: true,
        status: 200,
        id: project.id,
        message: 'Project created and brief generated successfully',
        credits_used: creditsUsed
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    // ============================================
    // SECURITY: Safe error handling - no stack traces
    // ============================================
    console.error('Unexpected error:', error);
    return errorResponse(500, 'An unexpected error occurred');
  }
});