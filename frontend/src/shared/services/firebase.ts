// Mocking Firebase Client for 100% Offline Local Integration
// This maintains type safety and prevents compilation errors in other components.

export const db = {} as any;

export const auth = {
  get currentUser() {
    const localUserStr = localStorage.getItem('vibe_commit_user');
    if (!localUserStr) return null;
    try {
      const user = JSON.parse(localUserStr);
      return {
        uid: user.id,
        displayName: user.username,
        email: `${user.username.toLowerCase()}@local`
      };
    } catch (e) {
      return null;
    }
  }
} as any;

export const googleProvider = {} as any;

export const loginWithGoogle = async () => {
  throw new Error("Google login is disabled in offline mode");
};

export const logout = async () => {
  localStorage.removeItem('vibe_commit_user');
};
