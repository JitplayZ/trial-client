import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  Users, 
  Activity, 
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Clock,
  Server,
  Eye,
  Pause,
  Settings,
  FileText
} from "lucide-react";

const AdminDashboard = () => {
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
      timestamp: "10 mins ago"
    },
    {
      user: "admin@trial-clients.com", 
      action: "Paused user generation",
      details: "Temporarily paused user ID: user_12345",
      timestamp: "1 hour ago"
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-surface">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-display font-bold">Admin Dashboard</h1>
                <p className="text-foreground-secondary">System monitoring and management</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-accent">
                <Activity className="h-3 w-3 mr-1" />
                All Systems Operational
              </Badge>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* System Alert */}
        <Card className="mb-8 border-warning/20 bg-warning/5">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-warning mb-1">System Maintenance Scheduled</h3>
                <p className="text-sm text-foreground-secondary">
                  Planned maintenance window: Tonight 2:00 AM - 4:00 AM EST. Generation services will be temporarily unavailable.
                </p>
              </div>
              <Button variant="outline" size="sm" className="border-warning text-warning hover:bg-warning/10">
                Manage
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {kpis.map((kpi, index) => (
            <Card key={index} className="hover-lift">
              <CardContent className="p-6">
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common administrative tasks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start" size="lg">
                <Pause className="h-4 w-4 mr-3" />
                Pause Generation Queue
              </Button>
              <Button variant="outline" className="w-full justify-start" size="lg">
                <Eye className="h-4 w-4 mr-3" />
                View Generation Queue
              </Button>
              <Button variant="outline" className="w-full justify-start" size="lg">
                <FileText className="h-4 w-4 mr-3" />
                Manage Templates
              </Button>
              <Button variant="outline" className="w-full justify-start" size="lg">
                <Users className="h-4 w-4 mr-3" />
                User Management
              </Button>
              <Button variant="outline" className="w-full justify-start" size="lg">
                <Settings className="h-4 w-4 mr-3" />
                System Settings
              </Button>
            </CardContent>
          </Card>

          {/* Flagged Users */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                  <span>Flagged Users</span>
                </span>
                <Badge variant="secondary">{alertedUsers.length}</Badge>
              </CardTitle>
              <CardDescription>
                Users requiring attention or review
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {alertedUsers.map((user, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-surface-hover transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-mono text-sm">{user.email}</p>
                    <p className="text-sm text-foreground-secondary">{user.reason}</p>
                    <p className="text-xs text-muted-foreground">{user.timestamp}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      Review
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Recent Admin Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Admin Actions</CardTitle>
            <CardDescription>
              Audit log of administrative activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActions.map((action, index) => (
                <div 
                  key={index}
                  className="flex items-start space-x-4 p-4 border border-border rounded-lg"
                >
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    action.severity === 'high' ? 'bg-destructive' :
                    action.severity === 'medium' ? 'bg-warning' : 'bg-accent'
                  }`}></div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
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
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <span>By: {action.user}</span>
                      <span>{action.timestamp}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminDashboard;