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
  deleteAccount: () => Promise<void>;
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

      let resData: any = {};
      try {
        resData = await res.json();
      } catch (e) {
        if (!res.ok) throw new Error('Gagal menghubungi server (Respons non-JSON)');
      }
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
      if (user.token) {
        localStorage.setItem('vibe_commit_token', user.token);
      }
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

      let resData: any = {};
      try {
        resData = await res.json();
      } catch (e) {
        if (!res.ok) throw new Error('Gagal menghubungi server (Respons non-JSON)');
      }
      if (!res.ok) {
        throw new Error(resData.error || 'Gagal mendaftarkan akun');
      }

      useToastStore.getState().toast({
        title: 'Operative Created!',
        description: `Akun berhasil dibuat. Silakan login untuk melanjutkan.`,
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

      let resData: any = {};
      try {
        resData = await res.json();
      } catch (e) {
        if (!res.ok) throw new Error('Gagal menghubungi server (Respons non-JSON)');
      }
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
      if (user.token) {
        localStorage.setItem('vibe_commit_token', user.token);
      }
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
      localStorage.removeItem('vibe_commit_token');
      set({ user: null });
      useToastStore.getState().toast({ title: 'System Deactivated', description: 'Operative logged out.', type: 'info' });
    } catch (error) {
      console.error(error);
      useToastStore.getState().toast({ title: 'Gagal Logout', type: 'error' });
    }
  },

  deleteAccount: async () => {
    try {
      const localUserStr = localStorage.getItem('vibe_commit_user');
      const token = localStorage.getItem('vibe_commit_token');
      if (localUserStr) {
        const user = JSON.parse(localUserStr);
        const userId = user.id || user.uid;
        if (!userId) {
          throw new Error("ID Pengguna tidak ditemukan di penyimpanan lokal.");
        }

        const headers: Record<string, string> = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        const res = await fetch(`/api/user/${userId}`, {
          method: 'DELETE',
          headers
        });
        if (!res.ok) {
          let errorMsg = 'Gagal menghapus akun di server';
          try {
            const resData = await res.json();
            errorMsg = resData.error || errorMsg;
          } catch (jsonErr) {
            try {
              const resText = await res.text();
              if (resText) {
                errorMsg = resText;
              }
            } catch (txtErr) { }
          }

          // Jika unauthorized atau forbidden (sesi tidak valid), bersihkan data lokal saja agar user tidak stuck
          if (res.status === 401 || res.status === 403) {
            console.warn(`Server authentication error (${res.status}): ${errorMsg}. Clearing local storage anyway.`);
            useToastStore.getState().toast({
              title: 'Sesi Kedaluwarsa',
              description: 'Sesi server tidak valid. Penyimpanan lokal dibersihkan agar Anda dapat masuk kembali.',
              type: 'info'
            });
          } else {
            throw new Error(`${errorMsg} (HTTP ${res.status})`);
          }
        }
      }

      // Bersihkan total storage klien
      localStorage.clear();
      sessionStorage.clear();

      // Hapus cache PWA service worker
      if ('caches' in window) {
        try {
          const keys = await caches.keys();
          await Promise.all(keys.map(key => caches.delete(key)));
        } catch (e) {
          console.error('Failed to clear caches:', e);
        }
      }

      set({ user: null });
      useToastStore.getState().toast({
        title: 'Account Permanently Deleted',
        description: 'Seluruh data Anda telah dihapus secara permanen dari server dan perangkat lokal.',
        type: 'success'
      });
    } catch (error: any) {
      console.error(error);
      useToastStore.getState().toast({
        title: 'Delete Account Failed',
        description: error.message || 'Gagal menghapus akun. Silakan coba kembali.',
        type: 'error'
      });
      throw error;
    }
  },


  initAuth: () => {
    const localUserStr = localStorage.getItem('vibe_commit_user');
    const token = localStorage.getItem('vibe_commit_token');

    if (localUserStr && token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp && Date.now() / 1000 > payload.exp) {
          throw new Error('Token expired');
        }

        const user = JSON.parse(localUserStr);
        const mapped = {
          uid: user.id,
          displayName: user.username,
          email: `${user.username.toLowerCase()}@local`
        };
        set({ user: mapped, isLoading: false });
      } catch (e) {
        localStorage.removeItem('vibe_commit_user');
        localStorage.removeItem('vibe_commit_token');
        set({ user: null, isLoading: false });
      }
    } else {
      set({ user: null, isLoading: false });
    }
    return () => { };
  }
}));

