// firestoreService.js
import { db } from "./firebase.js";

export function crearPerfilUsuario(user, nombrePantalla = null) {
  const uid = user.uid;
  const correo = user.email;
  const nombre = nombrePantalla || user.displayName || "Usuario sin nombre";
  const avatar = "Avatar1.png";

  return db.collection("usuarios").doc(uid).set({
    uid,
    nombrePantalla: nombre,
    correo,
    avatar,
    librosFavoritos: [],
    mostrarMasTarde: [],
    amigos: [],
    resenas: []
  });
}

// Obtener el nombrePantalla del usuario y ejecutar una acción con él
export function mostrarNombre(uid, callback) {
  db.collection("usuarios").doc(uid).get()
    .then((doc) => {
      if (doc.exists) {
        const datos = doc.data();
        callback(datos.nombrePantalla || "Usuario");
      } else {
        console.warn("No se encontró el perfil del usuario en Firestore.");
        callback("Usuario");
      }
    })
    .catch((error) => {
      console.error("Error al obtener el nombre del usuario:", error);
      callback("Usuario");
    });
}

export function avatarUsuario(uid, callback) {
  db.collection("usuarios").doc(uid).get()
  .then((doc) => {
    if (doc.exists) {
      const datos = doc.data();
      callback(datos.avatar);
    } else {
      console.warn("No se encontró el perfil del usuario en Firestore.");
      callback("Usuario");
    }
  })
  .catch((error) => {
    console.error("Error al obtener el nombre del usuario:", error);
    callback("Usuario");
  });
}
