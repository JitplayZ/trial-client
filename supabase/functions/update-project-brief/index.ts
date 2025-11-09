import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation schema
const briefDataSchema = z.object({
  projectId: z.string().uuid().optional(),
  project_id: z.string().uuid().optional(),
  company_name: z.string().min(1).max(200).optional(),
  title: z.string().min(1).max(200).optional(),
  tagline: z.string().min(1).max(500).optional(),
  description: z.string().max(5000).optional(),
}).passthrough(); // Allow additional fields

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
    const validatedData = briefDataSchema.parse(requestData);
    
    console.log('Received brief data from n8n:', JSON.stringify(validatedData));

    // Extract projectId from the data
    const projectId = validatedData.projectId || validatedData.project_id;
    
    if (!projectId) {
      console.error('No projectId provided in the request');
      throw new Error('Project ID is required');
    }

    // Verify project ownership
    const { data: project, error: ownershipError } = await supabaseClient
      .from('projects')
      .select('user_id')
      .eq('id', projectId)
      .single();

    if (ownershipError || !project) {
      throw new Error('Project not found');
    }

    if (project.user_id !== user.id) {
      throw new Error('Unauthorized: You do not own this project');
    }

    // Update the project with the brief data
    const { data: updatedProject, error: updateError } = await supabaseClient
      .from('projects')
      .update({
        title: validatedData.company_name || validatedData.title,
        description: validatedData.tagline || validatedData.description,
        brief_data: validatedData,
        status: 'completed',
      })
      .eq('id', projectId)
      .select()
      .single();

    if (updateError) {
      console.error('Database update error:', updateError);
      throw updateError;
    }

    console.log('Project updated successfully:', updatedProject.id);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Project brief updated successfully',
        projectId: updatedProject.id
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error updating project brief:', error);
    
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
