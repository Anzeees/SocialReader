import { mostrarNombre, avatarUsuario } from "./services/firestoreService.js";
export function accionesMenu(){
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
}
