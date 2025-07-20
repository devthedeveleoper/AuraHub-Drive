import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true, // <-- Add this: true by default
      setUser: (userData) => set({ user: userData, isAuthenticated: true, isLoading: false }),
      logout: () => set({ user: null, isAuthenticated: false, isLoading: false }),
      stopLoading: () => set({ isLoading: false }), // <-- Add this
    }),
    {
      name: 'auth-storage',
    }
  )
);

export default useAuthStore;