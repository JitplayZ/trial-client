import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Settings, 
  Server, 
  Bell,
  Shield,
  Database,
  Save,
  RefreshCw,
  AlertTriangle
} from "lucide-react";
import { toast } from "sonner";
import { useMaintenanceMode } from '@/hooks/useMaintenanceMode';

export const SystemSettings = () => {
  const { isMaintenanceMode, maintenanceMessage, loading: maintenanceLoading, setMaintenanceMode } = useMaintenanceMode();
  
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    maintenanceMessage: '',
    emailNotifications: true,
    autoBackup: true,
    debugMode: false,
    maxConcurrentGenerations: 10,
    defaultCredits: 5,
    sessionTimeout: 30
  });

  const [saving, setSaving] = useState(false);
  const [togglingMaintenance, setTogglingMaintenance] = useState(false);

  // Sync maintenance mode state from backend
  useEffect(() => {
    if (!maintenanceLoading) {
      setSettings(prev => ({
        ...prev,
        maintenanceMode: isMaintenanceMode,
        maintenanceMessage: maintenanceMessage
      }));
    }
  }, [isMaintenanceMode, maintenanceMessage, maintenanceLoading]);

  const handleMaintenanceToggle = async (enabled: boolean) => {
    setTogglingMaintenance(true);
    const result = await setMaintenanceMode(enabled, settings.maintenanceMessage || undefined);
    
    if (result.success) {
      setSettings(prev => ({ ...prev, maintenanceMode: enabled }));
      toast.success(enabled ? 'Maintenance mode enabled' : 'Maintenance mode disabled');
    } else {
      toast.error(result.error || 'Failed to update maintenance mode');
    }
    setTogglingMaintenance(false);
  };

  const handleSaveMaintenanceMessage = async () => {
    setSaving(true);
    const result = await setMaintenanceMode(settings.maintenanceMode, settings.maintenanceMessage);
    
    if (result.success) {
      toast.success('Maintenance message saved');
    } else {
      toast.error(result.error || 'Failed to save message');
    }
    setSaving(false);
  };

  const handleSave = async () => {
    setSaving(true);
    // Simulate API call for non-maintenance settings
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success('Settings saved successfully');
    setSaving(false);
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold flex items-center gap-3">
            <Settings className="h-7 w-7 text-primary" />
            System Settings
          </h1>
          <p className="text-foreground-secondary mt-1">Configure system-wide settings</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save Changes
        </Button>
      </div>

      {/* Maintenance Mode Alert */}
      {settings.maintenanceMode && (
        <div className="bg-warning/10 border border-warning/30 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-warning">Maintenance Mode Active</h3>
            <p className="text-sm text-foreground-secondary mt-1">
              All non-admin users are currently blocked from accessing the application. 
              Only administrators can sign in and access the system.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Maintenance Mode Card */}
        <Card className={settings.maintenanceMode ? 'border-warning/50' : ''}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-lg">
              <span className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                Maintenance Mode
              </span>
              {settings.maintenanceMode && (
                <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">
                  Active
                </Badge>
              )}
            </CardTitle>
            <CardDescription>Control site-wide access for non-admin users</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Maintenance Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Block all users except admins from accessing the site
                </p>
              </div>
              <Switch 
                checked={settings.maintenanceMode}
                onCheckedChange={handleMaintenanceToggle}
                disabled={togglingMaintenance || maintenanceLoading}
              />
            </div>
            <Separator />
            <div className="space-y-2">
              <Label>Maintenance Message</Label>
              <Textarea 
                value={settings.maintenanceMessage}
                onChange={(e) => setSettings({...settings, maintenanceMessage: e.target.value})}
                placeholder="Enter the message to display to users..."
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                This message will be shown on the maintenance page
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSaveMaintenanceMessage}
                disabled={saving}
              >
                Save Message
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Server className="h-5 w-5" />
              General Settings
            </CardTitle>
            <CardDescription>Core system configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Debug Mode</Label>
                <p className="text-sm text-muted-foreground">Enable verbose logging</p>
              </div>
              <Switch 
                checked={settings.debugMode}
                onCheckedChange={(checked) => setSettings({...settings, debugMode: checked})}
              />
            </div>
            <Separator />
            <div className="space-y-2">
              <Label>Max Concurrent Generations</Label>
              <Input 
                type="number" 
                value={settings.maxConcurrentGenerations}
                onChange={(e) => setSettings({...settings, maxConcurrentGenerations: parseInt(e.target.value) || 0})}
              />
              <p className="text-xs text-muted-foreground">Maximum parallel project generations</p>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>Alert and notification preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Send email alerts for critical events</p>
              </div>
              <Switch 
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => setSettings({...settings, emailNotifications: checked})}
              />
            </div>
            <Separator />
            <div className="space-y-2">
              <Label>Session Timeout (minutes)</Label>
              <Input 
                type="number" 
                value={settings.sessionTimeout}
                onChange={(e) => setSettings({...settings, sessionTimeout: parseInt(e.target.value) || 0})}
              />
              <p className="text-xs text-muted-foreground">Auto-logout after inactivity</p>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="h-5 w-5" />
              Security
            </CardTitle>
            <CardDescription>Security and access controls</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Default New User Credits</Label>
              <Input 
                type="number" 
                value={settings.defaultCredits}
                onChange={(e) => setSettings({...settings, defaultCredits: parseInt(e.target.value) || 0})}
              />
              <p className="text-xs text-muted-foreground">Credits given to new users on signup</p>
            </div>
          </CardContent>
        </Card>

        {/* Database Settings */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Database className="h-5 w-5" />
              Database
            </CardTitle>
            <CardDescription>Database and backup settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Automatic Backups</Label>
                <p className="text-sm text-muted-foreground">Daily automated database backups</p>
              </div>
              <Switch 
                checked={settings.autoBackup}
                onCheckedChange={(checked) => setSettings({...settings, autoBackup: checked})}
              />
            </div>
            <Separator />
            <Button variant="outline">
              <Database className="h-4 w-4 mr-2" />
              Create Manual Backup
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
