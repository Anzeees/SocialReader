import { mostrarNombre, avatarUsuario, agregarLibroFavorito, eliminarLibroFavorito,
  estaEnFavoritos,
  agregarMostrarMasTarde,
  eliminarMostrarMasTarde,
  estaEnMostrarMasTarde
} from "./services/firestoreService.js";

// Referencias
const mainContent = document.getElementById("mainContent");
const loader = document.getElementById("loader");

document.getElementById("hamburguesa").addEventListener("click", () => {
  document.getElementById("menuHamburguesa").classList.toggle("show");
  document.getElementById("sombra").style.display = "flex";
});

function cerrarSesion() {
  document.getElementById("menuHamburguesa").classList.remove("show");
  document.getElementById("sombra").style.display = "none";
  firebase.auth().signOut().then(() => {
    localStorage.removeItem("usuarioAutenticado");
    window.location.hash = "#login";
    window.dispatchEvent(new HashChangeEvent("hashchange"));
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
  document.getElementById("sombra").style.display = "none";
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

document.getElementById("botonBuscar").addEventListener("click", () => {
  const filtro = document.getElementById("filtroBusqueda").value;
  const termino = document.getElementById("campoBusqueda").value.trim();
  const contenedor = document.getElementById("resultadosLibros");
  const spinner = document.getElementById("spinnerBusqueda");

  if (termino === "") return;

  contenedor.innerHTML = "";
  spinner.classList.remove("oculto");

  const url = `https://openlibrary.org/search.json?${filtro}=${encodeURIComponent(termino)}&fields=title,author_name,cover_i,subject,first_publish_year,edition_count,key`;

  fetch(url)
    .then(res => res.json())
    .then(data => mostrarResultados(data.docs))
    .catch(error => {
      console.error("Error al buscar libros:", error);
      contenedor.innerHTML = "<p>Error al buscar libros.</p>";
    })
    .finally(() => {
      spinner.classList.add("oculto");
    });
});

document.getElementById("campoBusqueda").addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    document.getElementById("botonBuscar").click();
  }
});

function mostrarResultados(libros) {
  const contenedor = document.getElementById("resultadosLibros");
  contenedor.innerHTML = "";

  if (!libros || libros.length === 0) {
    contenedor.innerHTML = "<p>No se encontraron resultados.</p>";
    return;
  }

  const user = firebase.auth().currentUser;

  libros.slice(0, 10).forEach(async libro => {
    const portada = libro.cover_i
      ? `https://covers.openlibrary.org/b/id/${libro.cover_i}-M.jpg`
      : "./assets/img/logotipos/portadaDefault.png";

    const autores = libro.author_name?.join(", ") || "Autor desconocido";
    const categoria = Array.isArray(libro.subject) && libro.subject.length > 0
      ? libro.subject.slice(0, 2).join(", ")
      : "Sin categoría";
    const anio = libro.first_publish_year || "N/A";
    const ediciones = libro.edition_count || 1;
    const valoracion = Math.floor(Math.random() * 2) + 4;
    const resenas = Math.floor(Math.random() * 200) + 1;
    const keyLimpia = libro.key.replace("/works/", "");

    let favIcon = "./assets/img/interface/favdes.png";
    let mostrarIcon = "./assets/img/interface/marcdes.png";

    if (user) {
      if (await estaEnFavoritos(user.uid, keyLimpia)) favIcon = "./assets/img/interface/favact.png";
      if (await estaEnMostrarMasTarde(user.uid, keyLimpia)) mostrarIcon = "./assets/img/interface/marcact.png";
    }

    const item = document.createElement("div");
    item.className = "resultado-libro";

    item.innerHTML = `
      <img src="${portada}" alt="Portada" class="portada">
      <div class="info-libro">
        <h4>${libro.title}</h4>
        <p class="autor">Autor: ${autores}</p>
        <p class="categoria">Categorías: ${categoria}</p>
        <p class="publicacion"><strong>Primera publicación en ${anio} - ${ediciones} ediciones</strong></p>
        <div class="valoracion">
          ${"★".repeat(valoracion)}${"☆".repeat(5 - valoracion)}
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
        <button class="resena"><img src="./assets/img/interface/nueva-resena.png" alt="Reseña"> Nueva Reseña</button>
      </div>
    `;

    item.addEventListener("click", () => {
      mostrarDetalleLibro(keyLimpia);
    });

    contenedor.appendChild(item);
  });
}

// Favoritos
document.addEventListener("click", async (e) => {
  const btn = e.target.closest(".btn-fav");
  if (!btn) return;

  const user = firebase.auth().currentUser;
  if (!user) return;

  const key = btn.dataset.id.replace("/works/", "");
  const img = btn.querySelector("img");

  const esta = await estaEnFavoritos(user.uid, key);

  if (esta) {
    await eliminarLibroFavorito(user.uid, key);
    img.src = "./assets/img/interface/favdes.png";
  } else {
    await agregarLibroFavorito(user.uid, key);
    img.src = "./assets/img/interface/favact.png";
  }
});

// Mostrar Más Tarde
document.addEventListener("click", async (e) => {
  const btn = e.target.closest(".btn-mostrar");
  if (!btn) return;

  const user = firebase.auth().currentUser;
  if (!user) return;

  const key = btn.dataset.id.replace("/works/", "");
  const img = btn.querySelector("img");

  const esta = await estaEnMostrarMasTarde(user.uid, key);

  if (esta) {
    await eliminarMostrarMasTarde(user.uid, key);
    img.src = "./assets/img/interface/marcdes.png";
  } else {
    await agregarMostrarMasTarde(user.uid, key);
    img.src = "./assets/img/interface/marcact.png";
  }
});

// Vista de detalle del libro
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
      const descripcion = typeof libro.description === "string"
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
