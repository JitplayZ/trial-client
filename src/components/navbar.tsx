import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, LogOut } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Navbar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isDashboard = location.pathname === '/dashboard';

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/20">
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

          {/* Navigation Links */}
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

          {/* CTA Buttons */}
          <div className="flex items-center space-x-3">
            {user && isDashboard ? (
              // Show logout when user is authenticated and on dashboard
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center space-x-2"
                aria-label="Logout and return to landing"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
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
    </nav>
  );
};

export default Navbar;