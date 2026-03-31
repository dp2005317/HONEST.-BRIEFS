import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

// Configuration for streamly-a54ac project
const firebaseConfig = {
  apiKey: "AIzaSyA1W7jyIamDSvVvOz577V_RDO3XKlvTuYw",
  authDomain: "streamly-a54ac.firebaseapp.com",
  projectId: "streamly-a54ac",
  storageBucket: "streamly-a54ac.firebasestorage.app",
  messagingSenderId: "1025835833189",
  appId: "1:1025835833189:web:7ac05d1b2e6bfe77de338c",
  databaseURL: "https://streamly-a54ac-default-rtdb.firebaseio.com"
};

// Initialize Firebase for Client-side
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const rtdb = getDatabase(app);

export { app, auth, db, rtdb };
