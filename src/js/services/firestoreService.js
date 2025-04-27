// FIRESTORESERVICE.JS -- ÁNGEL MARTÍNEZ ORDIALES

// === IMPORTACIONES ===
import { db } from "./firebase.js";

// === CREACIÓN DE PERFIL DE USUARIO ===

/**
 * Crea un perfil de usuario en Firestore al registrarse.
 * @param {object} user - Usuario de Firebase.
 * @param {string|null} nombrePantalla - Nombre a mostrar del usuario (opcional).
 * @returns {Promise} Promesa que crea el documento en Firestore.
 */
export function crearPerfilUsuario(user, nombrePantalla = null) {
  const uid = user.uid;
  const correo = user.email;
  const nombre = nombrePantalla || user.displayName || "Usuario sin nombre";
  const avatar = "Avatar1.png";
  const fechaAlta = firebase.firestore.FieldValue.serverTimestamp();

  return db.collection("usuarios").doc(uid).set({
    uid,
    nombrePantalla: nombre,
    correo,
    avatar,
    librosFavoritos: [],
    mostrarMasTarde: [],
    amigos: [],
    resenas: [],
    fechaAlta
  });
}

// === OBTENER DATOS DE USUARIO ===

/**
 * Muestra el nombre de un usuario dado su UID.
 * @param {string} uid - ID del usuario.
 * @param {function} callback - Función callback con el nombre.
 */
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

/**
 * Muestra el avatar de un usuario dado su UID.
 * @param {string} uid - ID del usuario.
 * @param {function} callback - Función callback con la ruta del avatar.
 */
export function avatarUsuario(uid, callback) {
  db.collection("usuarios").doc(uid).get()
    .then((doc) => {
      if (doc.exists) {
        const datos = doc.data();
        callback(datos.avatar || "Avatar1.png");
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

/**
 * Obtiene el documento completo del usuario.
 * @param {string} uid - ID del usuario.
 * @returns {Promise<object|null>} Datos del usuario o null si no existe.
 */
export async function obtenerDocumentoUsuario(uid) {
  try {
    const snapshot = await db.collection("usuarios").doc(uid).get();
    if (snapshot.exists) {
      return snapshot.data();
    } else {
      console.warn("No se encontró el documento del usuario.");
      return null;
    }
  } catch (error) {
    console.error("Error obteniendo documento del usuario:", error);
    return null;
  }
}

/**
 * Obtiene todos los usuarios registrados.
 * @returns {Promise<Array<object>>} Lista de usuarios.
 */
export async function obtenerTodosUsuarios() {
  try {
    const snapshot = await db.collection("usuarios").get();
    return snapshot.docs.map(doc => doc.data());
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    return [];
  }
}

// === FAVORITOS ===

/**
 * Agrega un libro a la lista de favoritos del usuario.
 * @param {string} uid - ID del usuario.
 * @param {string} claveLibro - ID del libro.
 */
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

/**
 * Elimina un libro de la lista de favoritos del usuario.
 * @param {string} uid - ID del usuario.
 * @param {string} claveLibro - ID del libro.
 */
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

/**
 * Comprueba si un libro está en favoritos del usuario.
 * @param {string} uid - ID del usuario.
 * @param {string} claveLibro - ID del libro.
 * @returns {Promise<boolean>} True si está en favoritos.
 */
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

/**
 * Agrega un libro a la lista "mostrar más tarde" del usuario.
 * @param {string} uid - ID del usuario.
 * @param {string} claveLibro - ID del libro.
 */
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

/**
 * Elimina un libro de la lista "mostrar más tarde" del usuario.
 * @param {string} uid - ID del usuario.
 * @param {string} claveLibro - ID del libro.
 */
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

/**
 * Comprueba si un libro está en "mostrar más tarde" del usuario.
 * @param {string} uid - ID del usuario.
 * @param {string} claveLibro - ID del libro.
 * @returns {Promise<boolean>} True si está en la lista.
 */
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

// === GESTIÓN DE AMIGOS ===

/**
 * Agrega un amigo al usuario.
 * @param {string} uidUsuario - ID del usuario.
 * @param {string} uidNuevoAmigo - ID del nuevo amigo.
 */
export async function agregarAmigo(uidUsuario, uidNuevoAmigo) {
  try {
    const usuarioRef = db.collection("usuarios").doc(uidUsuario);
    await usuarioRef.update({
      amigos: firebase.firestore.FieldValue.arrayUnion(uidNuevoAmigo)
    });
  } catch (error) {
    console.error("Error al agregar amigo:", error);
  }
}

/**
 * Elimina un amigo del usuario.
 * @param {string} uidUsuario - ID del usuario.
 * @param {string} uidAmigo - ID del amigo a eliminar.
 */
export async function eliminarAmigo(uidUsuario, uidAmigo) {
  try {
    const usuarioRef = db.collection("usuarios").doc(uidUsuario);
    await usuarioRef.update({
      amigos: firebase.firestore.FieldValue.arrayRemove(uidAmigo)
    });
  } catch (error) {
    console.error("Error al eliminar amigo:", error);
  }
}

// === GESTIÓN DE RESEÑAS ===

/**
 * Crea una nueva reseña de un libro.
 * @param {string} uid - ID del usuario.
 * @param {string} idLibro - ID del libro.
 * @param {string} review - Texto de la reseña.
 * @param {number} valoracion - Valoración del libro (1-5).
 * @param {boolean} spoilers - Indica si contiene spoilers.
 * @returns {Promise} Promesa de creación.
 */
export function crearResena(uid, idLibro, review, valoracion, spoilers) {
  const fecha = new Date().toISOString();
  const idResena = `${uid}-${idLibro}-${fecha}`;

  const nuevaResena = {
    idresena: idResena,
    uid: uid,
    idlibro: idLibro,
    review: review,
    valoracion: valoracion,
    spoilers: spoilers
  };

  const resenaRef = db.collection("resenas").doc(idResena);
  const usuarioRef = db.collection("usuarios").doc(uid);

  return resenaRef.set(nuevaResena)
    .then(() => {
      return usuarioRef.update({
        resenas: firebase.firestore.FieldValue.arrayUnion(idResena)
      });
    });
}

/**
 * Obtiene todas las reseñas de un usuario.
 * @param {string} uid - ID del usuario.
 * @returns {Promise<Array<object>>} Lista de reseñas.
 */
export async function obtenerResenasDeUsuario(uid) {
  const snapshot = await db.collection("resenas").where("uid", "==", uid).get();
  return snapshot.docs.map(doc => doc.data());
}

/**
 * Obtiene las reseñas de un libro ordenadas por valoración.
 * @param {string} idLibro - ID del libro.
 * @returns {Promise<Array<object>>} Lista de reseñas.
 */
export async function obtenerResenasLibro(idLibro) {
  try {
    const snapshot = await db.collection("resenas")
      .where("idlibro", "==", idLibro)
      .orderBy("valoracion", "desc")
      .get();

    const resenas = [];
    snapshot.forEach(doc => resenas.push(doc.data()));
    return resenas;
  } catch (error) {
    console.error("Error obteniendo reseñas:", error);
    return [];
  }
}

/**
 * Obtiene un usuario por su UID.
 * @param {string} uid - ID del usuario.
 * @returns {Promise<object>} Datos del usuario o valores por defecto.
 */
export async function obtenerUsuarioPorUID(uid) {
  try {
    const doc = await db.collection("usuarios").doc(uid).get();
    if (doc.exists) {
      return doc.data();
    } else {
      return { nombrePantalla: "Usuario desconocido", avatar: "Avatar4.png" };
    }
  } catch (error) {
    console.error("Error obteniendo usuario:", error);
    return { nombrePantalla: "Usuario desconocido", avatar: "Avatar4.png" };
  }
}
