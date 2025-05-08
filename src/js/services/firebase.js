// FIREBASE.JS -- ÁNGEL MARTÍNEZ ORDIALES

// === CONFIGURACIÓN DE FIREBASE ===
// --- Datos del proyecto de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCyfskaPgGRuWW3S4jYUrv_jK5K1fVwQOc",
  authDomain: "proyectolectura-ccc5a.firebaseapp.com",
  projectId: "proyectolectura-ccc5a",
  storageBucket: "proyectolectura-ccc5a.firebasestorage.app",
  messagingSenderId: "767987672244",
  appId: "1:767987672244:web:c520b4619e48d8cd17e3e1",
  measurementId: "G-RKD269TL31"
};

// === INICIALIZACIÓN DE FIREBASE ===
// --- Inicializa Firebase con la configuración proporcionada
firebase.initializeApp(firebaseConfig);

// === EXPORTACIONES ===
// --- Exporta las instancias de autenticación y base de datos para usarlas en otros módulos
export const auth = firebase.auth();
export const db = firebase.firestore();
