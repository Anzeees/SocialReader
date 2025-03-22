// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

//Configuracion de la web app de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAZskdUe09OsY5nfkucc2cChLHhmD0TZnI",
  authDomain: "social-reader-9b7a2.firebaseapp.com",
  projectId: "social-reader-9b7a2",
  storageBucket: "social-reader-9b7a2.firebasestorage.app",
  messagingSenderId: "288679986999",
  appId: "1:288679986999:web:53634e20c2ca04e4a5fcb2",
  measurementId: "G-N1QZN2GFN3"
};

// Inicioalizo AppFirebase y otros modulos
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);