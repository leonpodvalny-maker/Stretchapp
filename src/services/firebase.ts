import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
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

// Initialize Firebase Auth (uses browser persistence automatically on web)
const auth = getAuth(app);

// Initialize Firestore (uses default persistence on web)
const firestore = getFirestore(app);

export { auth, firestore };
export default app;
