import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, getRedirectResult, GoogleAuthProvider, signOut } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
const firebaseConfig = (import.meta as any).env?.VITE_FIREBASE_CONFIG || {};

const app = initializeApp(firebaseConfig);

export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
}, firebaseConfig.firestoreDatabaseId);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
// Force Google to always show the account selection screen
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const loginWithGoogle = () => signInWithPopup(auth, googleProvider);
export { getRedirectResult };
export const logout = () => signOut(auth);
