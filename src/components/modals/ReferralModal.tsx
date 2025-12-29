import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Share2, Copy, MessageCircle, Check, Gift, Users, Coins, ExternalLink, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useReferral } from '@/hooks/useReferral';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { SocialRewardCooldown } from '@/components/dashboard/SocialRewardCooldown';
import { useSocialCooldown } from '@/hooks/useSocialCooldown';

interface ReferralModalProps {
  isOpen: boolean;
  onClose: () => void;
}

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

export const ReferralModal = ({ isOpen, onClose }: ReferralModalProps) => {
  const { user } = useAuth();
  const { referralData, loading, getReferralLink, copyReferralLink } = useReferral();
  const [copied, setCopied] = useState(false);
  
  // Social reward state
  const [existingRequest, setExistingRequest] = useState<SocialRewardRequest | null>(null);
  const [socialLoading, setSocialLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [platform, setPlatform] = useState<Platform | ''>('');
  const [postUrl, setPostUrl] = useState('');
  const [showResubmitForm, setShowResubmitForm] = useState(false);

  // Backend cooldown
  const { cooldown, refetch: refetchCooldown } = useSocialCooldown();

  useEffect(() => {
    if (user && isOpen) {
      fetchExistingRequest();
      refetchCooldown();
    }
  }, [user, isOpen]);

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

  const handleShareWhatsApp = () => {
    const link = getReferralLink();
    const message = encodeURIComponent(`Check out tRIAL-cLIENTS! Generate realistic client briefs with AI. Join using my link and we both get 2 bonus credits: ${link}`);
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  const handleSubmitSocial = async () => {
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
      // If resubmitting after rejection, update the existing record
      if (existingRequest && existingRequest.status === 'rejected') {
        const { error } = await supabase
          .from('social_reward_requests')
          .update({
            platform,
            post_url: postUrl.trim(),
            status: 'pending',
            rejection_reason: null,
            reviewed_at: null,
            reviewed_by: null
          })
          .eq('id', existingRequest.id);

        if (error) throw error;
        
        toast.success('New request submitted! We will review your post shortly.');
        setShowResubmitForm(false);
        setPlatform('');
        setPostUrl('');
        fetchExistingRequest();
        return;
      }

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

  const referralLink = getReferralLink();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-primary">
              <Gift className="h-5 w-5 text-primary-foreground" />
            </div>
            <span>Earn Free Credits</span>
          </DialogTitle>
          <DialogDescription>
            Choose how you'd like to earn credits
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="referral" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="referral" className="gap-2">
              <Users className="h-4 w-4" />
              Refer Friends
            </TabsTrigger>
            <TabsTrigger value="social" className="gap-2">
              <Share2 className="h-4 w-4" />
              Social Post
            </TabsTrigger>
          </TabsList>

          {/* Referral Tab */}
          <TabsContent value="referral" className="space-y-4 mt-4">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-lg bg-muted/50 border border-border/30 text-center">
                <Users className="h-5 w-5 mx-auto mb-2 text-primary" />
                {loading ? (
                  <Skeleton className="h-6 w-8 mx-auto" />
                ) : (
                  <p className="text-2xl font-bold text-foreground">{referralData?.totalReferrals || 0}</p>
                )}
                <p className="text-xs text-muted-foreground">Friends Referred</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 border border-border/30 text-center">
                <Coins className="h-5 w-5 mx-auto mb-2 text-accent" />
                {loading ? (
                  <Skeleton className="h-6 w-8 mx-auto" />
                ) : (
                  <p className="text-2xl font-bold text-foreground">{referralData?.creditsEarned || 0}</p>
                )}
                <p className="text-xs text-muted-foreground">Credits Earned</p>
              </div>
            </div>

            {/* Referral Link */}
            <div className="space-y-2">
              <Label htmlFor="referral-link">Your Referral Link</Label>
              <div className="flex gap-2">
                {loading ? (
                  <Skeleton className="h-10 flex-1" />
                ) : (
                  <Input
                    id="referral-link"
                    value={referralLink}
                    readOnly
                    className="flex-1 text-sm"
                  />
                )}
                <Button 
                  onClick={handleCopy} 
                  size="icon"
                  variant={copied ? "default" : "outline"}
                  disabled={loading}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Share Buttons */}
            <div className="flex gap-2">
              <Button 
                onClick={handleCopy} 
                variant="outline" 
                className="flex-1"
                disabled={loading}
              >
                {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                {copied ? 'Copied!' : 'Copy Link'}
              </Button>
              <Button 
                onClick={handleShareWhatsApp} 
                variant="outline" 
                className="flex-1"
                disabled={loading}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                WhatsApp
              </Button>
            </div>

            {/* How it works */}
            <div className="p-4 rounded-lg bg-accent/10 border border-accent/30">
              <div className="flex items-center gap-2 mb-3">
                <Gift className="h-4 w-4 text-accent" />
                <span className="text-sm font-medium text-accent">How it works</span>
              </div>
              <ul className="text-xs text-muted-foreground space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-accent font-bold">1.</span>
                  Share your unique referral link with friends
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent font-bold">2.</span>
                  When they sign up using your link, you both get <strong className="text-foreground">+2 credits</strong>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent font-bold">3.</span>
                  Earn up to 1 referral reward per day
                </li>
              </ul>
            </div>
          </TabsContent>

          {/* Social Post Tab */}
          <TabsContent value="social" className="space-y-4 mt-4">
            {socialLoading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="h-10 bg-muted rounded"></div>
              </div>
            ) : existingRequest ? (
              <div className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Your Submission</span>
                    {getStatusBadge(existingRequest.status)}
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
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
                  
                  {existingRequest.status === 'approved' && existingRequest.credits_awarded && (
                    <>
                      {/* Backend-driven cooldown */}
                      {cooldown && cooldown.ms_remaining !== null && (
                        <SocialRewardCooldown cooldown={cooldown} />
                      )}
                      <div className="flex items-center gap-2 text-green-600 bg-green-500/10 p-2 rounded">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm font-medium">You earned {existingRequest.credits_awarded} credits!</span>
                      </div>
                    </>
                  )}
                  
                  {existingRequest.status === 'rejected' && (
                    <>
                      {existingRequest.rejection_reason && (
                        <div className="flex items-start gap-2 text-destructive bg-destructive/10 p-2 rounded">
                          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{existingRequest.rejection_reason}</span>
                        </div>
                      )}
                      {!showResubmitForm && (
                        <Button 
                          onClick={() => setShowResubmitForm(true)} 
                          variant="outline" 
                          className="w-full mt-2"
                        >
                          Submit New Request
                        </Button>
                      )}
                    </>
                  )}
                </div>

                {/* Resubmit Form for Rejected Requests */}
                {showResubmitForm && (
                  <div className="space-y-3 pt-3 border-t border-border">
                    <p className="text-sm font-medium">Submit a New Post</p>
                    <div className="space-y-2">
                      <Label htmlFor="resubmit-platform">Platform</Label>
                      <Select value={platform} onValueChange={(v) => setPlatform(v as Platform)}>
                        <SelectTrigger id="resubmit-platform">
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
                      <Label htmlFor="resubmit-url">Post URL</Label>
                      <Input
                        id="resubmit-url"
                        type="url"
                        placeholder="https://x.com/yourpost..."
                        value={postUrl}
                        onChange={(e) => setPostUrl(e.target.value)}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        onClick={() => {
                          setShowResubmitForm(false);
                          setPlatform('');
                          setPostUrl('');
                        }} 
                        variant="outline"
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleSubmitSocial} 
                        disabled={submitting || !platform || !postUrl.trim()}
                        className="flex-1"
                      >
                        {submitting ? 'Submitting...' : 'Submit'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* Rules */}
                <div className="p-3 bg-muted/50 rounded-lg space-y-2 text-sm">
                  <p className="font-medium">How it works:</p>
                  <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                    <li>Create a meaningful post about tRIAL-CLIENTS</li>
                    <li>Tag or mention our official handle</li>
                    <li>Paste the post link below and submit</li>
                  </ol>
                  <div className="mt-3 pt-2 border-t border-border space-y-1 text-muted-foreground text-xs">
                    <p>• Low-effort or spam posts do NOT qualify</p>
                    <p>• Credits granted only after manual review</p>
                    <p>• Limited to one submission per user</p>
                  </div>
                </div>

                {/* Form */}
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
                    onClick={handleSubmitSocial} 
                    disabled={submitting || !platform || !postUrl.trim()}
                    className="w-full"
                  >
                    {submitting ? 'Submitting...' : 'Submit for Review'}
                  </Button>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ReferralModal;