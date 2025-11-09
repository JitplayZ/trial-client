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
    const userId = user.id; // Use authenticated user ID

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

    // Call n8n webhook asynchronously (don't wait for response)
    const n8nWebhookUrl = new URL('https://n8n-imnxqzfh.us-west-1.clawcloudrun.com/webhook-test/generate-brief');
    n8nWebhookUrl.searchParams.append('level', level);
    n8nWebhookUrl.searchParams.append('projectType', projectType);
    n8nWebhookUrl.searchParams.append('industry', industry);
    n8nWebhookUrl.searchParams.append('projectId', project.id);
    n8nWebhookUrl.searchParams.append('timestamp', new Date().toISOString());
    
    console.log('Triggering n8n webhook asynchronously...');
    
    // Fire and forget - n8n will call back when ready
    fetch(n8nWebhookUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }).catch(err => console.error('n8n webhook trigger failed:', err));

    // Return immediately with project ID
    return new Response(
      JSON.stringify({ 
        success: true, 
        id: project.id,
        status: 'generating',
        message: 'Project creation started. Brief is being generated...'
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
