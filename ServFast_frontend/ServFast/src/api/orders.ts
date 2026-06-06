import api from './axiosConfig';

export interface Order {
  id: number;
  serviceId: number;
  serviceTitle: string;
  servicePrice: number;
  clientId: number;
  clientName: string;
  clientPhoto?: string;
  providerId: number;
  providerName: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED';
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export const ordersApi = {
  create: async (serviceId: number, note?: string): Promise<Order> => {
    const res = await api.post('/orders', { serviceId, note });
    return res.data;
  },

  getMyOrders: async (): Promise<Order[]> => {
    const res = await api.get('/orders/my');
    return res.data;
  },

  getReceivedOrders: async (): Promise<Order[]> => {
    const res = await api.get('/orders/received');
    return res.data;
  },

  updateStatus: async (orderId: number, status: string): Promise<Order> => {
    const res = await api.patch(`/orders/${orderId}/status?status=${status}`);
    return res.data;
  },

  // ── Raccourcis utilisant updateStatus ──
  accept: async (orderId: number): Promise<Order> => {
    const res = await api.patch(`/orders/${orderId}/status?status=ACCEPTED`);
    return res.data;
  },

  reject: async (orderId: number): Promise<Order> => {
    const res = await api.patch(`/orders/${orderId}/status?status=REJECTED`);
    return res.data;
  },
};