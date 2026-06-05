import api from './axiosConfig';

export const adminApi = {
  deleteService: async (id: number): Promise<void> => {
    await api.delete(`/admin/services/${id}`);
  },
  
  deleteEnterprise: async (id: number): Promise<void> => {
    await api.delete(`/admin/enterprises/${id}`);
  },
};
