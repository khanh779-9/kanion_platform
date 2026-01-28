import { api } from './client';

export async function fetchLatestNotifications() {
  const res = await api.get('/api/auth/login/user/notifications');
  return res.data;
}

export async function fetchAllNotifications() {
  const res = await api.get('/api/auth/login/user/notifications/all');
  return res.data;
}
