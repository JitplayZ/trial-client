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

          {/* Navigation Links - Hidden on mobile and dashboard */}
          {!isDashboard && (
            <div className="hidden lg:flex items-center space-x-8">
              <a 
                href="#features" 
                className="text-foreground-secondary hover:text-foreground transition-colors cursor-pointer text-sm"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Features
              </a>
              <a 
                href="#pricing" 
                className="text-foreground-secondary hover:text-foreground transition-colors cursor-pointer text-sm"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Pricing
              </a>
              <a 
                href="#testimonials" 
                className="text-foreground-secondary hover:text-foreground transition-colors cursor-pointer text-sm"
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
          <div className="flex items-center space-x-2 sm:space-x-3">
            {user && isDashboard ? (
              // Show notifications bell and user menu when authenticated and on dashboard
              <div className="flex items-center gap-1 sm:gap-2">
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative h-9 w-9"
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                  >
                    <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
                    {unreadCount > 0 && (
                      <Badge
                        variant="destructive"
                        className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center p-0 text-[10px] sm:text-xs"
                      >
                        {unreadCount}
                      </Badge>
                    )}
                  </Button>
                </div>
                <UserMenu onReferClick={() => setReferralModalOpen(true)} />
              </div>
            ) : (
              // Show auth buttons when not authenticated or not on dashboard
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden sm:inline-flex text-xs sm:text-sm"
                  asChild
                >
                  <Link to="/auth">Sign In</Link>
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  className="bg-gradient-primary hover-glow text-xs sm:text-sm px-3 sm:px-4"
                  asChild
                >
                  <Link to="/login/user" className="flex items-center space-x-1 sm:space-x-2">
                    <span className="hidden sm:inline">Get Started</span>
                    <span className="sm:hidden">Start</span>
                    <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs sm:text-sm px-2 sm:px-3"
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
