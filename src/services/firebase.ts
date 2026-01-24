import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, indexedDBLocalPersistence } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import { Platform } from 'react-native';

// Firebase configuration
// Get these from: Firebase Console > Project Settings > General > Your apps > SDK setup and configuration
const firebaseConfig = {
  apiKey: "AIzaSyBlwZ-k9TMwJ7Ngu1qLSqaTmPUfxllB1Qs",
  authDomain: "stretchapp-cf32c.firebaseapp.com",
  projectId: "stretchapp-cf32c",
  storageBucket: "stretchapp-cf32c.firebasestorage.app",
  messagingSenderId: "270934121081",
  appId: "1:270934121081:web:0da1e84b228d4ec28e92a8",
  measurementId: "G-848RR1FPDD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth with platform-specific persistence
let auth;
if (Platform.OS === 'web') {
  // For web, use indexedDBLocalPersistence (browser default)
  auth = initializeAuth(app, {
    persistence: indexedDBLocalPersistence
  });
} else {
  // For React Native, use AsyncStorage persistence
  // Note: getReactNativePersistence is only available on React Native
  const AsyncStorage = require('@react-native-async-storage/async-storage').default;
  // @ts-ignore - This import only works on React Native
  const { getReactNativePersistence } = require('firebase/auth');
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
}

// Initialize Firestore with offline persistence
const firestore = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});

export { auth, firestore };
export default app;
