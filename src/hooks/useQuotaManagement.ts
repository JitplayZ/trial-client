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
        .single();

      if (error) throw error;

      if (data) {
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
      return { available: false, remaining: 0, limit: 0, isLocked: true };
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

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const columnName = `${level}_left`;
      const currentValue = quotaData.quotas[`${level}Left` as keyof typeof quotaData.quotas];
      
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

  const changePlan = async (newPlan: PlanType): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // Set new quotas based on plan
      const planQuotas = {
        beginner_left: -1, // Always unlimited
        intermediate_left: newPlan === 'free' ? 2 : -1,
        veteran_left: newPlan === 'free' ? 0 : newPlan === 'pro' ? 4 : 20
      };

      const { error } = await supabase
        .from('subscriptions')
        .update({ 
          plan: newPlan,
          ...planQuotas
        })
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchSubscription();
      
      toast({
        title: 'Success',
        description: `Plan updated to ${newPlan}`,
      });

      return true;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error changing plan:', error);
      }
      toast({
        title: 'Error',
        description: 'Failed to update plan',
        variant: 'destructive'
      });
      return false;
    }
  };

  return {
    quotaData,
    loading,
    getQuotaStatus,
    consumeQuota,
    getResetDate,
    changePlan,
    refresh: fetchSubscription
  };
};
