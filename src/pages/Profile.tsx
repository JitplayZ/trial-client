import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Save, ArrowLeft, X, Trash2, CreditCard, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';
import { useQuotaManagement } from '@/hooks/useQuotaManagement';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const profileSchema = z.object({
  display_name: z.string()
    .trim()
    .min(1, 'Display name is required')
    .max(50, 'Display name must be less than 50 characters')
    .regex(/^[a-zA-Z0-9 '\-]*$/, 'Display name can only contain letters, numbers, spaces, hyphens, and apostrophes')
});

export default function Profile() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { quotaData, loading: quotaLoading, refresh: refreshQuota } = useQuotaManagement();
  const [displayName, setDisplayName] = useState(
    user?.user_metadata?.display_name || 
    user?.user_metadata?.full_name || 
    user?.email?.split('@')[0] || ''
  );
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [hasCustomAvatar, setHasCustomAvatar] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [removingAvatar, setRemovingAvatar] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [gamificationEnabled, setGamificationEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchProfile();
    }
  }, [user?.id]);

  // Real-time subscription for credits
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('profile-credits-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subscriptions',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          refreshQuota();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, refreshQuota]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error) throw error;
      if (data?.avatar_url) {
        // If avatar_url is a path (not starting with http), it's a custom upload
        if (data.avatar_url.startsWith('http')) {
          setAvatarUrl(data.avatar_url);
          setHasCustomAvatar(false); // Google/OAuth avatar
        } else {
          // Generate signed URL for private storage (1 hour expiry)
          const { data: signedUrlData } = await supabase.storage
            .from('avatars')
            .createSignedUrl(data.avatar_url, 3600);
          
          if (signedUrlData?.signedUrl) {
            setAvatarUrl(signedUrlData.signedUrl);
          }
          setHasCustomAvatar(true); // Custom uploaded avatar
        }
      } else {
        setAvatarUrl(null);
        setHasCustomAvatar(false);
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error fetching profile:', error);
      }
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
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: 'Invalid File Type',
          description: 'Please upload a JPG, PNG, or WebP image.',
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

      // Generate safe filename - use timestamp to ensure uniqueness
      const timestamp = Date.now();
      const fileExt = file.type.split('/')[1]; // Extract extension from MIME type
      const sanitizedFilename = `avatar-${timestamp}.${fileExt}`;
      const filePath = `${user.id}/${sanitizedFilename}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Store the file path in the profile (not public URL)
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: filePath })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // Get signed URL for display (1 hour expiry)
      const { data: signedUrlData } = await supabase.storage
        .from('avatars')
        .createSignedUrl(filePath, 3600);

      if (signedUrlData?.signedUrl) {
        setAvatarUrl(signedUrlData.signedUrl);
      }
      setHasCustomAvatar(true);
      window.dispatchEvent(new Event('profile-updated'));
      toast({
        title: 'Avatar Updated',
        description: 'Your profile picture has been changed.',
      });
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error uploading avatar:', error);
      }
      toast({
        title: 'Upload Failed',
        description: 'Failed to upload avatar. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!user?.id) return;
    
    setRemovingAvatar(true);
    try {
      // Get current avatar_url to check if it's a storage path
      const { data: profile } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('user_id', user.id)
        .maybeSingle();

      // If it's a storage path, delete the file
      if (profile?.avatar_url && !profile.avatar_url.startsWith('http')) {
        await supabase.storage
          .from('avatars')
          .remove([profile.avatar_url]);
      }

      // Get original Google avatar from user metadata
      const googleAvatar = user.user_metadata?.avatar_url || user.user_metadata?.picture || null;

      // Update profile with Google avatar (or null if no Google avatar)
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: googleAvatar })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      setAvatarUrl(googleAvatar);
      setHasCustomAvatar(false);
      window.dispatchEvent(new Event('profile-updated'));
      
      toast({
        title: 'Avatar Removed',
        description: googleAvatar 
          ? 'Reverted to your Google profile picture.' 
          : 'Custom avatar has been removed.',
      });
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error removing avatar:', error);
      }
      toast({
        title: 'Error',
        description: 'Failed to remove avatar. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setRemovingAvatar(false);
    }
  };

  const handleSave = async () => {
    try {
      if (!user?.id) return;

      // Validate display name
      const validation = profileSchema.safeParse({ display_name: displayName });
      
      if (!validation.success) {
        const error = validation.error.issues[0];
        toast({
          title: 'Validation Error',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({ display_name: validation.data.display_name })
        .eq('user_id', user.id);

      if (error) throw error;

      window.dispatchEvent(new Event('profile-updated'));
      toast({
        title: 'Profile Updated',
        description: 'Your settings have been saved.',
      });
      setHasUnsavedChanges(false);
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to update profile.';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    
    setDeleting(true);
    try {
      // Call the delete_user_account function
      const { error } = await supabase.rpc('delete_user_account');
      
      if (error) throw error;
      
      toast({
        title: 'Account Deleted',
        description: 'Your account and all data have been deleted.',
      });
      
      // Sign out and redirect
      await signOut();
      navigate('/');
    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.error('Error deleting account:', error);
      }
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete account',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
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
                <div className="space-y-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleAvatarClick}
                      disabled={uploading || removingAvatar}
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      {uploading ? 'Uploading...' : 'Change Avatar'}
                    </Button>
                    {hasCustomAvatar && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={handleRemoveAvatar}
                        disabled={uploading || removingAvatar}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {removingAvatar ? 'Removing...' : 'Remove'}
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
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

          {/* Credits & Quota */}
          <Card className="glass-card bg-card/50 backdrop-blur-xl border-border/50">
            <CardHeader className="bg-surface/20 border-b border-border/50">
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Credits & Quota
              </CardTitle>
              <CardDescription>
                Your current plan usage and remaining credits
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {quotaLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : quotaData ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
                    <span className="font-medium">Current Plan</span>
                    <span className="font-bold text-primary uppercase">{quotaData.plan}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-background/40 rounded-lg">
                      <p className="text-sm text-muted-foreground">Beginner Projects</p>
                      <p className="text-xl font-bold">{quotaData.quotas.beginnerLeft}</p>
                    </div>
                    <div className="p-3 bg-background/40 rounded-lg">
                      <p className="text-sm text-muted-foreground">Intermediate Projects</p>
                      <p className="text-xl font-bold">{quotaData.quotas.intermediateLeft}</p>
                    </div>
                    <div className="p-3 bg-background/40 rounded-lg">
                      <p className="text-sm text-muted-foreground">Veteran Projects</p>
                      <p className="text-xl font-bold">
                        {quotaData.plan === 'free' ? (
                          <span className="text-muted-foreground text-sm">Locked</span>
                        ) : (
                          quotaData.quotas.veteranLeft
                        )}
                      </p>
                    </div>
                    <div className="p-3 bg-background/40 rounded-lg">
                      <p className="text-sm text-muted-foreground">Purchased Credits</p>
                      <p className="text-xl font-bold text-accent">{quotaData.credits}</p>
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground text-center pt-2">
                    Quotas reset on {new Date(quotaData.quotas.resetAt).toLocaleDateString()}
                  </div>

                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => navigate('/pricing')}
                  >
                    Upgrade Plan
                  </Button>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  Unable to load quota information
                </p>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSave} className="bg-gradient-primary">
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>

          {/* Delete Account Card */}
          <Card className="glass-card border-destructive/20 bg-card/50 backdrop-blur-xl">
            <CardHeader className="bg-destructive/5 border-b border-destructive/20">
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>
                Permanently delete your account and all associated data
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="destructive" 
                    className="w-full"
                    disabled={deleting}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {deleting ? 'Deleting...' : 'Delete Account'}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your account
                      and remove all your data including:
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>Your profile information</li>
                        <li>All generated projects and briefs</li>
                        <li>Your XP and badges</li>
                        <li>All other associated data</li>
                      </ul>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Yes, delete my account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
