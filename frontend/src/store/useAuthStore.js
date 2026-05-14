import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  authStatus: 'unknown',
  isAuthInitialized: false,

  setUser: (user) => set({ user, authStatus: 'authenticated' }),
  clearUser: () => set({ user: null, authStatus: 'unauthenticated' }),
  markAuthInitialized: () => set({ isAuthInitialized: true }),
}));
