import { create } from 'zustand';
import { Unsubscribe, User, onAuthStateChanged } from 'firebase/auth';
import { auth, loginWithGoogle, logout, getRedirectResult } from '../shared/services/firebase';
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
    } catch (error: any) {
      console.error('Login error:', error);
      const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
      
      // Handle specific Firebase errors
      if (error.code === 'auth/popup-closed-by-user') {
        useToastStore.getState().toast({ 
          title: 'Popup Ditutup', 
          description: 'Mohon jangan tutup popup login. Coba lagi.', 
          type: 'error' 
        });
      } else if (error.code === 'auth/popup-blocked') {
        useToastStore.getState().toast({ 
          title: 'Popup Diblokir', 
          description: 'Browser memblokir popup. Aktifkan popup di pengaturan.', 
          type: 'error' 
        });
      } else if (error.code === 'auth/unauthorized-domain') {
        useToastStore.getState().toast({ 
          title: 'Domain Tidak Diizinkan', 
          description: `Tambahkan domain ini ke Firebase Auth > Settings > Authorized domains: ${currentOrigin || 'origin saat ini'}.`, 
          type: 'error' 
        });
      } else if (error.code === 'auth/network-request-failed') {
        useToastStore.getState().toast({ 
          title: 'Koneksi Gagal', 
          description: 'Firebase Emulator tidak berjalan. Jalankan: firebase emulators:start', 
          type: 'error' 
        });
      } else {
        useToastStore.getState().toast({ 
          title: 'Gagal Login', 
          description: `Error: ${error.message || 'Unknown error'}`, 
          type: 'error' 
        });
      }
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
    // Process redirect result when app initializes
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          useToastStore.getState().toast({ title: 'Login Berhasil!', type: 'success' });
        }
      })
      .catch((error: any) => {
        console.error('Redirect login error:', error);
        const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
        
        if (error.code === 'auth/unauthorized-domain') {
          useToastStore.getState().toast({ 
            title: 'Domain Tidak Diizinkan', 
            description: `Tambahkan domain ini ke Firebase Auth > Settings > Authorized domains: ${currentOrigin || 'origin saat ini'}.`, 
            type: 'error' 
          });
        } else if (error.code === 'auth/network-request-failed') {
          useToastStore.getState().toast({ 
            title: 'Koneksi Gagal', 
            description: 'Firebase Emulator tidak berjalan.', 
            type: 'error' 
          });
        } else {
          useToastStore.getState().toast({ 
            title: 'Gagal Login', 
            description: `Error: ${error.message || 'Unknown error'}`, 
            type: 'error' 
          });
        }
      });

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
