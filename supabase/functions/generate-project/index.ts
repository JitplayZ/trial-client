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
    const { level, projectType, industry, userId } = await req.json();

    console.log('Generating project:', { level, projectType, industry, userId });

    if (!userId) {
      throw new Error('User ID is required');
    }

    // Call n8n webhook with GET request
    const n8nWebhookUrl = new URL('https://n8n-imnxqzfh.us-west-1.clawcloudrun.com/webhook-test/generate-brief');
    n8nWebhookUrl.searchParams.append('level', level);
    n8nWebhookUrl.searchParams.append('projectType', projectType);
    n8nWebhookUrl.searchParams.append('industry', industry);
    n8nWebhookUrl.searchParams.append('timestamp', new Date().toISOString());
    
    console.log('Calling n8n webhook...');
    const n8nResponse = await fetch(n8nWebhookUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!n8nResponse.ok) {
      console.error('n8n webhook failed:', n8nResponse.status, await n8nResponse.text());
      throw new Error('Failed to generate project brief from n8n');
    }

    const briefData = await n8nResponse.json();
    console.log('n8n response received:', JSON.stringify(briefData));

    // Check if briefData is an array with actual data
    const actualData = Array.isArray(briefData) ? briefData[0] : null;
    
    if (!actualData) {
      console.error('n8n returned invalid format:', briefData);
      throw new Error('n8n webhook did not return expected data format. Expected an array with project data.');
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Store project in database
    const { data: project, error: dbError } = await supabaseClient
      .from('projects')
      .insert({
        user_id: userId,
        title: actualData.company_name || `${projectType} Project`,
        description: actualData.tagline || `A ${level} level ${projectType} project for ${industry}`,
        type: projectType,
        brief_data: actualData,
        level: level,
        industry: industry,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      throw dbError;
    }

    console.log('Project created successfully:', project.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        id: project.id,
        data: actualData
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error generating project:', error);
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