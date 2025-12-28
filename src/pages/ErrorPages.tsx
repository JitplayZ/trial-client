import { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Home, Shield, Settings, RefreshCw } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from '@/integrations/supabase/client';

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

interface ServerErrorPageProps {
  onRetry?: () => void;
  retryData?: {
    level?: string;
    projectType?: string;
    industry?: string;
  };
}

export const ServerErrorPage = ({ onRetry, retryData }: ServerErrorPageProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get retry data from location state if not passed as props
  const stateData = location.state as { retryData?: ServerErrorPageProps['retryData'] } | null;
  const effectiveRetryData = retryData || stateData?.retryData;

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else if (effectiveRetryData) {
      // Navigate back to dashboard with retry intent
      navigate('/dashboard', { 
        state: { 
          retryGeneration: true, 
          ...effectiveRetryData 
        },
        replace: true
      });
    } else {
      // Simple page reload if no specific retry action
      window.location.reload();
    }
  };

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
              <p className="text-foreground-secondary mb-4">
                We're experiencing technical difficulties. Our team has been notified and is working on a fix.
              </p>
              <p className="text-sm text-muted-foreground">
                Don't worry — no credits or quota were deducted for this failed request.
              </p>
            </div>

            <div className="space-y-3">
              <Button size="lg" className="w-full bg-gradient-primary hover-glow" onClick={handleRetry}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              
              <Button variant="outline" size="lg" className="w-full" asChild>
                <Link to="/dashboard" className="flex items-center justify-center space-x-2">
                  <Home className="h-4 w-4" />
                  <span>Return to Dashboard</span>
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

interface MaintenancePageProps {
  message?: string;
}

export const MaintenancePage = ({ message }: MaintenancePageProps) => {
  const navigate = useNavigate();

  // Real-time subscription to detect when maintenance mode is turned OFF
  useEffect(() => {
    // Function to check current maintenance status
    const checkMaintenanceStatus = async () => {
      try {
        const { data } = await supabase
          .from('system_settings_public')
          .select('value')
          .eq('key', 'maintenance_mode')
          .single();
        
        const isEnabled = (data?.value as { enabled?: boolean } | null)?.enabled ?? false;
        
        // If maintenance is OFF, redirect user back to home
        if (!isEnabled) {
          navigate('/', { replace: true });
        }
      } catch (error) {
        // On error, stay on maintenance page
        if (import.meta.env.DEV) {
          console.error('Error checking maintenance status:', error);
        }
      }
    };

    // Check immediately on mount
    checkMaintenanceStatus();

    // Subscribe to real-time changes on system_settings table
    const channel = supabase
      .channel('maintenance_page_listener')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'system_settings',
          filter: 'key=eq.maintenance_mode'
        },
        () => {
          // When maintenance_mode changes, check if it's now OFF
          checkMaintenanceStatus();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md relative z-10">
        <Card className="glass-card border-border/20 animate-slide-up">
          <CardHeader className="text-center pb-8">
            <div className="w-16 h-16 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Settings className="h-8 w-8 text-primary animate-spin" style={{ animationDuration: '3s' }} />
            </div>
            <CardTitle className="text-2xl font-display">Under Maintenance</CardTitle>
            <CardDescription className="text-base">
              We're making improvements to serve you better
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-foreground-secondary mb-4">
                {message || 'tRIAL-cLIENTS is currently undergoing scheduled maintenance to improve performance and add new features.'}
              </p>
              <p className="text-sm text-accent mb-6">
                We'll be back shortly. Thank you for your patience.
              </p>
            </div>

            <Button size="lg" className="w-full bg-gradient-primary hover-glow" onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Check Status
            </Button>

            {/* Admin login link - subtle but accessible */}
            <div className="pt-4 border-t border-border/20">
              <Link 
                to="/login/admin" 
                className="block text-xs text-center text-muted-foreground hover:text-foreground-secondary transition-colors"
              >
                Admin Access
              </Link>
            </div>

            <p className="text-xs text-center text-foreground-secondary">
              We apologize for any inconvenience. Follow us for updates.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
