import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { FileText, Calendar, Download, Eye, X, Loader2, ArrowLeft } from 'lucide-react';

// Authentication is enforced - do not bypass in production
const BYPASS_AUTH = false;

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

interface Project {
  id: string;
  title: string;
  description: string | null;
  type: string | null;
  industry: string | null;
  level: string | null;
  status: string | null;
  brief_data: BriefData | null;
  created_at: string;
}

const History = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!BYPASS_AUTH && !authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        let query = supabase
          .from('projects')
          .select('*')
          .order('created_at', { ascending: false });

        // Only filter by user if not bypassing auth and user exists
        if (!BYPASS_AUTH && user) {
          query = query.eq('user_id', user.id);
        }

        const { data, error } = await query;

        if (error) throw error;
        setProjects((data || []) as unknown as Project[]);
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('Error fetching projects:', error);
        }
      } finally {
        setLoading(false);
      }
    };

    if (BYPASS_AUTH || user) {
      fetchProjects();
    }
  }, [user]);

  const downloadBrief = (project: Project) => {
    if (!project.brief_data) return;
    
    const briefData = project.brief_data;
    const content = `# ${briefData.company_name}\n\n${briefData.tagline}\n\n${briefData.slogan}\n\n` +
      `**Location:** ${briefData.location}\n\n` +
      `**Primary Colors:** ${briefData.primary_color_palette?.join(', ') || 'N/A'}\n\n` +
      `**Design Style:** ${briefData.design_style_keywords?.join(', ') || 'N/A'}\n\n` +
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
    a.download = `${briefData.company_name?.replace(/\s+/g, '-').toLowerCase() || 'project'}-brief.md`;
    a.click();
  };

  if (!BYPASS_AUTH && (authLoading || !user)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-4 sm:py-8 lg:py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/dashboard')}
              className="gap-1.5 text-xs sm:text-sm -ml-2"
            >
              <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Back</span>
            </Button>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">Project History</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">View all your generated projects</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="absolute right-4 top-4 sm:static">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="glass-card">
                <CardHeader>
                  <Skeleton className="h-5 sm:h-6 w-3/4 mb-2" />
                  <Skeleton className="h-3 sm:h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-16 sm:h-20 w-full mb-4" />
                  <div className="flex space-x-2">
                    <Skeleton className="h-8 sm:h-9 flex-1" />
                    <Skeleton className="h-8 sm:h-9 flex-1" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="py-10 sm:py-12 text-center">
              <FileText className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">No projects yet</h3>
              <p className="text-sm text-muted-foreground mb-6">Generate your first project to get started</p>
              <Button onClick={() => navigate('/dashboard')} className="bg-gradient-primary">
                Generate Project
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {projects.map((project) => (
              <Card key={project.id} className="glass-card hover-lift flex flex-col">
                <CardHeader className="pb-2 sm:pb-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-foreground text-base sm:text-lg line-clamp-1">
                        {project.brief_data?.company_name || project.title}
                      </CardTitle>
                      <CardDescription className="text-muted-foreground mt-0.5 text-xs sm:text-sm line-clamp-1">
                        {project.brief_data?.tagline || project.type || 'Web Project'}
                      </CardDescription>
                    </div>
                    {project.status === 'generating' && (
                      <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin text-primary flex-shrink-0" />
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {project.level && (
                      <Badge variant="outline" className="text-[10px] sm:text-xs px-1.5 py-0">{project.level}</Badge>
                    )}
                    {project.type && (
                      <Badge variant="outline" className="text-[10px] sm:text-xs px-1.5 py-0">{project.type}</Badge>
                    )}
                    {project.industry && (
                      <Badge variant="secondary" className="text-[10px] sm:text-xs px-1.5 py-0">{project.industry}</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  {project.status === 'generating' ? (
                    <p className="text-muted-foreground mb-3 sm:mb-4 text-xs sm:text-sm italic">
                      Brief is being generated...
                    </p>
                  ) : project.brief_data ? (
                    <div className="space-y-2 mb-3 sm:mb-4 flex-1">
                      <p className="text-muted-foreground text-xs sm:text-sm line-clamp-2">
                        {project.brief_data.intro}
                      </p>
                      {project.brief_data.primary_color_palette && (
                        <div className="flex gap-1">
                          {project.brief_data.primary_color_palette.slice(0, 4).map((color, idx) => (
                            <div 
                              key={idx}
                              className="h-4 w-4 sm:h-5 sm:w-5 rounded border border-border"
                              style={{ backgroundColor: color }}
                              title={color}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-muted-foreground mb-3 sm:mb-4 text-xs sm:text-sm line-clamp-3 flex-1">
                      {project.description || 'No description available'}
                    </p>
                  )}
                  
                  <div className="flex items-center text-[10px] sm:text-xs text-muted-foreground mb-3 sm:mb-4">
                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    {new Date(project.created_at).toLocaleDateString()}
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 text-xs sm:text-sm h-8 sm:h-9"
                      onClick={() => navigate(`/projects/${project.id}`)}
                    >
                      <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      View
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 text-xs sm:text-sm h-8 sm:h-9"
                      disabled={!project.brief_data}
                      onClick={() => downloadBrief(project)}
                    >
                      <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;