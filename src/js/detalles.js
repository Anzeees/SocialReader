// DETALLES.JS -- ÁNGEL MARTÍNEZ ORDIALES

//  === IMPORTACIONES ===
// --- Importacion servicios de Firebase y OpenLibraryAPI
import { mostrarNombre, avatarUsuario, agregarLibroFavorito, eliminarLibroFavorito, estaEnFavoritos, agregarMostrarMasTarde, eliminarMostrarMasTarde, estaEnMostrarMasTarde } from "./services/firestoreService.js";
import { obtenerDetallesLibro } from "./services/openlibrary.js";

// === VARIABLES DEL DOM ===
const mainContent = document.getElementById("mainContent");
const loader = document.getElementById("loader");

// === GESTIÓN DE INTERFAZ: MENÚ HAMBURGUESA ===
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

// === GESTIÓN DE SESIÓN (Cerrar sesión escritorio y móvil) ===
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

// === GESTIÓN DE MENÚ PERFIL (escritorio) ===
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

// === REDIRECCIÓN A PERFIL (escritorio y móvil) ===
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

// === UTILIDAD: OBTENER WORK ID DESDE EL HASH ===
// Esta función obtiene el workId del hash de la URL. Se espera que el hash tenga el formato #/workId
function obtenerWorkIdDesdeHash() {
  const hash = window.location.hash;
  const partes = hash.split("/");
  return partes.length === 2 ? partes[1] : null;
}

// === CARGA DE DETALLES DEL LIBRO ===
const workId = obtenerWorkIdDesdeHash();
const main = document.getElementById("mainContent");

if (workId && main) {
  main.hidden = false;
  main.innerHTML = `
    <div class="loader-container">
      <div class="spinner"></div>
      <p>Cargando detalles del libro...</p>
    </div>
  `;

  obtenerDetallesLibro(workId).then(async libro => {
    if (!libro) {
      main.innerHTML = "<p>Error al cargar el libro.</p>";
      return;
    }

    const user = firebase.auth().currentUser;
    const clave = libro.id;
    let favIcon = "./assets/img/interface/favdes.png";
    let mostrarIcon = "./assets/img/interface/marcdes.png";

    if (user) {
      const estaFav = await estaEnFavoritos(user.uid, clave);
      const estaMostrar = await estaEnMostrarMasTarde(user.uid, clave);
      if (estaFav) favIcon = "./assets/img/interface/favact.png";
      if (estaMostrar) mostrarIcon = "./assets/img/interface/marcdetails.png";
    }

    main.innerHTML = `
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
          ${libro.biografiaAutor ? `<p><strong>Biografía:</strong> ${libro.biografiaAutor}</p>` : ""}
          <p><strong>Año:</strong> ${libro.añoPublicacion}</p>
          <p><strong>Editorial:</strong> ${libro.editorial}</p>
          <p><strong>Idiomas:</strong> ${libro.idiomas.join(", ")}</p>
          <p><strong>Géneros:</strong> ${libro.generos.join(", ")}</p>
          <p><strong>Páginas:</strong> ${libro.paginas}</p>
          <p><strong>Sinopsis:</strong> ${libro.sinopsis}</p>
        </div>
      </div>
    `;

    // === EVENTOS: BOTONES DE ACCIÓN "Favorito" y "Leer más tarde" ===
    const btnFav = document.querySelector(".btn-fav");
    const btnMostrar = document.querySelector(".btn-mostrar");

    if (user && btnFav && btnMostrar) {
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
  main.innerHTML = "<p>No se ha especificado ningún libro.</p>";
}