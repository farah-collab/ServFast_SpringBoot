import api from './axiosConfig';

export interface Rating {
  id: number;
  serviceId: number;
  userId: number;
  userName: string;
  userPhoto?: string;
  score: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RatingStats {
  average: number;
  count: number;
}

export const ratingsApi = {
  submit: async (serviceId: number, score: number, comment?: string): Promise<Rating> => {
    const res = await api.post('/ratings', { serviceId, score, comment });
    return res.data;
  },

  getByService: async (serviceId: number): Promise<Rating[]> => {
    const res = await api.get(`/ratings/service/${serviceId}`);
    return res.data;
  },

  getStats: async (serviceId: number): Promise<RatingStats> => {
    const res = await api.get(`/ratings/service/${serviceId}/stats`);
    return res.data;
  },

  getMyRatings: async (): Promise<Rating[]> => {
    const res = await api.get('/ratings/my');
    return res.data;
  },

  getRecent: async (): Promise<Rating[]> => {
    const res = await api.get('/ratings/recent');
    return res.data;
  },

  delete: async (ratingId: number): Promise<void> => {
    await api.delete(`/ratings/${ratingId}`);
  },
};