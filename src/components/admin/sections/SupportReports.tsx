import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  HeadphonesIcon, 
  AlertTriangle, 
  AlertCircle,
  CheckCircle,
  Clock,
  RefreshCw,
  XCircle,
  Users,
  FileText
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface FailedProject {
  id: string;
  title: string;
  user_email: string;
  level: string;
  created_at: string;
}

interface FlaggedUser {
  user_id: string;
  email: string;
  status: string;
  generation_enabled: boolean;
}

interface AuditLog {
  id: string;
  action_type: string;
  details: any;
  created_at: string;
}

export const SupportReports = () => {
  const [loading, setLoading] = useState(true);
  const [failedProjects, setFailedProjects] = useState<FailedProject[]>([]);
  const [flaggedUsers, setFlaggedUsers] = useState<FlaggedUser[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch failed projects
      const { data: projects, error: projError } = await supabase
        .from('projects')
        .select('id, title, user_id, level, created_at')
        .eq('status', 'failed')
        .order('created_at', { ascending: false })
        .limit(20);

      if (projError) throw projError;

      if (projects && projects.length > 0) {
        const userIds = projects.map(p => p.user_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, email')
          .in('user_id', userIds);

        const failedData: FailedProject[] = projects.map(proj => ({
          id: proj.id,
          title: proj.title,
          user_email: profiles?.find(p => p.user_id === proj.user_id)?.email || 'N/A',
          level: proj.level || 'beginner',
          created_at: proj.created_at
        }));
        setFailedProjects(failedData);
      }

      // Fetch flagged/disabled users
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('user_id, email, status, generation_enabled')
        .or('status.eq.flagged,status.eq.suspended,generation_enabled.eq.false')
        .limit(20);

      if (profileError) throw profileError;
      setFlaggedUsers(profiles || []);

      // Fetch recent audit logs
      const { data: logs, error: logError } = await supabase
        .from('admin_audit_logs')
        .select('id, action_type, details, created_at')
        .order('created_at', { ascending: false })
        .limit(10);

      if (logError) throw logError;
      setAuditLogs(logs || []);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch support data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatTimeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const getStatusBadge = (user: FlaggedUser) => {
    if (!user.generation_enabled) {
      return <Badge variant="destructive">Generation Disabled</Badge>;
    }
    if (user.status === 'suspended') {
      return <Badge variant="destructive">Suspended</Badge>;
    }
    return <Badge className="bg-warning/10 text-warning border-warning/20">Flagged</Badge>;
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold flex items-center gap-3">
            <HeadphonesIcon className="h-7 w-7 text-primary" />
            Support & Reports
          </h1>
          <p className="text-foreground-secondary mt-1">Review issues and system alerts</p>
        </div>
        <Button onClick={fetchData} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
              <XCircle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold">{failedProjects.length}</p>
              <p className="text-sm text-foreground-secondary">Failed Generations</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold">{flaggedUsers.length}</p>
              <p className="text-sm text-foreground-secondary">Flagged/Disabled Users</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{auditLogs.length}</p>
              <p className="text-sm text-foreground-secondary">Recent Actions</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Failed Generations */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <XCircle className="h-5 w-5 text-destructive" />
            Failed Project Generations
          </CardTitle>
          <CardDescription>Projects that failed during generation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <div className="flex justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : failedProjects.length === 0 ? (
            <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
              <CheckCircle className="h-5 w-5 text-accent" />
              No failed generations
            </div>
          ) : (
            failedProjects.map((project) => (
              <div 
                key={project.id}
                className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 border border-destructive/20 bg-destructive/5 rounded-lg"
              >
                <div className="flex items-center gap-3 flex-shrink-0">
                  <XCircle className="h-5 w-5 text-destructive" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <p className="font-medium">{project.title}</p>
                    <Badge variant="outline" className="capitalize">{project.level}</Badge>
                  </div>
                  <p className="text-sm text-foreground-secondary">{project.user_email}</p>
                  <p className="text-xs text-muted-foreground mt-1">{formatTimeAgo(project.created_at)}</p>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Flagged Users */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5 text-warning" />
            Flagged & Disabled Users
          </CardTitle>
          <CardDescription>Users requiring admin attention</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <div className="flex justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : flaggedUsers.length === 0 ? (
            <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
              <CheckCircle className="h-5 w-5 text-accent" />
              No flagged users
            </div>
          ) : (
            flaggedUsers.map((user) => (
              <div 
                key={user.user_id}
                className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 border border-warning/20 bg-warning/5 rounded-lg"
              >
                <div className="flex items-center gap-3 flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <p className="font-medium">{user.email}</p>
                    {getStatusBadge(user)}
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Admin Activity Log */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5 text-primary" />
            Admin Activity Log
          </CardTitle>
          <CardDescription>Recent administrative actions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {auditLogs.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No recent admin activity</p>
          ) : (
            auditLogs.map((log) => (
              <div 
                key={log.id}
                className="flex items-start gap-4 p-4 border border-border rounded-lg"
              >
                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                  log.action_type === 'credit_update' ? 'bg-accent' : 'bg-primary'
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <p className="font-medium capitalize">{log.action_type.replace('_', ' ')}</p>
                    <Badge variant="outline">{log.action_type}</Badge>
                  </div>
                  <p className="text-sm text-foreground-secondary">
                    {log.details?.reason || log.details?.new_status || 'Action performed'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{formatTimeAgo(log.created_at)}</p>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};