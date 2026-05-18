import { create } from 'zustand';
import { useToastStore } from './toastStore';

interface LocalUser {
  uid: string;
  displayName: string;
  email: string;
}

interface AuthStore {
  user: LocalUser | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  loginAsGuest: () => Promise<void>;
  logout: () => Promise<void>;
  initAuth: () => () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isLoading: true,
  
  login: async (username, password) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || 'Kredensial tidak valid');
      }

      const { user } = resData;
      const mapped = {
        uid: user.id,
        displayName: user.username,
        email: `${user.username.toLowerCase()}@local`
      };
      
      localStorage.setItem('vibe_commit_user', JSON.stringify(user));
      set({ user: mapped });
      useToastStore.getState().toast({ title: 'System Activated!', description: `Welcome back, Operative ${user.username}.`, type: 'success' });
    } catch (error: any) {
      console.error(error);
      useToastStore.getState().toast({ 
        title: 'Authentication Failed', 
        description: error.message || 'Periksa kembali username dan password Anda.', 
        type: 'error' 
      });
      throw error;
    }
  },

  register: async (username, password) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || 'Gagal mendaftarkan akun');
      }

      const { user } = resData;
      const mapped = {
        uid: user.id,
        displayName: user.username,
        email: `${user.username.toLowerCase()}@local`
      };
      
      localStorage.setItem('vibe_commit_user', JSON.stringify(user));
      set({ user: mapped });
      useToastStore.getState().toast({ 
        title: 'Operative Created!', 
        description: `Stats calibrated. Welcome to the Nexus, ${user.username}!`, 
        type: 'success' 
      });
    } catch (error: any) {
      console.error(error);
      useToastStore.getState().toast({ 
        title: 'Failed to Register', 
        description: error.message || 'Pastikan username unik dan minimal 2 karakter.', 
        type: 'error' 
      });
      throw error;
    }
  },

  loginAsGuest: async () => {
    try {
      const res = await fetch('/api/auth/guest', {
        method: 'POST'
      });
      
      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || 'Gagal membuat sesi guest');
      }

      const { user } = resData;
      const mapped = {
        uid: user.id,
        displayName: user.username,
        email: `${user.username.toLowerCase()}@local`
      };
      
      localStorage.setItem('vibe_commit_user', JSON.stringify(user));
      set({ user: mapped });
      useToastStore.getState().toast({ 
        title: 'Guest Session Initiated', 
        description: `Welcome, ${user.username}. Progress is stored locally.`, 
        type: 'info' 
      });
    } catch (error: any) {
      console.error(error);
      useToastStore.getState().toast({ 
        title: 'Guest Log In Failed', 
        description: error.message || 'Kesalahan sistem saat membuat data tamu.', 
        type: 'error' 
      });
      throw error;
    }
  },
  
  logout: async () => {
    try {
      localStorage.removeItem('vibe_commit_user');
      set({ user: null });
      useToastStore.getState().toast({ title: 'System Deactivated', description: 'Operative logged out.', type: 'info' });
    } catch (error) {
      console.error(error);
      useToastStore.getState().toast({ title: 'Gagal Logout', type: 'error' });
    }
  },
  
  initAuth: () => {
    const localUserStr = localStorage.getItem('vibe_commit_user');
    if (localUserStr) {
      try {
        const user = JSON.parse(localUserStr);
        const mapped = {
          uid: user.id,
          displayName: user.username,
          email: `${user.username.toLowerCase()}@local`
        };
        set({ user: mapped, isLoading: false });
      } catch (e) {
        localStorage.removeItem('vibe_commit_user');
        set({ user: null, isLoading: false });
      }
    } else {
      set({ user: null, isLoading: false });
    }
    return () => {};
  }
}));
