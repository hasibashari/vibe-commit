// Local Session Utility to manage offline/local authenticated users.
// This replaces the old Firebase authentication structures.

export interface CurrentSessionUser {
  uid: string;
  displayName: string;
  email: string;
}

export const getCurrentUser = (): CurrentSessionUser | null => {
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
};
