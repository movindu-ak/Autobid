// src/config/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAod0TDZTxMO4OGEnHHSfAue2iExua2P0k",
  authDomain: "autobid-b2739.firebaseapp.com",
  projectId: "autobid-b2739",
  storageBucket: "autobid-b2739.firebasestorage.app",
  messagingSenderId: "154882260757",
  appId: "1:154882260757:web:551a5c371fe6b0b64b331c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Auth & Provider
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Configure Google provider to reduce COOP warnings
googleProvider.setCustomParameters({
  prompt: 'select_account'
});
