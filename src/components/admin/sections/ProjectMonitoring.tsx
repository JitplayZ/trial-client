import { CopyUserId } from "../CopyUserId";
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  FolderKanban, 
  CheckCircle, 
  XCircle,
  Clock,
  RefreshCw,
  Play,
  Pause,
  AlertTriangle,
  Trash2
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ProjectData {
  id: string;
  title: string;
  status: string;
  level: string;
  type: string;
  created_at: string;
  user_id: string;
  user_email: string;
}

export const ProjectMonitoring = () => {
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState(true);
  const [generationPaused, setGenerationPaused] = useState(false);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('id, title, status, level, type, created_at, user_id')
        .order('created_at', { ascending: false })
        .limit(100);

      if (projectsError) throw projectsError;

      const userIds = projectsData?.map(p => p.user_id) || [];
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('user_id, email')
        .in('user_id', userIds);

      if (profileError) throw profileError;

      const merged: ProjectData[] = (projectsData || []).map(project => {
        const profile = profiles?.find(p => p.user_id === project.user_id);
        return {
          id: project.id,
          title: project.title,
          status: project.status || 'generating',
          level: project.level || 'beginner',
          type: project.type || 'web-app',
          created_at: project.created_at,
          user_id: project.user_id,
          user_email: profile?.email || 'N/A'
        };
      });

      setProjects(merged);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const successCount = projects.filter(p => p.status === 'completed').length;
  const failedCount = projects.filter(p => p.status === 'failed').length;
  const generatingCount = projects.filter(p => p.status === 'generating').length;
  const successRate = projects.length > 0 ? Math.round((successCount / projects.length) * 100) : 0;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-accent/10 text-accent border-accent/20">Completed</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'generating':
        return <Badge className="bg-warning/10 text-warning border-warning/20">Generating</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'veteran':
        return <Badge className="bg-primary/10 text-primary border-primary/20">Veteran</Badge>;
      case 'intermediate':
        return <Badge className="bg-accent/10 text-accent border-accent/20">Intermediate</Badge>;
      default:
        return <Badge variant="outline">Beginner</Badge>;
    }
  };

  const toggleGeneration = () => {
    setGenerationPaused(!generationPaused);
    toast.success(generationPaused ? 'Generation queue resumed' : 'Generation queue paused');
  };

  const formatTimeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  // Get stuck/stale projects (generating for more than 1 hour)
  const getStuckProjects = () => {
    const ONE_HOUR_MS = 60 * 60 * 1000;
    return projects.filter(p => {
      if (p.status !== 'generating') return false;
      const createdTime = new Date(p.created_at).getTime();
      return Date.now() - createdTime > ONE_HOUR_MS;
    });
  };

  const stuckProjects = getStuckProjects();

  // Delete a single stuck project
  const deleteStuckProject = async (projectId: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;

      toast.success('Stuck project removed successfully');
      fetchProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project');
    }
  };

  // Delete all stuck projects
  const deleteAllStuckProjects = async () => {
    try {
      const stuckIds = stuckProjects.map(p => p.id);
      if (stuckIds.length === 0) return;

      const { error } = await supabase
        .from('projects')
        .delete()
        .in('id', stuckIds);

      if (error) throw error;

      toast.success(`Removed ${stuckIds.length} stuck project(s)`);
      fetchProjects();
    } catch (error) {
      console.error('Error deleting stuck projects:', error);
      toast.error('Failed to delete stuck projects');
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold flex items-center gap-3">
            <FolderKanban className="h-7 w-7 text-primary" />
            Project Monitoring
          </h1>
          <p className="text-foreground-secondary mt-1">Monitor project generation status and queue</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={generationPaused ? "default" : "outline"}
            onClick={toggleGeneration}
          >
            {generationPaused ? (
              <>
                <Play className="h-4 w-4 mr-2" />
                Resume Queue
              </>
            ) : (
              <>
                <Pause className="h-4 w-4 mr-2" />
                Pause Queue
              </>
            )}
          </Button>
          <Button onClick={fetchProjects} disabled={loading} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <FolderKanban className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{projects.length}</p>
              <p className="text-sm text-foreground-secondary">Total</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold">{successCount}</p>
              <p className="text-sm text-foreground-secondary">Completed</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <Clock className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold">{generatingCount}</p>
              <p className="text-sm text-foreground-secondary">In Queue</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
              <XCircle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold">{failedCount}</p>
              <p className="text-sm text-foreground-secondary">Failed</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{successRate}%</p>
              <p className="text-sm text-foreground-secondary">Success Rate</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Generation Queue Status */}
      {generationPaused && (
        <Card className="border-warning/20 bg-warning/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Pause className="h-5 w-5 text-warning" />
              <div>
                <p className="font-medium text-warning">Generation Queue Paused</p>
                <p className="text-sm text-foreground-secondary">New project generations are temporarily suspended</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stuck/Stale Projects Warning */}
      {stuckProjects.length > 0 && (
        <Card className="border-destructive/20 bg-destructive/5">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  Stuck Queues ({stuckProjects.length})
                </CardTitle>
                <CardDescription>Projects stuck in "generating" for over 1 hour</CardDescription>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove All Stuck
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Remove all stuck projects?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete {stuckProjects.length} project(s) that have been stuck in "generating" status for over 1 hour. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={deleteAllStuckProjects} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Delete All
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {stuckProjects.map((project) => (
              <div 
                key={project.id}
                className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 border border-destructive/20 bg-destructive/5 rounded-lg"
              >
                <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <p className="font-medium">{project.title}</p>
                    {getLevelBadge(project.level)}
                  </div>
                  <p className="text-sm text-foreground-secondary">{project.user_email}</p>
                  <p className="text-xs text-destructive">{formatTimeAgo(project.created_at)} - Stuck</p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="border-destructive/30 text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remove this stuck project?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete "{project.title}". This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => deleteStuckProject(project.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Pending/Generating Projects */}
      {generatingCount > 0 && (
        <Card className="border-warning/20">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5 text-warning" />
              Active Queue ({generatingCount})
            </CardTitle>
            <CardDescription>Projects currently being generated</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {projects.filter(p => p.status === 'generating').map((project) => (
              <div 
                key={project.id}
                className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 border border-warning/20 bg-warning/5 rounded-lg"
              >
                <Clock className="h-5 w-5 text-warning animate-pulse flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <p className="font-medium">{project.title}</p>
                    {getLevelBadge(project.level)}
                  </div>
                  <p className="text-sm text-foreground-secondary">{project.user_email}</p>
                  <p className="text-xs text-muted-foreground">{formatTimeAgo(project.created_at)}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Projects Table */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">All Projects</CardTitle>
          <CardDescription>Complete project generation history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>User ID</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <RefreshCw className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : projects.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No projects found
                    </TableCell>
                  </TableRow>
                ) : (
                  projects.map((project) => (
                    <TableRow key={project.id} className={project.status === 'failed' ? 'bg-destructive/5' : ''}>
                      <TableCell>
                        <span className="font-medium">{project.title}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">{project.user_email}</span>
                      </TableCell>
                      <TableCell>
                        <CopyUserId userId={project.user_id} />
                      </TableCell>
                      <TableCell>{getLevelBadge(project.level)}</TableCell>
                      <TableCell>
                        <span className="text-sm capitalize">{project.type}</span>
                      </TableCell>
                      <TableCell>{getStatusBadge(project.status)}</TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {formatTimeAgo(project.created_at)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};