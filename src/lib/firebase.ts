
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your Firebase configuration
// Note: These are public keys that are meant to be exposed in client-side code
const firebaseConfig = {
  apiKey: "AIzaSyDummyKeyReplace-With-Your-Actual-Key",
  authDomain: "crop-view-insights.firebaseapp.com",
  projectId: "crop-view-insights",
  storageBucket: "crop-view-insights.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:a1b2c3d4e5f6a7b8c9d0e1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
