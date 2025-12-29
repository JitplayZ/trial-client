import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Gift, ExternalLink, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

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
}

interface CanSubmitResult {
  allowed: boolean;
  reason: string;
  days_remaining?: number;
}

const platformLabels: Record<Platform, string> = {
  x: 'X (Twitter)',
  linkedin: 'LinkedIn',
  reddit: 'Reddit',
  youtube: 'YouTube'
};

export const SocialRewardCard = () => {
  const { user } = useAuth();
  const [existingRequest, setExistingRequest] = useState<SocialRewardRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [platform, setPlatform] = useState<Platform | ''>('');
  const [postUrl, setPostUrl] = useState('');
  const [canSubmit, setCanSubmit] = useState<CanSubmitResult | null>(null);

  useEffect(() => {
    if (user) {
      fetchExistingRequest();
      checkCanSubmit();
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
      setLoading(false);
    }
  };

  const checkCanSubmit = async () => {
    try {
      const { data, error } = await supabase.rpc('can_submit_social_reward', {
        _user_id: user?.id
      });
      if (error) throw error;
      if (data && typeof data === 'object') {
        setCanSubmit(data as unknown as CanSubmitResult);
      }
    } catch (error) {
      console.error('Error checking submit eligibility:', error);
    }
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
        } else if (error.message.includes('Social reward submission blocked')) {
          toast.error(error.message.replace('Social reward submission blocked: ', ''));
        } else {
          throw error;
        }
        return;
      }

      toast.success('Request submitted! We will review your post shortly.');
      fetchExistingRequest();
      checkCanSubmit();
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

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show existing pending request status
  if (existingRequest && existingRequest.status === 'pending') {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Gift className="h-5 w-5 text-primary" />
            Earn Free Credits
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted/50 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Your Submission</span>
              {getStatusBadge(existingRequest.status)}
            </div>
            <div className="text-sm text-muted-foreground">
              <p><strong>Platform:</strong> {platformLabels[existingRequest.platform]}</p>
              <p className="flex items-center gap-1">
                <strong>Post:</strong>
                <a 
                  href={existingRequest.post_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center gap-1"
                >
                  View Post <ExternalLink className="h-3 w-3" />
                </a>
              </p>
              <p><strong>Submitted:</strong> {new Date(existingRequest.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show weekly limit message if not allowed
  if (canSubmit && !canSubmit.allowed) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Gift className="h-5 w-5 text-primary" />
            Earn Free Credits
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted/50 rounded-lg space-y-3">
            {canSubmit.days_remaining !== undefined && canSubmit.days_remaining > 0 && (
              <div className="flex items-center justify-center gap-3 p-3 bg-primary/10 rounded-lg">
                <Clock className="h-5 w-5 text-primary" />
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{canSubmit.days_remaining}</p>
                  <p className="text-xs text-muted-foreground">day{canSubmit.days_remaining !== 1 ? 's' : ''} remaining</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">{canSubmit.reason}</span>
            </div>
            {existingRequest && existingRequest.status === 'approved' && (
              <div className="flex items-center gap-2 text-green-600 bg-green-500/10 p-2 rounded">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Last reward: +{existingRequest.credits_awarded} credits</span>
              </div>
            )}
            {existingRequest && existingRequest.status === 'rejected' && existingRequest.rejection_reason && (
              <div className="flex items-start gap-2 text-destructive bg-destructive/10 p-2 rounded">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span className="text-sm">Last submission rejected: {existingRequest.rejection_reason}</span>
              </div>
            )}
            <p className="text-xs text-muted-foreground">You can submit one social post for review each week.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show submission form
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Gift className="h-5 w-5 text-primary" />
          Earn Free Credits
        </CardTitle>
        <CardDescription>
          Share about tRIAL-CLIENTS on social media and earn free credits!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-muted/50 rounded-lg space-y-2 text-sm">
          <p className="font-medium">How it works:</p>
          <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
            <li>Create a meaningful post about tRIAL-CLIENTS</li>
            <li>Tag or mention our official handle (if applicable)</li>
            <li>Paste the post link below and submit</li>
          </ol>
          <div className="mt-3 pt-2 border-t border-border space-y-1 text-muted-foreground text-xs">
            <p>• Low-effort or spam posts do NOT qualify</p>
            <p>• Credits are granted only after manual review</p>
            <p>• This reward is limited to once per week</p>
            <p>• Submitting does NOT guarantee credits</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="platform">Platform</Label>
            <Select value={platform} onValueChange={(v) => setPlatform(v as Platform)}>
              <SelectTrigger id="platform">
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
          
          <div className="space-y-2">
            <Label htmlFor="post-url">Post URL</Label>
            <Input
              id="post-url"
              type="url"
              placeholder="https://x.com/yourpost..."
              value={postUrl}
              onChange={(e) => setPostUrl(e.target.value)}
            />
          </div>

          <Button 
            onClick={handleSubmit} 
            disabled={submitting || !platform || !postUrl.trim()}
            className="w-full"
          >
            {submitting ? 'Submitting...' : 'Submit for Review'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};