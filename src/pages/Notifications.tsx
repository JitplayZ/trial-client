import { motion } from 'framer-motion';
import { Bell, Check, CheckCheck, Trash2, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNotifications } from '@/hooks/useNotifications';
import { useNavigate } from 'react-router-dom';

export default function Notifications() {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
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
    <div className="min-h-screen bg-background py-4 sm:py-8 lg:py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div className="flex items-center space-x-3">
            <Bell className="h-6 w-6 sm:h-8 sm:w-8 text-foreground" />
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">Notifications</h1>
              {unreadCount > 0 && (
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>

          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="absolute right-4 top-4 sm:static">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead} className="flex-1 sm:flex-none text-xs sm:text-sm">
              <CheckCheck className="h-4 w-4 mr-1.5" />
              <span className="hidden sm:inline">Mark all read</span>
              <span className="sm:hidden">Mark all</span>
            </Button>
          )}
          {notifications.length > 0 && (
            <Button variant="outline" size="sm" onClick={clearAll} className="flex-1 sm:flex-none text-xs sm:text-sm">
              <Trash2 className="h-4 w-4 mr-1.5" />
              <span className="hidden sm:inline">Clear all</span>
              <span className="sm:hidden">Clear</span>
            </Button>
          )}
        </div>

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="py-10 sm:py-12 text-center">
              <Bell className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">
                No notifications
              </h3>
              <p className="text-sm text-muted-foreground">
                You're all caught up!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {notifications.map((notification, index) => {
              const styles = getTypeStyles(notification.type);
              return (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className={`glass-card hover-lift cursor-pointer transition-all ${
                    !notification.read ? 'border-l-4 border-l-primary bg-primary/5' : ''
                  }`}>
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-start justify-between gap-2 sm:gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center flex-wrap gap-1.5 mb-1.5">
                            <Badge 
                              variant="outline"
                              className={`${styles.bg} ${styles.text} ${styles.border} text-[10px] sm:text-xs px-1.5 py-0 h-4 sm:h-5`}
                            >
                              {notification.type}
                            </Badge>
                            {!notification.read && (
                              <span className="h-2 w-2 rounded-full bg-primary" />
                            )}
                          </div>
                          <h3 className="font-semibold text-sm sm:text-base text-foreground mb-0.5 sm:mb-1 line-clamp-1">
                            {notification.title}
                          </h3>
                          <p className="text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-[10px] sm:text-xs text-muted-foreground/70">
                            {notification.timestamp}
                          </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-1 flex-shrink-0">
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 sm:h-8 sm:w-8"
                              onClick={() => markAsRead(notification.id)}
                              title="Mark as read"
                            >
                              <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 sm:h-8 sm:w-8 hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => deleteNotification(notification.id)}
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}