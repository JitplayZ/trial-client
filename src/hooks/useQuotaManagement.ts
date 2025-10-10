import { useState, useEffect } from 'react';

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

  useEffect(() => {
    // Mock API call - replace with real endpoint
    const mockMe = localStorage.getItem('MOCK_USER_PLAN') || 'free';
    
    // Simulate API delay
    setTimeout(() => {
      const resetDate = new Date();
      resetDate.setMonth(resetDate.getMonth() + 1);
      resetDate.setDate(1);
      
      setQuotaData({
        plan: mockMe as PlanType,
        quotas: {
          beginnerLeft: -1, // -1 represents unlimited
          intermediateLeft: mockMe === 'free' ? 2 : -1,
          veteranLeft: mockMe === 'free' ? 0 : mockMe === 'pro' ? 4 : 20,
          resetAt: resetDate.toISOString()
        }
      });
      setLoading(false);
    }, 500);
  }, []);

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

  const consumeQuota = (level: LevelType): boolean => {
    if (!quotaData) return false;

    const status = getQuotaStatus(level);
    if (!status.available) return false;

    // Update local state
    setQuotaData(prev => {
      if (!prev) return prev;
      
      const key = `${level}Left` as keyof typeof prev.quotas;
      const currentValue = prev.quotas[key];
      
      if (typeof currentValue === 'number' && currentValue > 0) {
        return {
          ...prev,
          quotas: {
            ...prev.quotas,
            [key]: currentValue - 1
          }
        };
      }
      
      return prev;
    });

    return true;
  };

  const getResetDate = (): Date | null => {
    if (!quotaData) return null;
    return new Date(quotaData.quotas.resetAt);
  };

  const changePlan = (newPlan: PlanType) => {
    localStorage.setItem('MOCK_USER_PLAN', newPlan);
    window.location.reload(); // Simple reload for demo
  };

  return {
    quotaData,
    loading,
    getQuotaStatus,
    consumeQuota,
    getResetDate,
    changePlan
  };
};
