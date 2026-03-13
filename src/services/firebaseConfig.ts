import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getAuth, 
  initializeAuth, 
  // @ts-ignore
  getReactNativePersistence,
  browserLocalPersistence
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";
import { Platform } from "react-native";

// Firebase configuration — values loaded from .env (EXPO_PUBLIC_ prefix required by Expo)
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase (avoid duplicate initialization on hot reloads)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

let authInternal: any;

try {
  if (Platform.OS === 'web') {
    authInternal = initializeAuth(app, {
      persistence: browserLocalPersistence,
    });
  } else {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    authInternal = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  }
} catch (error) {
  // auth has already been initialized
  authInternal = getAuth(app);
}

export const auth = authInternal;
export const db = getFirestore(app);

// Analytics support check
isSupported().then(yes => yes && getAnalytics(app));

export default app;
