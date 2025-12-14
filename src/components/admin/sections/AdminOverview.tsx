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
  FileText
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export const AdminOverview = () => {
  const navigate = useNavigate();

  const kpis = [
    {
      title: "Daily Active Users",
      value: "2,847",
      change: "+12% vs yesterday",
      icon: Users,
      color: "text-primary"
    },
    {
      title: "Revenue (MTD)",
      value: "$12,450",
      change: "+23% vs last month",
      icon: DollarSign,
      color: "text-accent"
    },
    {
      title: "Pending Jobs",
      value: "34",
      change: "2 mins avg wait",
      icon: Clock,
      color: "text-warning"
    },
    {
      title: "System Health",
      value: "99.8%",
      change: "All systems operational",
      icon: Server,
      color: "text-success"
    }
  ];

  const recentActions = [
    {
      user: "admin@trial-clients.com",
      action: "Updated generation limits",
      details: "Increased free tier from 5 to 8 projects",
      timestamp: "10 mins ago",
      severity: "low"
    },
    {
      user: "admin@trial-clients.com", 
      action: "Paused user generation",
      details: "Temporarily paused user ID: user_12345",
      timestamp: "1 hour ago",
      severity: "medium"
    },
    {
      user: "admin@trial-clients.com",
      action: "Reviewed flagged content",
      details: "Approved project: 'E-commerce Platform'",
      timestamp: "1 hour ago",
      severity: "low"
    }
  ];

  const alertedUsers = [
    { email: "user@example.com", reason: "Excessive API calls", timestamp: "5 mins ago" },
    { email: "client@company.com", reason: "Flagged content", timestamp: "2 hours ago" },
    { email: "developer@startup.io", reason: "Quota exceeded", timestamp: "1 day ago" }
  ];

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold">Dashboard Overview</h1>
          <p className="text-foreground-secondary mt-1">System monitoring and key metrics</p>
        </div>
        <Badge variant="outline" className="text-accent w-fit">
          <Activity className="h-3 w-3 mr-1" />
          All Systems Operational
        </Badge>
      </div>

      {/* System Alert */}
      <Card className="border-warning/20 bg-warning/5">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-warning mb-1">System Maintenance Scheduled</h3>
              <p className="text-sm text-foreground-secondary">
                Planned maintenance window: Tonight 2:00 AM - 4:00 AM EST. Generation services will be temporarily unavailable.
              </p>
            </div>
            <Button variant="outline" size="sm" className="border-warning text-warning hover:bg-warning/10 w-fit">
              Manage
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {kpis.map((kpi, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center`}>
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
            <Button variant="outline" className="w-full justify-start">
              <FileText className="h-4 w-4 mr-3" />
              Manage Templates
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => navigate('/admin/users')}
            >
              <Users className="h-4 w-4 mr-3" />
              User Management
            </Button>
          </CardContent>
        </Card>

        {/* Flagged Users */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center justify-between text-lg">
              <span className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
                Flagged Users
              </span>
              <Badge variant="secondary">{alertedUsers.length}</Badge>
            </CardTitle>
            <CardDescription>Users requiring attention or review</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {alertedUsers.map((user, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-sm truncate">{user.email}</p>
                  <p className="text-sm text-foreground-secondary">{user.reason}</p>
                  <p className="text-xs text-muted-foreground">{user.timestamp}</p>
                </div>
                <div className="flex gap-2 ml-2">
                  <Button variant="outline" size="sm">Review</Button>
                </div>
              </div>
            ))}
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
          <div className="space-y-3">
            {recentActions.map((action, index) => (
              <div 
                key={index}
                className="flex items-start gap-4 p-4 border border-border rounded-lg"
              >
                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                  action.severity === 'high' ? 'bg-destructive' :
                  action.severity === 'medium' ? 'bg-warning' : 'bg-accent'
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <p className="font-medium">{action.action}</p>
                    <Badge 
                      variant="outline" 
                      className={
                        action.severity === 'high' ? 'border-destructive text-destructive' :
                        action.severity === 'medium' ? 'border-warning text-warning' : 'border-accent text-accent'
                      }
                    >
                      {action.severity}
                    </Badge>
                  </div>
                  <p className="text-sm text-foreground-secondary mb-1">{action.details}</p>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                    <span>By: {action.user}</span>
                    <span>{action.timestamp}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
