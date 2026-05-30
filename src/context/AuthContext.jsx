import { createContext, useContext, useState, useEffect } from 'react';
import { auth, db, googleProvider } from '../lib/firebase';
import { 
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  doc, 
  collection, 
  writeBatch 
} from 'firebase/firestore';

/** Returns true on iOS/Android mobile browsers where popups are unreliable */
function isMobileBrowser() {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chatCount, setChatCount] = useState(() => {
    try {
      const val = localStorage.getItem('dhamma_chat_count');
      return val ? parseInt(val, 10) : 0;
    } catch {
      return 0;
    }
  });

  useEffect(() => {
    localStorage.setItem('dhamma_chat_count', chatCount.toString());
  }, [chatCount]);

  // Sync guest data to user Firestore database on login
  const syncGuestData = async (uid) => {
    try {
      // 1. Sync Meditation History
      const localHistoryJson = localStorage.getItem('dhamma_meditation_history');
      if (localHistoryJson) {
        const localHistory = JSON.parse(localHistoryJson);
        if (Array.isArray(localHistory) && localHistory.length > 0) {
          const historyRef = collection(db, 'users', uid, 'history');
          const batch = writeBatch(db);
          localHistory.forEach((session) => {
            const docRef = doc(historyRef);
            batch.set(docRef, {
              durationMins: session.durationMins || 5,
              date: session.date || new Date().toLocaleDateString(),
              type: session.type || 'Mindfulness',
              timestamp: session.timestamp ? new Date(session.timestamp) : new Date(),
            });
          });
          await batch.commit();
          localStorage.removeItem('dhamma_meditation_history');
        }
      }

      // 2. Sync Meditation Plans
      const localPlansJson = localStorage.getItem('dhamma_meditation_plans');
      if (localPlansJson) {
        const localPlans = JSON.parse(localPlansJson);
        if (Array.isArray(localPlans) && localPlans.length > 0) {
          const plansRef = collection(db, 'users', uid, 'plans');
          const batch = writeBatch(db);
          localPlans.forEach((plan) => {
            const docRef = doc(plansRef);
            batch.set(docRef, {
              dayOfWeek: plan.dayOfWeek || 'Everyday',
              time: plan.time || '07:00',
              durationMins: plan.durationMins || 15,
              active: plan.active !== undefined ? plan.active : true,
              timestamp: new Date(),
            });
          });
          await batch.commit();
          localStorage.removeItem('dhamma_meditation_plans');
        }
      }
    } catch (err) {
      console.error('Error syncing guest data to Firestore:', err);
    }
  };

  useEffect(() => {
    // Handle redirect result from signInWithRedirect (mobile auth flow)
    getRedirectResult(auth)
      .then(async (result) => {
        if (result?.user) {
          await syncGuestData(result.user.uid);
        }
      })
      .catch((err) => {
        console.error('Redirect sign-in error:', err);
      });

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
      if (firebaseUser) {
        // Sync guest data upon login
        await syncGuestData(firebaseUser.uid);
      }
    });
    return unsubscribe;
  }, []);

  const loginWithGoogle = async () => {
    try {
      if (isMobileBrowser()) {
        // Mobile browsers block popups — use redirect flow instead
        await signInWithRedirect(auth, googleProvider);
        // Page will navigate away; result is handled in getRedirectResult above
        return;
      }
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (err) {
      // Popup blocked fallback: fall back to redirect
      if (err.code === 'auth/popup-blocked' || err.code === 'auth/popup-closed-by-user') {
        await signInWithRedirect(auth, googleProvider);
        return;
      }
      console.error('Google Sign-In Error:', err);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Sign-Out Error:', err);
    }
  };

  const incrementChatCount = () => {
    if (!user) {
      setChatCount((c) => c + 1);
    }
  };

  const isLocked = !user && chatCount >= 3;

  const value = {
    user,
    loading,
    chatCount,
    incrementChatCount,
    isLocked,
    loginWithGoogle,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
