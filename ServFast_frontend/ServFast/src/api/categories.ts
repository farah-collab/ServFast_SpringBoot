import api from './axiosConfig';

export interface Category {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
}

export const categoriesApi = {
  getAll: async (): Promise<Category[]> => {
    const res = await api.get<Category[]>('/categories');
    return res.data;
  },
  
  create: async (data: Omit<Category, 'id'>): Promise<Category> => {
    const res = await api.post<Category>('/categories', data);
    return res.data;
  }
};
