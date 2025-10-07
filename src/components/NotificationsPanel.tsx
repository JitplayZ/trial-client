import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Check, Trash2, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

interface Notification {
  id: string;
  type: 'project' | 'referral' | 'billing' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationsPanel = ({ isOpen, onClose }: NotificationsPanelProps) => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Load notifications from API/localStorage on mount
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        // Try to load from localStorage first (persistence)
        const stored = localStorage.getItem('notifications');
        if (stored) {
          setNotifications(JSON.parse(stored));
          return;
        }
        
        // Mock API call - replace with actual endpoint
        const mockNotifications: Notification[] = [
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
        
        setNotifications(mockNotifications);
        localStorage.setItem('notifications', JSON.stringify(mockNotifications));
      } catch (error) {
        console.error('Failed to load notifications:', error);
      }
    };

    loadNotifications();
  }, []);

  // Save to localStorage whenever notifications change
  useEffect(() => {
    if (notifications.length > 0) {
      localStorage.setItem('notifications', JSON.stringify(notifications));
    }
  }, [notifications]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = async (id: string) => {
    // Optimistic update
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );

    try {
      // Mock API call - replace with actual endpoint
      // await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
      console.info('[notifications] Marked as read:', id);
    } catch (error) {
      // Rollback on error
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
    
    // Optimistic update
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));

    try {
      // Mock API call
      console.info('[notifications] Marked all as read:', unreadIds);
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
    
    // Optimistic removal
    setNotifications(prev => prev.filter(notif => notif.id !== id));

    const undoToast = toast({
      title: 'Notification deleted',
      description: 'Undo',
      action: (
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            // Restore notification
            if (notificationToDelete) {
              setNotifications(prev => [...prev, notificationToDelete].sort((a, b) => 
                parseInt(a.id) - parseInt(b.id)
              ));
              toast({ title: 'Notification restored' });
            }
          }}
        >
          Undo
        </Button>
      ),
    });

    // Simulate API call with delay for undo window
    setTimeout(async () => {
      try {
        // Mock API call - replace with actual endpoint
        // await fetch(`/api/notifications/${id}`, { method: 'DELETE' });
        console.info('[notifications] Deleted:', id);
      } catch (error) {
        // Restore on error
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
    }, 5000); // 5s undo window
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'project': return 'bg-primary/20 text-primary';
      case 'referral': return 'bg-success/20 text-success';
      case 'billing': return 'bg-warning/20 text-warning';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20, y: -10 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 20, y: -10 }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed right-4 top-16 z-50 w-96 max-h-[32rem] bg-card/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border/50 bg-surface/20">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-foreground">Notifications</h3>
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="h-5 px-2 text-xs">
                    {unreadCount}
                  </Badge>
                )}
              </div>
              <div className="flex gap-1">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={markAllAsRead}
                    className="h-8 w-8 hover:bg-surface-hover"
                    title="Mark all as read"
                  >
                    <CheckCheck className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="h-8 w-8 hover:bg-surface-hover"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <ScrollArea className="h-[28rem]">
              {notifications.length === 0 ? (
                <div className="py-12 text-center">
                  <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">No notifications</p>
                </div>
              ) : (
                <div className="p-2">
                  {notifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-3 rounded-lg hover:bg-surface-hover transition-colors mb-1 ${
                        !notification.read ? 'bg-surface/40 border-l-2 border-l-primary' : 'bg-surface/20'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={`${getTypeColor(notification.type)} text-xs`}>
                              {notification.type}
                            </Badge>
                            {!notification.read && (
                              <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                            )}
                          </div>
                          <h4 className="font-medium text-sm text-foreground mb-1">
                            {notification.title}
                          </h4>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {notification.timestamp}
                          </p>
                        </div>

                        <div className="flex gap-1 flex-shrink-0">
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => markAsRead(notification.id)}
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => deleteNotification(notification.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
