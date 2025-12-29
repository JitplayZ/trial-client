import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface SocialCooldownState {
  ok: boolean;
  allowed: boolean;
  reason: string;
  now: string | null;
  last_approved_at: string | null;
  cooldown_end: string | null;
  ms_remaining: number | null;
}

export function useSocialCooldown() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [cooldown, setCooldown] = useState<SocialCooldownState | null>(null);

  const fetchCooldown = useCallback(async () => {
    if (!user) {
      setCooldown(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.rpc("get_social_reward_cooldown");
      if (error) throw error;
      setCooldown(data as unknown as SocialCooldownState);
    } catch (err) {
      console.error("Error fetching social cooldown:", err);
      setCooldown(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCooldown();
  }, [fetchCooldown]);

  return { loading, cooldown, refetch: fetchCooldown };
}
