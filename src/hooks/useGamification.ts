import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

// Define allowed event types
const ALLOWED_EVENT_TYPES = ['project_created', 'project_completed', 'referral_success', 'daily_login'] as const;
export type EventType = typeof ALLOWED_EVENT_TYPES[number];

// Define allowed badge types
const ALLOWED_BADGE_TYPES = ['first_project', 'level_5', 'level_10', 'xp_5000', 'referral_success', 'daily_streak_7'] as const;
export type BadgeType = typeof ALLOWED_BADGE_TYPES[number];

interface UserXP {
  total_xp: number;
  level: number;
}

interface Badge {
  badge_type: string;
  earned_at: string;
}

interface AwardXPResponse {
  ok: boolean;
  xp_gained?: number;
  total_xp?: number;
  level?: number;
  leveled_up?: boolean;
  badges_awarded?: string[];
  message?: string;
}

export function useGamification() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [userXP, setUserXP] = useState<UserXP>({ total_xp: 0, level: 1 });
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);

  // Calculate XP needed for next level
  const getXPForLevel = (level: number) => level * 1000;
  const currentLevelXP = getXPForLevel(userXP.level - 1);
  const nextLevelXP = getXPForLevel(userXP.level);
  const progressXP = userXP.total_xp - currentLevelXP;
  const neededXP = nextLevelXP - currentLevelXP;

  useEffect(() => {
    if (user) {
      fetchGamificationData();
      
      // Set up real-time subscription for XP updates
      const xpChannel = supabase
        .channel('gamification-xp-realtime')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'user_xp',
            filter: `user_id=eq.${user.id}`
          },
          () => {
            fetchGamificationData();
          }
        )
        .subscribe();
      
      // Set up real-time subscription for badge updates
      const badgeChannel = supabase
        .channel('gamification-badges-realtime')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'user_badges',
            filter: `user_id=eq.${user.id}`
          },
          () => {
            fetchGamificationData();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(xpChannel);
        supabase.removeChannel(badgeChannel);
      };
    }
  }, [user]);

  const fetchGamificationData = async () => {
    if (!user) return;

    try {
      // Fetch user XP
      const { data: xpData } = await supabase
        .from('user_xp')
        .select('total_xp, level')
        .eq('user_id', user.id)
        .maybeSingle();

      if (xpData) {
        setUserXP(xpData);
      }

      // Fetch user badges
      const { data: badgesData } = await supabase
        .from('user_badges')
        .select('badge_type, earned_at')
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false });

      if (badgesData) {
        setBadges(badgesData);
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error fetching gamification data:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const awardXP = async (eventType: EventType) => {
    if (!user) return;

    // Validate event type client-side (server also validates)
    if (!ALLOWED_EVENT_TYPES.includes(eventType)) {
      if (import.meta.env.DEV) {
        console.error('Invalid event type:', eventType);
      }
      return;
    }

    try {
      // Call server-side edge function to award XP securely
      const { data, error } = await supabase.functions.invoke<AwardXPResponse>('award-xp', {
        body: { event_type: eventType }
      });

      if (error) {
        console.error('Error awarding XP:', error);
        return;
      }

      if (!data?.ok) {
        console.error('XP award failed:', data?.message);
        return;
      }

      // Update local state with server response
      if (data.total_xp !== undefined && data.level !== undefined) {
        setUserXP({ total_xp: data.total_xp, level: data.level });
      }

      // Show XP gained toast
      toast({
        title: `+${data.xp_gained} XP`,
        description: getEventMessage(eventType),
        duration: 3000,
        className: 'animate-fade-in',
      });

      // Show level up toast if leveled up
      if (data.leveled_up) {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        toast({
          title: `🎉 Level Up!`,
          description: `You reached Level ${data.level}!`,
          duration: 5000,
          className: prefersReducedMotion ? '' : 'animate-scale-in',
        });
      }

      // Show badge toasts
      if (data.badges_awarded && data.badges_awarded.length > 0) {
        for (const badgeType of data.badges_awarded) {
          toast({
            title: "🏆 Badge Earned!",
            description: getBadgeDisplayName(badgeType),
            duration: 5000,
          });
        }
        // Refresh badges list
        await fetchGamificationData();
      }

    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error awarding XP:', error);
      }
    }
  };

  const getEventMessage = (eventType: string): string => {
    const messages = {
      project_created: 'Project generated! 🚀',
      project_completed: 'Project completed! Nice work! 💪',
      referral_success: 'Friend joined! Thanks for sharing! 🙌',
      daily_login: 'Daily check-in bonus! 📅',
    };
    return messages[eventType as keyof typeof messages] || 'XP earned!';
  };

  const getBadgeDisplayName = (badgeType: string): string => {
    const names: Record<string, string> = {
      first_project: 'First Project',
      level_5: 'Level 5 Achiever',
      level_10: 'Level 10 Master',
      xp_5000: '5000 XP Legend',
      referral_success: 'Referral Champion',
      daily_streak_7: '7 Day Streak',
    };
    return names[badgeType] || badgeType;
  };

  const getBadgeIcon = (badgeType: string): string => {
    const icons: Record<string, string> = {
      first_project: '🎯',
      level_5: '⭐',
      level_10: '🌟',
      xp_5000: '👑',
      referral_success: '🤝',
      daily_streak_7: '🔥',
    };
    return icons[badgeType] || '🏆';
  };

  return {
    userXP,
    badges,
    loading,
    progressXP,
    neededXP,
    awardXP,
    getBadgeDisplayName,
    getBadgeIcon,
    refresh: fetchGamificationData
  };
}
