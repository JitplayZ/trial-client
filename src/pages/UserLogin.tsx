import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Shield, Zap, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const UserLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [checkingMaintenance, setCheckingMaintenance] = useState(true);
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const { signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const checkMaintenanceMode = async () => {
      try {
        const { data, error } = await supabase.rpc('is_maintenance_mode');

        // Fail-closed: if we can't verify, treat as maintenance ON
        const enabled = error ? true : data === true;
        setIsMaintenanceMode(enabled);

        if (enabled) {
          navigate('/maintenance', { replace: true });
        }
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('Error checking maintenance mode:', error);
        }
        setIsMaintenanceMode(true);
        navigate('/maintenance', { replace: true });
      } finally {
        setCheckingMaintenance(false);
      }
    };

    checkMaintenanceMode();
  }, [navigate]);

  const handleGoogleLogin = async () => {
    // Double-check maintenance mode before allowing login
    try {
      const { data, error } = await supabase.rpc('is_maintenance_mode');
      const enabled = error ? true : data === true;

      if (enabled) {
        navigate('/maintenance', { replace: true });
        return;
      }
    } catch {
      // Fail-closed
      navigate('/maintenance', { replace: true });
      return;
    }

    setIsLoading(true);

    // Use the real Google OAuth flow
    const { error } = await signInWithGoogle();

    if (error) {
      setIsLoading(false);
    }
    // If successful, the OAuth flow will redirect automatically
  };

  if (checkingMaintenance) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isMaintenanceMode) {
    return null; // Will redirect to maintenance page
  }

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      {/* Background decorations */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      
      <div className="w-full max-w-md relative z-10">
        {/* Back button */}
        <Button
          variant="ghost"
          size="sm"
          className="mb-8 hover-lift"
          asChild
        >
          <Link to="/" className="flex items-center space-x-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </Link>
        </Button>

        {/* Login card */}
        <Card className="glass-card border-border/20 animate-slide-up">
          <CardHeader className="text-center pb-8">
            <div className="w-16 h-16 bg-gradient-primary rounded-xl flex items-center justify-center mx-auto mb-4">
              <Zap className="h-8 w-8 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl font-display">Welcome to tRIAL-cLIENTS</CardTitle>
            <CardDescription className="text-base">
              Sign in to start generating realistic client briefs with AI
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Google Sign In Button */}
            <Button
              onClick={handleGoogleLogin}
              size="lg"
              className="w-full bg-gradient-primary hover-glow text-lg py-6"
              disabled={isLoading}
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {isLoading ? 'Connecting to Google...' : 'Sign in with Google'}
            </Button>

            {/* Security note */}
            <div className="flex items-center justify-center space-x-2 text-sm text-foreground-secondary">
              <Shield className="h-4 w-4 text-accent" />
              <span>Secure OAuth authentication</span>
            </div>

            {/* Terms */}
            <p className="text-xs text-center text-foreground-secondary">
              By signing in, you agree to our{" "}
              <Link to="/terms" className="text-primary hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link to="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
            </p>
          </CardContent>
        </Card>

        {/* Admin login link */}
        <div className="text-center mt-6">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/login/admin" className="text-foreground-secondary hover:text-foreground">
              Admin Login
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserLogin;
