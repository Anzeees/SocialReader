// PROFILE.JS -- ÁNGEL MARTÍNEZ ORDIALES

// === IMPORTACIONES ===
// --- Servicios de Firebase y OpenLibrary
import { obtenerDocumentoUsuario, obtenerTodosUsuarios, agregarAmigo, eliminarAmigo } from "./services/firestoreService.js";
import { obtenerResumenLibro } from "./services/openlibrary.js";
import { accionesMenu } from "./nav.js";

// === VARIABLES GLOBALES ===
// const mainContent = document.getElementById("mainContent");

accionesMenu();
async function cargarDatosUsuario(uid) {
  const datos = await obtenerDocumentoUsuario(uid);
  if (!datos) return;

  document.getElementById("nombrePerfil").textContent = datos.nombrePantalla || "Sin nombre";
  document.getElementById("correoPerfil").textContent = datos.correo || "-";
  document.getElementById("fechaAlta").textContent = formatearFecha(datos.fechaAlta);
  document.getElementById("avatarGrande").src = `./assets/img/avatars/${datos.avatar || "Avatar1.png"}`;

  await mostrarLibrosUsuario(datos.librosFavoritos, "contenedor-favoritos");
  await mostrarLibrosUsuario(datos.mostrarMasTarde, "contenedor-mas-tarde");
  await mostrarAmigos(uid, datos.amigos, "contenedor-mis-amigos");
  await mostrarNuevosAmigos(uid, datos.amigos);
}

function formatearFecha(timestamp) {
  if (!timestamp || typeof timestamp.toDate !== "function") return "Sin fecha";
  const fecha = timestamp.toDate();
  return fecha.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

async function mostrarLibrosUsuario(lista, contenedorId) {
  const contenedor = document.getElementById(contenedorId);
  if (!contenedor || !Array.isArray(lista)) return;
  contenedor.innerHTML = "";

  for (const clave of lista) {
    try {
      const datos = await obtenerResumenLibro(clave);
      const titulo = datos.titulo || "Sin título";
      const portada = datos.portada || "./assets/img/interface/placeholder-libro.png";

      const div = document.createElement("div");
      div.className = "libro-item";
      div.addEventListener("click", () => {
        window.location.hash = `#detalle/${clave}`;
      });
      div.innerHTML = `
        <img src="${portada}" alt="${titulo}">
        <div class="overlay">${titulo}</div>
      `;
      contenedor.appendChild(div);
    } catch (err) {
      console.warn("No se pudo obtener datos para:", clave, err);
    }
  }
}

async function mostrarAmigos(uidUsuario, listaUids, contenedorId) {
  const contenedor = document.getElementById(contenedorId);
  contenedor.innerHTML = "";

  for (let uid of listaUids) {
    try {
      uid = uid.replaceAll('"', '').trim();
      if (!uid) continue;

      const amigo = await obtenerDocumentoUsuario(uid);
      if (!amigo) continue;

      const div = document.createElement("div");
      div.className = "amigo";
      div.innerHTML = `
        <img src="./assets/img/avatars/${amigo.avatar || 'Avatar1.png'}" alt="Avatar">
        <div class="info">
          <p class="nombre">${amigo.nombrePantalla || "Usuario"}</p>
          <p class="correo">${amigo.correo || "-"}</p>
        </div>
        <div class="estado verde" data-uid="${uid}"></div>
      `;
      div.querySelector(".estado").addEventListener("click", async () => {
        await eliminarAmigo(uidUsuario, uid);
        cargarDatosUsuario(uidUsuario);
      });
      contenedor.appendChild(div);
    } catch (error) {
      console.warn("No se pudo cargar amigo con UID:", uid, error);
    }
  }
}

async function mostrarNuevosAmigos(uidUsuario, listaAmigos) {
  const contenedor = document.getElementById("contenedor-nuevos-amigos");
  contenedor.innerHTML = "";
  const todos = await obtenerTodosUsuarios();
  for (const usuario of todos) {
    if (!usuario.uid || usuario.uid === uidUsuario || listaAmigos.includes(usuario.uid)) continue;
    const div = document.createElement("div");
    div.className = "amigo";
    div.innerHTML = `
      <img src="./assets/img/avatars/${usuario.avatar || 'Avatar1.png'}" alt="Avatar">
      <div class="info">
        <p class="nombre">${usuario.nombrePantalla || "Usuario"}</p>
        <p class="correo">${usuario.correo || "-"}</p>
      </div>
      <div class="estado" data-uid="${usuario.uid}"></div>
    `;
    div.querySelector(".estado").addEventListener("click", async () => {
      await agregarAmigo(uidUsuario, usuario.uid);
      cargarDatosUsuario(uidUsuario);
    });
    contenedor.appendChild(div);
  }
}

// === NAVEGACIÓN POR PESTAÑAS ===
document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((t) => t.classList.remove("activo"));
    tab.classList.add("activo");

    document.querySelectorAll(".contenido-tabs > div").forEach((div) => {
      div.style.display = "none";
    });

    const idContenido = tab.getAttribute("data-tab");
    const seccionActiva = document.getElementById(idContenido);
    if (seccionActiva) {
      seccionActiva.style.display = "block";
    }
  });
});

// === SELECCIÓN DE AVATAR ===
let avatarSeleccionado = null;

document.getElementById("avatarGrande").addEventListener("click", () => {
  document.getElementById("selectorAvatar").classList.toggle("oculto");
});

document.querySelectorAll(".grid-avatars img").forEach(img => {
  img.addEventListener("click", () => {
    document.querySelectorAll(".grid-avatars img").forEach(i => i.classList.remove("seleccionado"));
    img.classList.add("seleccionado");
    avatarSeleccionado = img.dataset.avatar;
  });
});

document.getElementById("guardarAvatar").addEventListener("click", async () => {
  if (!avatarSeleccionado) return document.getElementById("selectorAvatar").classList.add("oculto");
  const user = firebase.auth().currentUser;
  if (!user) return;

  // Guardar avatar en Firestore
  await firebase.firestore().collection("usuarios").doc(user.uid).update({
    avatar: avatarSeleccionado
  });

  // Actualizar en pantalla
  document.getElementById("avatarGrande").src = `./assets/img/avatars/${avatarSeleccionado}`;
  document.querySelector(".perfil-movil img").src = `./assets/img/avatars/${avatarSeleccionado}`;
  document.querySelector(".perfil img").src = `./assets/img/avatars/${avatarSeleccionado}`;

  document.getElementById("selectorAvatar").classList.add("oculto");
  avatarSeleccionado = null;
});