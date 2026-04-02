import React from 'react';
import { motion } from 'framer-motion';
import { Bell, CheckCheck, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

function formatNotificationTimestamp(value) {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleString([], {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function getAudienceLabel(targetType) {
  return String(targetType || '')
    .toLowerCase()
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export default function NotificationList({
  notifications = [],
  compact = false,
  onMarkRead,
  onEdit,
  onDelete,
  emptyTitle = 'No notifications yet',
  emptyMessage = 'When notifications arrive, they will appear here.',
}) {
  if (!notifications.length) {
    return (
      <div className={cn(
        'flex flex-col items-center justify-center rounded-xl border border-dashed px-6 py-10 text-center',
        compact ? 'bg-transparent' : 'bg-card'
      )}>
        <div className="mb-3 rounded-full bg-primary/10 p-3 text-primary">
          <Bell className="h-5 w-5" />
        </div>
        <h3 className="text-sm font-semibold text-foreground">{emptyTitle}</h3>
        <p className="mt-1 max-w-md text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-3', compact && 'space-y-2')}>
      {notifications.map((notification, index) => (
        <motion.div
          key={notification.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.03, duration: 0.2 }}
          className={cn(
            'group rounded-xl border bg-card p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md',
            !notification.isRead && 'border-primary/30 bg-primary/[0.04]',
            compact && 'p-3'
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-semibold text-foreground">{notification.title}</h3>
                {!notification.isRead && (
                  <Badge className="bg-primary/10 text-primary hover:bg-primary/10">Unread</Badge>
                )}
                <Badge variant="outline" className="text-xs">
                  {getAudienceLabel(notification.targetType)}
                </Badge>
              </div>

              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                {notification.message}
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span>{notification.senderName || 'System'}</span>
                <span>{notification.senderRole}</span>
                <span>{formatNotificationTimestamp(notification.createdAt)}</span>
                {notification.companyName && <span>{notification.companyName}</span>}
              </div>
            </div>

            {!compact && (
              <div className="flex shrink-0 items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                {!notification.isRead && onMarkRead && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onMarkRead(notification)}
                    aria-label="Mark as read"
                  >
                    <CheckCheck className="h-4 w-4" />
                  </Button>
                )}
                {notification.canEdit && onEdit && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onEdit(notification)}
                    aria-label="Edit notification"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                )}
                {notification.canDelete && onDelete && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => onDelete(notification)}
                    aria-label="Delete notification"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </div>

          {compact && !notification.isRead && onMarkRead && (
            <div className="mt-3">
              <Button variant="outline" size="sm" onClick={() => onMarkRead(notification)}>
                Mark as read
              </Button>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}
