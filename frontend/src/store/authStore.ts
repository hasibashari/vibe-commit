import { create } from 'zustand';
import { Unsubscribe, User, onAuthStateChanged } from 'firebase/auth';
import { auth, loginWithGoogle, logout } from '../shared/services/firebase';
import { useToastStore } from './toastStore';

interface AuthStore {
  user: User | null;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  initAuth: () => Unsubscribe;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isLoading: true,
  
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
      useToastStore.getState().toast({ title: 'Logout Berhasil', type: 'info' });
    } catch (error) {
      console.error(error);
      useToastStore.getState().toast({ title: 'Gagal Logout', type: 'error' });
    }
  },
  
  initAuth: () => {
    return onAuthStateChanged(auth, (user) => {
      set({ user, isLoading: false });
    });
  }
}));
