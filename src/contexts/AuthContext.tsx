import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

// Helper to track login and capture IP address
const trackLogin = async (accessToken: string) => {
  try {
    await supabase.functions.invoke('track-login', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    console.log('Login tracked successfully');
  } catch (error) {
    console.error('Failed to track login:', error);
  }
};

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInWithGoogle: (displayName?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Session storage key for referral codes
const REFERRAL_CODE_KEY = 'referralCode';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Process referral code from sessionStorage after OAuth callback
  const processStoredReferralCode = async (userId: string) => {
    const storedCode = sessionStorage.getItem(REFERRAL_CODE_KEY);
    if (!storedCode) return;

    // Clear immediately to prevent duplicate processing
    sessionStorage.removeItem(REFERRAL_CODE_KEY);

    try {
      const { data, error } = await supabase.rpc('process_referral', {
        _referral_code: storedCode
      });

      if (error) {
        console.error('Referral processing error:', error);
        return;
      }

      const result = data as { ok?: boolean; referred_credits?: number; message?: string } | null;
      
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
      console.error('Error processing stored referral:', error);
    }
  };

  // Helper to check maintenance mode before allowing user access
  const checkMaintenanceAndSignOut = async (userId: string): Promise<boolean> => {
    try {
      // SECURITY: Use SECURITY DEFINER RPC (system_settings has no SELECT policy by design)
      const { data: maintenanceEnabled, error: maintenanceError } = await supabase.rpc('is_maintenance_mode');

      if (maintenanceError) {
        if (import.meta.env.DEV) {
          console.error('Error checking maintenance mode:', maintenanceError);
        }
        return false;
      }

      if (maintenanceEnabled === true) {
        // Check if user is admin
        const { data: isAdmin } = await supabase.rpc('has_role', {
          _user_id: userId,
          _role: 'admin'
        });

        // If not admin during maintenance, sign them out immediately
        if (!isAdmin) {
          if (import.meta.env.DEV) {
            console.warn('Maintenance mode active - signing out non-admin user');
          }
          await supabase.auth.signOut();
          return true; // Signed out
        }
      }
      return false; // Not signed out
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error checking maintenance mode:', error);
      }
      return false;
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        if (session?.user) {
          // Defer Supabase calls to avoid auth deadlocks
          setTimeout(async () => {
            // CRITICAL: Enforce maintenance mode for all active sessions
            const wasSignedOut = await checkMaintenanceAndSignOut(session.user.id);
            if (wasSignedOut) return;

            // Process stored referral code after successful sign-up via OAuth
            if (event === 'SIGNED_IN') {
              processStoredReferralCode(session.user.id);

              // Track login to capture IP address
              if (session.access_token) {
                trackLogin(session.access_token);
              }
            }
          }, 0);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // CRITICAL: Enforce maintenance mode for already-logged-in users
      if (session?.user) {
        setTimeout(() => {
          checkMaintenanceAndSignOut(session.user.id);
        }, 0);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/dashboard`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    });
    
    if (error) {
      toast({
        title: "Sign Up Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Welcome!",
        description: "Account created successfully. Check your email to confirm.",
      });
    }
    
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      toast({
        title: "Sign In Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Welcome back!",
        description: "Successfully signed in.",
      });
    }
    
    return { error };
  };

  const signInWithGoogle = async (displayName?: string) => {
    const redirectUrl = `${window.location.origin}/dashboard`;
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'select_account',
        },
      },
    });
    
    if (error) {
      toast({
        title: "Google Sign In Error",
        description: error.message,
        variant: "destructive",
      });
    }
    
    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Sign Out Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Signed Out",
        description: "You have been signed out successfully.",
      });
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}