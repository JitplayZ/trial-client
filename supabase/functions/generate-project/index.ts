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

    // Call n8n webhook
    const n8nWebhookUrl = 'https://n8n-imnxqzfh.us-west-1.clawcloudrun.com/webhook-test/generate-brief';
    
    console.log('Calling n8n webhook...');
    const n8nResponse = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        level,
        projectType,
        industry,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!n8nResponse.ok) {
      console.error('n8n webhook failed:', n8nResponse.status, await n8nResponse.text());
      throw new Error('Failed to generate project brief from n8n');
    }

    const briefData = await n8nResponse.json();
    console.log('n8n response received:', briefData);

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
        title: briefData[0]?.company_name || `${projectType} Project`,
        description: briefData[0]?.tagline || `A ${level} level ${projectType} project for ${industry}`,
        type: projectType,
        brief_data: briefData[0], // Store the entire n8n response
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
        data: briefData[0]
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