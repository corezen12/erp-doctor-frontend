// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, serverTimestamp } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAWh4oVfSZYNOngiJx4rBQ2jrIkeXrd4OE",
  authDomain: "gform-ebe75.firebaseapp.com",
  projectId: "gform-ebe75",
  storageBucket: "gform-ebe75.firebasestorage.app",
  messagingSenderId: "372727146544",
  appId: "1:372727146544:web:215824c15f5e284a9f25f5",
  measurementId: "G-GVCYFR6CV3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getFirestore(app);
export { serverTimestamp };