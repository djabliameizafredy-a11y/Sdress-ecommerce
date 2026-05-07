import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, OAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export const PRODUCTS_COLLECTION = 'products';
export const CONFIG_COLLECTION = 'config';

export const googleProvider = new GoogleAuthProvider();
export const appleProvider = new OAuthProvider('apple.com');

export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);
export const signInWithApple = () => signInWithPopup(auth, appleProvider);
