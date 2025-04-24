// HOME.JS -- ÁNGEL MARTÍNEZ ORDIALES

// === IMPORTACIONES ===
// --- Importacion servicios de Firebase y OpenLibraryAPI
// import { mostrarNombre, avatarUsuario } from "./services/firestoreService.js";
import { obtenerLibrosPopulares, obtenerTopMasVendidos } from "./services/openlibrary.js";
import { accionesMenu } from "./nav.js";

// === VARIABLES DEL DOM ===
const mainContent = document.getElementById("mainContent");
const loader = document.getElementById("loader");

accionesMenu();

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

// === CARGA DE LOS TOPS: MÁS VENDIDOS Y MÁS POPULARES ===
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
}

// === MOVIMIENTO DEL CARRUSEL ===
window.moverCarrusel = function (btn, direccion) {
  const contenedor = btn.parentElement.querySelector(".contenedor-cards");
  const card = contenedor.querySelector(".card-libro");
  if (!card) return;
  const desplazamiento = card.offsetWidth + 16;
  contenedor.scrollBy({
    left: direccion * desplazamiento,
    behavior: "smooth"
  });
};

// === INICIALIZACIÓN: CARGAR CONTENIDO DE LA VISTA ===
cargarTopLibros();
