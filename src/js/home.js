// HOME.JS -- ÁNGEL MARTÍNEZ ORDIALES -- SOCIALREADER --
// ============================================================
// Proyecto: SocialReader
// Autor: Ángel Martínez Ordiales
// Archivo: home.js
// Descripción: Módulo de inicio y carga de libros destacados en la aplicación.

import { cargarDatosUsuario } from "./utils/perfilUtils.js";
import { cerrarSesion } from "./utils/authUtils.js";
import { configurarMenuHamburguesa, configurarMenuPerfil } from "./utils/uiUtils.js";
import { obtenerLibrosPopulares, obtenerTopMasVendidos } from "./services/openlibrary.js";

// === VARIABLES DEL DOM ===
const mainContent = document.getElementById("mainContent");
const loader = document.getElementById("loader");

// === CONFIGURAR MENÚS ===
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

// === CREACIÓN DE TARJETAS DE LIBROS PARA EL CARRUSEL ===
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

function actualizarBarraProgreso(contenedor) {
  const barra = contenedor.id.includes('vendidos') 
    ? document.getElementById('progreso-vendidos') 
    : document.getElementById('progreso-guardados');

  if (!barra) return;

  const scrollMaximo = contenedor.scrollWidth - contenedor.clientWidth;
  const scrollActual = contenedor.scrollLeft;
  const progreso = Math.min((scrollActual / scrollMaximo) * 100, 100);

  barra.style.width = `${progreso}%`;
}

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