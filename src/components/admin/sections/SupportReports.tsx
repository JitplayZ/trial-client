import { CopyUserId } from "../CopyUserId";
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { 
  HeadphonesIcon, 
  AlertTriangle, 
  CheckCircle,
  RefreshCw,
  Users,
  FileText,
  MessageCircle,
  Send,
  Bell,
  Globe,
  User,
  Trash2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface SupportMessage {
  id: string;
  user_id: string;
  message: string;
  created_at: string;
  user_email?: string;
  replies?: AdminReply[];
}

interface AdminReply {
  id: string;
  reply: string;
  created_at: string;
}

interface FlaggedUser {
  user_id: string;
  email: string;
  status: string;
  generation_enabled: boolean;
}

interface AuditLog {
  id: string;
  action_type: string;
  details: any;
  created_at: string;
}

export const SupportReports = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [supportMessages, setSupportMessages] = useState<SupportMessage[]>([]);
  const [flaggedUsers, setFlaggedUsers] = useState<FlaggedUser[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});
  const [sendingReply, setSendingReply] = useState<string | null>(null);
  const [deletingMessage, setDeletingMessage] = useState<string | null>(null);
  
  // Notification state
  const [notificationTitle, setNotificationTitle] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [targetUserId, setTargetUserId] = useState('');
  const [sendingNotification, setSendingNotification] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch support messages with user emails
      const { data: messages, error: msgError } = await supabase
        .from('support_messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (msgError) throw msgError;

      if (messages && messages.length > 0) {
        const userIds = [...new Set(messages.map(m => m.user_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, email')
          .in('user_id', userIds);

        // Fetch replies for each message
        const messageIds = messages.map(m => m.id);
        const { data: replies } = await supabase
          .from('admin_replies')
          .select('*')
          .in('support_message_id', messageIds)
          .order('created_at', { ascending: true });

        const messagesWithData: SupportMessage[] = messages.map(msg => ({
          ...msg,
          user_email: profiles?.find(p => p.user_id === msg.user_id)?.email || 'Unknown',
          replies: replies?.filter(r => r.support_message_id === msg.id) || []
        }));
        setSupportMessages(messagesWithData);
      } else {
        setSupportMessages([]);
      }

      // Fetch flagged/disabled users
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('user_id, email, status, generation_enabled')
        .or('status.eq.flagged,status.eq.suspended,generation_enabled.eq.false')
        .limit(20);

      if (profileError) throw profileError;
      setFlaggedUsers(profiles || []);

      // Fetch recent audit logs
      const { data: logs, error: logError } = await supabase
        .from('admin_audit_logs')
        .select('id, action_type, details, created_at')
        .order('created_at', { ascending: false })
        .limit(10);

      if (logError) throw logError;
      setAuditLogs(logs || []);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch support data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Real-time subscription for new support messages
    const channel = supabase
      .channel('support-messages-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'support_messages' },
        () => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleSendReply = async (messageId: string, userId: string) => {
    const reply = replyText[messageId]?.trim();
    if (!reply || !user) return;

    setSendingReply(messageId);
    try {
      // Insert admin reply
      const { error: replyError } = await supabase
        .from('admin_replies')
        .insert({
          support_message_id: messageId,
          admin_user_id: user.id,
          reply
        });

      if (replyError) throw replyError;

      // Create notification for the user
      const { error: notifError } = await supabase
        .from('admin_notifications')
        .insert({
          admin_user_id: user.id,
          target_user_id: userId,
          title: 'Support Reply',
          message: reply
        });

      if (notifError) throw notifError;

      toast.success('Reply sent and user notified');
      setReplyText(prev => ({ ...prev, [messageId]: '' }));
      fetchData();
    } catch (error) {
      console.error('Error sending reply:', error);
      toast.error('Failed to send reply');
    } finally {
      setSendingReply(null);
    }
  };

  const handleSendNotification = async (global: boolean) => {
    if (!notificationTitle.trim() || !notificationMessage.trim() || !user) {
      toast.error('Please fill in title and message');
      return;
    }

    if (!global && !targetUserId.trim()) {
      toast.error('Please enter a user ID for targeted notification');
      return;
    }

    setSendingNotification(true);
    try {
      const { error } = await supabase
        .from('admin_notifications')
        .insert({
          admin_user_id: user.id,
          target_user_id: global ? null : targetUserId.trim(),
          title: notificationTitle.trim(),
          message: notificationMessage.trim()
        });

      if (error) throw error;

      toast.success(global ? 'Global notification sent' : 'Notification sent to user');
      setNotificationTitle('');
      setNotificationMessage('');
      setTargetUserId('');
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error('Failed to send notification');
    } finally {
      setSendingNotification(false);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    setDeletingMessage(messageId);
    try {
      // First delete all replies associated with this message
      await supabase
        .from('admin_replies')
        .delete()
        .eq('support_message_id', messageId);

      // Then delete the message itself
      const { error } = await supabase
        .from('support_messages')
        .delete()
        .eq('id', messageId);

      if (error) throw error;

      toast.success('Message deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Failed to delete message');
    } finally {
      setDeletingMessage(null);
    }
  };

  const formatTimeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const getStatusBadge = (user: FlaggedUser) => {
    if (!user.generation_enabled) {
      return <Badge variant="destructive">Generation Disabled</Badge>;
    }
    if (user.status === 'suspended') {
      return <Badge variant="destructive">Suspended</Badge>;
    }
    return <Badge className="bg-warning/10 text-warning border-warning/20">Flagged</Badge>;
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold flex items-center gap-3">
            <HeadphonesIcon className="h-7 w-7 text-primary" />
            Support & Reports
          </h1>
          <p className="text-foreground-secondary mt-1">Manage support messages and send notifications</p>
        </div>
        <Button onClick={fetchData} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <MessageCircle className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{supportMessages.length}</p>
              <p className="text-sm text-foreground-secondary">Support Messages</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold">{flaggedUsers.length}</p>
              <p className="text-sm text-foreground-secondary">Flagged/Disabled Users</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{auditLogs.length}</p>
              <p className="text-sm text-foreground-secondary">Recent Actions</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Send Notification Section */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bell className="h-5 w-5 text-primary" />
            Send Notification
          </CardTitle>
          <CardDescription>Send notifications to all users or a specific user</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Title</label>
              <Input
                placeholder="Notification title..."
                value={notificationTitle}
                onChange={(e) => setNotificationTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Target User ID (optional)</label>
              <Input
                placeholder="Leave empty for global notification..."
                value={targetUserId}
                onChange={(e) => setTargetUserId(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Message</label>
            <Textarea
              placeholder="Notification message..."
              value={notificationMessage}
              onChange={(e) => setNotificationMessage(e.target.value)}
              className="min-h-[80px]"
            />
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={() => handleSendNotification(true)} 
              disabled={sendingNotification}
              className="gap-2"
            >
              <Globe className="h-4 w-4" />
              Send to All Users
            </Button>
            <Button 
              variant="outline"
              onClick={() => handleSendNotification(false)} 
              disabled={sendingNotification || !targetUserId.trim()}
              className="gap-2"
            >
              <User className="h-4 w-4" />
              Send to Specific User
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Support Messages */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageCircle className="h-5 w-5 text-primary" />
            Support Messages
          </CardTitle>
          <CardDescription>User support requests and admin replies</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : supportMessages.length === 0 ? (
            <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
              <CheckCircle className="h-5 w-5 text-accent" />
              No support messages
            </div>
          ) : (
            supportMessages.map((msg) => (
              <div 
                key={msg.id}
                className="p-4 border border-border rounded-lg space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline">{msg.user_email}</Badge>
                    <CopyUserId userId={msg.user_id} />
                    <span className="text-xs text-muted-foreground">{formatTimeAgo(msg.created_at)}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteMessage(msg.id)}
                    disabled={deletingMessage === msg.id}
                    className="h-8 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm bg-muted/50 p-3 rounded-lg">{msg.message}</p>
                
                {/* Previous Replies */}
                {msg.replies && msg.replies.length > 0 && (
                  <div className="pl-4 border-l-2 border-primary/30 space-y-2">
                    {msg.replies.map((reply) => (
                      <div key={reply.id} className="bg-primary/5 p-3 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className="bg-primary/10 text-primary text-xs">Admin Reply</Badge>
                          <span className="text-xs text-muted-foreground">{formatTimeAgo(reply.created_at)}</span>
                        </div>
                        <p className="text-sm">{reply.reply}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply Input */}
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Type your reply..."
                    value={replyText[msg.id] || ''}
                    onChange={(e) => setReplyText(prev => ({ ...prev, [msg.id]: e.target.value }))}
                    className="min-h-[60px] flex-1"
                  />
                  <Button
                    onClick={() => handleSendReply(msg.id, msg.user_id)}
                    disabled={sendingReply === msg.id || !replyText[msg.id]?.trim()}
                    size="icon"
                    className="h-auto"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Flagged Users */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5 text-warning" />
            Flagged & Disabled Users
          </CardTitle>
          <CardDescription>Users requiring admin attention</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <div className="flex justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : flaggedUsers.length === 0 ? (
            <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
              <CheckCircle className="h-5 w-5 text-accent" />
              No flagged users
            </div>
          ) : (
            flaggedUsers.map((flaggedUser) => (
              <div 
                key={flaggedUser.user_id}
                className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 border border-warning/20 bg-warning/5 rounded-lg"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium">{flaggedUser.email}</span>
                    <CopyUserId userId={flaggedUser.user_id} />
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <p className="font-medium">{flaggedUser.email}</p>
                    {getStatusBadge(flaggedUser)}
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Admin Activity Log */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5 text-primary" />
            Admin Activity Log
          </CardTitle>
          <CardDescription>Recent administrative actions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {auditLogs.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No recent admin activity</p>
          ) : (
            auditLogs.map((log) => (
              <div 
                key={log.id}
                className="flex items-start gap-4 p-4 border border-border rounded-lg"
              >
                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                  log.action_type === 'credit_update' ? 'bg-accent' : 'bg-primary'
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <p className="font-medium capitalize">{log.action_type.replace('_', ' ')}</p>
                    <Badge variant="outline">{log.action_type}</Badge>
                  </div>
                  <p className="text-sm text-foreground-secondary">
                    {log.details?.reason || log.details?.new_status || 'Action performed'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{formatTimeAgo(log.created_at)}</p>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};