import { initializeApp, getApp, getApps } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, signInWithCustomToken } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase services
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
  popupRedirectResolver: undefined,
});
const db = getFirestore(app);
const storage = getStorage(app);

// Function to sign in to Firebase with a Clerk token
export async function signInWithClerk(token: string) {
  try {
    const userCredentials = await signInWithCustomToken(auth, token);
    return userCredentials.user;
  } catch (error) {
    console.error('Error signing in with Clerk token:', error);
    throw error;
  }
}

export { app, auth, db, storage }; 