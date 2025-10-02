import { Button } from "@/components/ui/button";
import { ArrowRight, Zap } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import UserMenu from "@/components/UserMenu";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Share2, Copy, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Navbar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const { toast } = useToast();
  const isDashboard = location.pathname === '/dashboard';
  const [referralModalOpen, setReferralModalOpen] = useState(false);

  // Mock referral code
  const referralCode = 'AIProj2024';
  const referralLink = `${window.location.origin}/signup?ref=${referralCode}`;

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

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 hover-lift">
            <div className="bg-gradient-primary p-2 rounded-lg">
              <Zap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl text-gradient">
              AIProjects
            </span>
          </Link>

          {/* Navigation Links - Hidden on dashboard */}
          {!isDashboard && (
            <div className="hidden md:flex items-center space-x-8">
              <Link 
                to="#features" 
                className="text-foreground-secondary hover:text-foreground transition-colors"
              >
                Features
              </Link>
              <Link 
                to="#pricing" 
                className="text-foreground-secondary hover:text-foreground transition-colors"
              >
                Pricing
              </Link>
              <Link 
                to="#testimonials" 
                className="text-foreground-secondary hover:text-foreground transition-colors"
              >
                Testimonials
              </Link>
            </div>
          )}

          {/* CTA Buttons */}
          <div className="flex items-center space-x-3">
            {user && isDashboard ? (
              // Show user menu when authenticated and on dashboard
              <UserMenu onReferClick={() => setReferralModalOpen(true)} />
            ) : (
              // Show auth buttons when not authenticated or not on dashboard
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                >
                  <Link to="/auth">Sign In</Link>
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  className="bg-gradient-primary hover-glow"
                  asChild
                >
                  <Link to="/login/user" className="flex items-center space-x-2">
                    <span>Get Started</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                >
                  <Link to="/login/admin">Admin</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

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
    </nav>
  );
};

export default Navbar;
