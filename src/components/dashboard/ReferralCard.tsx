import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Copy, Gift, Users, Share2 } from 'lucide-react';
import { useReferral } from '@/hooks/useReferral';
import { Skeleton } from '@/components/ui/skeleton';

const ReferralCard = () => {
  const { referralData, loading, getReferralLink, copyReferralLink } = useReferral();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await copyReferralLink();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <Card className="glass-card bg-card/50 backdrop-blur-xl border-border/50">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48 mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <div className="flex gap-4">
            <Skeleton className="h-16 flex-1" />
            <Skeleton className="h-16 flex-1" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card bg-card/50 backdrop-blur-xl border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-5 w-5 text-primary" />
          Refer & Earn
        </CardTitle>
        <CardDescription>
          Share your link and earn 2 credits when friends sign up!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Referral Link */}
        <div className="flex gap-2">
          <Input
            readOnly
            value={getReferralLink()}
            className="bg-background/50 font-mono text-sm"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={handleCopy}
            className="shrink-0"
          >
            {copied ? (
              <Share2 className="h-4 w-4 text-accent" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-background/40 rounded-lg text-center">
            <Users className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
            <p className="text-2xl font-bold">{referralData?.totalReferrals ?? 0}</p>
            <p className="text-xs text-muted-foreground">Friends Referred</p>
          </div>
          <div className="p-3 bg-background/40 rounded-lg text-center">
            <Gift className="h-5 w-5 mx-auto mb-1 text-accent" />
            <p className="text-2xl font-bold text-accent">+{referralData?.creditsEarned ?? 0}</p>
            <p className="text-xs text-muted-foreground">Credits Earned</p>
          </div>
        </div>

        {/* Rules */}
        <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t border-border/50">
          <p>• Both you and your friend get +2 credits</p>
          <p>• Max 1 referral reward per day</p>
          <p>• Each user can only be referred once</p>
        </div>

        <Button onClick={handleCopy} className="w-full bg-gradient-primary">
          <Share2 className="h-4 w-4 mr-2" />
          Share Referral Link
        </Button>
      </CardContent>
    </Card>
  );
};

export default ReferralCard;
