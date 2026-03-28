import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// 👇 paste your config here
const firebaseConfig = {
  apiKey: "AIzaSyDEwjioTniRKNsAytTmSG4xaIuyf8ZQy1E",
  authDomain: "denpartner-fd031.firebaseapp.com",
  projectId: "denpartner-fd031",
  storageBucket: "denpartner-fd031.firebasestorage.app",
  messagingSenderId: "682705629107",
  appId: "1:682705629107:web:cc5e7002df31cd149925c6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services
export const auth = getAuth(app);
export const db = getFirestore(app);