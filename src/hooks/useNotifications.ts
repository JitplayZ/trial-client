import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface Notification {
  id: string;
  type: 'project' | 'referral' | 'billing' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

const STORAGE_KEY = 'notifications';

const defaultNotifications: Notification[] = [
  {
    id: '1',
    type: 'project',
    title: 'Project Generated',
    message: 'Your Fashion Website project brief is ready to view.',
    timestamp: '2h ago',
    read: false
  },
  {
    id: '2',
    type: 'referral',
    title: 'Referral Bonus',
    message: 'You earned 100 XP for referring a friend!',
    timestamp: '1d ago',
    read: false
  },
  {
    id: '3',
    type: 'system',
    title: 'New Features',
    message: 'Check out our new project templates.',
    timestamp: '1w ago',
    read: true
  }
];

export const useNotifications = () => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setNotifications(JSON.parse(stored));
      } catch {
        setNotifications(defaultNotifications);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultNotifications));
      }
    } else {
      setNotifications(defaultNotifications);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultNotifications));
    }
  }, []);

  // Save to localStorage whenever notifications change
  useEffect(() => {
    if (notifications.length >= 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
      // Dispatch storage event for cross-component sync
      window.dispatchEvent(new Event('storage'));
    }
  }, [notifications]);

  // Listen for storage changes from other components
  useEffect(() => {
    const handleStorageChange = () => {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          setNotifications(JSON.parse(stored));
        } catch {}
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = async (id: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );

    try {
      if (import.meta.env.DEV) {
        console.info('[notifications] Marked as read:', id);
      }
    } catch (error) {
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === id ? { ...notif, read: false } : notif
        )
      );
      toast({
        title: 'Failed to mark as read',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    }
  };

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
    
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));

    try {
      if (import.meta.env.DEV) {
        console.info('[notifications] Marked all as read:', unreadIds);
      }
      toast({
        title: 'All notifications marked as read',
      });
    } catch (error) {
      toast({
        title: 'Failed to mark all as read',
        variant: 'destructive',
      });
    }
  };

  const deleteNotification = async (id: string) => {
    setDeletingId(id);
    const notificationToDelete = notifications.find(n => n.id === id);
    
    setNotifications(prev => prev.filter(notif => notif.id !== id));

    toast({
      title: 'Notification deleted',
      description: 'Undo',
    });

    setTimeout(async () => {
      try {
        if (import.meta.env.DEV) {
          console.info('[notifications] Deleted:', id);
        }
      } catch (error) {
        if (notificationToDelete) {
          setNotifications(prev => [...prev, notificationToDelete]);
        }
        toast({
          title: 'Failed to delete notification',
          variant: 'destructive',
        });
      } finally {
        setDeletingId(null);
      }
    }, 5000);
  };

  const clearAll = () => {
    setNotifications([]);
    toast({
      title: 'All notifications cleared',
    });
  };

  return {
    notifications,
    unreadCount,
    deletingId,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  };
};
