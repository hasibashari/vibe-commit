import { create } from 'zustand';
import { Unsubscribe, User, onAuthStateChanged } from 'firebase/auth';
import { auth, loginWithGoogle, logout } from '../shared/services/firebase';
import { useToastStore } from './toastStore';

interface AuthStore {
  user: User | null;
  isLoading: boolean;
  hasCompletedOnboarding: boolean;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  initAuth: () => Unsubscribe;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isLoading: true,
  hasCompletedOnboarding: localStorage.getItem('hasCompletedOnboarding_v3') === 'true',
  
  completeOnboarding: () => {
    localStorage.setItem('hasCompletedOnboarding_v3', 'true');
    set({ hasCompletedOnboarding: true });
  },

  resetOnboarding: () => {
    localStorage.removeItem('hasCompletedOnboarding_v3');
    set({ hasCompletedOnboarding: false });
  },

  login: async () => {
    try {
      await loginWithGoogle();
      useToastStore.getState().toast({ title: 'Login Berhasil!', type: 'success' });
    } catch (error) {
      console.error(error);
      useToastStore.getState().toast({ title: 'Gagal Login', description: 'Pastikan koneksi internet lancar.', type: 'error' });
    }
  },
  
  logout: async () => {
    try {
      await logout();
      localStorage.removeItem('hasCompletedOnboarding_v3');
      set({ hasCompletedOnboarding: false });
      useToastStore.getState().toast({ title: 'Logout Berhasil', type: 'info' });
    } catch (error) {
      console.error(error);
      useToastStore.getState().toast({ title: 'Gagal Logout', type: 'error' });
    }
  },
  
  initAuth: () => {
    return onAuthStateChanged(auth, (user) => {
      // If user is logged in, optionally set onboarding to true automatically
      if (user) {
        localStorage.setItem('hasCompletedOnboarding_v3', 'true');
        set({ user, isLoading: false, hasCompletedOnboarding: true });
      } else {
        set({ user, isLoading: false });
      }
    });
  }
}));
