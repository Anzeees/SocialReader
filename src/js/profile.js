// profile.js
import { mostrarNombre, avatarUsuario, obtenerDocumentoUsuario } from "./services/firestoreService.js";
import { obtenerResumenLibro } from "./services/openlibrary.js";

// Referencia al contenedor principal
const mainContent = document.getElementById("mainContent");

// Abrir menú hamburguesa
document.getElementById("hamburguesa").addEventListener("click", () => {
  document.getElementById("menuHamburguesa").classList.toggle("show");
  document.getElementById("sombra").style.setProperty("display", "flex");
});

// Función para cerrar sesión
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

// Eventos para cerrar sesión
["exitescritorio", "exitmovil"].forEach(id => {
  const btn = document.getElementById(id);
  if (btn) {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      cerrarSesion();
    });
  }
});

// Cerrar menú hamburguesa
document.getElementById("exitMenu").addEventListener("click", (e) => {
  e.preventDefault();
  document.getElementById("menuHamburguesa").classList.remove("show");
  document.getElementById("sombra").style.setProperty("display", "none");
});

// Mostrar/ocultar menú perfil
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

// Personalizar perfil al iniciar sesión
firebase.auth().onAuthStateChanged(async (user) => {
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

    const datos = await obtenerDocumentoUsuario(user.uid);
    if (!datos) return;

    document.getElementById("nombrePerfil").textContent = datos.nombrePantalla || "Sin nombre";
    document.getElementById("correoPerfil").textContent = datos.correo || "-";
    document.getElementById("fechaAlta").textContent = formatearFecha(datos.fechaAlta);
    document.getElementById("avatarGrande").src = `./assets/img/avatars/${datos.avatar || "Avatar1.png"}`;

    await mostrarLibrosUsuario(datos.librosFavoritos, "contenedor-favoritos");
    await mostrarLibrosUsuario(datos.mostrarMasTarde, "contenedor-mas-tarde");
  }
});

function formatearFecha(timestamp) {
  if (!timestamp || typeof timestamp.toDate !== "function") return "Sin fecha";
  const fecha = timestamp.toDate();
  return fecha.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

// Mostrar libros desde OpenLibrary según claves
async function mostrarLibrosUsuario(lista, contenedorId) {
  const contenedor = document.getElementById(contenedorId);
  if (!contenedor || !Array.isArray(lista)) return;

  contenedor.innerHTML = "";

  for (const clave of lista) {
    try {
      const datos = await obtenerResumenLibro(clave); // ✅ Usa función que obtiene título y portada
      const titulo = datos.titulo || "Sin título";
      const portada = datos.portada || "./assets/img/interface/placeholder-libro.png";

      const div = document.createElement("div");
      div.className = "libro-item";
      div.addEventListener("click", () => {
        window.location.hash = `#detalle/${clave}`;
      });

      div.innerHTML = `
        <img src="${portada}" alt="${titulo}">
        <div class="overlay">${titulo}</div>
      `;

      contenedor.appendChild(div);
    } catch (err) {
      console.warn("No se pudo obtener datos para:", clave, err);
    }
  }
}

// Pestañas
document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((t) => t.classList.remove("activo"));
    tab.classList.add("activo");

    document.querySelectorAll(".contenido-tabs > div").forEach((div) => {
      div.style.display = "none";
    });

    const idContenido = tab.getAttribute("data-tab");
    const seccionActiva = document.getElementById(idContenido);
    if (seccionActiva) {
      seccionActiva.style.display = "block";
    }
  });
});
