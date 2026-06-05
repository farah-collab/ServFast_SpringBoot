import axiosInstance from './axiosConfig';

export interface Notification {
  id: number;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export const notificationsApi = {
  getAll: async (): Promise<Notification[]> => {
    const res = await axiosInstance.get('/notifications');
    return res.data;
  },

  getUnreadCount: async (): Promise<number> => {
    const res = await axiosInstance.get('/notifications/unread-count');
    return res.data?.count || 0;
  },

  markAsRead: async (id: number): Promise<void> => {
    await axiosInstance.put(`/notifications/${id}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await axiosInstance.put('/notifications/read-all');
  },
};
