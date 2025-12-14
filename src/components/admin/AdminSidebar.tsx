import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  HeadphonesIcon, 
  FolderKanban, 
  Settings,
  Shield,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
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
    label: 'System Settings', 
    path: '/admin/settings', 
    icon: Settings 
  },
];

export const AdminSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside 
      className={cn(
        "h-screen bg-surface border-r border-border flex flex-col transition-all duration-300 sticky top-0",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo Header */}
      <div className="h-16 border-b border-border flex items-center justify-between px-4">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Shield className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-lg">Admin</span>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto">
            <Shield className="h-4 w-4 text-primary-foreground" />
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className={cn("h-8 w-8", collapsed && "mx-auto")}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

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
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
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

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-border">
          <div className="text-xs text-muted-foreground text-center">
            Admin Panel v1.0
          </div>
        </div>
      )}
    </aside>
  );
};
