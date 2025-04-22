import {
  mostrarNombre,
  avatarUsuario,
  obtenerDocumentoUsuario,
  obtenerUidPorCorreo,
  obtenerUsuariosPorNombre,
  agregarAmigo,
  obtenerAmigos,
  buscarUsuariosPorCorreo
} from "./services/firestoreService.js";
import { obtenerResumenLibro } from "./services/openlibrary.js";

const mainContent = document.getElementById("mainContent");

document.getElementById("hamburguesa").addEventListener("click", () => {
  document.getElementById("menuHamburguesa").classList.toggle("show");
  document.getElementById("sombra").style.setProperty("display", "flex");
});

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

["exitescritorio", "exitmovil"].forEach(id => {
  const btn = document.getElementById(id);
  if (btn) {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      cerrarSesion();
    });
  }
});

document.getElementById("exitMenu").addEventListener("click", (e) => {
  e.preventDefault();
  document.getElementById("menuHamburguesa").classList.remove("show");
  document.getElementById("sombra").style.setProperty("display", "none");
});

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

    obtenerAmigos(user.uid, (amigos) => {
      const contenedor = document.getElementById("contenedor-mis-amigos");
      contenedor.innerHTML = "";
      amigos.forEach(amigo => {
        const div = document.createElement("div");
        div.className = "amigo";
        div.innerHTML = `
          <img src="./assets/img/avatars/${amigo.avatar || 'Avatar1.png'}">
          <div class="info">
            <p class="nombre">${amigo.nombrePantalla}</p>
            <p class="correo">${amigo.correo}</p>
          </div>
        `;
        contenedor.appendChild(div);
      });
    });
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

async function mostrarLibrosUsuario(lista, contenedorId) {
  const contenedor = document.getElementById(contenedorId);
  if (!contenedor || !Array.isArray(lista)) return;

  contenedor.innerHTML = "";

  for (const clave of lista) {
    try {
      const datos = await obtenerResumenLibro(clave);
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

// Búsqueda de nuevos amigos
document.addEventListener("DOMContentLoaded", () => {
  const campoBusqueda = document.getElementById("campoBusqueda");
  const botonBuscar = document.getElementById("botonBuscar");
  const contenedor = document.getElementById("contenedor-nuevos-amigos");

  if (!campoBusqueda || !botonBuscar || !contenedor) {
    console.error("Faltan elementos necesarios para la búsqueda.");
    return;
  }

  const realizarBusqueda = async () => {
    const termino = campoBusqueda.value.trim().toLowerCase();
    contenedor.innerHTML = "";

    if (!termino) return;

    try {
      let usuarios = [];
      const esCorreo = termino.includes("@");

      if (esCorreo) {
        usuarios = await buscarUsuariosPorCorreo(termino);
      } else {
        usuarios = await obtenerUsuariosPorNombre(termino);
      }

      mostrarUsuariosEnContenedor(usuarios, contenedor);
    } catch (err) {
      console.error("Error al buscar usuarios:", err);
      contenedor.innerHTML = "<p>Error al buscar usuarios.</p>";
    }
  };

  botonBuscar.addEventListener("click", (e) => {
    e.preventDefault();
    realizarBusqueda();
  });

  campoBusqueda.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      realizarBusqueda();
    }
  });
});

function mostrarUsuariosEnContenedor(usuarios, contenedor) {
  if (!usuarios || usuarios.length === 0) {
    contenedor.innerHTML = "<p>No se encontraron usuarios.</p>";
    return;
  }

  contenedor.innerHTML = "";

  usuarios.forEach(usuario => {
    const div = document.createElement("div");
    div.className = "amigo";
    div.innerHTML = `
      <img src="./assets/img/avatars/${usuario.avatar || 'Avatar1.png'}">
      <div class="info">
        <p class="nombre">${usuario.nombrePantalla}</p>
        <p class="correo">${usuario.correo}</p>
      </div>
      <button class="btn-agregar" data-uid="${usuario.uid}">Agregar</button>
    `;
    contenedor.appendChild(div);
  });

  document.querySelectorAll(".btn-agregar").forEach(btn => {
    btn.addEventListener("click", async () => {
      const uidAmigo = btn.getAttribute("data-uid");
      const user = firebase.auth().currentUser;

      if (!user) return;

      try {
        await agregarAmigo(user.uid, uidAmigo);
        btn.textContent = "Agregado";
        btn.disabled = true;
        btn.classList.add("btn-agregado");
      } catch (err) {
        console.error("Error al agregar amigo:", err);
        alert("No se pudo agregar el usuario.");
      }
    });
  });
}
