import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Activity, 
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Clock,
  Server,
  Eye,
  Pause,
  FileText,
  CheckCircle,
  XCircle,
  RefreshCw
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  totalProjects: number;
  successProjects: number;
  failedProjects: number;
  pendingProjects: number;
  totalCredits: number;
  paidUsers: number;
}

interface AuditLog {
  id: string;
  action_type: string;
  details: any;
  created_at: string;
  admin_email?: string;
}

export const AdminOverview = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalProjects: 0,
    successProjects: 0,
    failedProjects: 0,
    pendingProjects: 0,
    totalCredits: 0,
    paidUsers: 0
  });
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      // Fetch user stats
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, status, generation_enabled');
      
      // Fetch subscription stats
      const { data: subs } = await supabase
        .from('subscriptions')
        .select('plan, credits');
      
      // Fetch project stats
      const { data: projects } = await supabase
        .from('projects')
        .select('status');

      // Fetch recent audit logs
      const { data: logs } = await supabase
        .from('admin_audit_logs')
        .select('id, action_type, details, created_at, admin_user_id')
        .order('created_at', { ascending: false })
        .limit(5);

      // Get admin emails for logs
      if (logs && logs.length > 0) {
        const adminIds = [...new Set(logs.map(l => l.admin_user_id))];
        const { data: adminProfiles } = await supabase
          .from('profiles')
          .select('user_id, email')
          .in('user_id', adminIds);

        const logsWithEmail = logs.map(log => ({
          ...log,
          admin_email: adminProfiles?.find(p => p.user_id === log.admin_user_id)?.email || 'Unknown'
        }));
        setAuditLogs(logsWithEmail);
      }

      setStats({
        totalUsers: profiles?.length || 0,
        activeUsers: profiles?.filter(p => p.status === 'active' && p.generation_enabled !== false).length || 0,
        totalProjects: projects?.length || 0,
        successProjects: projects?.filter(p => p.status === 'completed').length || 0,
        failedProjects: projects?.filter(p => p.status === 'failed').length || 0,
        pendingProjects: projects?.filter(p => p.status === 'generating').length || 0,
        totalCredits: subs?.reduce((sum, s) => sum + (s.credits || 0), 0) || 0,
        paidUsers: subs?.filter(s => s.plan !== 'free').length || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const kpis = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      change: `${stats.activeUsers} active`,
      icon: Users,
    },
    {
      title: "Paid Subscribers",
      value: stats.paidUsers,
      change: `${stats.totalCredits} total credits`,
      icon: DollarSign,
    },
    {
      title: "Pending Jobs",
      value: stats.pendingProjects,
      change: `${stats.failedProjects} failed`,
      icon: Clock,
    },
    {
      title: "Success Rate",
      value: stats.totalProjects > 0 
        ? `${Math.round((stats.successProjects / stats.totalProjects) * 100)}%` 
        : 'N/A',
      change: `${stats.successProjects}/${stats.totalProjects} projects`,
      icon: Server,
    }
  ];

  const getActionLabel = (actionType: string) => {
    switch (actionType) {
      case 'credit_update': return 'Credit Update';
      case 'status_update': return 'Status Update';
      default: return actionType;
    }
  };

  const formatTimeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold">Dashboard Overview</h1>
          <p className="text-foreground-secondary mt-1">System monitoring and key metrics</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchStats} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Badge variant="outline" className="text-accent">
            <Activity className="h-3 w-3 mr-1" />
            Live
          </Badge>
        </div>
      </div>

      {/* System Status */}
      {stats.pendingProjects > 0 && (
        <Card className="border-warning/20 bg-warning/5">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              <Clock className="h-5 w-5 text-warning flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-warning mb-1">Active Generation Queue</h3>
                <p className="text-sm text-foreground-secondary">
                  {stats.pendingProjects} project(s) currently in queue or generating.
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="border-warning text-warning hover:bg-warning/10 w-fit"
                onClick={() => navigate('/admin/projects')}
              >
                View Queue
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {kpis.map((kpi, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
                  <kpi.icon className="h-5 w-5 text-primary-foreground" />
                </div>
                <TrendingUp className="h-4 w-4 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">{kpi.value}</p>
                <p className="text-sm text-foreground-secondary">{kpi.title}</p>
                <p className="text-xs text-accent mt-1">{kpi.change}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              variant="outline" 
              className="w-full justify-start" 
              onClick={() => navigate('/admin/projects')}
            >
              <Pause className="h-4 w-4 mr-3" />
              Pause Generation Queue
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => navigate('/admin/projects')}
            >
              <Eye className="h-4 w-4 mr-3" />
              View Generation Queue
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => navigate('/admin/users')}
            >
              <Users className="h-4 w-4 mr-3" />
              User Management
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => navigate('/admin/billing')}
            >
              <DollarSign className="h-4 w-4 mr-3" />
              Billing Overview
            </Button>
          </CardContent>
        </Card>

        {/* Generation Stats */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center justify-between text-lg">
              <span className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Generation Summary
              </span>
            </CardTitle>
            <CardDescription>Project generation statistics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-accent/5 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-accent" />
                <span>Completed</span>
              </div>
              <span className="font-mono font-bold text-accent">{stats.successProjects}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-warning/5 rounded-lg">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-warning" />
                <span>In Progress</span>
              </div>
              <span className="font-mono font-bold text-warning">{stats.pendingProjects}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-destructive/5 rounded-lg">
              <div className="flex items-center gap-3">
                <XCircle className="h-5 w-5 text-destructive" />
                <span>Failed</span>
              </div>
              <span className="font-mono font-bold text-destructive">{stats.failedProjects}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Admin Actions */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Recent Admin Actions</CardTitle>
          <CardDescription>Audit log of administrative activities</CardDescription>
        </CardHeader>
        <CardContent>
          {auditLogs.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No recent admin actions</p>
          ) : (
            <div className="space-y-3">
              {auditLogs.map((log) => (
                <div 
                  key={log.id}
                  className="flex items-start gap-4 p-4 border border-border rounded-lg"
                >
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                    log.action_type === 'credit_update' ? 'bg-accent' : 'bg-primary'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <p className="font-medium">{getActionLabel(log.action_type)}</p>
                      <Badge variant="outline">
                        {log.action_type}
                      </Badge>
                    </div>
                    <p className="text-sm text-foreground-secondary mb-1">
                      {log.details?.reason || log.details?.new_status || 'Admin action performed'}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                      <span>By: {log.admin_email}</span>
                      <span>{formatTimeAgo(log.created_at)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};