import api from './axiosConfig';

export interface Enterprise {
  id: number;
  name: string;
  description: string;
  city: string;
  sector: string;
  logoUrl: string;
  imageUrl: string;
  websiteUrl: string;
  employeeCount: number;
}

export const enterpriseApi = {
  getAll: async (): Promise<Enterprise[]> => {
    const res = await api.get<Enterprise[]>('/enterprises');
    return res.data;
  },

  getBySector: async (sector: string): Promise<Enterprise[]> => {
    const res = await api.get<Enterprise[]>('/enterprises/by-sector', {
      params: { sector },
    });
    return res.data;
  },

  getByCity: async (city: string): Promise<Enterprise[]> => {
    const res = await api.get<Enterprise[]>('/enterprises/by-city', {
      params: { city },
    });
    return res.data;
  },
};