export function configurarMenuHamburguesa() {
    const btnHamburguesa = document.getElementById("hamburguesa");
    const menu = document.getElementById("menuHamburguesa");
    const sombra = document.getElementById("sombra");
    const exitMenu = document.getElementById("exitMenu");
  
    if (btnHamburguesa && menu && sombra) {
      btnHamburguesa.addEventListener("click", () => {
        menu.classList.toggle("show");
        sombra.style.display = "flex";
      });
    }
  
    if (exitMenu) {
      exitMenu.addEventListener("click", (e) => {
        e.preventDefault();
        menu.classList.remove("show");
        sombra.style.display = "none";
      });
    }
  }
  
  export function configurarMenuPerfil() {
    const perfil = document.querySelector(".perfil");
    const menuPerfil = document.querySelector(".perfil-menu");
  
    if (perfil && menuPerfil) {
      perfil.addEventListener("click", (e) => {
        menuPerfil.style.display = menuPerfil.style.display === "flex" ? "none" : "flex";
        e.stopPropagation();
      });
  
      document.addEventListener("click", (e) => {
        if (!perfil.contains(e.target)) {
          menuPerfil.style.display = "none";
        }
      });
    }
  
    const nombreUsuario = document.getElementById("nombreUsuario");
    const enlacePerfil = document.querySelector(".perfil-menu a[href='#profile']");
  
    if (nombreUsuario) {
      nombreUsuario.addEventListener("click", () => {
        window.location.hash = "#profile";
      });
    }
  
    if (enlacePerfil) {
      enlacePerfil.addEventListener("click", (e) => {
        e.preventDefault();
        window.location.hash = "#profile";
      });
    }
  }
  
  export function desactivarBotonTemporalmente(boton, milisegundos = 1000) {
    if (!boton) return;
    boton.disabled = true;
    setTimeout(() => { boton.disabled = false; }, milisegundos);
  }
  
  export function configurarLecturaExpandida(idBio, idBoton) {
    const bio = document.getElementById(idBio);
    const boton = document.getElementById(idBoton);
    if (!bio || !boton) return;
  
    boton.addEventListener("click", () => {
      bio.classList.toggle("expandido");
      boton.textContent = bio.classList.contains("expandido") ? "Leer menos" : "Leer más";
    });
  }