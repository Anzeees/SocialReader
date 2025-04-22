// firestoreService.js
import { db } from "./firebase.js";

// Crear perfil de usuario
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

// === FAVORITOS ===

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

// Obtener documento completo del usuario
export async function obtenerDocumentoUsuario(uid) {
  try {
    const ref = db.collection("usuarios").doc(uid);
    const snapshot = await ref.get();
    if (snapshot.exists) {
      return snapshot.data();
    } else {
      console.warn("No se encontró el documento del usuario");
      return null;
    }
  } catch (error) {
    console.error("Error obteniendo documento del usuario:", error);
    return null;
  }
}

// Obtener usuarios por correo
export async function obtenerUidPorCorreo(correo) {
  try {
    const snapshot = await db.collection("usuarios")
      .where("correo", "==", correo)
      .get();

    if (snapshot.empty) {
      console.log("No se encontró ningún usuario con ese correo.");
      return [];
    }

    const uids = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      uids.push(data.uid);
    });

    return uids;
  } catch (error) {
    console.error("Error al buscar usuarios por correo:", error);
    return [];
  }
}

// Obtener amigos del usuario
export function obtenerAmigos(uid, callback) {
  db.collection("usuarios").doc(uid).get()
    .then(doc => {
      if (doc.exists) {
        const datos = doc.data();
        const amigos = datos.amigos || [];
        callback(amigos);
      } else {
        callback([]);
      }
    })
    .catch(err => {
      console.error("Error al obtener amigos:", err);
      callback([]);
    });
}

// Obtener usuarios por nombre (usando un rango de búsqueda)
export async function obtenerUsuariosPorNombre(nombreBusqueda, uidActual) {
  try {
    const snapshot = await db.collection("usuarios")
      .orderBy("nombrePantalla")
      .startAt(nombreBusqueda)
      .endAt(nombreBusqueda + "\uf8ff")
      .get();

    const usuarios = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (doc.id !== uidActual) {
        usuarios.push({ ...data, uid: doc.id });
      }
    });

    return usuarios;
  } catch (error) {
    console.error("Error al buscar usuarios por nombre:", error);
    return [];
  }
}

// Agregar amigo
export function agregarAmigo(uid, uidAmigo) {
  const usuarioRef = db.collection("usuarios").doc(uid);
  const amigoRef = db.collection("usuarios").doc(uidAmigo);

  amigoRef.get().then((docAmigo) => {
    if (!docAmigo.exists) return;

    const datosAmigo = docAmigo.data();
    const amigoObj = {
      uid: uidAmigo,
      nombrePantalla: datosAmigo.nombrePantalla,
      correo: datosAmigo.correo,
      avatar: datosAmigo.avatar || "Avatar1.png",
    };

    usuarioRef.update({
      amigos: firebase.firestore.FieldValue.arrayUnion(amigoObj),
    }).then(() => {
      console.log("Amigo agregado");

      db.collection("usuarios").doc(uid).get().then((docUsuario) => {
        const datosUsuario = docUsuario.data();
        const yo = {
          uid: uid,
          nombrePantalla: datosUsuario.nombrePantalla,
          correo: datosUsuario.correo,
          avatar: datosUsuario.avatar || "Avatar1.png",
        };

        amigoRef.update({
          amigos: firebase.firestore.FieldValue.arrayUnion(yo),
        });
      });
    });
  });
}
