import { mostrarNombre, avatarUsuario } from "./services/firestoreService.js";
import { obtenerLibrosPopulares, obtenerTopMasVendidos } from "./services/openlibrary.js";

const mainContent = document.getElementById("mainContent");
const loader = document.getElementById("loader");

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

function mostrarDetalleLibro(key) {
  mainContent.innerHTML = `
    <div class="spinner-busqueda">
      <div class="spinner"></div>
      <p>Cargando detalles del libro...</p>
    </div>
  `;
  fetch(`https://openlibrary.org/works/${key}.json`)
    .then(res => res.json())
    .then(libro => {
      const titulo = libro.title || "Título desconocido";
      const descripcion = typeof libro.description === 'string'
        ? libro.description
        : libro.description?.value || "Sin descripción";
      const tema = libro.subjects?.slice(0, 5).join(", ") || "No especificado";

      mainContent.innerHTML = `
        <div class="detalle-libro">
          <h2>${titulo}</h2>
          <p><strong>Temas:</strong> ${tema}</p>
          <p><strong>Descripción:</strong></p>
          <p>${descripcion}</p>
        </div>
      `;
    })
    .catch(() => {
      mainContent.innerHTML = "<p>Error al cargar los detalles del libro.</p>";
    });
}

cargarTopLibros();
