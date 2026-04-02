import { useEffect, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  deleteNotification,
  getNotifications,
  markNotificationAsRead,
  sendNotification,
  updateNotification,
} from '@/services/notificationService';
import { getApiData, getErrorMessage } from '@/utils/normalizers';

const NOTIFICATION_QUERY_KEY = ['notifications'];

export function useNotifications(params = {}) {
  return useQuery({
    queryKey: [...NOTIFICATION_QUERY_KEY, params],
    queryFn: async () => {
      const response = await getNotifications(params);
      return getApiData(response, {
        notifications: [],
        unreadCount: 0,
        permissions: { canSend: false, allowedTargetTypes: [] },
        availableOwners: [],
      });
    },
    staleTime: 1000 * 20,
    refetchInterval: 1000 * 30,
  });
}

export function useNotificationRealtimeToast(unreadCount) {
  const previousUnreadCount = useRef(null);

  useEffect(() => {
    if (previousUnreadCount.current === null) {
      previousUnreadCount.current = unreadCount;
      return;
    }

    if (typeof unreadCount === 'number' && unreadCount > previousUnreadCount.current) {
      const newItems = unreadCount - previousUnreadCount.current;
      toast.info(
        newItems === 1
          ? 'You have 1 new notification'
          : `You have ${newItems} new notifications`
      );
    }

    previousUnreadCount.current = unreadCount;
  }, [unreadCount]);
}

function useInvalidateNotifications() {
  const queryClient = useQueryClient();

  return () => queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEY });
}

export function useSendNotification() {
  const invalidateNotifications = useInvalidateNotifications();

  return useMutation({
    mutationFn: sendNotification,
    onSuccess: () => {
      toast.success('Notification sent successfully');
      invalidateNotifications();
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Failed to send notification'));
    },
  });
}

export function useMarkNotificationRead() {
  const invalidateNotifications = useInvalidateNotifications();

  return useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      invalidateNotifications();
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Failed to update notification'));
    },
  });
}

export function useUpdateNotification() {
  const invalidateNotifications = useInvalidateNotifications();

  return useMutation({
    mutationFn: ({ notificationId, payload }) => updateNotification(notificationId, payload),
    onSuccess: () => {
      toast.success('Notification updated successfully');
      invalidateNotifications();
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Failed to update notification'));
    },
  });
}

export function useDeleteNotification() {
  const invalidateNotifications = useInvalidateNotifications();

  return useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => {
      toast.success('Notification deleted successfully');
      invalidateNotifications();
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Failed to delete notification'));
    },
  });
}
