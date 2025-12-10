import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type PlanType = 'free' | 'pro' | 'proplus';
export type LevelType = 'beginner' | 'intermediate' | 'veteran';

interface QuotaData {
  plan: PlanType;
  credits: number;
  quotas: {
    beginnerLeft: number;
    intermediateLeft: number;
    veteranLeft: number;
    resetAt: string;
  };
}

// Credit costs per level (updated: veteran = 5)
export const CREDIT_COSTS: Record<LevelType, number> = {
  beginner: 1,
  intermediate: 2,
  veteran: 5
};

// Free monthly quotas per plan (updated: beginner = 3 for free plan)
const PLAN_FREE_QUOTAS: Record<PlanType, { beginner: number; intermediate: number; veteran: number }> = {
  free: { beginner: 3, intermediate: 2, veteran: 0 },
  pro: { beginner: 10, intermediate: 5, veteran: 2 },
  proplus: { beginner: 20, intermediate: 10, veteran: 5 }
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
            beginner_left: 3,  // Updated: 3 free beginner projects
            intermediate_left: 2,
            veteran_left: 0,
            credits: 5,  // Updated: 5 starting credits (not 10)
            reset_at: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString()
          })
          .select()
          .single();

        if (insertError) throw insertError;

        setQuotaData({
          plan: newSubscription.plan as PlanType,
          credits: newSubscription.credits ?? 0,
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
          credits: data.credits ?? 0,
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
    remaining: number | 'locked';
    limit: number | 'locked';
    isLocked: boolean;
    creditCost: number;
    canUseCredits: boolean;
  } => {
    if (!quotaData) {
      return { available: false, remaining: 0, limit: 0, isLocked: false, creditCost: 0, canUseCredits: false };
    }

    const freeQuotas = PLAN_FREE_QUOTAS[quotaData.plan];
    const limit = freeQuotas[level];
    const creditCost = CREDIT_COSTS[level];
    
    // Veteran level is locked for free plan users
    if (level === 'veteran' && quotaData.plan === 'free') {
      return { 
        available: false, 
        remaining: 'locked', 
        limit: 'locked', 
        isLocked: true,
        creditCost,
        canUseCredits: false
      };
    }

    const remaining = quotaData.quotas[`${level}Left` as keyof typeof quotaData.quotas] as number;
    const canUseCredits = quotaData.credits >= creditCost;
    
    // Available if has free quota OR has enough credits
    const available = remaining > 0 || canUseCredits;
    
    return {
      available,
      remaining,
      limit,
      isLocked: false,
      creditCost,
      canUseCredits
    };
  };

  const consumeQuota = async (level: LevelType): Promise<boolean> => {
    if (!quotaData) return false;

    const status = getQuotaStatus(level);
    if (!status.available) return false;
    
    // If locked, can't consume
    if (status.remaining === 'locked') return false;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const columnName = `${level}_left`;
      const currentValue = quotaData.quotas[`${level}Left` as keyof typeof quotaData.quotas];
      
      if (typeof currentValue !== 'number' || currentValue <= 0) {
        // No free quota left - would need to use credits (handled by edge function)
        return true;
      }

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
