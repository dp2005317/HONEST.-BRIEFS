import { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut 
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  onSnapshot 
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [preferences, setPreferences] = useState({ interestedTopics: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubPrefs = null;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        
        // Listen for user preference changes in Firestore
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        
        try {
          // Check if user document exists, if not create it
          const docSnap = await getDoc(userDocRef);
          if (!docSnap.exists()) {
            await setDoc(userDocRef, {
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              interestedTopics: [],
              createdAt: new Date().toISOString()
            });
          }

          if (unsubPrefs) unsubPrefs(); // clear previous if any
          unsubPrefs = onSnapshot(userDocRef, (doc) => {
            if (doc.exists()) {
              setPreferences(doc.data());
            }
          });
        } catch (dbError) {
          console.error("Firestore Error on Init:", dbError);
          alert(`ACTION REQUIRED: Cloud Firestore Database not found or permission denied.\n\nPlease go to Firebase Console (studio-5026483346-4f14a) -> Firestore Database -> 'Create database'. Start in Production mode.\n\nError details: ${dbError.message}`);
        }

      } else {
        setUser(null);
        setPreferences({ interestedTopics: [] });
        if (unsubPrefs) {
          unsubPrefs();
          unsubPrefs = null;
        }
      }
      setLoading(false);
    });

    return () => {
      unsubscribe();
      if (unsubPrefs) unsubPrefs();
    };
  }, []);

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in with Google:", error);
      if (error.code === 'auth/configuration-not-found') {
        alert("ACTION REQUIRED: Firebase Authentication is currently disabled for this project.\n\nPlease go to your Firebase Console (studio-5026483346-4f14a) -> Authentication -> Sign-in Method, and explicitly enable 'Google' as a provider.");
      } else if (error.code === 'auth/unauthorized-domain') {
        alert("ACTION REQUIRED: You enabled Google Sign-In, but Firebase is blocking this Vercel URL!\n\n1. Go to Firebase Console -> Authentication -> Settings (tab) -> Authorized domains.\n2. Click 'Add domain' and paste: the-daily-edition-tau.vercel.app\n3. Save and try again.");
      } else {
        alert(`Authentication Error: ${error.message}`);
      }
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  const updatePreferences = async (newTopics) => {
    if (!user) return;
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, { interestedTopics: newTopics }, { merge: true });
    } catch (error) {
      console.error("Error updating preferences", error);
      alert(`ACTION REQUIRED: Failed to save preferences.\n\nEnsure you have created a 'Cloud Firestore' database in your Firebase Console (studio-5026483346-4f14a). Error: ${error.message}`);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      preferences, 
      updatePreferences, 
      loginWithGoogle, 
      logout, 
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
