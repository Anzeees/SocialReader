// --- Importo la autenticación de Firebase
import { auth } from "./firebase.js";

// console.log("JS cargado para la vista de home");

const mainContent = document.getElementById("mainContent");

// --- Mostrar/ocultar menú hamburguesa
document.getElementById("hamburguesa").addEventListener("click", () => {
  document.getElementById("menuHamburguesa").classList.toggle("show");
  document.getElementById("sombra").style.display = "flex";
});

document.getElementById("exit").addEventListener("click", () => {
  document.getElementById("menuHamburguesa").classList.remove("show");
  document.getElementById("sombra").style.display = "none";
});

// --- Cargar vista interna: Buscar Libros
document.querySelectorAll("#buscarLink").forEach((enlace) => {
  enlace.addEventListener("click", (e) => {
    e.preventDefault();

    if (mainContent.dataset.vista === "search") return;

    fetch("./views/home/search.html")
      .then((res) => res.text())
      .then((html) => {
        mainContent.innerHTML = html;
        mainContent.dataset.vista = "search";
        const estilo = document.createElement("link");
        estilo.rel = "stylesheet";
        estilo.href = "./styles/home/search.css";
        document.head.appendChild(estilo);
        const script = document.createElement("script");
        script.type = "module";
        script.src = "./js/home/search.js";
        document.body.appendChild(script);
      })
      .catch((err) => {
        console.error("Error al cargar search.html:", err);
        mainContent.innerHTML = "<p>Error al cargar la vista.</p>";
      });
  });
});

// --- Ir a Inicio (solo recarga si no estás ya en inicio)
document.querySelectorAll("#inicioLink").forEach((enlace) => {
  enlace.addEventListener("click", (e) => {
    e.preventDefault();
    if (mainContent.dataset.vista !== "inicio") {
      mainContent.innerHTML = "";
      mainContent.dataset.vista = "inicio";
    }

    window.location.hash = "#home";
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  });
});

// --- Cerrar sesión (escritorio y móvil)
document.querySelectorAll("a").forEach((enlace) => {
  if (enlace.textContent.trim().toLowerCase() === "cerrar sesión") {
    enlace.addEventListener("click", (e) => {
      e.preventDefault();

      auth.signOut()
        .then(() => {
          console.log("Sesión cerrada");
          localStorage.removeItem("usuarioAutenticado");
          window.location.hash = "#login";
          window.dispatchEvent(new HashChangeEvent("hashchange"));
        })
        .catch((error) => {
          console.error("Error al cerrar sesión:", error);
          alert("Error al cerrar sesión.");
        });
    });
  }
});
