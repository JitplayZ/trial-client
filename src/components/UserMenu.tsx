import { useState, useEffect } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  User,
  Moon,
  Sun,
  Share2,
  CreditCard,
  Crown,
  Settings,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface UserMenuProps {
  onReferClick?: () => void;
}

const UserMenu = ({ onReferClick }: UserMenuProps) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [credits, setCredits] = useState<number>(100); // Mock credits

  useEffect(() => {
    // Get current theme from document
    const isDark = document.documentElement.classList.contains('dark');
    setTheme(isDark ? 'dark' : 'light');
  }, []);

  const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'User';
  const initials = displayName.slice(0, 2).toUpperCase();

  const handleThemeToggle = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    
    toast({
      title: 'Appearance Updated',
      description: `Switched to ${newTheme} mode`,
      duration: 2000,
    });

    // In production: PUT /api/user/settings { appearance: newTheme }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleProfile = () => {
    // Navigate to profile or open profile modal
    toast({
      title: 'Profile',
      description: 'Profile editing coming soon',
      duration: 2000,
    });
  };

  const handleUpgrade = () => {
    toast({
      title: 'Upgrade',
      description: 'Redirecting to pricing...',
      duration: 2000,
    });
    // navigate('/pricing');
  };

  const handleSettings = () => {
    toast({
      title: 'Settings',
      description: 'Settings page coming soon',
      duration: 2000,
    });
    // navigate('/account/settings');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center space-x-2 h-10"
          aria-label="User menu"
          aria-haspopup="true"
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-gradient-primary text-primary-foreground text-sm">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="hidden sm:inline font-medium">{displayName}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56 bg-background/95 backdrop-blur-lg border-border/50"
        role="menu"
      >
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Appearance submenu */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="cursor-pointer">
            {theme === 'dark' ? (
              <Moon className="mr-2 h-4 w-4" />
            ) : (
              <Sun className="mr-2 h-4 w-4" />
            )}
            <span>Appearance</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="bg-background/95 backdrop-blur-lg border-border/50">
            <DropdownMenuItem
              onClick={() => handleThemeToggle('light')}
              className="cursor-pointer"
            >
              <Sun className="mr-2 h-4 w-4" />
              <span>Light</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleThemeToggle('dark')}
              className="cursor-pointer"
            >
              <Moon className="mr-2 h-4 w-4" />
              <span>Dark</span>
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuItem onClick={handleProfile} className="cursor-pointer">
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={onReferClick}
          className="cursor-pointer"
        >
          <Share2 className="mr-2 h-4 w-4" />
          <span>Refer to Earn Credits</span>
        </DropdownMenuItem>

        <DropdownMenuItem className="cursor-default focus:bg-transparent">
          <CreditCard className="mr-2 h-4 w-4" />
          <span className="flex-1">Credits</span>
          <span className="font-semibold text-primary">{credits}</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleUpgrade} className="cursor-pointer text-accent">
          <Crown className="mr-2 h-4 w-4" />
          <span>Upgrade to Pro</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleSettings} className="cursor-pointer">
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={handleSignOut}
          className="cursor-pointer text-destructive focus:text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
