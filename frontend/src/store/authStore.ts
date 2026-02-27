import { create } from 'zustand';
import { getToken, setToken, removeToken } from '../utils/storage';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  isLoading: true,
  
  login: async (token: string) => {
    await setToken('accessToken', token);
    set({ isAuthenticated: true });
  },
  
  logout: async () => {
    await removeToken('accessToken');
    set({ isAuthenticated: false });
  },
  
  checkAuth: async () => {
    set({ isLoading: true });
    const token = await getToken('accessToken');
    set({ isAuthenticated: !!token, isLoading: false });
  },
}));
