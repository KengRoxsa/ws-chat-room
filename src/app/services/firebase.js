import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyDST3-YW5rntL8jtbMWFPna9BBxVUAUkO4",
    authDomain: "web-socket-chat-495db.firebaseapp.com",
    projectId: "web-socket-chat-495db",
    storageBucket: "web-socket-chat-495db.firebasestorage.app",
    messagingSenderId: "688376414472",
    appId: "1:688376414472:web:444defec41d07cf7572cbd",
    measurementId: "G-RYTWZR0L9G"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and export Auth
export const auth = getAuth(app);

// Google Auth Provider
const provider = new GoogleAuthProvider();
provider.setCustomParameters({
    prompt: "select_account",
});

// Sign in with Google
export const signInWithGoogle = () => signInWithPopup(auth, provider);

// (Optional) Sign out function
export const signOutUser = () => signOut(auth);
