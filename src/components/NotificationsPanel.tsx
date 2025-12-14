import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Check, Trash2, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useNotifications } from '@/hooks/useNotifications';

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationsPanel = ({ isOpen, onClose }: NotificationsPanelProps) => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'project': return { bg: 'bg-primary/10', text: 'text-primary', border: 'border-primary/20' };
      case 'referral': return { bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/20' };
      case 'billing': return { bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/20' };
      default: return { bg: 'bg-muted', text: 'text-muted-foreground', border: 'border-border' };
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - lighter for less lag */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            className="fixed inset-0 z-40"
            onClick={onClose}
          />

          {/* Panel - Positioned directly under the notification button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -5 }}
            transition={{ duration: 0.12, ease: 'easeOut' }}
            className="absolute right-0 top-full mt-1 z-50 w-80 sm:w-96 bg-popover border border-border rounded-lg shadow-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-muted/50">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-primary" />
                <span className="font-semibold text-sm text-foreground">Notifications</span>
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="h-5 min-w-5 px-1.5 text-xs font-medium">
                    {unreadCount}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="h-7 px-2 text-xs hover:bg-muted"
                    title="Mark all as read"
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-7 w-7 p-0 hover:bg-muted"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Separator />

            {/* Content */}
            <ScrollArea className="max-h-80">
              {notifications.length === 0 ? (
                <div className="py-8 px-4 text-center">
                  <Bell className="h-10 w-10 mx-auto text-muted-foreground/50 mb-2" />
                  <p className="text-sm text-muted-foreground">No notifications yet</p>
                </div>
              ) : (
                <div className="py-1">
                  {notifications.map((notification, index) => {
                    const styles = getTypeStyles(notification.type);
                    return (
                      <div
                        key={notification.id}
                        className={`px-3 py-2.5 mx-1 my-0.5 rounded-md transition-colors cursor-pointer group ${
                          !notification.read 
                            ? 'bg-primary/5 hover:bg-primary/10' 
                            : 'hover:bg-muted/50'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <Badge 
                                variant="outline" 
                                className={`${styles.bg} ${styles.text} ${styles.border} text-[10px] px-1.5 py-0 h-4 font-medium`}
                              >
                                {notification.type}
                              </Badge>
                              {!notification.read && (
                                <span className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                              )}
                            </div>
                            <h4 className="font-medium text-sm text-foreground leading-tight">
                              {notification.title}
                            </h4>
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="text-[10px] text-muted-foreground/70 mt-1">
                              {notification.timestamp}
                            </p>
                          </div>

                          <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 hover:bg-muted"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(notification.id);
                                }}
                                title="Mark as read"
                              >
                                <Check className="h-3 w-3" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification.id);
                              }}
                              title="Delete"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};