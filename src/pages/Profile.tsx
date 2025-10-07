import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Save, ArrowLeft, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [displayName, setDisplayName] = useState(
    user?.user_metadata?.display_name || 
    user?.user_metadata?.full_name || 
    user?.email?.split('@')[0] || ''
  );
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [gamificationEnabled, setGamificationEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchProfile();
    }
  }, [user?.id]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error) throw error;
      if (data?.avatar_url) {
        setAvatarUrl(data.avatar_url);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const initialDisplayName = user?.user_metadata?.display_name || 
    user?.user_metadata?.full_name || 
    user?.email?.split('@')[0] || '';

  const handleFieldChange = () => {
    setHasUnsavedChanges(true);
  };

  const handleClose = () => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm('You have unsaved changes. Are you sure you want to leave?');
      if (!confirmed) return;
    }
    navigate('/dashboard');
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file || !user?.id) return;

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid File',
          description: 'Please upload an image file.',
          variant: 'destructive',
        });
        return;
      }

      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: 'File Too Large',
          description: 'Please upload an image smaller than 2MB.',
          variant: 'destructive',
        });
        return;
      }

      setUploading(true);

      // Upload to storage
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      window.dispatchEvent(new Event('profile-updated'));
      toast({
        title: 'Avatar Updated',
        description: 'Your profile picture has been changed.',
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: 'Upload Failed',
        description: 'Failed to upload avatar. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (!user?.id) return;

      const { error } = await supabase
        .from('profiles')
        .update({ display_name: displayName })
        .eq('user_id', user.id);

      if (error) throw error;

      window.dispatchEvent(new Event('profile-updated'));
      toast({
        title: 'Profile Updated',
        description: 'Your settings have been saved.',
      });
      setHasUnsavedChanges(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update profile.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background py-6 sm:py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Close/Back buttons */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="gap-2 text-xs sm:text-sm"
          >
            <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Back to Dashboard</span>
            <span className="sm:hidden">Back</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            title="Close"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <h1 className="text-3xl font-bold text-foreground mb-8">Account Settings</h1>

        <div className="space-y-6">
          {/* Profile Info */}
          <Card className="glass-card bg-card/50 backdrop-blur-xl border-border/50">
            <CardHeader className="bg-surface/20 border-b border-border/50">
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={avatarUrl || undefined} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                    {displayName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleAvatarClick}
                    disabled={uploading}
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    {uploading ? 'Uploading...' : 'Change Avatar'}
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1">
                    Max 2MB, JPG/PNG
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => {
                      setDisplayName(e.target.value);
                      handleFieldChange();
                    }}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={user?.email || ''}
                    disabled
                    className="mt-2 opacity-60"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Email cannot be changed
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card className="glass-card bg-card/50 backdrop-blur-xl border-border/50">
            <CardHeader className="bg-surface/20 border-b border-border/50">
              <CardTitle>Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Gamification</Label>
                  <p className="text-sm text-muted-foreground">
                    Show XP, levels, and badges
                  </p>
                </div>
                <Switch
                  checked={gamificationEnabled}
                  onCheckedChange={(checked) => {
                    setGamificationEnabled(checked);
                    handleFieldChange();
                  }}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive updates via email
                  </p>
                </div>
                <Switch
                  checked={emailNotifications}
                  onCheckedChange={(checked) => {
                    setEmailNotifications(checked);
                    handleFieldChange();
                  }}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSave} className="bg-gradient-primary">
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
