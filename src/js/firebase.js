// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAZskdUe09OsY5nfkucc2cChLHhmD0TZnI",
    authDomain: "social-reader-9b7a2.firebaseapp.com",
    projectId: "social-reader-9b7a2",
    storageBucket: "social-reader-9b7a2.firebasestorage.app",
    messagingSenderId: "288679986999",
    appId: "1:288679986999:web:507818b8bb451a85a5fcb2",
    measurementId: "G-QEHQRTVDQ0"
  };
  
  // Inicializar Firebase y Firebase Authentication
  firebase.initializeApp(firebaseConfig);
  export const auth = firebase.auth();
  