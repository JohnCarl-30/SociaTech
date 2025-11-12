import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBzvweKbhffci_vAB8FyqCiMwAAXlxS494",
  authDomain: "sociatech-f7441.firebaseapp.com",
  projectId: "sociatech-f7441",
  storageBucket: "sociatech-f7441.firebasestorage.app",
  messagingSenderId: "581753415151",
  appId: "1:581753415151:web:2a7222bc4e38f52453c21a",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
