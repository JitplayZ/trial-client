import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  Settings, 
  Server, 
  Bell,
  Shield,
  Database,
  Save,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";

export const SystemSettings = () => {
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    emailNotifications: true,
    autoBackup: true,
    debugMode: false,
    maxConcurrentGenerations: 10,
    defaultCredits: 5,
    sessionTimeout: 30
  });

  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    // Simulate API call
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                <Label>Maintenance Mode</Label>
                <p className="text-sm text-muted-foreground">Disable all generation services</p>
              </div>
              <Switch 
                checked={settings.maintenanceMode}
                onCheckedChange={(checked) => setSettings({...settings, maintenanceMode: checked})}
              />
            </div>
            <Separator />
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
        <Card>
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
            <Button variant="outline" className="w-full">
              <Database className="h-4 w-4 mr-2" />
              Create Manual Backup
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
