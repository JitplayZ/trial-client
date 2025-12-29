import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Copy, Gift, Users, Share2, ExternalLink, Clock, CheckCircle,
  XCircle, AlertCircle, Megaphone, UserPlus
} from 'lucide-react';
import { useReferral } from '@/hooks/useReferral';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { SocialRewardCooldown } from "@/components/dashboard/SocialRewardCooldown";
import { useSocialCooldown } from "@/hooks/useSocialCooldown";

type Platform = 'x' | 'linkedin' | 'reddit' | 'youtube';
type RequestStatus = 'pending' | 'approved' | 'rejected';

interface SocialRewardRequest {
  id: string;
  platform: Platform;
  post_url: string;
  status: RequestStatus;
  credits_awarded: number | null;
  rejection_reason: string | null;
  created_at: string;
  reviewed_at?: string | null;
}

const platformLabels: Record<Platform, string> = {
  x: 'X (Twitter)',
  linkedin: 'LinkedIn',
  reddit: 'Reddit',
  youtube: 'YouTube'
};

const EarnCreditsSection = () => {
  const { user } = useAuth();
  const { referralData, loading: referralLoading, getReferralLink, copyReferralLink } = useReferral();
  const [copied, setCopied] = useState(false);
  
  // Social reward state
  const [existingRequest, setExistingRequest] = useState<SocialRewardRequest | null>(null);
  const [socialLoading, setSocialLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [platform, setPlatform] = useState<Platform | ''>('');
  const [postUrl, setPostUrl] = useState('');

  // Backend cooldown state
  const { cooldown, refetch: refetchCooldown } = useSocialCooldown();

  useEffect(() => {
    if (user) {
      fetchExistingRequest();
    }
  }, [user]);

  const fetchExistingRequest = async () => {
    try {
      const { data, error } = await supabase
        .from('social_reward_requests')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      setExistingRequest(data as SocialRewardRequest | null);
    } catch (error) {
      console.error('Error fetching social reward request:', error);
    } finally {
      setSocialLoading(false);
    }
  };

  const handleCopy = async () => {
    await copyReferralLink();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async () => {
    if (!platform || !postUrl.trim()) {
      toast.error('Please select a platform and enter a valid post URL');
      return;
    }

    try {
      new URL(postUrl);
    } catch {
      toast.error('Please enter a valid URL');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('social_reward_requests')
        .insert({
          user_id: user?.id,
          platform,
          post_url: postUrl.trim()
        });

      if (error) {
        if (error.code === '23505') {
          if (error.message.includes('unique_post_url')) {
            toast.error('This post URL has already been submitted');
          } else {
            toast.error('You have already submitted a request');
          }
        } else {
          throw error;
        }
        return;
      }

      toast.success('Request submitted! We will review your post shortly.');
      fetchExistingRequest();
      refetchCooldown();
    } catch (error) {
      console.error('Error submitting request:', error);
      toast.error('Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: RequestStatus) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="outline" className="gap-1">
            <Clock className="h-3 w-3" />
            Pending Review
          </Badge>
        );
      case 'approved':
        return (
          <Badge className="gap-1 bg-green-500/20 text-green-600 border-green-500/30">
            <CheckCircle className="h-3 w-3" />
            Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            Rejected
          </Badge>
        );
    }
  };

  const isLoading = referralLoading || socialLoading;

  if (isLoading) {
    return (
      <Card className="bg-card/50 backdrop-blur-xl border-border/50">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/50 backdrop-blur-xl border-border/50">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Gift className="h-5 w-5 text-primary" />
          Earn Free Credits
        </CardTitle>
        <CardDescription>
          Choose how you'd like to earn free credits
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Referral Card */}
          <div className="p-5 rounded-xl bg-background/60 border border-border/50 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <UserPlus className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Refer Friends</h3>
                <p className="text-sm text-muted-foreground">Earn 2 credits per signup</p>
              </div>
            </div>
            
            {/* Referral Link */}
            <div className="flex gap-2">
              <Input
                readOnly
                value={getReferralLink()}
                className="bg-background/50 font-mono text-xs"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopy}
                className="shrink-0"
              >
                {copied ? (
                  <Share2 className="h-4 w-4 text-primary" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-muted/30 rounded-lg text-center">
                <Users className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                <p className="text-xl font-bold">{referralData?.totalReferrals ?? 0}</p>
                <p className="text-xs text-muted-foreground">Referred</p>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg text-center">
                <Gift className="h-4 w-4 mx-auto mb-1 text-primary" />
                <p className="text-xl font-bold text-primary">+{referralData?.creditsEarned ?? 0}</p>
                <p className="text-xs text-muted-foreground">Earned</p>
              </div>
            </div>

            {/* Rules */}
            <div className="text-xs text-muted-foreground space-y-1 pt-3 border-t border-border/50">
              <p>• Both you and your friend get +2 credits</p>
              <p>• Max 1 referral reward per day</p>
            </div>

            <Button onClick={handleCopy} className="w-full" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              {copied ? 'Copied!' : 'Share Link'}
            </Button>
          </div>

          {/* Social Post Card */}
          <div className="p-5 rounded-xl bg-background/60 border border-border/50 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Megaphone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Social Post</h3>
                <p className="text-sm text-muted-foreground">Earn up to 5 credits</p>
              </div>
            </div>

            {existingRequest && existingRequest.status === 'pending' ? (
              <div className="space-y-3">
                <div className="p-3 bg-muted/30 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Your Submission</span>
                    {getStatusBadge(existingRequest.status)}
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p><strong>Platform:</strong> {platformLabels[existingRequest.platform]}</p>
                    <p className="flex items-center gap-1">
                      <strong>Post:</strong>
                      <a 
                        href={existingRequest.post_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline inline-flex items-center gap-1"
                      >
                        View <ExternalLink className="h-3 w-3" />
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            ) : cooldown && !cooldown.allowed ? (
              <div className="space-y-3">
                <div className="p-3 bg-muted/30 rounded-lg space-y-2">
                  {/* Backend-driven cooldown box */}
                  <SocialRewardCooldown cooldown={cooldown} label="Next submission available in" />
                  {existingRequest && existingRequest.status === 'approved' && (
                    <div className="flex items-center gap-2 text-green-600 bg-green-500/10 p-2 rounded text-sm">
                      <CheckCircle className="h-4 w-4" />
                      <span className="font-medium">+{existingRequest.credits_awarded} credits earned!</span>
                    </div>
                  )}
                  {existingRequest && existingRequest.status === 'rejected' && existingRequest.rejection_reason && (
                    <div className="flex items-start gap-2 text-destructive bg-destructive/10 p-2 rounded text-xs">
                      <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                      <span>{existingRequest.rejection_reason}</span>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">One submission per week.</p>
                </div>
              </div>
            ) : (
              <>
                {/* Backend-driven cooldown (visible if approved but now eligible again) */}
                {existingRequest?.status === 'approved' && cooldown && cooldown.ms_remaining !== null && (
                  <SocialRewardCooldown cooldown={cooldown} label="Next submission available in" />
                )}

                {/* Form */}
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="platform" className="text-xs">Platform</Label>
                    <Select value={platform} onValueChange={(v) => setPlatform(v as Platform)}>
                      <SelectTrigger id="platform" className="h-9">
                        <SelectValue placeholder="Select platform" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="x">X (Twitter)</SelectItem>
                        <SelectItem value="linkedin">LinkedIn</SelectItem>
                        <SelectItem value="reddit">Reddit</SelectItem>
                        <SelectItem value="youtube">YouTube</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-1.5">
                    <Label htmlFor="post-url" className="text-xs">Post URL</Label>
                    <Input
                      id="post-url"
                      type="url"
                      placeholder="https://x.com/yourpost..."
                      value={postUrl}
                      onChange={(e) => setPostUrl(e.target.value)}
                      className="h-9 text-sm"
                    />
                  </div>
                </div>

                {/* Rules */}
                <div className="text-xs text-muted-foreground space-y-1 pt-3 border-t border-border/50">
                  <p>• Post about tRIAL-CLIENTS on social media</p>
                  <p>• Credits after manual review (2-5)</p>
                  <p>• Once per week limit</p>
                </div>

                <Button 
                  onClick={handleSubmit} 
                  disabled={submitting || !platform || !postUrl.trim()}
                  className="w-full"
                  size="sm"
                >
                  {submitting ? 'Submitting...' : 'Submit for Review'}
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EarnCreditsSection;
