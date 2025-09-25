import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Shield, AlertTriangle, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

const AdminLogin = () => {
  const [showTwoFA, setShowTwoFA] = useState(false);

  const handleGoogleLogin = () => {
    // Mock Google OAuth flow for admin
    console.log("Initiating Admin Google OAuth...");
    // Simulate admin allowlist check and 2FA requirement
    setTimeout(() => {
      setShowTwoFA(true);
    }, 1000);
  };

  const handleTwoFASubmit = () => {
    // Mock 2FA verification
    console.log("Verifying 2FA...");
    setTimeout(() => {
      window.location.href = "/admin";
    }, 1000);
  };

  if (showTwoFA) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        
        <div className="w-full max-w-md relative z-10">
          <Card className="glass-card border-border/20 animate-slide-up">
            <CardHeader className="text-center pb-8">
              <div className="w-16 h-16 bg-gradient-primary rounded-xl flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-primary-foreground" />
              </div>
              <CardTitle className="text-2xl font-display">Two-Factor Authentication</CardTitle>
              <CardDescription className="text-base">
                Enter the 6-digit code from your authenticator app
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="flex justify-center space-x-2">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <input
                    key={i}
                    type="text"
                    maxLength={1}
                    className="w-12 h-12 text-center text-xl font-mono border border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 bg-surface"
                  />
                ))}
              </div>

              <Button
                onClick={handleTwoFASubmit}
                size="lg"
                className="w-full bg-gradient-primary hover-glow"
              >
                Verify & Continue
              </Button>

              <div className="text-center">
                <Button variant="ghost" size="sm">
                  Resend Code
                </Button>
              </div>

              <div className="text-xs text-center text-foreground-secondary">
                Having trouble? Contact your system administrator for assistance.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      
      <div className="w-full max-w-md relative z-10">
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

        <Card className="glass-card border-border/20 animate-slide-up">
          <CardHeader className="text-center pb-8">
            <div className="w-16 h-16 bg-gradient-primary rounded-xl flex items-center justify-center mx-auto mb-4">
              <Zap className="h-8 w-8 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl font-display">Admin Login</CardTitle>
            <CardDescription className="text-base">
              Authorized personnel only — 2FA required
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Admin warning */}
            <div className="flex items-start space-x-3 p-4 bg-warning/10 border border-warning/20 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-warning mb-1">Admin Access Only</p>
                <p className="text-foreground-secondary">
                  This area is restricted to authorized administrators. All access is logged and monitored.
                </p>
              </div>
            </div>

            <Button
              onClick={handleGoogleLogin}
              size="lg"
              className="w-full bg-gradient-primary hover-glow text-lg py-6"
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
                  d="M12 1c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign in with Google (Admin)
            </Button>

            <div className="flex items-center justify-center space-x-2 text-sm text-foreground-secondary">
              <Shield className="h-4 w-4 text-accent" />
              <span>Secure 2FA authentication required</span>
            </div>

            <p className="text-xs text-center text-foreground-secondary">
              Admin sessions are monitored and automatically expire after 1 hour of inactivity.
            </p>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/login/user" className="text-foreground-secondary hover:text-foreground">
              User Login
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;