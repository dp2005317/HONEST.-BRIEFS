import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBO_hb49NDI4c4LFidf3OSVadBtq5XG-DE",
  authDomain: "studio-5026483346-4f14a.firebaseapp.com",
  projectId: "studio-5026483346-4f14a",
  storageBucket: "studio-5026483346-4f14a.firebasestorage.app",
  messagingSenderId: "860415567277",
  appId: "1:860415567277:web:0dc1b147f20efdd105ad24"
};

// Initialize Firebase for Client-side
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
