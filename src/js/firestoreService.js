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
    amigos: []
  });
}
