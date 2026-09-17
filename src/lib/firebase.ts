/**
 * Firebase Configuration
 * 
 * SECURITY NOTE: Firestore Security Rules are NOT applied in this Phase 1 build.
 * The database runs in open/test mode. Do not deploy publicly with real data
 * until Security Rules are added (Phase 2).
 * 
 * The PIN is stored in Firestore — NOT in source code, NOT in local config.
 * It is managed entirely through the app's frontend.
 */

import { initializeApp } from 'firebase/app';
import { initializeFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAysyC8s4CrgGAn6gUaoa-gYk-K7t8Dxsg",
  authDomain: "store-a47de.firebaseapp.com",
  projectId: "store-a47de",
  storageBucket: "store-a47de.firebasestorage.app",
  messagingSenderId: "890730840320",
  appId: "1:890730840320:web:e959265caf4bfdc39073e5"
};

export const app = initializeApp(firebaseConfig);

export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Google Sign-In persists indefinitely per device (Section 11.1)
setPersistence(auth, browserLocalPersistence).catch(console.error);

// Firestore collection names
export const COLLECTIONS = {
  items: 'items',
  sales: 'sales',
  expenses: 'expenses',
  settings: 'settings',
  sessions: 'sessions',
} as const;

// Document IDs
export const DOC_IDS = {
  globalSettings: 'global-settings',
  pinSettings: 'pin-settings',
} as const;
