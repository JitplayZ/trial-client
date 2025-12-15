import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Notification {
  id: string;
  type: 'project' | 'referral' | 'billing' | 'system' | 'admin' | 'support';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

const STORAGE_KEY = 'notifications';

const defaultNotifications: Notification[] = [
  {
    id: 'default-1',
    type: 'system',
    title: 'Welcome to tRIAL-cLIENTS',
    message: 'Get started by generating your first project brief!',
    timestamp: 'Just now',
    read: false
  }
];

export const useNotifications = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch notifications from database and local storage
  const fetchNotifications = async () => {
    if (!user) {
      // Load from localStorage for non-authenticated state
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          setNotifications(JSON.parse(stored));
        } catch {
          setNotifications(defaultNotifications);
        }
      } else {
        setNotifications(defaultNotifications);
      }
      setLoading(false);
      return;
    }

    try {
      // Fetch deleted notification IDs for this user
      const { data: deletedNotifs } = await supabase
        .from('user_deleted_notifications')
        .select('notification_id')
        .eq('user_id', user.id);

      const deletedIds = new Set(deletedNotifs?.map(d => d.notification_id) || []);

      // Fetch admin notifications for this user
      const { data: adminNotifs, error: adminError } = await supabase
        .from('admin_notifications')
        .select('*')
        .or(`target_user_id.eq.${user.id},target_user_id.is.null`)
        .order('created_at', { ascending: false })
        .limit(50);

      if (adminError) throw adminError;

      // Fetch read status
      const { data: readStatus } = await supabase
        .from('user_notification_reads')
        .select('notification_id')
        .eq('user_id', user.id);

      const readIds = new Set(readStatus?.map(r => r.notification_id) || []);

      // Fetch support replies for this user
      const { data: supportMessages } = await supabase
        .from('support_messages')
        .select('id')
        .eq('user_id', user.id);

      const messageIds = supportMessages?.map(m => m.id) || [];
      
      let supportReplies: any[] = [];
      if (messageIds.length > 0) {
        const { data: replies } = await supabase
          .from('admin_replies')
          .select('*')
          .in('support_message_id', messageIds)
          .order('created_at', { ascending: false });
        supportReplies = replies || [];
      }

      // Convert to notification format - filter out deleted ones
      const adminNotifications: Notification[] = (adminNotifs || [])
        .filter(n => !deletedIds.has(n.id))
        .map(n => ({
          id: `admin-${n.id}`,
          type: 'admin' as const,
          title: n.title,
          message: n.message,
          timestamp: formatTimeAgo(n.created_at),
          read: readIds.has(n.id)
        }));

      // Filter out deleted support replies
      const supportNotifications: Notification[] = supportReplies
        .filter(r => !deletedIds.has(r.id))
        .map(r => ({
          id: `support-${r.id}`,
          type: 'support' as const,
          title: 'Support Reply',
          message: r.reply,
          timestamp: formatTimeAgo(r.created_at),
          read: false
        }));

      // Combine notifications (no more local ones for authenticated users)
      const allNotifications = [...adminNotifications, ...supportNotifications];
      setNotifications(allNotifications);
      
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const diff = Date.now() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return `${Math.floor(days / 7)}w ago`;
  };

  // Load notifications on mount and when user changes
  useEffect(() => {
    fetchNotifications();
  }, [user?.id]);

  // Set up real-time subscription for new notifications
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('user-notifications')
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'admin_notifications'
        },
        (payload) => {
          const newNotif = payload.new as any;
          // Check if this notification is for this user (targeted or global)
          if (newNotif.target_user_id === user.id || newNotif.target_user_id === null) {
            const notification: Notification = {
              id: `admin-${newNotif.id}`,
              type: 'admin',
              title: newNotif.title,
              message: newNotif.message,
              timestamp: 'Just now',
              read: false
            };
            setNotifications(prev => [notification, ...prev]);
            toast({
              title: newNotif.title,
              description: newNotif.message,
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'admin_replies'
        },
        () => {
          // Refetch to get the new reply
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  // Save to localStorage whenever notifications change
  useEffect(() => {
    if (notifications.length >= 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    }
  }, [notifications]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = async (id: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );

    // If it's an admin notification, mark as read in database
    if (id.startsWith('admin-') && user) {
      const notificationId = id.replace('admin-', '');
      try {
        await supabase
          .from('user_notification_reads')
          .insert({
            user_id: user.id,
            notification_id: notificationId
          });
      } catch (error) {
        // Ignore duplicate errors
      }
    }
  };

  const markAllAsRead = async () => {
    const unreadNotifs = notifications.filter(n => !n.read);
    
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));

    // Mark admin notifications as read in database
    if (user) {
      const adminNotifIds = unreadNotifs
        .filter(n => n.id.startsWith('admin-'))
        .map(n => n.id.replace('admin-', ''));

      if (adminNotifIds.length > 0) {
        try {
          const inserts = adminNotifIds.map(notificationId => ({
            user_id: user.id,
            notification_id: notificationId
          }));
          await supabase.from('user_notification_reads').insert(inserts);
        } catch (error) {
          // Ignore errors
        }
      }
    }

    toast({
      title: 'All notifications marked as read',
    });
  };

  const deleteNotification = async (id: string) => {
    setDeletingId(id);
    
    try {
      // Remove from local state immediately
      setNotifications(prev => prev.filter(notif => notif.id !== id));

      if (user) {
        // Get the actual notification ID (remove prefix)
        let notificationId = id;
        if (id.startsWith('admin-')) {
          notificationId = id.replace('admin-', '');
        } else if (id.startsWith('support-')) {
          notificationId = id.replace('support-', '');
        }

        // Persist deletion in database
        await supabase
          .from('user_deleted_notifications')
          .insert({
            user_id: user.id,
            notification_id: notificationId
          });
      }

      toast({
        title: 'Notification deleted',
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
    } finally {
      setDeletingId(null);
    }
  };

  const clearAll = async () => {
    if (user) {
      try {
        // Mark all current notifications as deleted in database
        const inserts = notifications.map(n => {
          let notificationId = n.id;
          if (n.id.startsWith('admin-')) {
            notificationId = n.id.replace('admin-', '');
          } else if (n.id.startsWith('support-')) {
            notificationId = n.id.replace('support-', '');
          }
          return {
            user_id: user.id,
            notification_id: notificationId
          };
        });

        if (inserts.length > 0) {
          await supabase
            .from('user_deleted_notifications')
            .insert(inserts);
        }
      } catch (error) {
        console.error('Error clearing notifications:', error);
      }
    }
    
    setNotifications([]);
    toast({
      title: 'All notifications cleared',
    });
  };

  return {
    notifications,
    unreadCount,
    deletingId,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    refetch: fetchNotifications,
  };
};