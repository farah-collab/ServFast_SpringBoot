import api from './axiosConfig';

export interface UserProfile {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone?: string;
  profilePhoto?: string;
  bio?: string;
  city?: string;
  role: string;
  verified?: boolean;
  experienceYears?: number;
  specialty?: string;
  createdAt: string;
}

export interface UserUpdateRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  bio?: string;
  city?: string;
  profilePhoto?: string;
  specialty?: string;
  experienceYears?: number;
}

export const usersApi = {
  getMe: async (): Promise<UserProfile> => {
    const res = await api.get('/users/me');
    return res.data;
  },

  getById: async (id: number): Promise<UserProfile> => {
    const res = await api.get(`/users/${id}`);
    return res.data;
  },

  updateProfile: async (data: UserUpdateRequest): Promise<UserProfile> => {
    const res = await api.put('/users/me', data);
    return res.data;
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    return api.patch('/users/me/password', { currentPassword, newPassword });
  },

  // Get experts (providers) with optional keyword search, paginated
  getExperts: async (params?: { keyword?: string; page?: number; size?: number }): Promise<UserProfile[]> => {
    const res = await api.get('/users/experts', { params });
    return res.data;
  },

  // Get featured (verified) experts
  getFeatured: async (limit: number = 6): Promise<UserProfile[]> => {
    const res = await api.get('/users/featured', { params: { limit } });
    return res.data;
  },

  // Upload profile photo
  uploadPhoto: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.url;
  },
};