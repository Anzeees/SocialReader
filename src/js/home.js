// --- Referencia al contenedor principal
const mainContent = document.getElementById("mainContent");

// --- Abrir menú hamburguesa
document.getElementById("hamburguesa").addEventListener("click", () => {
  document.getElementById("menuHamburguesa").classList.toggle("show");
  document.getElementById("sombra").style.setProperty("display", "flex");
});

// --- Función única para cerrar sesión
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

// --- Cerrar sesión desde botón escritorio
document.getElementById("exitescritorio").addEventListener("click", (e) => {
  e.preventDefault();
  cerrarSesion();
});

// --- Cerrar sesión desde botón móvil
document.getElementById("exitmovil").addEventListener("click", (e) => {
  e.preventDefault();
  cerrarSesion();
});

