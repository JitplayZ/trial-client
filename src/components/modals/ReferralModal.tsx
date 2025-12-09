import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Share2, Copy, MessageCircle, Check, Gift, Users, Coins } from 'lucide-react';
import { useState } from 'react';
import { useReferral } from '@/hooks/useReferral';
import { Skeleton } from '@/components/ui/skeleton';

interface ReferralModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReferralModal = ({ isOpen, onClose }: ReferralModalProps) => {
  const { referralData, loading, getReferralLink, copyReferralLink } = useReferral();
  const [copied, setCopied] = useState(false);

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

  const referralLink = getReferralLink();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-primary">
              <Share2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <span>Refer & Earn Credits</span>
          </DialogTitle>
          <DialogDescription>
            Share your unique link and earn credits when friends join!
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
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
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReferralModal;
