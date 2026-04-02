import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/shared/PageHeader';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import ErrorState from '@/components/shared/ErrorState';
import NotificationList from '@/components/notifications/NotificationList';
import SendNotificationModal from '@/components/notifications/SendNotificationModal';
import { useAuthUser } from '@/hooks/useAuthUser';
import {
  useDeleteNotification,
  useMarkNotificationRead,
  useNotifications,
  useSendNotification,
  useUpdateNotification,
} from '@/hooks/useNotifications';
import { getErrorMessage } from '@/utils/normalizers';

export default function Notifications() {
  const { userRole } = useAuthUser();
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [editingNotification, setEditingNotification] = useState(null);
  const { data, isLoading, isError, error, refetch } = useNotifications({ limit: 100 });

  const sendMutation = useSendNotification();
  const markAsReadMutation = useMarkNotificationRead();
  const updateMutation = useUpdateNotification();
  const deleteMutation = useDeleteNotification();

  const notifications = data?.notifications || [];
  const permissions = data?.permissions || { canSend: false, allowedTargetTypes: [] };
  const availableOwners = data?.availableOwners || [];
  const unreadCount = data?.unreadCount || 0;
  const errorMessage = getErrorMessage(error, 'Unable to load notifications.');
  const canSend = permissions.canSend;

  const pageDescription = useMemo(() => {
    if (userRole === 'SUPER_ADMIN') {
      return 'Broadcast platform updates, owner communications, and review delivery status across the system.';
    }

    if (userRole === 'OWNER') {
      return 'Manage company-wide announcements and oversee notifications sent by admins in your workspace.';
    }

    if (userRole === 'ADMIN') {
      return 'Share timely updates with everyone in your company from one place.';
    }

    return 'Stay up to date with announcements from your company and the platform.';
  }, [userRole]);

  const handleCreate = async (payload) => {
    await sendMutation.mutateAsync(payload);
    setIsComposerOpen(false);
  };

  const handleUpdate = async (payload) => {
    await updateMutation.mutateAsync({
      notificationId: editingNotification.id,
      payload: {
        title: payload.title,
        message: payload.message,
      },
    });
    setEditingNotification(null);
  };

  const handleDelete = async (notification) => {
    const confirmed = window.confirm(`Delete "${notification.title}"?`);

    if (!confirmed) {
      return;
    }

    await deleteMutation.mutateAsync(notification.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      <PageHeader
        title="Notifications"
        description={pageDescription}
      >
        {canSend && (
          <Button className="gap-2" onClick={() => setIsComposerOpen(true)}>
            <Plus className="h-4 w-4" />
            Send notification
          </Button>
        )}
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Total notifications</p>
          <p className="mt-3 text-3xl font-semibold text-foreground">{notifications.length}</p>
        </div>
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Unread</p>
          <p className="mt-3 text-3xl font-semibold text-foreground">{unreadCount}</p>
        </div>
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Your access</p>
          <p className="mt-3 text-lg font-semibold text-foreground">
            {canSend ? 'Can send and manage' : 'View only'}
          </p>
        </div>
      </div>

      {isLoading ? (
        <LoadingSkeleton type="list" rows={6} className="rounded-xl" />
      ) : isError ? (
        <ErrorState message={errorMessage} onRetry={refetch} />
      ) : (
        <NotificationList
          notifications={notifications}
          onMarkRead={(notification) => markAsReadMutation.mutate(notification.id)}
          onEdit={(notification) => setEditingNotification(notification)}
          onDelete={handleDelete}
          emptyMessage="There are no announcements for you yet."
        />
      )}

      <SendNotificationModal
        open={isComposerOpen}
        onOpenChange={setIsComposerOpen}
        permissions={permissions}
        availableOwners={availableOwners}
        onSubmit={handleCreate}
        isSubmitting={sendMutation.isPending}
      />

      <SendNotificationModal
        open={Boolean(editingNotification)}
        onOpenChange={(open) => {
          if (!open) {
            setEditingNotification(null);
          }
        }}
        permissions={permissions}
        availableOwners={availableOwners}
        initialValues={editingNotification}
        onSubmit={handleUpdate}
        isSubmitting={updateMutation.isPending}
      />
    </motion.div>
  );
}
