import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, RefreshCw, FileQuestion, Wifi } from "lucide-react";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md relative z-10">
        <Card className="glass-card border-border/20 animate-slide-up">
          <CardHeader className="text-center pb-8">
            <div className="w-16 h-16 bg-muted/20 border border-muted/30 rounded-xl flex items-center justify-center mx-auto mb-4">
              <FileQuestion className="h-8 w-8 text-muted-foreground" />
            </div>
            <CardTitle className="text-2xl font-display">Page Not Found</CardTitle>
            <CardDescription className="text-base">
              The page you're looking for doesn't exist or may have been moved
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-foreground-secondary mb-6">
                This could be due to an incorrect URL, a broken link, or the page may have been removed.
              </p>
            </div>

            <div className="space-y-3">
              <Button size="lg" className="w-full bg-gradient-primary hover-glow" onClick={() => window.location.reload()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
              
              <Button variant="outline" size="lg" className="w-full" asChild>
                <Link to="/" className="flex items-center justify-center space-x-2">
                  <Home className="h-4 w-4" />
                  <span>Go to Home</span>
                </Link>
              </Button>
            </div>

            <div className="pt-4 border-t border-border/20">
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Wifi className="h-3 w-3" />
                <span>If this persists, check your internet connection</span>
              </div>
            </div>

            <p className="text-xs text-center text-foreground-secondary">
              Error Code: 404 • Page Not Found
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NotFound;
