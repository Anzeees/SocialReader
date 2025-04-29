/**
 * RESENA.JS -- ÁNGEL MARTÍNEZ ORDIALES -- SOCIALREADER --
 * ============================================================
 * Proyecto: SocialReader
 * Autor: Ángel Martínez Ordiales
 * Archivo: resena.js
 * Descripción: Módulo de creación de reseñas de libros.
 */

// === IMPORTACIONES ===
import { mostrarNombre, avatarUsuario, crearResena } from "./services/firestoreService.js";
import { obtenerDetallesLibro } from "./services/openlibrary.js";
import { configurarMenuHamburguesa, configurarMenuPerfil } from "./utils/uiUtils.js";
import { cerrarSesion } from "./utils/authUtils.js";

// === ELEMENTOS DEL DOM ===
const mainContent = document.getElementById("mainContent");
const loader = document.getElementById("loader");

// === CONFIGURACIÓN INTERFAZ ===
configurarMenuHamburguesa();
configurarMenuPerfil();

["exitescritorio", "exitmovil"].forEach((id) => {
  const btn = document.getElementById(id);
  if (btn) {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      cerrarSesion();
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

// === UTILIDADES ===
function mostrarModalError(mensaje, callback) {
  const modal = document.getElementById("modalError");
  const texto = document.getElementById("mensajeError");
  const btnCerrar = document.getElementById("btnCerrarModal");
  if (!modal || !texto || !btnCerrar) return;
  texto.textContent = mensaje;
  modal.classList.remove("oculto");
  btnCerrar.onclick = () => {
    modal.classList.add("oculto");
    if (typeof callback === "function") callback();
  };
}

function limpiarFormulario(formulario) {
  if (!formulario) return;
  formulario.reset();
  const estrellas = formulario.querySelectorAll(".estrella");
  estrellas.forEach((e) => e.classList.remove("activa"));
  const valoracion = formulario.querySelector("#valoracion");
  if (valoracion) valoracion.setAttribute("data-valor", "0");
}

// === FUNCIONES ===
function obtenerWorkIdDesdeHash() {
  const hash = window.location.hash;
  const partes = hash.split("/");
  return partes.length === 2 ? partes[1] : null;
}

function activarEstrellas() {
  const estrellas = document.querySelectorAll(".estrella");
  const textoValoracion = document.getElementById("textoValoracion");
  estrellas.forEach((estrella) => {
    estrella.addEventListener("click", () => {
      const valorSeleccionado = parseInt(estrella.dataset.valor);
      estrellas.forEach((e) => {
        e.classList.toggle("activa", parseInt(e.dataset.valor) <= valorSeleccionado);
      });
      document.getElementById("valoracion").setAttribute("data-valor", valorSeleccionado);
      if (textoValoracion) {
        textoValoracion.textContent = `${valorSeleccionado} estrella${valorSeleccionado === 1 ? "" : "s"}`;
      }
    });
  });
}

// === CARGA DE INTERFAZ Y LÓGICA DE RESEÑA ===
firebase.auth().onAuthStateChanged(async (user) => {
  if (!user) return;

  const uid = user.uid;
  const workId = obtenerWorkIdDesdeHash();

  if (!workId) {
    loader.style.display = "none";
    mainContent.hidden = false;
    mostrarModalError("Error: No se ha especificado ningún libro para reseñar.", () => {
      window.location.hash = "#home";
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    });
    return;
  }

  loader.style.display = "flex";
  mainContent.hidden = true;

  const libro = await obtenerDetallesLibro(workId);

  loader.style.display = "none";

  if (!libro) {
    mainContent.hidden = false;
    mostrarModalError("Error al cargar los detalles del libro.");
    return;
  }

  mainContent.hidden = false;
  mainContent.innerHTML = `
    <div class="resena-container">
      <div class="info-libro">
        <img src="${libro.portada}" alt="Portada del libro" class="portada-libro">
        <div class="datos-libro">
          <h2>${libro.titulo}</h2>
          <p class="autor">${libro.autor}</p>
        </div>
      </div>
      <hr class="separador">
      <form id="formResena">
        <label for="valoracion">Mi Valoración:</label>
        <div class="estrellas" id="valoracion" data-valor="0">
          ${[1,2,3,4,5].map((i) => `<span class="estrella" data-valor="${i}">★</span>`).join("")}
          <span id="textoValoracion" class="texto-valoracion">0 estrellas</span>
        </div>
        <label for="opinion">¿Cuál es tu opinión?</label>
        <textarea id="opinion" placeholder="Escribe tu reseña aquí..." rows="6"></textarea>
        <div class="opciones-resena">
          <label><input type="checkbox" id="spoiler"> ¿Tu reseña podría contener spoilers?</label>
        </div>
        <button type="submit" class="boton">Publicar</button>
      </form>
    </div>
  `;

  activarEstrellas();

  document.getElementById("formResena").addEventListener("submit", async (e) => {
    e.preventDefault();

    const review = document.getElementById("opinion").value.trim();
    const valoracion = parseInt(document.getElementById("valoracion").getAttribute("data-valor")) || 0;
    const spoilers = document.getElementById("spoiler").checked;

    if (valoracion === 0) {
      mostrarModalError("Debes seleccionar al menos una estrella para publicar tu reseña.");
      return;
    }

    try {
      await crearResena(uid, workId, review, valoracion, spoilers);
      mostrarModalError("¡Reseña publicada correctamente!", () => {
        window.location.hash = `#detalle/${workId}`;
        window.dispatchEvent(new HashChangeEvent("hashchange"));
      });
      limpiarFormulario(document.getElementById("formResena"));
    } catch (error) {
      console.error("Error al crear la reseña:", error);
      mostrarModalError("No se pudo guardar la reseña. Intenta más tarde.");
    }
  });
});