import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Copy, Download, Share2, ArrowLeft, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

interface BriefData {
  company_name: string;
  tagline: string;
  slogan: string;
  location: string;
  primary_color_palette: string[];
  design_style_keywords: string[];
  intro: string;
  objective: string;
  requirement_design: string;
  about_page: string;
  home_page: string;
  order_page: string;
  audience: string;
  tips: string;
}

interface ProjectBrief {
  id: string;
  level: string;
  type: string;
  industry: string;
  brief_data: BriefData | null;
  created_at: string;
  status?: string;
}

export default function ProjectWorkspace() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [project, setProject] = useState<ProjectBrief | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;

        if (data) {
          setProject(data as any as ProjectBrief);
        }
      } catch (error) {
        console.error('Error loading project:', error);
        toast({
          title: 'Error loading project',
          description: 'Please try again',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProject();

    // Set up realtime subscription for project updates
    const channel = supabase
      .channel('project-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'projects',
          filter: `id=eq.${id}`
        },
        (payload) => {
          console.log('Project updated via realtime:', payload);
          setProject(payload.new as any as ProjectBrief);
          
          if (payload.new.status === 'completed') {
            toast({
              title: 'Brief Ready!',
              description: 'Your project brief has been generated successfully',
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, toast]);

  const copySection = (content: string, section: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: 'Copied!',
      description: `${section} copied to clipboard`,
    });
  };

  const downloadBrief = () => {
    if (!project || !project.brief_data) return;
    
    const briefData = project.brief_data;
    const content = `# ${briefData.company_name}\n\n${briefData.tagline}\n\n${briefData.slogan}\n\n` +
      `**Location:** ${briefData.location}\n\n` +
      `**Primary Colors:** ${briefData.primary_color_palette.join(', ')}\n\n` +
      `**Design Style:** ${briefData.design_style_keywords.join(', ')}\n\n` +
      `## INTRO\n\n${briefData.intro}\n\n` +
      `## OBJECTIVE\n\n${briefData.objective}\n\n` +
      `## REQUIREMENT DESIGN\n\n${briefData.requirement_design}\n\n` +
      `## ABOUT PAGE\n\n${briefData.about_page}\n\n` +
      `## HOME PAGE\n\n${briefData.home_page}\n\n` +
      `## ORDER PAGE\n\n${briefData.order_page}\n\n` +
      `## AUDIENCE\n\n${briefData.audience}\n\n` +
      `## TIPS\n\n${briefData.tips}\n\n`;
    
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${briefData.company_name.replace(/\s+/g, '-').toLowerCase()}-brief.md`;
    a.click();
    
    toast({
      title: 'Downloaded!',
      description: 'Project brief saved as markdown',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="inline-block"
          >
            <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full" />
          </motion.div>
          <p className="mt-4 text-muted-foreground">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Project not found</h1>
          <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  if (project.status === 'generating' || !project.brief_data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="inline-block mb-6"
          >
            <div className="h-16 w-16 border-4 border-primary border-t-transparent rounded-full" />
          </motion.div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Generating Your Brief</h1>
          <p className="text-muted-foreground mb-4">
            Our AI is crafting a personalized project brief for you. This usually takes 30-60 seconds.
          </p>
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-sm text-muted-foreground"
          >
            Please wait...
          </motion.div>
          <Button 
            variant="outline" 
            className="mt-6"
            onClick={() => navigate('/dashboard')}
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const briefData = project.brief_data;

  const sections = [
    { key: 'intro', title: '1. Introduction', content: briefData.intro },
    { key: 'objective', title: '2. Project Objective', content: briefData.objective },
    { key: 'requirement_design', title: '3. Design & Technical Requirements', content: briefData.requirement_design },
    { key: 'about_page', title: '4. About Page Content', content: briefData.about_page },
    { key: 'home_page', title: '5. Home Page Structure', content: briefData.home_page },
    { key: 'order_page', title: '6. Order/Product Page', content: briefData.order_page },
    { key: 'audience', title: '7. Target Audience', content: briefData.audience },
    { key: 'tips', title: '8. Implementation Tips', content: briefData.tips },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{briefData.company_name}</h1>
              <p className="text-muted-foreground text-lg mt-1">{briefData.tagline}</p>
              <div className="flex items-center space-x-2 mt-2">
                <Badge variant="outline">{project.level}</Badge>
                <Badge variant="outline">{project.type}</Badge>
                <Badge variant="outline">{project.industry}</Badge>
              </div>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={downloadBrief}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left sidebar - Project info */}
          <div className="lg:col-span-1">
            <Card className="glass-card sticky top-4">
              <CardHeader>
                <CardTitle className="text-sm">Project Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Slogan</p>
                  <p className="font-medium text-foreground">{briefData.slogan}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Location</p>
                  <p className="font-medium text-foreground">{briefData.location}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Type</p>
                  <p className="font-medium text-foreground">{project.type}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Industry</p>
                  <p className="font-medium text-foreground">{project.industry}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Level</p>
                  <p className="font-medium text-foreground capitalize">{project.level}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-2">Color Palette</p>
                  <div className="flex gap-2 flex-wrap">
                    {briefData.primary_color_palette.map((color, idx) => (
                      <div key={idx} className="flex flex-col items-center gap-1">
                        <div 
                          className="h-8 w-8 rounded-md border border-border shadow-sm"
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-xs text-muted-foreground">{color}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-muted-foreground mb-2">Design Style</p>
                  <div className="flex flex-wrap gap-1">
                    {briefData.design_style_keywords.map((keyword, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-muted-foreground">Generated</p>
                  <p className="font-medium text-foreground">
                    {new Date(project.created_at).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main content - Brief sections */}
          <div className="lg:col-span-3 space-y-6">
            {sections.map((section, index) => (
              <motion.div
                key={section.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="glass-card">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{section.title}</CardTitle>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copySection(section.content, section.title)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                      {section.content}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
