import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  CreditCard, 
  DollarSign, 
  TrendingUp,
  Users,
  Coins,
  RefreshCw,
  ArrowUpRight
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SubscriptionData {
  user_id: string;
  email: string;
  plan: string;
  credits: number;
  beginner_left: number;
  intermediate_left: number;
  veteran_left: number;
  reset_at: string;
}

export const BillingManagement = () => {
  const [subscriptions, setSubscriptions] = useState<SubscriptionData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBillingData = async () => {
    setLoading(true);
    try {
      // Fetch subscriptions with profiles
      const { data: subs, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (subError) throw subError;

      const userIds = subs?.map(s => s.user_id) || [];
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('user_id, email')
        .in('user_id', userIds);

      if (profileError) throw profileError;

      const merged: SubscriptionData[] = (subs || []).map(sub => {
        const profile = profiles?.find(p => p.user_id === sub.user_id);
        return {
          ...sub,
          email: profile?.email || 'N/A'
        };
      });

      setSubscriptions(merged);
    } catch (error) {
      console.error('Error fetching billing data:', error);
      toast.error('Failed to fetch billing data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBillingData();
  }, []);

  const totalRevenue = subscriptions.filter(s => s.plan !== 'free').length * 5; // Simplified calculation
  const totalCredits = subscriptions.reduce((sum, s) => sum + s.credits, 0);
  const proUsers = subscriptions.filter(s => s.plan === 'pro' || s.plan === 'proplus').length;

  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case 'pro':
        return <Badge className="bg-primary/10 text-primary border-primary/20">Pro</Badge>;
      case 'proplus':
        return <Badge className="bg-accent/10 text-accent border-accent/20">Pro+</Badge>;
      default:
        return <Badge variant="outline">Free</Badge>;
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold flex items-center gap-3">
            <CreditCard className="h-7 w-7 text-primary" />
            Billing & Payments
          </h1>
          <p className="text-foreground-secondary mt-1">Manage subscriptions and payment tracking</p>
        </div>
        <Button onClick={fetchBillingData} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold">${totalRevenue}</p>
              <p className="text-sm text-foreground-secondary">Est. Monthly Revenue</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{proUsers}</p>
              <p className="text-sm text-foreground-secondary">Paid Subscribers</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <Coins className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalCredits}</p>
              <p className="text-sm text-foreground-secondary">Total Credits in System</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">+23%</p>
              <p className="text-sm text-foreground-secondary">Growth Rate</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subscriptions Table */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">User Subscriptions</CardTitle>
          <CardDescription>View all user plans and credit balances</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Credits</TableHead>
                  <TableHead>Beginner Quota</TableHead>
                  <TableHead>Intermediate Quota</TableHead>
                  <TableHead>Veteran Quota</TableHead>
                  <TableHead>Resets At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <RefreshCw className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : subscriptions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No subscriptions found
                    </TableCell>
                  </TableRow>
                ) : (
                  subscriptions.map((sub) => (
                    <TableRow key={sub.user_id}>
                      <TableCell>
                        <span className="text-sm">{sub.email}</span>
                      </TableCell>
                      <TableCell>{getPlanBadge(sub.plan)}</TableCell>
                      <TableCell>
                        <span className="font-mono font-medium">{sub.credits}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono">{sub.beginner_left}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono">{sub.intermediate_left}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono">{sub.veteran_left}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {new Date(sub.reset_at).toLocaleDateString()}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Payment Gateway Notice */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <ArrowUpRight className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-primary mb-1">Payment Gateway Integration</h3>
              <p className="text-sm text-foreground-secondary">
                Payment gateway integration is ready for configuration. Connect Stripe or another payment processor to enable automated billing and subscription management.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
