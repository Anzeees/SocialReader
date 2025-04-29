/** HOME.JS -- ÁNGEL MARTÍNEZ ORDIALES -- SOCIALREADER --
============================================================
Proyecto: SocialReader
Autor: Ángel Martínez Ordiales
Archivo: home.js
Descripción: Módulo de inicio y carga de libros destacados en la aplicación.
*/

// === IMPORTACIONES ===
import { mostrarNombre, avatarUsuario } from "./services/firestoreService.js";
import { obtenerLibrosPopulares, obtenerTopMasVendidos } from "./services/openlibrary.js";

// === VARIABLES DEL DOM ===
const mainContent = document.getElementById("mainContent");
const loader = document.getElementById("loader");

// === FUNCIONES DE NAV === 
/**
 * Cierra el menú hamburguesa en vista móvil.
 * @function
 */
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

// === GESTIÓN DEL MENÚ PERFIL (escritorio) ===
document.querySelector(".perfil").addEventListener("click", (e) => {
  const menu = document.querySelector(".perfil-menu");
  menu.style.display = menu.style.display === "flex" ? "none" : "flex";
  e.stopPropagation();
});

document.addEventListener("click", (e) => {
  const menu = document.querySelector(".perfil-menu");
  const perfil = document.querySelector(".perfil");
  if (perfil && !perfil.contains(e.target)) {
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

// === CREACIÓN DE TARJETAS DE LIBROS PARA EL CARRUSEL ===
/**
 * Crea dinámicamente una tarjeta de libro para el carrusel.
 * @param {Object} libro - Datos del libro.
 * @returns {HTMLElement} - Elemento HTML de la tarjeta.
 */
function crearCardLibro(libro) {
  const card = document.createElement("div");
  card.className = "card-libro";
  card.innerHTML = `
    <img src="${libro.portada || './assets/img/logotipos/portadaDefault.png'}" alt="Portada">
    <h3>${libro.titulo}</h3>
    <p>${libro.autor}</p>
  `;
  card.addEventListener("click", () => {
    const key = libro.id || libro.clave || libro.key?.replace("/works/", "");
    if (key) {
      window.location.hash = `#detalle/${key}`;
    }
  });
  return card;
}

// === MOVIMIENTO DEL CARRUSEL ===
/**
 * Mueve el carrusel manualmente al pulsar los botones.
 * @param {HTMLElement} btn - Botón pulsado (izquierda o derecha).
 * @param {number} direccion - Dirección de movimiento: -1 (izquierda), 1 (derecha).
 */
window.moverCarrusel = function (btn, direccion) {
  const contenedor = btn.parentElement.querySelector(".contenedor-cards");
  const card = contenedor.querySelector(".card-libro");
  if (!card) return;

  const desplazamiento = card.offsetWidth + 16;
  const scrollMaximo = contenedor.scrollWidth - contenedor.clientWidth;
  const scrollActual = contenedor.scrollLeft;

  if ((direccion === -1 && scrollActual === 0) || 
      (direccion === 1 && Math.ceil(scrollActual) >= scrollMaximo)) {
    contenedor.classList.add("rebote");
    setTimeout(() => contenedor.classList.remove("rebote"), 400);
    return;
  }

  contenedor.scrollBy({
    left: direccion * desplazamiento,
    behavior: "smooth"
  });

  setTimeout(() => actualizarBarraProgreso(contenedor), 300);
};

/**
 * Actualiza la barra de progreso del carrusel.
 * @param {HTMLElement} contenedor - Contenedor del carrusel.
 */
function actualizarBarraProgreso(contenedor) {
  const barra = contenedor.id.includes('vendidos') 
    ? document.getElementById('progreso-vendidos') 
    : document.getElementById('progreso-guardados');

  if (!barra) {
    // console.warn('No se encontró la barra de progreso para el contenedor:', contenedor.id);
    return;
  }

  const scrollMaximo = contenedor.scrollWidth - contenedor.clientWidth;
  const scrollActual = contenedor.scrollLeft;
  const progreso = Math.min((scrollActual / scrollMaximo) * 100, 100);

  barra.style.width = `${progreso}%`;
}

/**
 * Inicia el desplazamiento automático de los carruseles.
 * @function
 */
function iniciarAutoplayCarrusel() {
  const carruseles = document.querySelectorAll(".contenedor-cards");

  carruseles.forEach(contenedor => {
    setInterval(() => {
      const card = contenedor.querySelector(".card-libro");
      if (!card) return;

      const desplazamiento = card.offsetWidth + 16;
      const scrollMaximo = contenedor.scrollWidth - contenedor.clientWidth;
      const scrollActual = contenedor.scrollLeft;

      if (Math.ceil(scrollActual) >= scrollMaximo) {
        contenedor.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        contenedor.scrollBy({ left: desplazamiento, behavior: "smooth" });
      }
      setTimeout(() => actualizarBarraProgreso(contenedor), 300);
    }, 5000);
  });
}

// === CARGA DE LIBROS EN LOS CARRUSELES ===
/**
 * Carga los libros más vendidos y populares y los muestra en el carrusel.
 * @function
 */
async function cargarTopLibros() {
  const contVendidos = document.getElementById('lista-vendidos');
  const contGuardados = document.getElementById('lista-guardados');

  const vendidos = await obtenerTopMasVendidos();
  const guardados = await obtenerLibrosPopulares();

  vendidos.forEach(libro => contVendidos.appendChild(crearCardLibro(libro)));
  guardados.forEach(libro => contGuardados.appendChild(crearCardLibro(libro)));

  loader.style.display = "none";
  mainContent.removeAttribute("hidden");
  mainContent.classList.add("fade-in");

  iniciarAutoplayCarrusel();
}

// === INICIALIZACIÓN ===
cargarTopLibros();