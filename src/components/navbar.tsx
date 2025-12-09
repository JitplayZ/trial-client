import { Button } from "@/components/ui/button";
import { ArrowRight, Bell } from "lucide-react";
import logo from "@/assets/logo.png";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import UserMenu from "@/components/UserMenu";
import { useState } from "react";
import { NotificationsPanel } from "@/components/NotificationsPanel";
import { Badge } from "@/components/ui/badge";
import { useNotifications } from "@/hooks/useNotifications";
import { ReferralModal } from "@/components/modals/ReferralModal";

const Navbar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isDashboard = location.pathname === '/dashboard';
  const [referralModalOpen, setReferralModalOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { unreadCount } = useNotifications();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2 hover-lift cursor-pointer" onClick={() => {
            if (location.pathname === '/') {
              document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' });
            } else {
              navigate('/');
              setTimeout(() => {
                document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }
          }}>
            <img 
              src={logo} 
              alt="tRIAL - cLIENTS logo" 
              className="h-10 w-10" 
              width="40" 
              height="40"
              loading="eager"
              fetchPriority="high"
            />
            <span className="font-display font-bold text-xl text-gradient">
              tRIAL - cLIENTS
            </span>
          </div>

          {/* Navigation Links - Hidden on dashboard */}
          {!isDashboard && (
            <div className="hidden md:flex items-center space-x-8">
              <a 
                href="#features" 
                className="text-foreground-secondary hover:text-foreground transition-colors cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Features
              </a>
              <a 
                href="#pricing" 
                className="text-foreground-secondary hover:text-foreground transition-colors cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Pricing
              </a>
              <a 
                href="#testimonials" 
                className="text-foreground-secondary hover:text-foreground transition-colors cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('testimonials')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Testimonials
              </a>
            </div>
          )}

          {/* CTA Buttons */}
          <div className="flex items-center space-x-3">
            {user && isDashboard ? (
              // Show notifications bell and user menu when authenticated and on dashboard
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative"
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                    >
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
                <UserMenu onReferClick={() => setReferralModalOpen(true)} />
              </div>
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
      <ReferralModal 
        isOpen={referralModalOpen} 
        onClose={() => setReferralModalOpen(false)} 
      />

      {/* Notifications Panel */}
      <NotificationsPanel 
        isOpen={notificationsOpen} 
        onClose={() => setNotificationsOpen(false)} 
      />
    </nav>
  );
};

export default Navbar;
