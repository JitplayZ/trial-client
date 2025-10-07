import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  User,
  Moon,
  Sun,
  Share2,
  CreditCard,
  Crown,
  Settings,
  LogOut,
  History,
  Bell,
  HelpCircle,
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
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [credits, setCredits] = useState<number>(100);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string>('');

  useEffect(() => {
    // Initialize dark mode as default
    const isDark = document.documentElement.classList.contains('dark');
    if (!isDark && !localStorage.getItem('theme')) {
      document.documentElement.classList.add('dark');
      setTheme('dark');
    } else {
      setTheme(isDark ? 'dark' : 'light');
    }

    // Fetch profile
    if (user?.id) {
      fetchProfile();
    }
  }, [user?.id]);

  useEffect(() => {
    const handleProfileUpdate = () => {
      if (user?.id) {
        fetchProfile();
      }
    };

    window.addEventListener('profile-updated', handleProfileUpdate);
    return () => window.removeEventListener('profile-updated', handleProfileUpdate);
  }, [user?.id]);

  const fetchProfile = async () => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('avatar_url, display_name')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (data) {
        setAvatarUrl(data.avatar_url);
        setDisplayName(data.display_name || user?.email?.split('@')[0] || 'User');
      } else {
        setDisplayName(user?.email?.split('@')[0] || 'User');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setDisplayName(user?.email?.split('@')[0] || 'User');
    }
  };

  const initials = displayName.slice(0, 2).toUpperCase();

  const handleThemeToggle = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    localStorage.setItem('theme', newTheme);
    
    toast({
      title: 'Appearance Updated',
      description: `Switched to ${newTheme} mode`,
      duration: 2000,
    });

    // In production: PUT /api/user/settings { appearance: newTheme }
  };

  const handleHistory = () => {
    navigate('/history');
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleProfile = () => {
    navigate('/account/profile');
  };

  const handleUpgrade = () => {
    navigate('/pricing');
  };

  const handleSettings = () => {
    navigate('/account/profile');
  };

  const handleNotifications = () => {
    navigate('/notifications');
  };

  const handleHelp = () => {
    navigate('/help');
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
            <AvatarImage src={avatarUrl || undefined} alt={displayName} />
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

        <DropdownMenuItem onClick={handleHistory} className="cursor-pointer">
          <History className="mr-2 h-4 w-4" />
          <span>History</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleNotifications} className="cursor-pointer">
          <Bell className="mr-2 h-4 w-4" />
          <span>Notifications</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleHelp} className="cursor-pointer">
          <HelpCircle className="mr-2 h-4 w-4" />
          <span>Help</span>
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
