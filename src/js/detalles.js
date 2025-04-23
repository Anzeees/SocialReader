// DETALLES.JS -- ÁNGEL MARTÍNEZ ORDIALES

import {
  mostrarNombre,
  avatarUsuario,
  agregarLibroFavorito,
  eliminarLibroFavorito,
  estaEnFavoritos,
  agregarMostrarMasTarde,
  eliminarMostrarMasTarde,
  estaEnMostrarMasTarde
} from "./services/firestoreService.js";

import { obtenerDetallesLibro } from "./services/openlibrary.js";

// === VARIABLES DEL DOM ===
const mainContent = document.getElementById("mainContent");
const loader = document.getElementById("loader");

// === GESTIÓN DE MENÚ HAMBURGUESA ===
function cerrarMenuHamburguesa() {
  document.getElementById("menuHamburguesa").classList.remove("show");
  document.getElementById("sombra").style.display = "none";
}

document.getElementById("hamburguesa").addEventListener("click", () => {
  document.getElementById("menuHamburguesa").classList.toggle("show");
  document.getElementById("sombra").style.display = "flex";
});

document.getElementById("exitMenu").addEventListener("click", (e) => {
  e.preventDefault();
  cerrarMenuHamburguesa();
});

// === CIERRE DE SESIÓN ===
["exitescritorio", "exitmovil"].forEach(id => {
  const btn = document.getElementById(id);
  if (btn) {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      firebase.auth().signOut().then(() => {
        localStorage.removeItem("usuarioAutenticado");
        window.location.hash = "#login";
        window.dispatchEvent(new HashChangeEvent("hashchange"));
      });
    });
  }
});

// === MENÚ PERFIL ===
document.querySelector(".perfil").addEventListener("click", (e) => {
  const menu = document.querySelector(".perfil-menu");
  menu.style.display = menu.style.display === "flex" ? "none" : "flex";
  e.stopPropagation();
});

document.addEventListener("click", (e) => {
  const menu = document.querySelector(".perfil-menu");
  const perfil = document.querySelector(".perfil");
  if (!perfil.contains(e.target)) {
    menu.style.display = "none";
  }
});

// === REDIRECCIÓN A PERFIL ===
document.querySelector("#nombreUsuario")?.addEventListener("click", () => {
  window.location.hash = "#profile";
});

document.querySelector(".perfil-menu a[href='#profile']")?.addEventListener("click", (e) => {
  e.preventDefault();
  window.location.hash = "#profile";
});

// === CARGA DE DATOS DEL USUARIO AUTENTICADO ===
firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    mostrarNombre(user.uid, (nombre) => {
      const h5Usuario = document.querySelector(".perfil-movil h5");
      if (h5Usuario) h5Usuario.textContent = nombre;
    });
    avatarUsuario(user.uid, (avatar) => {
      const imgUsuario = document.querySelector(".perfil-movil img");
      const imgUsuarioEscritorio = document.querySelector(".perfil img");
      if (imgUsuarioEscritorio) imgUsuarioEscritorio.src = `./assets/img/avatars/${avatar}`;
      if (imgUsuario) imgUsuario.src = `./assets/img/avatars/${avatar}`;
    });
  }
});

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
    let favIcon = "./assets/img/interface/favdes.png";
    let mostrarIcon = "./assets/img/interface/marcdes.png";

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
            <button class="resena">
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
          btnFav.querySelector("img").src = "./assets/img/interface/favdes.png";
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
          btnMostrar.querySelector("img").src = "./assets/img/interface/marcdes.png";
        } else {
          await agregarMostrarMasTarde(user.uid, clave);
          btnMostrar.querySelector("img").src = "./assets/img/interface/marcdetails.png";
        }
      });
    }
  });
} else {
  mainContent.innerHTML = "<p>No se ha especificado ningún libro.</p>";
}
