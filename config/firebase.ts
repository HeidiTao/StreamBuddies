// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, Firestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCb_IYOgrgLTkImqF2UWf3hsQDwqC3jB8w",
  authDomain: "mobileappsgroup-3a749.firebaseapp.com",
  projectId: "mobileappsgroup-3a749",
  storageBucket: "mobileappsgroup-3a749.firebasestorage.app",
  messagingSenderId: "388735524763",
  appId: "1:388735524763:web:93bc2ee9cfa622aeaa8b3e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and EXPORT the Firestore DB object (the missing step)
export const db: Firestore = getFirestore(app);