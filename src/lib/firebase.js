import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  getAuth,
  GoogleAuthProvider,
} from "firebase/auth";
import { initializeFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

if (!firebaseConfig.apiKey || !firebaseConfig.projectId || !firebaseConfig.appId) {
  throw new Error(
    "Missing Firebase environment variables. Check VITE_FIREBASE_API_KEY, VITE_FIREBASE_PROJECT_ID, and VITE_FIREBASE_APP_ID."
  );
}

firebaseConfig.authDomain =
  import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || `${firebaseConfig.projectId}.firebaseapp.com`;

const app = initializeApp(firebaseConfig);
const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;

const auth = getAuth(app);

auth.useDeviceLanguage();

const db = initializeFirestore(app, {
  // Force long-polling — more reliable on mobile networks & behind proxies
  experimentalForceLongPolling: true,
});

const googleProvider = new GoogleAuthProvider();
googleProvider.addScope("email");
googleProvider.addScope("profile");
// Always show account picker, even when only one account is signed in
googleProvider.setCustomParameters({ prompt: "select_account" });

export { app, analytics, auth, db, googleProvider };

