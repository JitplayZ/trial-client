import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FolderOpen, Calendar, ExternalLink } from 'lucide-react';

const RecentProjectsList = () => {
  const projects = [
    {
      id: 1,
      title: 'E-commerce Dashboard',
      description: 'Modern admin panel with analytics',
      type: 'Web App',
      createdAt: '2 days ago'
    },
    {
      id: 2,
      title: 'Task Management App',
      description: 'Collaborative project management tool',
      type: 'SaaS',
      createdAt: '1 week ago'
    },
    {
      id: 3,
      title: 'Portfolio Website',
      description: 'Personal portfolio with dark mode',
      type: 'Website',
      createdAt: '2 weeks ago'
    }
  ];

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/30">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-foreground">
          <FolderOpen className="h-5 w-5" />
          <span>Recent Projects</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {projects.map((project) => (
            <div key={project.id} className="flex items-center justify-between p-4 bg-background/40 backdrop-blur-sm rounded-lg border border-border/30 hover:bg-background/60 transition-colors">
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">{project.title}</h3>
                <p className="text-sm text-muted-foreground">{project.description}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                    {project.type}
                  </span>
                  <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{project.createdAt}</span>
                  </div>
                </div>
              </div>
              <Button size="sm" variant="outline" className="hover-lift">
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentProjectsList;