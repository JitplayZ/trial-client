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

interface XPEvent {
  event_type: string;
  xp_gained: number;
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
    }
  }, [user]);

  const fetchGamificationData = async () => {
    if (!user) return;

    try {
      // Fetch user XP
      let { data: xpData } = await supabase
        .from('user_xp')
        .select('total_xp, level')
        .eq('user_id', user.id)
        .maybeSingle();

      // If no XP record exists, create one
      if (!xpData) {
        const { data: newXpData, error: insertError } = await supabase
          .from('user_xp')
          .insert({ user_id: user.id, total_xp: 0, level: 1 })
          .select('total_xp, level')
          .single();

        if (!insertError && newXpData) {
          xpData = newXpData;
        }
      }

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

  const awardXP = async (eventType: EventType, xpAmount: number) => {
    if (!user) return;

    // Validate event type
    if (!ALLOWED_EVENT_TYPES.includes(eventType)) {
      if (import.meta.env.DEV) {
        console.error('Invalid event type:', eventType);
      }
      return;
    }

    try {
      // Add XP event
      await supabase.from('xp_events').insert({
        user_id: user.id,
        event_type: eventType,
        xp_gained: xpAmount
      });

      // Update user XP
      const newTotalXP = userXP.total_xp + xpAmount;
      const newLevel = Math.floor(newTotalXP / 1000) + 1;
      const leveledUp = newLevel > userXP.level;

      await supabase
        .from('user_xp')
        .update({
          total_xp: newTotalXP,
          level: newLevel
        })
        .eq('user_id', user.id);

      // Update local state
      setUserXP({ total_xp: newTotalXP, level: newLevel });

      // Show XP gained toast with subtle animation
      toast({
        title: `+${xpAmount} XP`,
        description: getEventMessage(eventType),
        duration: 3000,
        className: 'animate-fade-in',
      });

      // Show level up toast if leveled up
      if (leveledUp) {
        // Check for reduced motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        toast({
          title: `🎉 Level Up!`,
          description: `You reached Level ${newLevel}!`,
          duration: 5000,
          className: prefersReducedMotion ? '' : 'animate-scale-in',
        });
        
        // Award level up badge
        await awardBadge(`level_${newLevel}`);
      }

      // Check for achievement badges
      await checkForBadges(eventType, newTotalXP);

    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error awarding XP:', error);
      }
    }
  };

  const awardBadge = async (badgeType: BadgeType | string) => {
    if (!user) return;

    // Validate badge type for known badges (allow dynamic level badges)
    const isDynamicLevelBadge = badgeType.startsWith('level_');
    if (!isDynamicLevelBadge && !ALLOWED_BADGE_TYPES.includes(badgeType as BadgeType)) {
      if (import.meta.env.DEV) {
        console.error('Invalid badge type:', badgeType);
      }
      return;
    }

    try {
      // Check if badge already exists
      const { data: existingBadge } = await supabase
        .from('user_badges')
        .select('id')
        .eq('user_id', user.id)
        .eq('badge_type', badgeType)
        .maybeSingle();

      if (!existingBadge) {
        await supabase.from('user_badges').insert({
          user_id: user.id,
          badge_type: badgeType
        });

        // Refresh badges
        await fetchGamificationData();

        // Show badge earned toast
        toast({
          title: "🏆 Badge Earned!",
          description: getBadgeDisplayName(badgeType),
          duration: 5000,
        });
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error awarding badge:', error);
      }
    }
  };

  const checkForBadges = async (eventType: string, totalXP: number) => {
    // First Project badge
    if (eventType === 'project_created') {
      await awardBadge('first_project');
    }

    // High XP badges
    if (totalXP >= 5000 && !badges.find(b => b.badge_type === 'xp_5000')) {
      await awardBadge('xp_5000');
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
    const names = {
      first_project: 'First Project',
      level_5: 'Level 5 Achiever',
      level_10: 'Level 10 Master',
      xp_5000: '5000 XP Legend',
      referral_success: 'Referral Champion',
      daily_streak_7: '7 Day Streak',
    };
    return names[badgeType as keyof typeof names] || badgeType;
  };

  const getBadgeIcon = (badgeType: string): string => {
    const icons = {
      first_project: '🎯',
      level_5: '⭐',
      level_10: '🌟',
      xp_5000: '👑',
      referral_success: '🤝',
      daily_streak_7: '🔥',
    };
    return icons[badgeType as keyof typeof icons] || '🏆';
  };

  return {
    userXP,
    badges,
    loading,
    progressXP,
    neededXP,
    awardXP,
    awardBadge,
    getBadgeDisplayName,
    getBadgeIcon,
    refresh: fetchGamificationData
  };
}