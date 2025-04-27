/** 
 * SEARCH.JS -- ÁNGEL MARTÍNEZ ORDIALES -- SOCIALREADER --
 ============================================================
 Proyecto: SocialReader
 Autor: Ángel Martínez Ordiales
 Archivo: search.js
 Descripción: Módulo de búsqueda de libros en la aplicación, con paginación y gestión de favoritos y mostrar más tarde.
*/

// === IMPORTACIONES DE SERVICIOS ===
import { mostrarNombre, avatarUsuario, agregarLibroFavorito, eliminarLibroFavorito, estaEnFavoritos, agregarMostrarMasTarde, eliminarMostrarMasTarde, estaEnMostrarMasTarde } from "./services/firestoreService.js";

// === VARIABLES DEL DOM ===
const mainContent = document.getElementById("mainContent");
const contenedor = document.getElementById("resultadosLibros");
const spinner = document.getElementById("spinnerBusqueda");
const botonBuscar = document.getElementById("botonBuscar");

// === VARIABLES DE CONTROL DE ESTADO ===
let abortController = null;
let resultados = [];
let paginaActual = 1;
const resultadosPorPagina = 5;

// === GESTIÓN DEL MENÚ HAMBURGUESA Y CIERRE DE SESIÓN ===
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

["exitescritorio", "exitmovil"].forEach(id => {
  document.getElementById(id)?.addEventListener("click", async (e) => {
    e.preventDefault();
    await firebase.auth().signOut();
    localStorage.removeItem("usuarioAutenticado");
    window.location.hash = "#login";
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  });
});

// === GESTIÓN DEL PERFIL DE USUARIO EN MENÚ ===
document.querySelector(".perfil")?.addEventListener("click", (e) => {
  const menu = document.querySelector(".perfil-menu");
  menu.style.display = menu.style.display === "flex" ? "none" : "flex";
  e.stopPropagation();
});

document.addEventListener("click", (e) => {
  const menu = document.querySelector(".perfil-menu");
  if (!document.querySelector(".perfil").contains(e.target)) {
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

// === CARGA DE INFORMACIÓN DEL USUARIO AUTENTICADO ===
firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    mostrarNombre(user.uid, nombre => {
      const nombreElement = document.querySelector(".perfil-movil h5");
      if (nombreElement) nombreElement.textContent = nombre;
    });
    avatarUsuario(user.uid, avatar => {
      const imgMovil = document.querySelector(".perfil-movil img");
      const imgEscritorio = document.querySelector(".perfil img");
      if (imgMovil) imgMovil.src = `./assets/img/avatars/${avatar}`;
      if (imgEscritorio) imgEscritorio.src = `./assets/img/avatars/${avatar}`;
    });
  }
});

// === EVENTOS PRINCIPALES: BÚSQUEDA DE LIBROS ===
document.getElementById("botonBuscar").addEventListener("click", realizarBusqueda);
document.getElementById("campoBusqueda").addEventListener("keypress", (e) => {
  if (e.key === "Enter") realizarBusqueda();
});

/**
 * Realiza la búsqueda de libros en OpenLibrary.
 * Aborta búsquedas anteriores si existen, muestra el spinner y bloquea el botón.
 */
function realizarBusqueda() {
  const filtro = document.getElementById("filtroBusqueda").value;
  const termino = document.getElementById("campoBusqueda").value.trim();

  if (termino === "") return;

  if (abortController) abortController.abort();
  abortController = new AbortController();

  contenedor.innerHTML = "";
  spinner.classList.remove("oculto");
  botonBuscar.disabled = true;

  const url = `https://openlibrary.org/search.json?${filtro}=${encodeURIComponent(termino)}&fields=title,author_name,cover_i,subject,first_publish_year,edition_count,key`;

  fetch(url, { signal: abortController.signal })
    .then(res => res.json())
    .then(data => {
      resultados = data.docs || [];
      paginaActual = 1;
      mostrarPagina();
    })
    .catch(error => {
      if (error.name !== "AbortError") {
        console.error("Error al buscar libros:", error);
        contenedor.innerHTML = "<p>Error al buscar libros.</p>";
      }
    })
    .finally(() => {
      spinner.classList.add("oculto");
      botonBuscar.disabled = false;
      setTimeout(() => {
        contenedor.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 200);
    });
}

/**
 * Muestra los resultados correspondientes a la página actual.
 * Pagina los resultados almacenados en `resultados`.
 */
async function mostrarPagina() {
  contenedor.innerHTML = "";

  const inicio = (paginaActual - 1) * resultadosPorPagina;
  const fin = inicio + resultadosPorPagina;
  const librosPagina = resultados.slice(inicio, fin);

  const mensaje = document.createElement("p");
  mensaje.className = "mensaje-resultados";
  mensaje.textContent = `Se han encontrado ${resultados.length} resultados. Página ${paginaActual} de ${Math.ceil(resultados.length / resultadosPorPagina)}`;
  contenedor.appendChild(mensaje);

  const user = firebase.auth().currentUser;
  const fragmento = document.createDocumentFragment();

  for (const libro of librosPagina) {
    const item = await crearElementoLibro(libro, user);
    fragmento.appendChild(item);
  }

  contenedor.appendChild(fragmento);
  crearBotonesPaginacion();
}

/**
 * Crea un elemento HTML representando un libro.
 * @param {Object} libro - Libro de OpenLibrary.
 * @param {firebase.User} user - Usuario autenticado actual.
 * @returns {HTMLElement} - Elemento HTML listo para añadir al DOM.
 */
async function crearElementoLibro(libro, user) {
  const portada = libro.cover_i
    ? `https://covers.openlibrary.org/b/id/${libro.cover_i}-M.jpg`
    : "./assets/img/logotipos/portadaDefault.png";

  const autores = libro.author_name?.join(", ") || "Autor desconocido";
  const categoria = Array.isArray(libro.subject) && libro.subject.length > 0
    ? libro.subject.slice(0, 2).join(", ")
    : "Sin categoría";
  const anio = libro.first_publish_year || "N/A";
  const ediciones = libro.edition_count || 1;
  const valoracion = Math.floor(Math.random() * 6);
  const resenas = Math.floor(Math.random() * 200) + 1;
  const keyLimpia = libro.key.replace("/works/", "");

  let favIcon = "./assets/img/interface/favdes.png";
  let mostrarIcon = "./assets/img/interface/marcdes.png";

  if (user) {
    if (await estaEnFavoritos(user.uid, keyLimpia)) favIcon = "./assets/img/interface/favact.png";
    if (await estaEnMostrarMasTarde(user.uid, keyLimpia)) mostrarIcon = "./assets/img/interface/marcact.png";
  }

  const item = document.createElement("div");
  item.className = "resultado-libro animar-entrada";

  item.innerHTML = `
    <img src="${portada}" alt="Portada" class="portada" loading="lazy">
    <div class="info-libro">
      <h4>${libro.title}</h4>
      <p class="autor">Autor: ${autores}</p>
      <p class="categoria">Categorías: ${categoria}</p>
      <p class="publicacion"><strong>Primera publicación en ${anio} - ${ediciones} ediciones</strong></p>
      <div class="valoracion">
        ${Array.from({ length: 5 }, (_, i) => `
          <img src="./assets/img/interface/${i < valoracion ? 'estrellaact' : 'estrellades'}.png" 
               alt="${i < valoracion ? 'Estrella activa' : 'Estrella desactivada'}"
               style="width:20px;height:20px;margin-right:2px;">
        `).join("")}
        <span>${valoracion} - ${resenas} reseñas</span>
      </div>
    </div>
    <div class="acciones-libro">
      <button class="accion btn-mostrar" data-id="${libro.key}">
        <img src="${mostrarIcon}" alt="Guardar para más tarde">
      </button>
      <button class="accion btn-fav" data-id="${libro.key}">
        <img src="${favIcon}" alt="Favorito">
      </button>
      <button class="resena" data-id="${keyLimpia}">
        <img src="./assets/img/interface/nueva-resena.png" alt="Reseña"> Nueva Reseña
      </button>
    </div>
  `;

  item.addEventListener("click", (e) => {
    if (e.target.closest(".resena")) {
      window.location.hash = `#resena/${keyLimpia}`;
    } else if (!e.target.closest(".accion")) {
      window.location.hash = `#detalle/${keyLimpia}`;
    }
  });

  return item;
}

/**
 * Crea y muestra los botones de paginación según el estado actual.
 */
function crearBotonesPaginacion() {
  const totalPaginas = Math.ceil(resultados.length / resultadosPorPagina);
  const paginacion = document.createElement("div");
  paginacion.className = "paginacion";

  const anterior = document.createElement("button");
  anterior.textContent = "Anterior";
  anterior.className = "boton-paginacion";
  anterior.disabled = paginaActual === 1;
  anterior.addEventListener("click", () => {
    if (paginaActual > 1) {
      paginaActual--;
      mostrarPagina();
    }
  });

  const siguiente = document.createElement("button");
  siguiente.textContent = "Siguiente";
  siguiente.className = "boton-paginacion";
  siguiente.disabled = paginaActual === totalPaginas;
  siguiente.addEventListener("click", () => {
    if (paginaActual < totalPaginas) {
      paginaActual++;
      mostrarPagina();
    }
  });

  paginacion.append(anterior, siguiente);
  contenedor.appendChild(paginacion);
}

// === GESTIÓN DE BOTONES DE FAVORITOS Y MOSTRAR MÁS TARDE ===
document.addEventListener("click", async (e) => {
  const btnFav = e.target.closest(".btn-fav");
  const btnMostrar = e.target.closest(".btn-mostrar");
  const user = firebase.auth().currentUser;

  if (!user) return;

  if (btnFav) {
    const key = btnFav.dataset.id.replace("/works/", "");
    const img = btnFav.querySelector("img");
    if (await estaEnFavoritos(user.uid, key)) {
      await eliminarLibroFavorito(user.uid, key);
      img.src = "./assets/img/interface/favdes.png";
    } else {
      await agregarLibroFavorito(user.uid, key);
      img.src = "./assets/img/interface/favact.png";
    }
  }

  if (btnMostrar) {
    const key = btnMostrar.dataset.id.replace("/works/", "");
    const img = btnMostrar.querySelector("img");
    if (await estaEnMostrarMasTarde(user.uid, key)) {
      await eliminarMostrarMasTarde(user.uid, key);
      img.src = "./assets/img/interface/marcdes.png";
    } else {
      await agregarMostrarMasTarde(user.uid, key);
      img.src = "./assets/img/interface/marcact.png";
    }
  }
});