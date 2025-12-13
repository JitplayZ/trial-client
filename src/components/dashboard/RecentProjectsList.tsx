import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FolderOpen, Calendar, ExternalLink, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

interface Project {
  id: string;
  title: string;
  description: string | null;
  type: string | null;
  created_at: string;
  status: string | null;
}

const RecentProjectsList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('projects')
        .select('id, title, description, type, created_at, status')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();

    // Set up real-time subscription for projects
    if (!user) return;

    const channel = supabase
      .channel('recent-projects-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          // Refetch projects when any change occurs
          fetchProjects();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return 'Unknown date';
    }
  };

  const getTypeLabel = (type: string | null) => {
    const types: Record<string, string> = {
      'web-app': 'Web App',
      'mobile-app': 'Mobile App',
      'saas': 'SaaS',
      'ecommerce': 'E-commerce',
      'portfolio': 'Portfolio',
      'landing': 'Landing Page'
    };
    return types[type || ''] || type || 'Project';
  };

  if (loading) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-border/30">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-foreground">
            <FolderOpen className="h-5 w-5" />
            <span>Recent Projects</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/30">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-foreground">
          <FolderOpen className="h-5 w-5" />
          <span>Recent Projects</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {projects.length === 0 ? (
          <div className="text-center py-8">
            <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-foreground">No projects yet</p>
            <p className="text-sm text-muted-foreground">Generate your first project to get started!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {projects.map((project) => (
              <div 
                key={project.id} 
                className="flex items-center justify-between p-4 bg-background/40 backdrop-blur-sm rounded-lg border border-border/30 hover:bg-background/60 transition-colors"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{project.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {project.description || 'No description'}
                  </p>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                      {getTypeLabel(project.type)}
                    </span>
                    {project.status && (
                      <span className={`text-xs px-2 py-1 rounded ${
                        project.status === 'completed' 
                          ? 'bg-green-500/10 text-green-500' 
                          : project.status === 'generating'
                          ? 'bg-yellow-500/10 text-yellow-500'
                          : 'bg-red-500/10 text-red-500'
                      }`}>
                        {project.status}
                      </span>
                    )}
                    <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(project.created_at)}</span>
                    </div>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="hover-lift"
                  onClick={() => navigate(`/projects/${project.id}`)}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentProjectsList;
