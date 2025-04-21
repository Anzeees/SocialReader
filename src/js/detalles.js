import { mostrarNombre, avatarUsuario } from "./services/firestoreService.js";
import { obtenerDetallesLibro } from "./services/openlibrary.js";

// --- Abrir menú hamburguesa
document.getElementById("hamburguesa").addEventListener("click", () => {
  document.getElementById("menuHamburguesa").classList.toggle("show");
  document.getElementById("sombra").style.setProperty("display", "flex");
});

// --- Función única para cerrar sesión
function cerrarSesion() {
  document.getElementById("menuHamburguesa").classList.remove("show");
  document.getElementById("sombra").style.setProperty("display", "none");

  firebase.auth().signOut()
    .then(() => {
      localStorage.removeItem("usuarioAutenticado");
      window.location.hash = "#login";
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    })
    .catch((error) => {
      console.error("Error al cerrar sesión:", error);
    });
}

// --- Eventos cerrar sesión
["exitescritorio", "exitmovil"].forEach(id => {
  const btn = document.getElementById(id);
  if (btn) {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      cerrarSesion();
    });
  }
});

// --- Cerrar el menú hamburguesa con el botón de cerrar (X)
document.getElementById("exitMenu").addEventListener("click", (e) => {
  e.preventDefault();
  document.getElementById("menuHamburguesa").classList.remove("show");
  document.getElementById("sombra").style.setProperty("display", "none");
});

// --- Mostrar/ocultar menú del perfil con clic
document.querySelector(".perfil").addEventListener("click", (e) => {
  const menu = document.querySelector(".perfil-menu");
  menu.style.display = menu.style.display === "flex" ? "none" : "flex";
  e.stopPropagation();
});

// --- Cerrar el menú si se hace clic fuera de él
document.addEventListener("click", (e) => {
  const menu = document.querySelector(".perfil-menu");
  const perfil = document.querySelector(".perfil");
  if (!perfil.contains(e.target)) {
    menu.style.display = "none";
  }
});

// --- Personalización del home por usuario
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

document.querySelector("#nombreUsuario")?.addEventListener("click", () => {
  window.location.hash = "#profile";
});

document.querySelector(".perfil-menu a[href='#profile']")?.addEventListener("click", (e) => {
  e.preventDefault();
  window.location.hash = "#profile";
});
// --- Obtener el workId desde la URL
function obtenerWorkIdDesdeHash() {
  const hash = window.location.hash; // Ej: "#detalle/OL123456W"
  const partes = hash.split("/");
  return partes.length === 2 ? partes[1] : null;
}

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

  obtenerDetallesLibro(workId).then(libro => {
    if (!libro) {
      main.innerHTML = "<p>Error al cargar el libro.</p>";
      return;
    }

    main.innerHTML = `
      <div class="detalle-libro">
        <img src="${libro.portada}" alt="Portada del libro">
        <h2>${libro.titulo}</h2>
        <p><strong>Autor:</strong> ${libro.autor}</p>
        <p><strong>Año:</strong> ${libro.añoPublicacion}</p>
        <p><strong>Editorial:</strong> ${libro.editorial}</p>
        <p><strong>Idiomas:</strong> ${libro.idiomas.join(", ")}</p>
        <p><strong>Géneros:</strong> ${libro.generos.join(", ")}</p>
        <p><strong>Páginas:</strong> ${libro.paginas}</p>
        <p><strong>Sinopsis:</strong> ${libro.sinopsis}</p>
      </div>
    `;
  });
} else {
  main.innerHTML = "<p>No se ha especificado ningún libro.</p>";
}