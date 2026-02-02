import { api } from './client';

export async function fetchLatestNotifications() {
  const res = await api.get('/auth/user/notifications');
  return res.data;
}

export async function fetchAllNotifications() {
  const res = await api.get('/auth/user/notifications/all');
  return res.data;
}

export async function markNotificationAsRead(notificationId, isRead) {
  const res = await api.patch(`/auth/user/notifications/${notificationId}/read`, { is_read: isRead });
  return res.data || { success: true };
}
