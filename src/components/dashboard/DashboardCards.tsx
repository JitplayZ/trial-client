import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FolderOpen, CreditCard, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useQuotaManagement } from '@/hooks/useQuotaManagement';

const DashboardCards = () => {
  const { user } = useAuth();
  const { quotaData, loading: quotaLoading, refresh: refreshQuota } = useQuotaManagement();
  const [projectCount, setProjectCount] = useState<number>(0);
  const [weeklyCount, setWeeklyCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const fetchProjectStats = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // Fetch total project count
      const { count: total, error: totalError } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (totalError) throw totalError;

      // Fetch projects from this week
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const { count: weekly, error: weeklyError } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', weekAgo.toISOString());

      if (weeklyError) throw weeklyError;

      setProjectCount(total || 0);
      setWeeklyCount(weekly || 0);
    } catch (error) {
      console.error('Error fetching project stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectStats();

    if (!user) return;

    // Real-time subscription for projects
    const projectsChannel = supabase
      .channel('dashboard-projects-stats')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchProjectStats();
        }
      )
      .subscribe();

    // Real-time subscription for subscriptions (credits)
    const subscriptionsChannel = supabase
      .channel('dashboard-subscriptions-stats')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subscriptions',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          refreshQuota();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(projectsChannel);
      supabase.removeChannel(subscriptionsChannel);
    };
  }, [user]);

  // Calculate total free credits remaining
  const getTotalFreeCredits = () => {
    if (!quotaData) return 0;
    const { beginnerLeft, intermediateLeft, veteranLeft } = quotaData.quotas;
    return beginnerLeft + intermediateLeft + veteranLeft;
  };

  // Calculate total purchased credits
  const getPurchasedCredits = () => {
    return quotaData?.credits || 0;
  };

  const isLoading = loading || quotaLoading;

  const cards = [
    {
      title: 'Projects Generated',
      value: isLoading ? '-' : projectCount.toString(),
      icon: FolderOpen,
      description: 'Total projects created',
      trend: isLoading ? '' : `+${weeklyCount} this week`
    },
    {
      title: 'Free Credits',
      value: isLoading ? '-' : getTotalFreeCredits().toString(),
      icon: CreditCard,
      description: `${getPurchasedCredits()} purchased credits`,
      trend: quotaData ? `${quotaData.plan.toUpperCase()} plan` : ''
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index} className="bg-card/50 backdrop-blur-sm border-border/30 hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              ) : (
                <Icon className="h-4 w-4 text-muted-foreground" />
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{card.value}</div>
              <p className="text-xs text-muted-foreground">
                {card.description}
              </p>
              <p className="text-xs text-accent mt-1">
                {card.trend}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default DashboardCards;
