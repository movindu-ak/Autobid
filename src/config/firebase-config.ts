// src/config/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Replace these with your Firebase project's config
const firebaseConfig = {
  apiKey: "AIzaSyDEMOKEY123456789",
  authDomain: "autobid-demo.firebaseapp.com",
  projectId: "autobid-demo",
  storageBucket: "autobid-demo.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123def456"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Auth & Provider
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
