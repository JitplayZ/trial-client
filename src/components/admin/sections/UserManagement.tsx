import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { 
  Users, 
  Search, 
  UserCheck, 
  UserX, 
  AlertTriangle,
  RefreshCw,
  Edit,
  Coins,
  Power,
  PowerOff
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UserData {
  id: string;
  email: string;
  display_name: string;
  created_at: string;
  plan: string;
  credits: number;
  status: string;
  generation_enabled: boolean;
  beginner_left: number;
  intermediate_left: number;
  veteran_left: number;
}

export const UserManagement = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [creditDialogOpen, setCreditDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [creditChange, setCreditChange] = useState(0);
  const [creditReason, setCreditReason] = useState('');
  const [newStatus, setNewStatus] = useState('active');
  const [generationEnabled, setGenerationEnabled] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, email, display_name, created_at, status, generation_enabled')
        .order('created_at', { ascending: false })
        .limit(100);

      if (profilesError) throw profilesError;

      const userIds = profiles?.map(p => p.user_id) || [];
      const { data: subscriptions, error: subError } = await supabase
        .from('subscriptions')
        .select('user_id, plan, credits, beginner_left, intermediate_left, veteran_left')
        .in('user_id', userIds);

      if (subError) throw subError;

      const mergedUsers: UserData[] = (profiles || []).map(profile => {
        const sub = subscriptions?.find(s => s.user_id === profile.user_id);
        return {
          id: profile.user_id,
          email: profile.email || 'N/A',
          display_name: profile.display_name || 'Unknown',
          created_at: profile.created_at,
          plan: sub?.plan || 'free',
          credits: sub?.credits || 0,
          status: profile.status || 'active',
          generation_enabled: profile.generation_enabled !== false,
          beginner_left: sub?.beginner_left || 0,
          intermediate_left: sub?.intermediate_left || 0,
          veteran_left: sub?.veteran_left || 0
        };
      });

      setUsers(mergedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUpdateCredits = async () => {
    if (!selectedUser || creditChange === 0) return;
    
    setActionLoading(true);
    try {
      const { data, error } = await supabase.rpc('admin_update_user_credits', {
        _target_user_id: selectedUser.id,
        _credit_change: creditChange,
        _reason: creditReason || 'Admin adjustment'
      });

      if (error) throw error;
      
      const result = data as { ok: boolean; message: string };
      if (!result.ok) throw new Error(result.message);

      toast.success(`Credits ${creditChange > 0 ? 'added' : 'deducted'} successfully`);
      setCreditDialogOpen(false);
      setCreditChange(0);
      setCreditReason('');
      fetchUsers();
    } catch (error: any) {
      console.error('Error updating credits:', error);
      toast.error(error.message || 'Failed to update credits');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedUser) return;
    
    setActionLoading(true);
    try {
      const { data, error } = await supabase.rpc('admin_update_user_status', {
        _target_user_id: selectedUser.id,
        _new_status: newStatus,
        _generation_enabled: generationEnabled
      });

      if (error) throw error;
      
      const result = data as { ok: boolean; message: string };
      if (!result.ok) throw new Error(result.message);

      toast.success('User status updated successfully');
      setStatusDialogOpen(false);
      fetchUsers();
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast.error(error.message || 'Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  const openCreditDialog = (user: UserData) => {
    setSelectedUser(user);
    setCreditChange(0);
    setCreditReason('');
    setCreditDialogOpen(true);
  };

  const openStatusDialog = (user: UserData) => {
    setSelectedUser(user);
    setNewStatus(user.status);
    setGenerationEnabled(user.generation_enabled);
    setStatusDialogOpen(true);
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.display_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string, genEnabled: boolean) => {
    if (!genEnabled) {
      return <Badge variant="destructive">Generation Disabled</Badge>;
    }
    switch (status) {
      case 'active':
        return <Badge className="bg-accent/10 text-accent border-accent/20">Active</Badge>;
      case 'suspended':
        return <Badge variant="destructive">Suspended</Badge>;
      case 'flagged':
        return <Badge className="bg-warning/10 text-warning border-warning/20">Flagged</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case 'pro':
        return <Badge className="bg-primary/10 text-primary border-primary/20">Pro</Badge>;
      case 'proplus':
        return <Badge className="bg-accent/10 text-accent border-accent/20">Pro+</Badge>;
      default:
        return <Badge variant="outline">Free</Badge>;
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold flex items-center gap-3">
            <Users className="h-7 w-7 text-primary" />
            User Management
          </h1>
          <p className="text-foreground-secondary mt-1">View and manage all registered users</p>
        </div>
        <Button onClick={fetchUsers} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{users.length}</p>
              <p className="text-sm text-foreground-secondary">Total Users</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <UserCheck className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold">{users.filter(u => u.status === 'active' && u.generation_enabled).length}</p>
              <p className="text-sm text-foreground-secondary">Active Users</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold">{users.filter(u => u.status === 'flagged').length}</p>
              <p className="text-sm text-foreground-secondary">Flagged</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
              <PowerOff className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold">{users.filter(u => !u.generation_enabled).length}</p>
              <p className="text-sm text-foreground-secondary">Gen. Disabled</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-lg">All Users</CardTitle>
              <CardDescription>Manage user accounts, credits, and permissions</CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Credits</TableHead>
                  <TableHead>Quotas (B/I/V)</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <RefreshCw className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{user.display_name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(user.status, user.generation_enabled)}</TableCell>
                      <TableCell>{getPlanBadge(user.plan)}</TableCell>
                      <TableCell>
                        <span className="font-mono font-medium">{user.credits}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm">
                          {user.beginner_left}/{user.intermediate_left}/{user.veteran_left}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {new Date(user.created_at).toLocaleDateString()}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => openCreditDialog(user)}
                            title="Manage Credits"
                          >
                            <Coins className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => openStatusDialog(user)}
                            title="Manage Status"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Credit Management Dialog */}
      <Dialog open={creditDialogOpen} onOpenChange={setCreditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage User Credits</DialogTitle>
            <DialogDescription>
              Adjust credits for {selectedUser?.display_name} ({selectedUser?.email})
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-4">
              <Label className="w-32">Current Credits:</Label>
              <span className="font-mono font-bold text-lg">{selectedUser?.credits}</span>
            </div>
            <div className="space-y-2">
              <Label>Credit Change</Label>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setCreditChange(c => c - 5)}
                >-5</Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setCreditChange(c => c - 1)}
                >-1</Button>
                <Input 
                  type="number" 
                  value={creditChange}
                  onChange={(e) => setCreditChange(parseInt(e.target.value) || 0)}
                  className="w-24 text-center font-mono"
                />
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setCreditChange(c => c + 1)}
                >+1</Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setCreditChange(c => c + 5)}
                >+5</Button>
              </div>
              <p className="text-sm text-muted-foreground">
                New balance: {(selectedUser?.credits || 0) + creditChange}
              </p>
            </div>
            <div className="space-y-2">
              <Label>Reason (optional)</Label>
              <Input 
                placeholder="e.g., Refund for failed generation"
                value={creditReason}
                onChange={(e) => setCreditReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreditDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateCredits} 
              disabled={actionLoading || creditChange === 0}
            >
              {actionLoading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
              {creditChange > 0 ? 'Add Credits' : 'Deduct Credits'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status Management Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage User Status</DialogTitle>
            <DialogDescription>
              Update status for {selectedUser?.display_name} ({selectedUser?.email})
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>User Status</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="flagged">Flagged</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Project Generation</p>
                <p className="text-sm text-muted-foreground">
                  {generationEnabled ? 'User can generate projects' : 'User cannot generate projects'}
                </p>
              </div>
              <Button 
                variant={generationEnabled ? "outline" : "destructive"}
                size="sm"
                onClick={() => setGenerationEnabled(!generationEnabled)}
              >
                {generationEnabled ? (
                  <><Power className="h-4 w-4 mr-2" />Enabled</>
                ) : (
                  <><PowerOff className="h-4 w-4 mr-2" />Disabled</>
                )}
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateStatus} disabled={actionLoading}>
              {actionLoading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};