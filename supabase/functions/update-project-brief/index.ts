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
    const briefData = await req.json();
    
    console.log('Received brief data from n8n:', JSON.stringify(briefData));

    // Extract projectId from the data
    const projectId = briefData.projectId || briefData.project_id;
    
    if (!projectId) {
      console.error('No projectId provided in the request');
      throw new Error('Project ID is required');
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Update the project with the brief data
    const { data: project, error: updateError } = await supabaseClient
      .from('projects')
      .update({
        title: briefData.company_name || briefData.title,
        description: briefData.tagline || briefData.description,
        brief_data: briefData,
        status: 'completed',
      })
      .eq('id', projectId)
      .select()
      .single();

    if (updateError) {
      console.error('Database update error:', updateError);
      throw updateError;
    }

    console.log('Project updated successfully:', project.id);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Project brief updated successfully',
        projectId: project.id
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error updating project brief:', error);
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
