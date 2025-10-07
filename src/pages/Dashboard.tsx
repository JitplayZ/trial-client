import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Zap, 
  Plus, 
  BarChart3, 
  Clock, 
  Star, 
  ArrowRight,
  Folder,
  Users,
  TrendingUp
} from "lucide-react";
import Lottie from "lottie-react";
import globalNetworkAnimation from "@/assets/global-network.json";

const Dashboard = () => {
  const stats = [
    {
      title: "Projects Generated",
      value: "12",
      change: "+3 this week",
      icon: Folder,
      color: "text-primary"
    },
    {
      title: "Free Credits",
      value: "8",
      change: "Resets in 23 days",
      icon: Zap,
      color: "text-accent"
    },
    {
      title: "Total Views",
      value: "2,847",
      change: "+12% this month",
      icon: BarChart3,
      color: "text-warning"
    },
    {
      title: "Team Members",
      value: "3",
      change: "Upgrade for more",
      icon: Users,
      color: "text-destructive"
    }
  ];

  const recentProjects = [
    {
      name: "E-commerce Dashboard",
      type: "Full-Stack App",
      status: "Deployed",
      views: 245,
      created: "2 days ago"
    },
    {
      name: "Portfolio Website",
      type: "Landing Page",
      status: "Draft",
      views: 89,
      created: "5 days ago"
    },
    {
      name: "Task Management API",
      type: "Backend API",
      status: "In Review",
      views: 156,
      created: "1 week ago"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-surface">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-4 sm:h-16 gap-3 sm:gap-0">
            <div>
              <h1 className="text-xl sm:text-2xl font-display font-bold">Dashboard</h1>
              <p className="text-sm sm:text-base text-foreground-secondary hidden sm:block">Welcome back! Ready to build something amazing?</p>
            </div>
            <Button className="bg-gradient-primary hover-glow w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Quick Action Card */}
        <Card className="glass-card mb-6 sm:mb-8 border-primary/20 bg-gradient-hero">
          <CardContent className="p-4 sm:p-8">
            <div className="flex flex-col items-start space-y-4">
              <div className="w-full">
                <h2 className="text-xl sm:text-2xl font-display font-bold mb-2">
                  Ready to create your next project?
                </h2>
                <p className="text-sm sm:text-base text-foreground-secondary mb-4">
                  Generate a complete project in minutes with our AI-powered tools.
                </p>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-foreground-secondary">
                  <div className="flex items-center space-x-1">
                    <Zap className="h-4 w-4 text-accent flex-shrink-0" />
                    <span>8 credits remaining</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4 text-warning flex-shrink-0" />
                    <span>~5 min generation time</span>
                  </div>
                </div>
              </div>
              <Button size="lg" className="bg-gradient-primary hover-glow w-full sm:w-auto">
                <div className="w-20 h-20 sm:w-24 sm:h-24 mr-2 flex-shrink-0">
                  <Lottie animationData={globalNetworkAnimation} loop={true} />
                </div>
                Generate Project
                <ArrowRight className="h-5 w-5 ml-2 flex-shrink-0" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="hover-lift">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center ${stat.color}`}>
                    <stat.icon className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <TrendingUp className="h-4 w-4 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-foreground-secondary">{stat.title}</p>
                  <p className="text-xs text-accent mt-1">{stat.change}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
          {/* Recent Projects */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Recent Projects
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </CardTitle>
              <CardDescription>
                Your latest AI-generated projects
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentProjects.map((project, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-surface-hover transition-colors cursor-pointer"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold">{project.name}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {project.type}
                      </Badge>
                      <Badge 
                        variant={
                          project.status === 'Deployed' ? 'default' : 
                          project.status === 'Draft' ? 'secondary' : 'outline'
                        }
                        className="text-xs"
                      >
                        {project.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-foreground-secondary mt-1">
                      {project.views} views • {project.created}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm">
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common tasks and shortcuts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start" size="lg">
                <div className="w-14 h-14 mr-3 flex-shrink-0">
                  <Lottie animationData={globalNetworkAnimation} loop={true} />
                </div>
                Generate New Project
              </Button>
              <Button variant="outline" className="w-full justify-start" size="lg">
                <Folder className="h-4 w-4 mr-3" />
                Browse Templates
              </Button>
              <Button variant="outline" className="w-full justify-start" size="lg">
                <BarChart3 className="h-4 w-4 mr-3" />
                View Analytics
              </Button>
              <Button variant="outline" className="w-full justify-start" size="lg">
                <Users className="h-4 w-4 mr-3" />
                Invite Team Members
              </Button>
              <Button variant="outline" className="w-full justify-start" size="lg">
                <Star className="h-4 w-4 mr-3" />
                Upgrade to Pro
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;