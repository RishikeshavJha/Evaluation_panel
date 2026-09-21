import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDOSSB3OQlPCf4Armvag7k5dNnlGVcdqCU",
  authDomain: "ieee-colloquium.firebaseapp.com",
  databaseURL: "https://ieee-colloquium-default-rtdb.firebaseio.com",
  projectId: "ieee-colloquium",
  storageBucket: "ieee-colloquium.firebasestorage.app",
  messagingSenderId: "914616555571",
  appId: "1:914616555571:web:bbb428406970d9596a2b46",
  measurementId: "G-XTXEM3XYLJ",
};

// Prevent duplicate initialization
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
