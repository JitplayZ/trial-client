import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Home, ArrowLeft, Shield, Settings } from "lucide-react";
import { Link } from "react-router-dom";

export const ForbiddenPage = () => {
  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md relative z-10">
        <Card className="glass-card border-border/20 animate-slide-up">
          <CardHeader className="text-center pb-8">
            <div className="w-16 h-16 bg-destructive/10 border border-destructive/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-2xl font-display">Access Forbidden</CardTitle>
            <CardDescription className="text-base">
              You don't have permission to access this resource
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-foreground-secondary mb-6">
                This area is restricted to authorized users only. If you believe this is an error, please contact support.
              </p>
            </div>

            <div className="space-y-3">
              <Button size="lg" className="w-full bg-gradient-primary hover-glow" asChild>
                <Link to="/" className="flex items-center justify-center space-x-2">
                  <Home className="h-4 w-4" />
                  <span>Return Home</span>
                </Link>
              </Button>
              
              <Button variant="outline" size="lg" className="w-full" asChild>
                <Link to="/login/user" className="flex items-center justify-center space-x-2">
                  <Shield className="h-4 w-4" />
                  <span>Sign In</span>
                </Link>
              </Button>
            </div>

            <p className="text-xs text-center text-foreground-secondary">
              Error Code: 403 • Access Denied
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export const ServerErrorPage = () => {
  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md relative z-10">
        <Card className="glass-card border-border/20 animate-slide-up">
          <CardHeader className="text-center pb-8">
            <div className="w-16 h-16 bg-warning/10 border border-warning/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-8 w-8 text-warning" />
            </div>
            <CardTitle className="text-2xl font-display">Server Error</CardTitle>
            <CardDescription className="text-base">
              Something went wrong on our end
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-foreground-secondary mb-6">
                We're experiencing technical difficulties. Our team has been notified and is working on a fix.
              </p>
            </div>

            <div className="space-y-3">
              <Button size="lg" className="w-full bg-gradient-primary hover-glow" onClick={() => window.location.reload()}>
                <Settings className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              
              <Button variant="outline" size="lg" className="w-full" asChild>
                <Link to="/" className="flex items-center justify-center space-x-2">
                  <Home className="h-4 w-4" />
                  <span>Return Home</span>
                </Link>
              </Button>
            </div>

            <p className="text-xs text-center text-foreground-secondary">
              Error Code: 500 • Internal Server Error
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export const MaintenancePage = () => {
  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md relative z-10">
        <Card className="glass-card border-border/20 animate-slide-up">
          <CardHeader className="text-center pb-8">
            <div className="w-16 h-16 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Settings className="h-8 w-8 text-primary animate-spin" />
            </div>
            <CardTitle className="text-2xl font-display">Under Maintenance</CardTitle>
            <CardDescription className="text-base">
              We're making improvements to serve you better
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-foreground-secondary mb-4">
                tRIAL-cLIENTS is currently undergoing scheduled maintenance to improve performance and add new features.
              </p>
              <p className="text-sm text-accent mb-6">
                Estimated completion: 30 minutes
              </p>
            </div>

            <Button size="lg" className="w-full bg-gradient-primary hover-glow" onClick={() => window.location.reload()}>
              <Settings className="h-4 w-4 mr-2" />
              Check Status
            </Button>

            <p className="text-xs text-center text-foreground-secondary">
              We apologize for any inconvenience. Follow us for updates.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};