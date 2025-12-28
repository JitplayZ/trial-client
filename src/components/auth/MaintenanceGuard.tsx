import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface MaintenanceGuardProps {
  children: React.ReactNode;
}

export const MaintenanceGuard = ({ children }: MaintenanceGuardProps) => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);

  const checkMaintenanceAndAdmin = useCallback(async () => {
    // Skip check for maintenance page itself
    if (location.pathname === '/maintenance') {
      setChecking(false);
      return;
    }

    try {
      // Check maintenance mode using public view (hides admin IDs)
      const { data: settingsData } = await supabase
        .from('system_settings_public')
        .select('value')
        .eq('key', 'maintenance_mode')
        .single();

      const maintenanceEnabled = (settingsData?.value as { enabled?: boolean } | null)?.enabled ?? false;
      setIsMaintenanceMode(maintenanceEnabled);

      if (!maintenanceEnabled) {
        // Maintenance is OFF - ensure users can access the app
        setIsAdmin(false);
        setChecking(false);
        return;
      }

      // If maintenance mode is on, check if user is admin
      if (user) {
        const { data: roleData } = await supabase.rpc('has_role', {
          _user_id: user.id,
          _role: 'admin'
        });
        setIsAdmin(roleData === true);
        
        // If not admin and maintenance mode is on, redirect
        if (!roleData) {
          navigate('/maintenance', { replace: true });
        }
      } else {
        // No user and maintenance mode is on - redirect
        // Allow access to login pages for admins
        const isAdminLoginRoute = location.pathname === '/login/admin';
        if (!isAdminLoginRoute) {
          navigate('/maintenance', { replace: true });
        }
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error checking maintenance mode:', error);
      }
    } finally {
      setChecking(false);
    }
  }, [user, navigate, location.pathname]);

  useEffect(() => {
    if (!authLoading) {
      checkMaintenanceAndAdmin();
    }
  }, [authLoading, checkMaintenanceAndAdmin]);

  // Subscribe to real-time maintenance mode changes
  useEffect(() => {
    const channel = supabase
      .channel('maintenance_mode_guard')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'system_settings',
          filter: 'key=eq.maintenance_mode'
        },
        () => {
          // Re-check maintenance status immediately when it changes
          checkMaintenanceAndAdmin();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [checkMaintenanceAndAdmin]);

  if (authLoading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If maintenance mode and not admin (and not on maintenance page), don't render
  if (isMaintenanceMode && !isAdmin && location.pathname !== '/maintenance' && location.pathname !== '/login/admin') {
    return null;
  }

  return <>{children}</>;
};