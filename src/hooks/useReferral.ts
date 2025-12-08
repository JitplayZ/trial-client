import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface ReferralData {
  code: string;
  totalReferrals: number;
  creditsEarned: number;
}

export function useReferral() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [referralData, setReferralData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchReferralData();
    }
  }, [user]);

  const fetchReferralData = async () => {
    if (!user) return;

    try {
      // Fetch user's referral code
      const { data: codeData, error: codeError } = await supabase
        .from('referral_codes')
        .select('code')
        .eq('user_id', user.id)
        .maybeSingle();

      if (codeError) throw codeError;

      // If no code exists, create one via edge function
      let code = codeData?.code;
      if (!code) {
        const { data: newCode, error: createError } = await supabase
          .rpc('generate_referral_code');
        
        if (!createError && newCode) {
          const { error: insertError } = await supabase
            .from('referral_codes')
            .insert({ user_id: user.id, code: newCode });
          
          if (!insertError) {
            code = newCode;
          }
        }
      }

      // Fetch referral stats
      const { data: referrals, error: refError } = await supabase
        .from('referrals')
        .select('id, credits_awarded')
        .eq('referrer_id', user.id);

      if (refError) throw refError;

      const totalReferrals = referrals?.length ?? 0;
      const creditsEarned = (referrals?.filter(r => r.credits_awarded).length ?? 0) * 2;

      setReferralData({
        code: code ?? '',
        totalReferrals,
        creditsEarned
      });
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error fetching referral data:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const getReferralLink = () => {
    if (!referralData?.code) return '';
    const baseUrl = window.location.origin;
    return `${baseUrl}/auth?ref=${referralData.code}`;
  };

  const copyReferralLink = async () => {
    const link = getReferralLink();
    if (!link) {
      toast({
        title: 'Error',
        description: 'Could not generate referral link',
        variant: 'destructive'
      });
      return;
    }

    try {
      await navigator.clipboard.writeText(link);
      toast({
        title: 'Copied!',
        description: 'Referral link copied to clipboard'
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to copy link',
        variant: 'destructive'
      });
    }
  };

  return {
    referralData,
    loading,
    getReferralLink,
    copyReferralLink,
    refresh: fetchReferralData
  };
}
