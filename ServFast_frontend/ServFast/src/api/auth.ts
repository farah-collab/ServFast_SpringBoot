import api from './axiosConfig';

export interface AuthUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: 'CLIENT' | 'PROVIDER' | 'ADMIN';
  avatarUrl?: string;
  profilePhoto?: string;
  bio?: string;
  city?: string;
  phone?: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: 'CLIENT' | 'PROVIDER';
}

export interface LoginRequest {
  email: string;
  password: string;
}

const TOKEN_KEY = 'sh_token';
const USER_KEY = 'sh_user';

export const authApi = {
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>('/auth/register', data);
    authApi.saveSession(res.data);
    return res.data;
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>('/auth/login', data);
    authApi.saveSession(res.data);
    return res.data;
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  saveSession: (data: AuthResponse) => {
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  },

  getCurrentUser: (): AuthUser | null => {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  getToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem(TOKEN_KEY);
  },

  updateStoredUser: (user: Partial<AuthUser>) => {
    const current = authApi.getCurrentUser();
    if (current) {
      localStorage.setItem(USER_KEY, JSON.stringify({ ...current, ...user }));
    }
  },

  forgotPassword: async (email: string) => {
    return api.post('/auth/forgot-password', { email });
  },

  resetPassword: async (token: string, newPassword: string) => {
    return api.post('/auth/reset-password', { token, newPassword });
  },
};