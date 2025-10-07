import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Zap, Share2, Copy, MessageCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useGamification } from '@/hooks/useGamification';
import { ProjectDetailModal } from '@/components/modals/ProjectDetailModal';
import Lottie from 'lottie-react';
import globalNetworkAnimation from '@/assets/global-network.json';

const QuickActions = () => {
  const [referralModalOpen, setReferralModalOpen] = useState(false);
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const { toast } = useToast();
  const { awardXP } = useGamification();

  // Mock referral code - in real app this would come from user profile
  const referralCode = 'AIProj2024';
  const referralLink = `${window.location.origin}/signup?ref=${referralCode}`;

  const handleGenerateProject = () => {
    setProjectModalOpen(true);
  };

  const handleCopyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast({
      title: "Link Copied!",
      description: "Referral link copied to clipboard.",
    });
  };

  const handleShareWhatsApp = () => {
    const message = encodeURIComponent(`Check out AIProjects! Build amazing projects with AI. Join using my link: ${referralLink}`);
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  const actions = [
    {
      title: 'Generate Project',
      description: 'Create a new AI-powered project',
      icon: 'lottie' as const,
      onClick: handleGenerateProject,
      variant: 'default' as const
    },
    {
      title: 'Refer People',
      description: 'Refer karo — pao extra free projects',
      icon: Share2,
      onClick: () => setReferralModalOpen(true),
      variant: 'outline' as const
    }
  ];

  return (
    <>
      <Card className="bg-card/50 backdrop-blur-sm border-border/30">
        <CardHeader>
          <CardTitle className="text-foreground">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {actions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Button
                  key={index}
                  variant={action.variant}
                  size="lg"
                  onClick={action.onClick}
                  className={`h-auto p-4 flex flex-col items-center justify-center space-y-2 min-h-[100px] ${
                    action.variant === 'default' ? 'bg-gradient-primary hover-glow' : 'hover-lift'
                  }`}
                >
                  {Icon === 'lottie' ? (
                    <div className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0">
                      <Lottie animationData={globalNetworkAnimation} loop={true} />
                    </div>
                  ) : (
                    <Icon className="h-8 w-8 flex-shrink-0" />
                  )}
                  <div className="text-center w-full">
                    <div className="font-semibold text-base line-clamp-1">{action.title}</div>
                    <div className="text-sm opacity-80 line-clamp-2 mt-1">{action.description}</div>
                  </div>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Referral Modal */}
      <Dialog open={referralModalOpen} onOpenChange={setReferralModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Share2 className="h-5 w-5" />
              <span>Refer People & Earn</span>
            </DialogTitle>
            <DialogDescription>
              Share this link and get extra free projects when your friends join!
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="referral-link">Your Referral Link</Label>
            <div className="flex space-x-2">
              <Input
                id="referral-link"
                value={referralLink}
                readOnly
                className="flex-1"
              />
              <Button onClick={handleCopyReferralLink} size="sm">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button 
              onClick={handleCopyReferralLink} 
              variant="outline" 
              className="flex-1"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy Link
            </Button>
            <Button 
              onClick={handleShareWhatsApp} 
              variant="outline" 
              className="flex-1"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              WhatsApp
            </Button>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <p>🎉 You referred <strong>0</strong> people</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    {/* Project Detail Modal */}
    <ProjectDetailModal 
      isOpen={projectModalOpen} 
      onClose={() => setProjectModalOpen(false)} 
    />
  </>
  );
};

export default QuickActions;