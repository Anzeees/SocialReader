// DETALLES.JS -- ÁNGEL MARTÍNEZ ORDIALES

import { agregarLibroFavorito, eliminarLibroFavorito, estaEnFavoritos, agregarMostrarMasTarde, eliminarMostrarMasTarde, estaEnMostrarMasTarde } from "./services/firestoreService.js";
import { obtenerDetallesLibro } from "./services/openlibrary.js";
import { accionesMenu } from "./nav.js";

// === VARIABLES DEL DOM ===
const mainContent = document.getElementById("mainContent");
const loader = document.getElementById("loader");

accionesMenu();
// === OBTENER ID DEL LIBRO DESDE EL HASH ===
function obtenerWorkIdDesdeHash() {
  const hash = window.location.hash;
  const partes = hash.split("/");
  return partes.length === 2 ? partes[1] : null;
}

// === CARGAR DETALLES DEL LIBRO ===
const workId = obtenerWorkIdDesdeHash();

if (workId && mainContent) {
  mainContent.hidden = false;
  loader.style.display = "flex"; // Mostrar spinner

  obtenerDetallesLibro(workId).then(async libro => {
    loader.style.display = "none"; // Ocultar spinner

    if (!libro) {
      mainContent.innerHTML = "<p>Error al cargar los detalles del libro.</p>";
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

    mainContent.innerHTML = `
      <div class="detalle-libro">
        <div class="colizq">
          <img src="${libro.portada}" class="portada" alt="Portada del libro">
          <div class="acciones-libro">
            <button class="accion btn-mostrar" data-id="${clave}">
              <img src="${mostrarIcon}" alt="Guardar para más tarde"> Leer más tarde
            </button>
            <button class="accion btn-fav" data-id="${clave}">
              <img src="${favIcon}" alt="Favorito"> Mis Favoritos
            </button>
            <button class="resena btn-resena" data-id="${clave}">
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
        </div>
      </div>
    `;

    // === BOTONES FAVORITO Y MOSTRAR MÁS TARDE ===
    const btnFav = document.querySelector(".btn-fav");
    const btnMostrar = document.querySelector(".btn-mostrar");

    if (user) {
      btnFav.addEventListener("click", async (e) => {
        e.stopPropagation();
        const esta = await estaEnFavoritos(user.uid, clave);
        if (esta) {
          await eliminarLibroFavorito(user.uid, clave);
          btnFav.querySelector("img").src = "./assets/img/interface/favdesdetails.png";
        } else {
          await agregarLibroFavorito(user.uid, clave);
          btnFav.querySelector("img").src = "./assets/img/interface/favact.png";
        }
      });

      btnMostrar.addEventListener("click", async (e) => {
        e.stopPropagation();
        const esta = await estaEnMostrarMasTarde(user.uid, clave);
        if (esta) {
          await eliminarMostrarMasTarde(user.uid, clave);
          btnMostrar.querySelector("img").src = "./assets/img/interface/marcdesdetails.png";
        } else {
          await agregarMostrarMasTarde(user.uid, clave);
          btnMostrar.querySelector("img").src = "./assets/img/interface/marcdetails.png";
        }
      });

      const btnResena = document.querySelector(".btn-resena");
      btnResena.addEventListener("click", (e) => {
        e.stopPropagation();
        window.location.hash = `#resena/${clave}`;
        window.dispatchEvent(new HashChangeEvent("hashchange"));
      });
    }
  });
} else {
  mainContent.innerHTML = "<p>No se ha especificado ningún libro.</p>";
}
