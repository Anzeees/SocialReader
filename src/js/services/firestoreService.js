// firestoreService.js
import { db } from "./firebase.js";

// Crear perfil de usuario
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

// Obtener nombre del usuario
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

// Obtener avatar del usuario
export function avatarUsuario(uid, callback) {
  db.collection("usuarios").doc(uid).get()
    .then((doc) => {
      if (doc.exists) {
        const datos = doc.data();
        callback(datos.avatar);
      } else {
        console.warn("No se encontró el perfil del usuario en Firestore.");
        callback("Avatar1.png");
      }
    })
    .catch((error) => {
      console.error("Error al obtener el avatar del usuario:", error);
      callback("Avatar1.png");
    });
}

// === FAVORITOS ===

// Añadir libro a favoritos
export async function agregarLibroFavorito(uid, claveLibro) {
  try {
    const docRef = db.collection("usuarios").doc(uid);
    await docRef.update({
      librosFavoritos: firebase.firestore.FieldValue.arrayUnion(claveLibro)
    });
  } catch (error) {
    console.error("Error al añadir a favoritos:", error);
  }
}

// Quitar libro de favoritos
export async function eliminarLibroFavorito(uid, claveLibro) {
  try {
    const docRef = db.collection("usuarios").doc(uid);
    await docRef.update({
      librosFavoritos: firebase.firestore.FieldValue.arrayRemove(claveLibro)
    });
  } catch (error) {
    console.error("Error al quitar de favoritos:", error);
  }
}

// Consultar si un libro está en favoritos
export async function estaEnFavoritos(uid, claveLibro) {
  try {
    const docSnap = await db.collection("usuarios").doc(uid).get();
    const favoritos = docSnap.data()?.librosFavoritos || [];
    return favoritos.includes(claveLibro);
  } catch (error) {
    console.error("Error al consultar favoritos:", error);
    return false;
  }
}

// === MOSTRAR MÁS TARDE ===

// Añadir libro a mostrar más tarde
export async function agregarMostrarMasTarde(uid, claveLibro) {
  try {
    const docRef = db.collection("usuarios").doc(uid);
    await docRef.update({
      mostrarMasTarde: firebase.firestore.FieldValue.arrayUnion(claveLibro)
    });
  } catch (error) {
    console.error("Error al añadir a mostrar más tarde:", error);
  }
}

// Quitar libro de mostrar más tarde
export async function eliminarMostrarMasTarde(uid, claveLibro) {
  try {
    const docRef = db.collection("usuarios").doc(uid);
    await docRef.update({
      mostrarMasTarde: firebase.firestore.FieldValue.arrayRemove(claveLibro)
    });
  } catch (error) {
    console.error("Error al quitar de mostrar más tarde:", error);
  }
}

// Consultar si un libro está en mostrar más tarde
export async function estaEnMostrarMasTarde(uid, claveLibro) {
  try {
    const docSnap = await db.collection("usuarios").doc(uid).get();
    const lista = docSnap.data()?.mostrarMasTarde || [];
    return lista.includes(claveLibro);
  } catch (error) {
    console.error("Error al consultar mostrar más tarde:", error);
    return false;
  }
}
