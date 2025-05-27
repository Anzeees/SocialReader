// DETALLES.JS -- SOCIALREADER -- Vista de detalles de libros y gestión de reseñas

import {
  agregarLibroFavorito,
  eliminarLibroFavorito,
  estaEnFavoritos,
  agregarMostrarMasTarde,
  eliminarMostrarMasTarde,
  estaEnMostrarMasTarde,
  obtenerResenasLibro,
  obtenerUsuarioPorUID
} from "./services/firestoreService.js";

import { obtenerDetallesLibro } from "./services/openlibrary.js";
import {
  configurarMenuHamburguesa,
  configurarMenuPerfil,
  desactivarBotonTemporalmente,
  configurarLecturaExpandida
} from "./utils/uiUtils.js";

import { cerrarSesion } from "./utils/authUtils.js";
import { cargarDatosUsuario } from "./utils/perfilUtils.js";
import { mostrarModalError } from "./utils/modales.js";
import { mostrarToast } from "./utils/toastUtils.js";

// === INICIALIZACIÓN ===
const mainContent = document.getElementById("mainContent");
const loader = document.getElementById("loader");

configurarMenuHamburguesa();
configurarMenuPerfil();

["exitescritorio", "exitmovil"].forEach(id => {
  const btn = document.getElementById(id);
  if (btn) {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      cerrarSesion();
    });
  }
});

firebase.auth().onAuthStateChanged((user) => {
  if (user) cargarDatosUsuario(user.uid);
});

// === FUNCIONES PRINCIPALES ===
function obtenerWorkIdDesdeHash() {
  const partes = window.location.hash.split("/");
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
    let favIcon = "./assets/img/interface/favdesdetails.png";
    let mostrarIcon = "./assets/img/interface/marcdesdetails.png";

    if (user) {
      if (await estaEnFavoritos(user.uid, libro.id)) favIcon = "./assets/img/interface/favact.png";
      if (await estaEnMostrarMasTarde(user.uid, libro.id)) mostrarIcon = "./assets/img/interface/marcdetails.png";
    }

    mainContent.innerHTML = crearTarjetaDetalle(libro, favIcon, mostrarIcon);
    configurarEventosBotones(libro, user);
    cargarResenasLibro(libro.id);
    configurarLecturaExpandida("biografiaAutor", "leerMasBio");
  }).catch(error => {
    loader.style.display = "none";
    mostrarModalError("Error al cargar los detalles del libro. Intenta de nuevo más tarde.");
    console.error(error);
  });
} else {
  loader.style.display = "none";
  mostrarModalError("Libro no encontrado. Intenta acceder de nuevo.", "#home");
}

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
  }).catch(error => {
    console.error("Error cargando reseñas:", error);
    contenedor.innerHTML = "<p>No se pudieron cargar las reseñas en este momento.</p>";
  });
}

function crearTarjetaDetalle(libro, favIcon, mostrarIcon) {
  const relacionados = libro.librosRelacionados.length ? libro.librosRelacionados.map(l => `
    <div class="libro-relacionado">
      <img src="${l.portada}" alt="Portada relacionada" onclick="window.location.hash='#detalle/${l.id}'">
    </div>`).join("") : "<p>No se encontraron libros relacionados.</p>";

  const enlaces = libro.enlacesExternos.length ? libro.enlacesExternos.map(e => `
    <li><a href="${e.url}" target="_blank" rel="noopener">${e.titulo}</a></li>
  `).join("") : "<li>No hay enlaces disponibles.</li>";

  const crearBadges = (array) => array.map(e => `<span class="badge">${e}</span>`).join(" ");

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
        ${libro.subtitulo ? `<h3>${libro.subtitulo}</h3>` : ""}
        <p><strong>Autor:</strong> ${libro.autor}</p>
        ${libro.editorial && libro.editorial !== 'No especificada' ? `<p><strong>Editorial:</strong> ${libro.editorial}</p>` : ""}
        ${libro.añoPublicacion && libro.añoPublicacion !== 'Desconocido' ? `<p><strong>Año de publicación:</strong> ${libro.añoPublicacion}</p>` : ""}
        ${libro.paginas && libro.paginas !== 'No especificado' ? `<p><strong>Páginas:</strong> ${libro.paginas}</p>` : ""}
        ${libro.idiomas && libro.idiomas[0] !== 'No especificados' ? `<p><strong>Idioma:</strong> ${libro.idiomas.join(", ")}</p>` : ""}
        ${libro.generos && libro.generos[0] !== 'Sin datos' ? `<p><strong>Géneros:</strong> ${crearBadges(libro.generos)}</p>` : ""}
        ${libro.isbn && libro.isbn !== 'No disponible' ? `<p><strong>ISBN:</strong> ${libro.isbn}</p>` : ""}
        ${libro.edicion && libro.edicion !== 'No especificada' ? `<p><strong>Edición:</strong> ${libro.edicion}</p>` : ""}
        ${libro.sinopsis ? `<p><strong>Sinopsis:</strong> ${libro.sinopsis}</p>` : ""}

        ${libro.biografiaAutor ? `
        <p><strong>Sobre el autor:</strong></p>
        <p id="biografiaAutor" class="biografia-corta">${libro.biografiaAutor}</p>
        <button id="leerMasBio" class="boton-leer-mas">Leer más</button>
        ` : ""}

        <h3>Reseñas</h3>
        <div id="contenedorResenas" class="contenedor-resenas"></div>

        ${libro.lugares.length ? `<p><strong>Lugares:</strong> ${crearBadges(libro.lugares)}</p>` : ""}
        ${libro.personajes.length ? `<p><strong>Personajes:</strong> ${crearBadges(libro.personajes)}</p>` : ""}
        ${libro.epocas.length ? `<p><strong>Épocas:</strong> ${crearBadges(libro.epocas)}</p>` : ""}

        <h3>Enlaces externos</h3>
        <ul class="enlaces-externos">${enlaces}</ul>

        <h3>Libros relacionados</h3>
        <div class="contenedor-relacionados">${relacionados}</div>
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
