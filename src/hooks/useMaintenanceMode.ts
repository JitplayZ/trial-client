import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface MaintenanceModeData {
  enabled: boolean;
  message: string;
}

export const useMaintenanceMode = () => {
  const [maintenanceData, setMaintenanceData] = useState<MaintenanceModeData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMaintenanceMode = async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'maintenance_mode')
        .single();

      if (error) {
        if (import.meta.env.DEV) {
          console.error('Error fetching maintenance mode:', error);
        }
        setMaintenanceData({ enabled: false, message: '' });
      } else {
        const value = data?.value as { enabled?: boolean; message?: string } | null;
        setMaintenanceData({
          enabled: value?.enabled ?? false,
          message: value?.message ?? 'We are currently undergoing scheduled maintenance.'
        });
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error fetching maintenance mode:', error);
      }
      setMaintenanceData({ enabled: false, message: '' });
    } finally {
      setLoading(false);
    }
  };

  const setMaintenanceMode = async (enabled: boolean, message?: string) => {
    try {
      const { data, error } = await supabase.rpc('set_maintenance_mode', {
        _enabled: enabled,
        _message: message || null
      });

      if (error) throw error;

      const result = data as { ok?: boolean; message?: string } | null;
      if (result?.ok) {
        await fetchMaintenanceMode();
        return { success: true };
      } else {
        return { success: false, error: result?.message || 'Failed to update' };
      }
    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.error('Error setting maintenance mode:', error);
      }
      return { success: false, error: error.message };
    }
  };

  useEffect(() => {
    fetchMaintenanceMode();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('system_settings_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'system_settings',
          filter: 'key=eq.maintenance_mode'
        },
        () => {
          fetchMaintenanceMode();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    isMaintenanceMode: maintenanceData?.enabled ?? false,
    maintenanceMessage: maintenanceData?.message ?? '',
    loading,
    setMaintenanceMode,
    refresh: fetchMaintenanceMode
  };
};
