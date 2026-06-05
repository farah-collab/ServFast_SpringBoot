import api from './axiosConfig';

export interface Service {
  id: number;
  title: string;
  description: string;
  price: number;
  priceType: 'FIXED' | 'HOURLY' | 'QUOTE';
  city?: string;
  isAvailable: boolean;
  categoryId?: number;
  categoryName?: string;
  categoryIcon?: string;
  provider?: {
    id: number;
    fullName: string;
    profilePhoto?: string;
    city?: string;
  };
  userId: number;
  imageUrl?: string;
  photoUrls?: string[];
  averageRating?: number;
  totalRatings?: number;
  createdAt: string;
}

export interface ServiceCreateRequest {
  title: string;
  description: string;
  price: number;
  priceType: 'FIXED' | 'HOURLY' | 'QUOTE';
  city?: string;
  categoryId: number;
  isAvailable?: boolean;
  imageUrl?: string;
}

export const servicesApi = {
  search: async (params?: {
    keyword?: string;
    city?: string;
    categoryId?: number;
    maxPrice?: number;
  }): Promise<Service[]> => {
    const res = await api.get('/services/search', { params });
    return res.data;
  },

  getById: async (id: number): Promise<Service> => {
    const res = await api.get(`/services/${id}`);
    return res.data;
  },

  getMyServices: async (): Promise<Service[]> => {
    const res = await api.get('/services/my');
    return res.data;
  },

  getByUser: async (userId: number): Promise<Service[]> => {
    const res = await api.get(`/services/user/${userId}`);
    return res.data;
  },

  getByCategory: async (categoryId: number): Promise<Service[]> => {
    const res = await api.get(`/services/category/${categoryId}`);
    return res.data;
  },

  create: async (data: ServiceCreateRequest): Promise<Service> => {
    const res = await api.post('/services', data);
    return res.data;
  },

  update: async (id: number, data: Partial<ServiceCreateRequest>): Promise<Service> => {
    const res = await api.put(`/services/${id}`, data);
    return res.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/services/${id}`);
  },
};