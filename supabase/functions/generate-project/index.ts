import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation schema
const generateProjectSchema = z.object({
  level: z.enum(['beginner', 'intermediate', 'veteran']),
  projectType: z.string().min(1).max(100),
  industry: z.string().min(1).max(100),
});

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Unauthorized: Missing authorization header');
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get authenticated user from JWT
    const jwt = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(jwt);
    
    if (authError || !user) {
      throw new Error('Unauthorized: Invalid token');
    }

    // Validate and parse input
    const requestData = await req.json();
    const validatedData = generateProjectSchema.parse(requestData);
    
    const { level, projectType, industry } = validatedData;
    const userId = user.id;

    console.log('Generating project:', { level, projectType, industry, userId });

    // Create project with "generating" status immediately
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
      throw dbError;
    }

    console.log('Project created with ID:', project.id);

    // Call n8n webhook synchronously and wait for response
    const n8nWebhookBaseUrl = Deno.env.get('N8N_WEBHOOK_URL');
    if (!n8nWebhookBaseUrl) {
      console.error('N8N_WEBHOOK_URL environment variable is not set');
      throw new Error('Webhook configuration error');
    }

    const n8nWebhookUrl = new URL(n8nWebhookBaseUrl);
    n8nWebhookUrl.searchParams.append('level', level);
    n8nWebhookUrl.searchParams.append('projectType', projectType);
    n8nWebhookUrl.searchParams.append('industry', industry);
    n8nWebhookUrl.searchParams.append('projectId', project.id);
    n8nWebhookUrl.searchParams.append('timestamp', new Date().toISOString());
    
    console.log('Calling n8n webhook synchronously...');
    
    const n8nResponse = await fetch(n8nWebhookUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!n8nResponse.ok) {
      console.error('n8n webhook failed:', n8nResponse.status, await n8nResponse.text());
      
      // Update project status to failed
      await supabaseClient
        .from('projects')
        .update({ status: 'failed' })
        .eq('id', project.id);
      
      throw new Error('Failed to generate brief from n8n');
    }

    // Parse n8n response - expect brief data directly
    const briefData = await n8nResponse.json();
    console.log('Received brief data from n8n:', JSON.stringify(briefData).substring(0, 200));

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
      throw updateError;
    }

    console.log('Project updated with brief data successfully');

    // Return success with project ID
    return new Response(
      JSON.stringify({ 
        success: true, 
        id: project.id,
        status: 'completed',
        message: 'Project created and brief generated successfully'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error generating project:', error);
    
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid input',
          details: error.errors 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }
    
    // Handle authentication errors
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401 
        }
      );
    }
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
