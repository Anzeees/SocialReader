import {
  mostrarNombre,
  avatarUsuario,
  crearResena,
} from "./services/firestoreService.js";
import { obtenerDetallesLibro } from "./services/openlibrary.js";

const mainContent = document.getElementById("mainContent");
const loader = document.getElementById("loader");

// === GESTIÓN DE INTERFAZ: MENÚ HAMBURGUESA ===
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
["exitescritorio", "exitmovil"].forEach((id) => {
  const btn = document.getElementById(id);
  if (btn) {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      firebase
        .auth()
        .signOut()
        .then(() => {
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
      if (imgUsuarioEscritorio)
        imgUsuarioEscritorio.src = `./assets/img/avatars/${avatar}`;
      if (imgUsuario) imgUsuario.src = `./assets/img/avatars/${avatar}`;
    });
  }
});

function obtenerWorkIdDesdeHash() {
  const hash = window.location.hash;
  const partes = hash.split("/");
  return partes.length === 2 ? partes[1] : null;
}

function activarEstrellas() {
  const estrellas = document.querySelectorAll(".estrella");

  estrellas.forEach((estrella) => {
    estrella.addEventListener("click", () => {
      const valorSeleccionado = parseInt(estrella.dataset.valor);
      estrellas.forEach((e) => {
        e.classList.toggle(
          "activa",
          parseInt(e.dataset.valor) <= valorSeleccionado
        );
      });
      document
        .getElementById("valoracion")
        .setAttribute("data-valor", valorSeleccionado);
    });
  });
}

firebase.auth().onAuthStateChanged(async (user) => {
  if (!user) return;
  const uid = user.uid;
  const workId = obtenerWorkIdDesdeHash();
  if (!workId) {
    mainContent.innerHTML = "<p>Error: libro no especificado.</p>";
    return;
  }

  loader.style.display = "flex";
  mainContent.hidden = true;

  const libro = await obtenerDetallesLibro(workId);
  loader.style.display = "none";
  if (!libro) {
    mainContent.innerHTML = "<p>Error al cargar los detalles del libro.</p>";
    return;
  }

  mainContent.innerHTML = `
    <div class="resena-container">
      <div class="info-libro">
        <img src="${
          libro.portada
        }" alt="Portada del libro" class="portada-libro">
        <div class="datos-libro">
          <h2>${libro.titulo}</h2>
          <p class="autor">${libro.autor}</p>
        </div>
      </div>
      <hr class="separador">
      <form id="formResena">
        <label for="valoracion">Mi Valoración:</label>
        <div class="estrellas" id="valoracion" data-valor="0">
          ${[1, 2, 3, 4, 5]
            .map((i) => `<span class="estrella" data-valor="${i}">★</span>`)
            .join("")}
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
      const valoracion =
        parseInt(
          document.getElementById("valoracion").getAttribute("data-valor")
        ) || 0;
      const spoilers = document.getElementById("spoiler").checked;

      try {
        await crearResena(uid, workId, review, valoracion, spoilers);
        alert("Reseña publicada correctamente.");
      } catch (error) {
        console.error("Error al crear la reseña:", error);
        alert("No se pudo guardar la reseña. Intenta más tarde.");
      }
    });
});
