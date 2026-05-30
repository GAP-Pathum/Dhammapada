import { createContext, useContext, useState, useEffect } from 'react';
import { auth, db, googleProvider } from '../lib/firebase';
import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  doc,
  collection,
  writeBatch,
} from 'firebase/firestore';

/**
 * iOS Safari is the ONLY major browser that reliably blocks popups.
 * Chrome on Android DOES support popups from user gestures and should use
 * signInWithPopup — signInWithRedirect is broken on Chrome due to SameSite/
 * third-party cookie restrictions (Firebase known issue since Chrome 80+).
 */
function isIosSafari() {
  const ua = navigator.userAgent;
  const isIos = /iPhone|iPad|iPod/i.test(ua);
  // CriOS = Chrome on iOS, FxiOS = Firefox on iOS — both support popups
  const isSafariEngine = !/CriOS|FxiOS|EdgiOS|OPiOS/i.test(ua);
  return isIos && isSafariEngine;
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [signingIn, setSigningIn] = useState(false);
  const [authError, setAuthError] = useState(null);
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

  // Sync guest data to Firestore on first login
  const syncGuestData = async (uid) => {
    try {
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
    // Handle the return from signInWithRedirect (iOS Safari flow)
    getRedirectResult(auth)
      .then(async (result) => {
        if (result?.user) {
          await syncGuestData(result.user.uid);
        }
      })
      .catch((err) => {
        console.error('Redirect result error:', err);
        if (err.code && err.code !== 'auth/no-auth-event') {
          setAuthError(getReadableError(err.code));
        }
      });

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
      if (firebaseUser) {
        await syncGuestData(firebaseUser.uid);
      }
    });
    return unsubscribe;
  }, []);

  const loginWithGoogle = async () => {
    setAuthError(null);
    setSigningIn(true);
    try {
      if (isIosSafari()) {
        // iOS Safari blocks popups — use redirect flow
        // (note: Android Chrome must NOT use redirect; it breaks due to cookie policy)
        await signInWithRedirect(auth, googleProvider);
        // Page navigates away; result handled by getRedirectResult on return
        return;
      }

      // Chrome desktop, Chrome Android, Firefox, Edge — all support popup
      const result = await signInWithPopup(auth, googleProvider);
      setSigningIn(false);
      return result.user;
    } catch (err) {
      setSigningIn(false);
      if (err.code === 'auth/popup-blocked') {
        // Browser blocked the popup despite user gesture — fall back to redirect
        try {
          await signInWithRedirect(auth, googleProvider);
        } catch (redirectErr) {
          const msg = getReadableError(redirectErr.code);
          setAuthError(msg);
          throw redirectErr;
        }
        return;
      }
      if (err.code !== 'auth/popup-closed-by-user' && err.code !== 'auth/cancelled-popup-request') {
        const msg = getReadableError(err.code);
        setAuthError(msg);
        console.error('Google Sign-In Error:', err.code, err.message);
      }
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
    if (!user) setChatCount((c) => c + 1);
  };

  const isLocked = !user && chatCount >= 3;

  const value = {
    user,
    loading,
    signingIn,
    authError,
    chatCount,
    incrementChatCount,
    isLocked,
    loginWithGoogle,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function getReadableError(code) {
  switch (code) {
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection and try again.';
    case 'auth/too-many-requests':
      return 'Too many sign-in attempts. Please wait a moment and try again.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support.';
    case 'auth/unauthorized-domain':
      return 'Sign-in is not authorised for this domain. Please contact support.';
    case 'auth/operation-not-allowed':
      return 'Google sign-in is not enabled. Please contact support.';
    case 'auth/internal-error':
      return 'An internal error occurred. Please try again.';
    default:
      return 'Sign-in failed. Please try again.';
  }
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
