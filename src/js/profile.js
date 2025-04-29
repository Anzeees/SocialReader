/* 
==========================================
Script: PROFILE.JS (Refactorizado)
Proyecto: Social Reader
Autor: Ángel Martínez Ordiales
Fecha de última modificación: Abril 2025
Descripción: Lógica de la vista de perfil
==========================================
*/

// === IMPORTACIONES ===
import { mostrarNombre, avatarUsuario, obtenerDocumentoUsuario, obtenerTodosUsuarios, agregarAmigo, eliminarAmigo, obtenerResenasDeUsuario } from "./services/firestoreService.js";
import { obtenerResumenLibro } from "./services/openlibrary.js";
import { configurarMenuHamburguesa, configurarMenuPerfil } from "./utils/uiUtils.js";
import { cerrarSesion } from "./utils/authUtils.js";

// === CONFIGURACIÓN INTERFAZ ===
configurarMenuHamburguesa();
configurarMenuPerfil();

["exitescritorio", "exitmovil"].forEach((id) => {
  const btn = document.getElementById(id);
  if (btn) {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      cerrarSesion();
    });
  }
});

document.querySelector("#nombreUsuario")?.addEventListener("click", () => {
  window.location.hash = "#profile";
});

document.querySelector(".perfil-menu a[href='#profile']")?.addEventListener("click", (e) => {
  e.preventDefault();
  window.location.hash = "#profile";
});

// === CARGA DE DATOS DE USUARIO AUTENTICADO ===
firebase.auth().onAuthStateChanged(async (user) => {
  if (!user) return;

  mostrarNombre(user.uid, (nombre) => {
    const h5Usuario = document.getElementById("nombreUsuarioMovil");
    if (h5Usuario) h5Usuario.textContent = nombre;
  });

  avatarUsuario(user.uid, (avatar) => {
    const imgUsuario = document.getElementById("avatarMovil");
    const imgUsuarioEscritorio = document.getElementById("avatarEscritorio");
    if (imgUsuarioEscritorio) imgUsuarioEscritorio.src = `./assets/img/avatars/${avatar}`;
    if (imgUsuario) imgUsuario.src = `./assets/img/avatars/${avatar}`;
  });

  cargarDatosUsuario(user.uid);
});

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
  await mostrarResenasUsuario(uid);
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

  if (lista.length === 0) {
    contenedor.innerHTML = `<p class='mensaje-vacio'>No tienes libros en esta lista todavía.</p>`;
    return;
  }

  for (const clave of lista) {
    try {
      const datos = await obtenerResumenLibro(clave);
      const titulo = datos.titulo || "Sin título";
      const portada = datos.portada || "./assets/img/interface/placeholder-libro.png";

      const div = document.createElement("div");
      div.className = "libro-item";
      div.innerHTML = `
        <img src="${portada}" alt="${titulo}">
        <div class="overlay">${titulo}</div>
      `;
      div.addEventListener("click", () => {
        window.location.hash = `#detalle/${clave}`;
      });

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
      div.querySelector(".estado").addEventListener("click", async (e) => {
        e.stopPropagation();
        e.currentTarget.disabled = true;
        await eliminarAmigo(uidUsuario, uid);
        await cargarDatosUsuario(uidUsuario);
      });
      contenedor.appendChild(div);
    } catch (error) {
      console.warn("No se pudo cargar amigo con UID:", uid, error);
    }
  }
}

async function mostrarNuevosAmigos(uidUsuario, listaAmigos) {
  const contenedor = document.getElementById("contenedor-nuevos-amigos");
  const inputBusqueda = document.getElementById("input-buscar-amigos");
  contenedor.innerHTML = "";

  const todos = await obtenerTodosUsuarios();
  if (!inputBusqueda) return;

  let offset = 0;
  const limite = 10;

  function renderizar(amigosFiltrados, reiniciar = false) {
    if (reiniciar) {
      contenedor.innerHTML = "";
      offset = 0;
    }

    const nuevos = amigosFiltrados.slice(offset, offset + limite);

    for (const usuario of nuevos) {
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
      div.querySelector(".estado").addEventListener("click", async (e) => {
        e.stopPropagation();
        e.currentTarget.disabled = true;
        await agregarAmigo(uidUsuario, usuario.uid);
        await cargarDatosUsuario(uidUsuario);
      });
      contenedor.appendChild(div);
    }

    offset += limite;
  }

  let amigosFiltrados = todos;

  inputBusqueda.addEventListener("input", (e) => {
    const texto = e.target.value.toLowerCase();
    amigosFiltrados = todos.filter((usuario) => {
      return (
        usuario.nombrePantalla?.toLowerCase().includes(texto) ||
        usuario.correo?.toLowerCase().includes(texto)
      );
    });
    renderizar(amigosFiltrados, true);
  });

  contenedor.addEventListener("scroll", () => {
    if (contenedor.scrollLeft + contenedor.clientWidth >= contenedor.scrollWidth - 100) {
      renderizar(amigosFiltrados);
    }
  });

  renderizar(amigosFiltrados);
}

// === NAVEGACIÓN ENTRE PESTAÑAS ===
let pestañaActivaIndex = 0;
const tabs = Array.from(document.querySelectorAll(".tab"));

function activarTab(index) {
  tabs.forEach((t) => t.classList.remove("activo"));
  tabs[index].classList.add("activo");

  const contenidos = document.querySelectorAll(".contenido-tabs > div");
  contenidos.forEach((div) => div.classList.remove("activo-tab"));

  const idContenido = tabs[index].getAttribute("data-tab");
  const seccionActiva = document.getElementById(idContenido);
  if (!seccionActiva) return;

  seccionActiva.classList.add("activo-tab");
  pestañaActivaIndex = index;
}

tabs.forEach((tab, index) => {
  tab.addEventListener("click", () => activarTab(index));
});

if (window.location.hash === "#profile") {
  activarTab(0);
}
window.addEventListener("hashchange", () => {
  if (window.location.hash === "#profile") {
    activarTab(0);
  }
});

// === SELECCIÓN Y CAMBIO DE AVATAR ===
let avatarSeleccionado = null;

document.getElementById("avatarGrande").addEventListener("click", () => {
  const selector = document.getElementById("selectorAvatar");
  if (selector.classList.contains("mostrar")) {
    selector.classList.remove("mostrar");
    selector.classList.add("ocultar");
    setTimeout(() => selector.classList.add("oculto"), 300);
  } else {
    selector.classList.remove("oculto", "ocultar");
    selector.classList.add("mostrar");
  }
});

document.querySelectorAll(".grid-avatars img").forEach((img) => {
  img.addEventListener("click", () => {
    document.querySelectorAll(".grid-avatars img").forEach((i) => i.classList.remove("seleccionado"));
    img.classList.add("seleccionado");
    avatarSeleccionado = img.dataset.avatar;
  });
});

document.getElementById("guardarAvatar").addEventListener("click", async () => {
  if (!avatarSeleccionado) {
    cerrarSelectorAvatar();
    return;
  }
  const user = firebase.auth().currentUser;
  if (!user) return;

  await firebase.firestore().collection("usuarios").doc(user.uid).update({
    avatar: avatarSeleccionado,
  });

  document.getElementById("avatarGrande").src = `./assets/img/avatars/${avatarSeleccionado}`;
  document.getElementById("avatarMovil").src = `./assets/img/avatars/${avatarSeleccionado}`;
  document.getElementById("avatarEscritorio").src = `./assets/img/avatars/${avatarSeleccionado}`;

  cerrarSelectorAvatar();
  avatarSeleccionado = null;
});

function cerrarSelectorAvatar() {
  const selector = document.getElementById("selectorAvatar");
  selector.classList.remove("mostrar");
  selector.classList.add("ocultar");
  setTimeout(() => {
    selector.classList.add("oculto");
  }, 300);
}

async function mostrarResenasUsuario(uid) {
  const contenedor = document.getElementById("mis-resenas");
  contenedor.innerHTML = "";

  const resenas = await obtenerResenasDeUsuario(uid);
  if (resenas.length === 0) {
    contenedor.innerHTML = `<p class='mensaje-vacio'>No has publicado ninguna reseña todavía.</p>`;
    return;
  }

  for (const resena of resenas) {
    const datos = await obtenerResumenLibro(resena.idlibro);
    const titulo = datos.titulo || "Título desconocido";
    const portada = datos.portada || "./assets/img/interface/placeholder-libro.png";

    const div = document.createElement("div");
    div.className = "tarjeta-resena";
    div.innerHTML = `
      <div class="imagen-resena">
        <img src="${portada}" alt="${titulo}">
      </div>
      <div class="contenido-resena">
        <h4>${titulo}</h4>
        <div class="valoracion">
          ${Array.from({ length: 5 }, (_, i) => `
            <img src="./assets/img/interface/${i < resena.valoracion ? 'estrellaact' : 'estrellades'}.png" 
                 alt="${i < resena.valoracion ? 'Estrella activa' : 'Estrella desactivada'}" 
                 class="estrella-resena">
          `).join('')}
        </div>
        <p class="texto-resena">${resena.review || "Sin texto de reseña."}</p>
      </div>
    `;

    div.addEventListener("click", () => {
      window.location.hash = `#detalle/${resena.idlibro}`;
    });

    contenedor.appendChild(div);
  }
}