// DETALLES.JS -- ÁNGEL MARTÍNEZ ORDIALES -- SOCIALREADER --
// ===========================================================
// Proyecto: SocialReader
// Autor: Ángel Martínez Ordiales
// Archivo: detalles.js
// Descripción: Vista de detalles de libros y gestión de reseñas.
// ===========================================================

// === IMPORTACIONES ===
import { agregarLibroFavorito, eliminarLibroFavorito, estaEnFavoritos, agregarMostrarMasTarde, eliminarMostrarMasTarde, estaEnMostrarMasTarde, obtenerResenasLibro, obtenerUsuarioPorUID } from "./services/firestoreService.js";
import { obtenerDetallesLibro } from "./services/openlibrary.js";
import { configurarMenuHamburguesa, configurarMenuPerfil, desactivarBotonTemporalmente, configurarLecturaExpandida } from "./utils/uiUtils.js";
import { cerrarSesion } from "./utils/authUtils.js";
import { cargarDatosUsuario } from "./utils/perfilUtils.js";
import { mostrarModalError } from "./utils/modales.js";
import { mostrarToast } from "./utils/toastUtils.js";

// === VARIABLES DEL DOM ===
const mainContent = document.getElementById("mainContent");
const loader = document.getElementById("loader");

// === CONFIGURACIÓN INTERFAZ ===
configurarMenuHamburguesa();
configurarMenuPerfil();

// === GESTIÓN DE SESIÓN (Cerrar sesión escritorio y móvil) ===
["exitescritorio", "exitmovil"].forEach(id => {
  const btn = document.getElementById(id);
  if (btn) {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      cerrarSesion();
    });
  }
});

// === CARGA DE DATOS DEL USUARIO AUTENTICADO ===
firebase.auth().onAuthStateChanged((user) => {
  if (user) cargarDatosUsuario(user.uid);
});

// === FUNCIONES PRINCIPALES ===
function obtenerWorkIdDesdeHash() {
  const hash = window.location.hash;
  const partes = hash.split("/");
  return partes.length === 2 ? partes[1] : null;
}

const workId = obtenerWorkIdDesdeHash();

if (workId && mainContent) {
  mainContent.hidden = false;
  loader.style.display = "flex";
  obtenerDetallesLibro(workId).then(async libro => {
    loader.style.display = "none";

    if (!libro) {
      mostrarModalError("No se ha encontrado el libro solicitado. Intenta buscar otro.", "#search");
      return;
    }

    const user = firebase.auth().currentUser;
    const clave = libro.id;
    let favIcon = "./assets/img/interface/favdesdetails.png";
    let mostrarIcon = "./assets/img/interface/marcdesdetails.png";

    if (user) {
      if (await estaEnFavoritos(user.uid, clave)) favIcon = "./assets/img/interface/favact.png";
      if (await estaEnMostrarMasTarde(user.uid, clave)) mostrarIcon = "./assets/img/interface/marcdetails.png";
    }

    mainContent.innerHTML = crearTarjetaDetalle(libro, favIcon, mostrarIcon);

    configurarEventosBotones(libro, user);
    cargarResenasLibro(libro.id);
    configurarLecturaExpandida("biografiaAutor", "leerMasBio");
  }).catch((error) => {
    loader.style.display = "none";
    mostrarModalError("Error al cargar los detalles del libro. Intenta de nuevo más tarde.");
    console.error(error);
  });
} else {
  loader.style.display = "none";
  mostrarModalError("Libro no encontrado. Intenta acceder de nuevo.", "#home");
}

// === FUNCIONES AUXILIARES ===
function configurarEventosBotones(libro, user) {
  const btnFav = document.querySelector(".btn-fav");
  const btnMostrar = document.querySelector(".btn-mostrar");
  const btnResena = document.querySelector(".btn-resena");

  if (user) {
    btnFav.addEventListener("click", async (e) => {
      e.stopPropagation();
      desactivarBotonTemporalmente(btnFav);

      const esta = await estaEnFavoritos(user.uid, libro.id);
      if (esta) {
        await eliminarLibroFavorito(user.uid, libro.id);
        btnFav.querySelector("img").src = "./assets/img/interface/favdesdetails.png";
        mostrarToast("Libro eliminado de Favoritos", "error");
      } else {
        await agregarLibroFavorito(user.uid, libro.id);
        btnFav.querySelector("img").src = "./assets/img/interface/favact.png";
        mostrarToast("Libro añadido a Favoritos", "success");
      }
    });

    btnMostrar.addEventListener("click", async (e) => {
      e.stopPropagation();
      desactivarBotonTemporalmente(btnMostrar);

      const esta = await estaEnMostrarMasTarde(user.uid, libro.id);
      if (esta) {
        await eliminarMostrarMasTarde(user.uid, libro.id);
        btnMostrar.querySelector("img").src = "./assets/img/interface/marcdesdetails.png";
        mostrarToast("Libro eliminado de Leer más tarde", "error");
      } else {
        await agregarMostrarMasTarde(user.uid, libro.id);
        btnMostrar.querySelector("img").src = "./assets/img/interface/marcdetails.png";
        mostrarToast("Libro añadido a Leer más tarde", "success");
      }
    });

    btnResena.addEventListener("click", (e) => {
      e.stopPropagation();
      desactivarBotonTemporalmente(btnResena);
      window.location.hash = `#resena/${libro.id}`;
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    });
  }
}

function cargarResenasLibro(idLibro) {
  const contenedor = document.getElementById("contenedorResenas");
  if (!contenedor) return;

  obtenerResenasLibro(idLibro).then(async (resenas) => {
    if (!resenas.length) {
      contenedor.innerHTML = "<p>No hay reseñas disponibles para este libro.</p>";
      return;
    }

    const tarjetas = await Promise.all(resenas.map(async (resena) => {
      const usuario = await obtenerUsuarioPorUID(resena.uid);
      return crearEtiquetaResena(usuario, resena);
    }));

    contenedor.innerHTML = tarjetas.join("");

    document.querySelectorAll(".spoiler-toggle").forEach(boton => {
      boton.addEventListener("click", () => {
        boton.outerHTML = `<div class="texto-resena">${boton.dataset.texto}</div>`;
      });
    });
  }).catch((error) => {
    console.error("Error cargando reseñas:", error);
    contenedor.innerHTML = "<p>No se pudieron cargar las reseñas en este momento.</p>";
  });
}

function crearTarjetaDetalle(libro, favIcon, mostrarIcon) {
  return `
    <div class="detalle-libro">
      <div class="colizq">
        <img src="${libro.portada}" class="portada" alt="Portada del libro">
        <div class="acciones-libro">
          <button class="accion btn-mostrar" data-id="${libro.id}">
            <img src="${mostrarIcon}" alt="Guardar para más tarde"> Leer más tarde
          </button>
          <button class="accion btn-fav" data-id="${libro.id}">
            <img src="${favIcon}" alt="Favorito"> Mis Favoritos
          </button>
          <button class="resena btn-resena" data-id="${libro.id}">
            <img src="./assets/img/interface/nueva-resena.png" alt="Reseña"> Nueva Reseña
          </button>
        </div>
      </div>
      <div class="coldrch">
        <h2>${libro.titulo}</h2>
        <p><strong>Autor:</strong> ${libro.autor}</p>
        <p><strong>Editorial:</strong> ${libro.editorial}</p>
        <p><strong>Año de publicación:</strong> ${libro.añoPublicacion}</p>
        <p><strong>Páginas:</strong> ${libro.paginas}</p>
        <p><strong>Idioma:</strong> ${libro.idiomas.join(", ")}</p>
        <p><strong>Géneros:</strong> ${libro.generos.join(", ")}</p>
        <p><strong>Sinopsis:</strong> ${libro.sinopsis}</p>

        ${libro.biografiaAutor ? `
        <p><strong>Sobre el autor:</strong></p>
        <p id="biografiaAutor" class="biografia-corta">${libro.biografiaAutor}</p>
        <button id="leerMasBio" class="boton-leer-mas">Leer más</button>
        ` : ''}

        <div id="contenedorResenas" class="contenedor-resenas"></div>
      </div>
    </div>
  `;
}

function crearEtiquetaResena(usuario, resena) {
  const estrellas = "★".repeat(resena.valoracion) + "☆".repeat(5 - resena.valoracion);
  return `
    <div class="etiqueta-resena">
      <img src="./assets/img/avatars/${usuario.avatar}" alt="Avatar">
      <div class="contenido-resena">
        <div class="nombre-usuario">${usuario.nombrePantalla}</div>
        <div class="estrellas-resena">${estrellas}</div>
        ${resena.spoilers 
          ? `<button class="spoiler-toggle" data-texto="${resena.review}">Esta reseña contiene spoilers. Pulsa para ver.</button>` 
          : `<div class="texto-resena">${resena.review}</div>`}
      </div>
    </div>
  `;
}
