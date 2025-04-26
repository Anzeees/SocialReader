// DETALLES.JS -- ÁNGEL MARTÍNEZ ORDIALES -- SOCIALREADER --
// ===========================================================
// Proyecto: SocialReader
// Autor: Ángel Martínez Ordiales
// Archivo: detalles.js
// Descripción: Vista de detalles de libros y gestión de reseñas.
// ===========================================================

// === IMPORTACIONES ===
import { mostrarNombre, avatarUsuario, agregarLibroFavorito, eliminarLibroFavorito, estaEnFavoritos, agregarMostrarMasTarde, eliminarMostrarMasTarde, estaEnMostrarMasTarde, obtenerResenasLibro, obtenerUsuarioPorUID } from "./services/firestoreService.js";
import { obtenerDetallesLibro } from "./services/openlibrary.js";

// === VARIABLES DEL DOM ===
const mainContent = document.getElementById("mainContent");
const loader = document.getElementById("loader");

// === GESTIÓN DE INTERFAZ: MENÚ HAMBURGUESA ===

/**
 * Cierra el menú hamburguesa en vista móvil.
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

// === FUNCIONES PRICIPALES === 
/**
 * Obtiene el ID del libro desde el hash de la URL.
 * @returns {string|null} ID del libro o null si no existe.
 */
function obtenerWorkIdDesdeHash() {
  const hash = window.location.hash;
  const partes = hash.split("/");
  return partes.length === 2 ? partes[1] : null;
}

// === CARGAR DETALLES DEL LIBRO ===
const workId = obtenerWorkIdDesdeHash();

if (workId && mainContent) {
  mainContent.hidden = false;
  loader.style.display = "flex";
  obtenerDetallesLibro(workId).then(async libro => {
    loader.style.display = "none";

    if (!libro) {
      mostrarModalError("No se ha encontrado el libro solicitado. Intenta buscar otro.", "#search");
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

    mainContent.innerHTML = crearTarjetaDetalle(libro, favIcon, mostrarIcon);

    configurarEventosBotones(libro, user);
    cargarResenasLibro(libro.id);

  }).catch((error) => {
    loader.style.display = "none";
    mostrarModalError("Error al cargar los detalles del libro. Intenta de nuevo más tarde.");
    console.error(error);
  });
} else {
  loader.style.display = "none";
  mostrarModalError("Libro no encontrado. Intenta acceder de nuevo.", "#home");
}

// === FUNCIONES AUXILIARES ===
/**
 * Configura los eventos de botones de acción del detalle del libro.
 * @param {object} libro - Objeto del libro.
 * @param {firebase.User} user - Usuario autenticado.
 */
function configurarEventosBotones(libro, user) {
  const btnFav = document.querySelector(".btn-fav");
  const btnMostrar = document.querySelector(".btn-mostrar");
  const btnResena = document.querySelector(".btn-resena");

  if (user) {
    btnFav.addEventListener("click", async (e) => {
      e.stopPropagation();
      desactivarBotonTemporalmente(btnFav);

      const esta = await estaEnFavoritos(user.uid, libro.id);
      if (esta) {
        await eliminarLibroFavorito(user.uid, libro.id);
        btnFav.querySelector("img").src = "./assets/img/interface/favdesdetails.png";
        mostrarToast("Libro eliminado de Favoritos", "error");
      } else {
        await agregarLibroFavorito(user.uid, libro.id);
        btnFav.querySelector("img").src = "./assets/img/interface/favact.png";
        mostrarToast("Libro añadido a Favoritos", "success");
      }
    });

    btnMostrar.addEventListener("click", async (e) => {
      e.stopPropagation();
      desactivarBotonTemporalmente(btnMostrar);

      const esta = await estaEnMostrarMasTarde(user.uid, libro.id);
      if (esta) {
        await eliminarMostrarMasTarde(user.uid, libro.id);
        btnMostrar.querySelector("img").src = "./assets/img/interface/marcdesdetails.png";
        mostrarToast("Libro eliminado de Leer más tarde", "error");
      } else {
        await agregarMostrarMasTarde(user.uid, libro.id);
        btnMostrar.querySelector("img").src = "./assets/img/interface/marcdetails.png";
        mostrarToast("Libro añadido a Leer más tarde", "success");
      }
    });

    btnResena.addEventListener("click", (e) => {
      e.stopPropagation();
      desactivarBotonTemporalmente(btnResena);
      window.location.hash = `#resena/${libro.id}`;
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    });
  }
}

/**
 * Carga las reseñas de un libro y las muestra en pantalla.
 * @param {string} idLibro - ID del libro.
 */
function cargarResenasLibro(idLibro) {
  const contenedor = document.getElementById("contenedorResenas");
  if (!contenedor) return;

  obtenerResenasLibro(idLibro).then(async (resenas) => {
    if (!resenas.length) {
      contenedor.innerHTML = "<p>No hay reseñas disponibles para este libro.</p>";
      return;
    }

    const tarjetas = await Promise.all(resenas.map(async (resena) => {
      const usuario = await obtenerUsuarioPorUID(resena.uid);
      return crearEtiquetaResena(usuario, resena);
    }));

    contenedor.innerHTML = tarjetas.join("");

    // Activar eventos para mostrar spoilers
    document.querySelectorAll(".spoiler-toggle").forEach(boton => {
      boton.addEventListener("click", () => {
        boton.outerHTML = `<div class="texto-resena">${boton.dataset.texto}</div>`;
      });
    });
  }).catch((error) => {
    console.error("Error cargando reseñas:", error);
    contenedor.innerHTML = "<p>No se pudieron cargar las reseñas en este momento.</p>";
  });
}

/**
 * Crea el HTML de una reseña.
 * @param {object} usuario - Usuario que ha creado la reseña.
 * @param {object} resena - Objeto reseña.
 * @returns {string} HTML generado de la reseña.
 */
function crearEtiquetaResena(usuario, resena) {
  const estrellas = "★".repeat(resena.valoracion) + "☆".repeat(5 - resena.valoracion);
  return `
    <div class="etiqueta-resena">
      <img src="./assets/img/avatars/${usuario.avatar}" alt="Avatar">
      <div class="contenido-resena">
        <div class="nombre-usuario">${usuario.nombrePantalla}</div>
        <div class="estrellas-resena">${estrellas}</div>
        ${resena.spoilers 
          ? `<button class="spoiler-toggle" data-texto="${resena.review}">Esta reseña contiene spoilers. Pulsa para ver.</button>` 
          : `<div class="texto-resena">${resena.review}</div>`}
      </div>
    </div>
  `;
}

/**
 * Crea el contenido principal de la vista de detalles.
 * @param {object} libro - Datos del libro.
 * @param {string} favIcon - Icono para favoritos.
 * @param {string} mostrarIcon - Icono para leer más tarde.
 * @returns {string} HTML de la tarjeta de detalles.
 */
function crearTarjetaDetalle(libro, favIcon, mostrarIcon) {
  return `
    <div class="detalle-libro">
      <div class="colizq">
        <img src="${libro.portada}" class="portada" alt="Portada del libro">
        <div class="acciones-libro">
          <button class="accion btn-mostrar" data-id="${libro.id}">
            <img src="${mostrarIcon}" alt="Guardar para más tarde"> Leer más tarde
          </button>
          <button class="accion btn-fav" data-id="${libro.id}">
            <img src="${favIcon}" alt="Favorito"> Mis Favoritos
          </button>
          <button class="resena btn-resena" data-id="${libro.id}">
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

        <div id="contenedorResenas" class="contenedor-resenas"></div>
      </div>
    </div>
  `;
}

/**
 * Muestra un modal de error con redirección opcional.
 * @param {string} mensaje - Texto del error.
 * @param {string|null} [redireccion=null] - Redirección tras cerrar modal.
 */
function mostrarModalError(mensaje, redireccion = null) {
  const modal = document.getElementById("modalError");
  const texto = document.getElementById("mensajeError");
  const btnCerrar = document.getElementById("btnCerrarModal");

  texto.textContent = mensaje;
  modal.classList.remove("oculto");

  btnCerrar.onclick = () => {
    modal.classList.add("oculto");
    if (redireccion) {
      window.location.hash = redireccion;
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    }
  };
}

/**
 * Desactiva temporalmente un botón para evitar múltiples clicks.
 * @param {HTMLElement} boton - Botón a desactivar.
 * @param {number} [milisegundos=1000] - Tiempo en ms.
 */
function desactivarBotonTemporalmente(boton, milisegundos = 1000) {
  if (!boton) return;
  boton.disabled = true;
  setTimeout(() => {
    boton.disabled = false;
  }, milisegundos);
}

/**
 * Muestra un toast de notificación.
 * @param {string} mensaje - Texto del mensaje.
 * @param {string} [tipo="success"] - Tipo: "success" o "error".
 */
function mostrarToast(mensaje, tipo = "success") {
  const toast = document.getElementById("toast");
  const toastMensaje = document.getElementById("toastMensaje");

  toastMensaje.textContent = mensaje;
  toast.classList.remove("oculto", "toast-success", "toast-error");

  if (tipo === "success") {
    toast.classList.add("toast-success");
  } else if (tipo === "error") {
    toast.classList.add("toast-error");
  }

  toast.classList.add("mostrar");

  setTimeout(() => {
    toast.classList.remove("mostrar");
    setTimeout(() => {
      toast.classList.add("oculto");
    }, 500);
  }, 2000);
}