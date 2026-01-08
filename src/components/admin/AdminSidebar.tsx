import { NavLink, useLocation, useNavigate, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  HeadphonesIcon, 
  FolderKanban, 
  Settings,
  Shield,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Gift
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const navItems = [
  { 
    label: 'Dashboard', 
    path: '/admin', 
    icon: LayoutDashboard,
    end: true
  },
  { 
    label: 'User Management', 
    path: '/admin/users', 
    icon: Users 
  },
  { 
    label: 'Billing & Payments', 
    path: '/admin/billing', 
    icon: CreditCard 
  },
  { 
    label: 'Support & Reports', 
    path: '/admin/support', 
    icon: HeadphonesIcon 
  },
  { 
    label: 'Project Monitoring', 
    path: '/admin/projects', 
    icon: FolderKanban 
  },
  { 
    label: 'Social Rewards', 
    path: '/admin/social-rewards', 
    icon: Gift 
  },
  { 
    label: 'System Settings', 
    path: '/admin/settings', 
    icon: Settings 
  },
];

interface AdminSidebarProps {
  onNavClick?: () => void;
}

export const AdminSidebar = ({ onNavClick }: AdminSidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Logged out successfully');
      navigate('/admin/login');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  return (
    <aside 
      className={cn(
        "h-screen bg-surface border-r border-border flex flex-col transition-all duration-300 sticky top-0",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo Header */}
      <div className={cn(
        "h-16 border-b border-border flex items-center px-3 gap-2",
        collapsed ? "justify-center" : "justify-between"
      )}>
        <Link 
          to="/" 
          className={cn(
            "flex items-center gap-2 hover:opacity-80 transition-opacity",
            collapsed && "justify-center"
          )}
        >
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center flex-shrink-0">
            <Shield className="h-4 w-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="font-display font-bold text-lg">Admin</span>
          )}
        </Link>
        {!collapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="h-8 w-8 flex-shrink-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Expand Button when collapsed - positioned below header */}
      {collapsed && (
        <div className="flex justify-center py-2 border-b border-border">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = item.end 
            ? location.pathname === item.path
            : location.pathname.startsWith(item.path);
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onNavClick}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group min-h-[44px]",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-md" 
                  : "text-foreground-secondary hover:bg-muted hover:text-foreground",
                collapsed && "justify-center px-2"
              )}
            >
              <item.icon className={cn(
                "h-5 w-5 flex-shrink-0",
                isActive ? "text-primary-foreground" : "text-foreground-secondary group-hover:text-foreground"
              )} />
              {!collapsed && (
                <span className="font-medium text-sm">{item.label}</span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer with Logout */}
      <div className="p-4 border-t border-border space-y-3">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className={cn(
            "w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10",
            collapsed && "justify-center px-2"
          )}
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && <span>Logout</span>}
        </Button>
        {!collapsed && (
          <div className="text-xs text-muted-foreground text-center">
            Admin Panel v1.0
          </div>
        )}
      </div>
    </aside>
  );
};
