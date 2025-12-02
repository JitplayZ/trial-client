import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type PlanType = 'free' | 'pro' | 'proplus';
export type LevelType = 'beginner' | 'intermediate' | 'veteran';

interface QuotaData {
  plan: PlanType;
  quotas: {
    beginnerLeft: number;
    intermediateLeft: number;
    veteranLeft: number;
    resetAt: string;
  };
}

interface QuotaLimits {
  beginner: number | 'unlimited';
  intermediate: number | 'unlimited';
  veteran: number | 'locked';
}

const PLAN_LIMITS: Record<PlanType, QuotaLimits> = {
  free: {
    beginner: 'unlimited',
    intermediate: 2,
    veteran: 'locked'
  },
  pro: {
    beginner: 'unlimited',
    intermediate: 'unlimited',
    veteran: 4
  },
  proplus: {
    beginner: 'unlimited',
    intermediate: 'unlimited',
    veteran: 20
  }
};

export const useQuotaManagement = () => {
  const [quotaData, setQuotaData] = useState<QuotaData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      // If subscription doesn't exist, create one with free plan defaults
      if (!data) {
        const { data: newSubscription, error: insertError } = await supabase
          .from('subscriptions')
          .insert({
            user_id: user.id,
            plan: 'free',
            beginner_left: -1, // unlimited
            intermediate_left: 2,
            veteran_left: 0,
            reset_at: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString()
          })
          .select()
          .single();

        if (insertError) throw insertError;

        setQuotaData({
          plan: newSubscription.plan as PlanType,
          quotas: {
            beginnerLeft: newSubscription.beginner_left,
            intermediateLeft: newSubscription.intermediate_left,
            veteranLeft: newSubscription.veteran_left,
            resetAt: newSubscription.reset_at
          }
        });
      } else {
        setQuotaData({
          plan: data.plan as PlanType,
          quotas: {
            beginnerLeft: data.beginner_left,
            intermediateLeft: data.intermediate_left,
            veteranLeft: data.veteran_left,
            resetAt: data.reset_at
          }
        });
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error fetching subscription:', error);
      }
      toast({
        title: 'Error',
        description: 'Failed to load subscription data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getQuotaStatus = (level: LevelType): {
    available: boolean;
    remaining: number | 'unlimited' | 'locked';
    limit: number | 'unlimited' | 'locked';
    isLocked: boolean;
  } => {
    if (!quotaData) {
      // Return loading state instead of locked when quotaData is not available yet
      return { available: false, remaining: 0, limit: 0, isLocked: false };
    }

    const limits = PLAN_LIMITS[quotaData.plan];
    const limit = limits[level];

    if (limit === 'locked') {
      return { available: false, remaining: 'locked', limit: 'locked', isLocked: true };
    }

    if (limit === 'unlimited') {
      return { available: true, remaining: 'unlimited', limit: 'unlimited', isLocked: false };
    }

    const remaining = quotaData.quotas[`${level}Left` as keyof typeof quotaData.quotas] as number;
    
    // Handle unlimited case (when remaining is -1 in database)
    if (remaining === -1) {
      return { available: true, remaining: 'unlimited', limit: 'unlimited', isLocked: false };
    }
    
    return {
      available: remaining > 0,
      remaining,
      limit,
      isLocked: false
    };
  };

  const consumeQuota = async (level: LevelType): Promise<boolean> => {
    if (!quotaData) return false;

    const status = getQuotaStatus(level);
    if (!status.available) return false;
    
    // Don't consume quota if it's unlimited
    if (status.remaining === 'unlimited') return true;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const columnName = `${level}_left`;
      const currentValue = quotaData.quotas[`${level}Left` as keyof typeof quotaData.quotas];
      
      // Handle unlimited case (-1 in database)
      if (currentValue === -1) return true;
      
      if (typeof currentValue !== 'number' || currentValue <= 0) return false;

      const { error } = await supabase
        .from('subscriptions')
        .update({ [columnName]: currentValue - 1 })
        .eq('user_id', user.id);

      if (error) throw error;

      // Update local state
      setQuotaData(prev => {
        if (!prev) return prev;
        
        const key = `${level}Left` as keyof typeof prev.quotas;
        
        return {
          ...prev,
          quotas: {
            ...prev.quotas,
            [key]: currentValue - 1
          }
        };
      });

      return true;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error consuming quota:', error);
      }
      toast({
        title: 'Error',
        description: 'Failed to update quota',
        variant: 'destructive'
      });
      return false;
    }
  };

  const getResetDate = (): Date | null => {
    if (!quotaData) return null;
    return new Date(quotaData.quotas.resetAt);
  };

  // Note: Plan changes are now handled server-side only via payment integration
  // The changePlan function has been removed to prevent privilege escalation

  return {
    quotaData,
    loading,
    getQuotaStatus,
    consumeQuota,
    getResetDate,
    refresh: fetchSubscription
  };
};
