import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-callback-secret',
};

// Input validation schema - flexible to accept various n8n output formats
const briefDataSchema = z.object({
  projectId: z.string().uuid().optional(),
  project_id: z.string().uuid().optional(),
  company_name: z.string().optional(),
  title: z.string().optional(),
  tagline: z.string().optional(),
  slogan: z.string().optional(),
  location: z.string().optional(),
  primary_color_palette: z.array(z.string()).optional(),
  design_style_keywords: z.array(z.string()).optional(),
  intro: z.string().optional(),
  objective: z.string().optional(),
  requirement_design: z.string().optional(),
  about_page: z.string().optional(),
  home_page: z.string().optional(),
  order_page: z.string().optional(),
  audience: z.string().optional(),
  tips: z.string().optional(),
  description: z.string().optional(),
}).passthrough();

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check for callback secret (n8n authentication)
    const callbackSecret = req.headers.get('x-callback-secret');
    const expectedSecret = Deno.env.get('N8N_CALLBACK_SECRET');
    
    if (!callbackSecret || callbackSecret !== expectedSecret) {
      console.error('Invalid or missing callback secret');
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Invalid callback secret' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401 
        }
      );
    }

    console.log('Callback secret verified successfully');

    // Initialize Supabase client with service role key
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Parse request data (support both GET query params and POST body)
    let requestData: Record<string, unknown>;
    
    if (req.method === 'GET') {
      const url = new URL(req.url);
      requestData = Object.fromEntries(url.searchParams.entries());
      
      // Parse arrays from query params if they exist
      if (requestData.primary_color_palette && typeof requestData.primary_color_palette === 'string') {
        try {
          requestData.primary_color_palette = JSON.parse(requestData.primary_color_palette as string);
        } catch {
          requestData.primary_color_palette = (requestData.primary_color_palette as string).split(',');
        }
      }
      if (requestData.design_style_keywords && typeof requestData.design_style_keywords === 'string') {
        try {
          requestData.design_style_keywords = JSON.parse(requestData.design_style_keywords as string);
        } catch {
          requestData.design_style_keywords = (requestData.design_style_keywords as string).split(',');
        }
      }
    } else {
      requestData = await req.json();
    }

    console.log('Received brief data from n8n:', JSON.stringify(requestData));

    const validatedData = briefDataSchema.parse(requestData);

    // Extract projectId from the data
    const projectId = validatedData.projectId || validatedData.project_id;
    
    if (!projectId) {
      console.error('No projectId provided in the request');
      return new Response(
        JSON.stringify({ error: 'Project ID is required' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    console.log('Updating project:', projectId);

    // Build the brief_data object
    const briefData = {
      company_name: validatedData.company_name || validatedData.title || 'Untitled Project',
      tagline: validatedData.tagline || '',
      slogan: validatedData.slogan || '',
      location: validatedData.location || '',
      primary_color_palette: validatedData.primary_color_palette || [],
      design_style_keywords: validatedData.design_style_keywords || [],
      intro: validatedData.intro || '',
      objective: validatedData.objective || '',
      requirement_design: validatedData.requirement_design || '',
      about_page: validatedData.about_page || '',
      home_page: validatedData.home_page || '',
      order_page: validatedData.order_page || '',
      audience: validatedData.audience || '',
      tips: validatedData.tips || '',
    };

    // Update the project with the brief data using service role (bypasses RLS)
    const { data: updatedProject, error: updateError } = await supabaseClient
      .from('projects')
      .update({
        title: briefData.company_name,
        description: briefData.tagline || validatedData.description,
        brief_data: briefData,
        status: 'completed',
      })
      .eq('id', projectId)
      .select()
      .single();

    if (updateError) {
      console.error('Database update error:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update project', details: updateError.message }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      );
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
