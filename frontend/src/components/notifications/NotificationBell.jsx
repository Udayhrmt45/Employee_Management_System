import React from 'react';
import { Link } from 'react-router-dom';
import { Bell } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import NotificationList from '@/components/notifications/NotificationList';
import { useAuthUser } from '@/hooks/useAuthUser';
import { useMarkNotificationRead, useNotifications, useNotificationRealtimeToast } from '@/hooks/useNotifications';

export default function NotificationBell() {
  const { userRole } = useAuthUser();
  const { data, isLoading } = useNotifications({ limit: 5 });
  const markAsReadMutation = useMarkNotificationRead();
  const unreadCount = data?.unreadCount || 0;
  const notifications = data?.notifications || [];
  const notificationsPath = userRole === 'SUPER_ADMIN' ? '/admin/notifications' : '/notifications';

  useNotificationRealtimeToast(unreadCount);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9 hover:bg-secondary">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-[24rem] p-0">
        <div className="p-3">
          <DropdownMenuLabel className="px-0 py-0 text-base">Notifications</DropdownMenuLabel>
          <p className="mt-1 text-xs text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} unread message${unreadCount === 1 ? '' : 's'}` : 'All caught up'}
          </p>
        </div>
        <DropdownMenuSeparator />
        <div className="max-h-[26rem] overflow-y-auto p-3">
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="h-24 animate-pulse rounded-xl bg-muted/50" />
              ))}
            </div>
          ) : (
            <NotificationList
              notifications={notifications}
              compact
              onMarkRead={(notification) => markAsReadMutation.mutate(notification.id)}
              emptyMessage="Updates from your workspace will appear here."
            />
          )}
        </div>
        <DropdownMenuSeparator />
        <div className="p-3">
          <Button asChild variant="outline" className="w-full">
            <Link to={notificationsPath}>View all notifications</Link>
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
