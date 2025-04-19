import {
  mostrarNombre, avatarUsuario, agregarLibroFavorito, eliminarLibroFavorito, estaEnFavoritos, agregarMostrarMasTarde,
  eliminarMostrarMasTarde, estaEnMostrarMasTarde } from "./services/firestoreService.js";

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
      if (await estaEnFavoritos(user.uid, keyLimpia)) {
        favIcon = "./assets/img/interface/favact.png";
      }
      if (await estaEnMostrarMasTarde(user.uid, keyLimpia)) {
        mostrarIcon = "./assets/img/interface/marcact.png";
      }
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