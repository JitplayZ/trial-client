import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [isBanned, setIsBanned] = useState(false);
  const [banReason, setBanReason] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      const next = encodeURIComponent(location.pathname + location.search);
      navigate(`/login/user?next=${next}`, { replace: true });
    }
  }, [user, loading, navigate, location]);

  // Check user status from profiles table
  useEffect(() => {
    const checkUserStatus = async () => {
      if (!user) {
        setCheckingStatus(false);
        return;
      }

      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('status, generation_enabled, ban_reason')
          .eq('user_id', user.id)
          .single();

        // CRITICAL FIX: If profile not found, user was deleted - force sign out
        if (error) {
          if (error.code === 'PGRST116') {
            // Profile not found - user was deleted by admin
            console.warn('User profile not found - account may have been deleted');
            await signOut();
            return;
          }
          console.error('Error checking user status:', error);
          setCheckingStatus(false);
          return;
        }

        // Check if user is banned (suspended status AND generation disabled)
        if (profile?.status === 'suspended') {
          setIsBanned(true);
          setBanReason(profile?.ban_reason || 'Your account has been suspended by an administrator.');
        } else {
          setIsBanned(false);
          setBanReason(null);
        }
      } catch (error) {
        console.error('Error checking user status:', error);
      } finally {
        setCheckingStatus(false);
      }
    };

    if (user && !loading) {
      checkUserStatus();
    }

    // Set up real-time listener for status changes
    if (user) {
      const channel = supabase
        .channel('user-status-changes')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'profiles',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            const newStatus = payload.new as { status?: string; generation_enabled?: boolean; ban_reason?: string };
            if (newStatus.status === 'suspended') {
              setIsBanned(true);
              setBanReason(newStatus.ban_reason || 'Your account has been suspended by an administrator.');
            } else {
              setIsBanned(false);
              setBanReason(null);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, loading]);

  if (loading || checkingStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Show banned screen if user is suspended
  if (isBanned) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-20 h-20 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
            <ShieldAlert className="h-10 w-10 text-destructive" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">Account Suspended</h1>
            <p className="text-foreground-secondary">
              {banReason || 'Your account has been suspended. Please contact support for more information.'}
            </p>
          </div>
          <div className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full"
              asChild
            >
              <a href="mailto:help.trialclients@gmail.com?subject=Account%20Ban%20Appeal">
                Contact Support
              </a>
            </Button>

            <Button
              variant="secondary"
              className="w-full"
              asChild
            >
              <a
                href="https://mail.google.com/mail/?view=cm&fs=1&to=help.trialclients@gmail.com&su=Account%20Ban%20Appeal"
                target="_blank"
                rel="noreferrer"
              >
                Open in Gmail
              </a>
            </Button>
            <Button 
              variant="ghost" 
              className="w-full"
              onClick={signOut}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
