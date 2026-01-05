import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Zap, Shield, Gift, Loader2 } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Check maintenance mode before allowing auth (uses public view to hide admin IDs)
const checkMaintenanceMode = async (): Promise<boolean> => {
  try {
    // SECURITY: Use SECURITY DEFINER RPC (system_settings has no SELECT policy by design)
    const { data, error } = await supabase.rpc('is_maintenance_mode');
    if (error) return true; // fail-closed
    return data === true;
  } catch {
    return true; // fail-closed
  }
};

// Helper to trigger referral achievement XP with session token
const triggerReferralAchievement = async (accessToken: string) => {
  try {
    await supabase.functions.invoke('award-xp', {
      body: { event_type: 'referral_success' },
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    console.log('Referral achievement XP awarded successfully');
  } catch (error) {
    console.error('Failed to award referral XP:', error);
  }
};

// Session storage key for referral codes (must match AuthContext)
const REFERRAL_CODE_KEY = 'referralCode';

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const referralCode = searchParams.get('ref');
  const { signInWithGoogle, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      // Process referral if code exists in URL (for non-OAuth flows)
      if (referralCode) {
        processReferral(referralCode);
      }
      navigate('/dashboard');
    }
  }, [user, navigate, referralCode]);

  const processReferral = async (code: string) => {
    try {
      // Updated: No longer passing user_id, RPC uses auth.uid() internally
      const { data, error } = await supabase.rpc('process_referral', {
        _referral_code: code
      });

      if (error) {
        console.error('Referral error:', error);
        return;
      }

      // Type assertion for the response
      const result = data as { ok?: boolean; referred_credits?: number } | null;
      
      if (result?.ok) {
        toast({
          title: '🎉 Welcome Bonus!',
          description: `You received ${result.referred_credits ?? 2} credits for signing up with a referral!`,
        });
        // Award referral achievement XP/badge to the new user - pass access token
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          await triggerReferralAchievement(session.access_token);
        }
      }
    } catch (error) {
      console.error('Error processing referral:', error);
    }
  };

  const handleGoogleLogin = async () => {
    // Check maintenance mode before allowing login
    const maintenanceEnabled = await checkMaintenanceMode();
    if (maintenanceEnabled) {
      navigate('/maintenance', { replace: true });
      return;
    }
    
    setIsLoading(true);
    // Store referral code in sessionStorage for processing after OAuth callback
    if (referralCode) {
      sessionStorage.setItem(REFERRAL_CODE_KEY, referralCode);
    }
    const { error } = await signInWithGoogle();
    if (error) {
      setIsLoading(false);
    }
  };


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

        {/* Auth card */}
        <Card className="glass-card border-border/20 animate-slide-up">
          <CardHeader className="text-center pb-8">
            <div className="w-16 h-16 bg-gradient-primary rounded-xl flex items-center justify-center mx-auto mb-4">
              <Zap className="h-8 w-8 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl font-display">Welcome to tRIAL-cLIENTS</CardTitle>
            <CardDescription className="text-base">
              Sign in to start generating realistic client briefs with AI
            </CardDescription>
            
            {/* Referral Banner */}
            {referralCode && (
              <div className="mt-4 p-3 bg-accent/10 border border-accent/30 rounded-lg flex items-center gap-2">
                <Gift className="h-5 w-5 text-accent" />
                <span className="text-sm text-accent font-medium">
                  You'll receive 2 bonus credits after signing up!
                </span>
              </div>
            )}
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
              By continuing, you agree to our{" "}
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
      </div>
    </div>
  );
};

export default Auth;