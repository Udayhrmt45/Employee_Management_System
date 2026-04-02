import api from './api';

export const getNotifications = async (params = {}) => {
  return await api.get('/notifications', {
    params: {
      limit: params.limit,
      unreadOnly: params.unreadOnly,
    },
  });
};

export const sendNotification = async (payload) => {
  return await api.post('/notifications', payload);
};

export const markNotificationAsRead = async (notificationId) => {
  return await api.put(`/notifications/${notificationId}/read`);
};

export const updateNotification = async (notificationId, payload) => {
  return await api.put(`/notifications/${notificationId}`, payload);
};

export const deleteNotification = async (notificationId) => {
  return await api.delete(`/notifications/${notificationId}`);
};
