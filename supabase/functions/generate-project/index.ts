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
    // SECURITY: Check and consume quota/credits
    // ============================================
    const { data: quotaResult, error: quotaError } = await supabaseClient
      .rpc('check_and_consume_quota', {
        _user_id: userId,
        _level: level
      });

    if (quotaError) {
      console.error('Quota check error:', quotaError);
      return errorResponse(500, 'Failed to check quota');
    }

    if (!quotaResult.ok) {
      console.log('Quota denied:', quotaResult.message);
      return errorResponse(quotaResult.status, quotaResult.message);
    }

    console.log('Quota check passed:', quotaResult.message);

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
      
      // Update project status to failed
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
    
    const n8nResponse = await fetch(n8nWebhookUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!n8nResponse.ok) {
      const errorText = await n8nResponse.text();
      console.error('n8n webhook failed:', n8nResponse.status, errorText);
      
      // Update project status to failed
      await supabaseClient
        .from('projects')
        .update({ status: 'failed' })
        .eq('id', project.id);
      
      return errorResponse(500, 'Failed to generate brief');
    }

    // Parse n8n response
    const briefData = await n8nResponse.json();
    console.log('Received brief data from n8n');

    // Extract first element if briefData is an array
    const briefDataObject = Array.isArray(briefData) ? briefData[0] : briefData;

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
      return errorResponse(500, 'Failed to save brief data');
    }

    console.log('Project updated with brief data successfully');

    // ============================================
    // Return success response
    // ============================================
    return new Response(
      JSON.stringify({ 
        ok: true,
        status: 200,
        id: project.id,
        message: 'Project created and brief generated successfully',
        credits_used: quotaResult.credits_used || 0
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
