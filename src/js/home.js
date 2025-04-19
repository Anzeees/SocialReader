import { mostrarNombre, avatarUsuario } from "./services/firestoreService.js";
import { obtenerLibrosPopulares, obtenerTopMasVendidos } from "./services/openlibrary.js";

// --- Referencia al contenedor principal y loader
const mainContent = document.getElementById("mainContent");
const loader = document.getElementById("loader");

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

function crearCardLibro(libro) {
  const card = document.createElement('div');
  card.className = 'card-libro';
  card.innerHTML = `
    <img src="${libro.portada || './assets/img/logotipos/portadaDefault.png'}" alt="Portada">
    <h3>${libro.titulo}</h3>
    <p>${libro.autor}</p>
  `;
  return card;
}

async function cargarTopLibros() {
  const contVendidos = document.getElementById('lista-vendidos');
  const contGuardados = document.getElementById('lista-guardados');

  const vendidos = await obtenerTopMasVendidos();
  const guardados = await obtenerLibrosPopulares();

  vendidos.forEach(libro => contVendidos.appendChild(crearCardLibro(libro)));
  guardados.forEach(libro => contGuardados.appendChild(crearCardLibro(libro)));

  // Ocultar loader y mostrar contenido principal solo cuando esté todo cargado
  loader.style.display = "none";
  mainContent.removeAttribute("hidden");
  mainContent.classList.add("fade-in");
}

// --- Función para mover el carrusel con flechas
window.moverCarrusel = function (btn, direccion) {
  const contenedor = btn.parentElement.querySelector(".contenedor-cards");
  const card = contenedor.querySelector(".card-libro");

  if (!card) return;

  const desplazamiento = card.offsetWidth + 16; // Ancho de la tarjeta + margen
  contenedor.scrollBy({
    left: direccion * desplazamiento,
    behavior: "smooth"
  });
};

// Ejecutar carga al iniciar
cargarTopLibros();
