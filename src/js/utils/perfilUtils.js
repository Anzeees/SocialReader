import { mostrarNombre, avatarUsuario } from "../services/firestoreService.js";

export function cargarDatosUsuario(uid) {
  mostrarNombre(uid, (nombre) => {
    const h5Usuario = document.querySelector(".perfil-movil h5");
    if (h5Usuario) h5Usuario.textContent = nombre;
  });

  avatarUsuario(uid, (avatar) => {
    const imgMovil = document.querySelector(".perfil-movil img");
    const imgEscritorio = document.querySelector(".perfil img");
    if (imgEscritorio) imgEscritorio.src = `./assets/img/avatars/${avatar}`;
    if (imgMovil) imgMovil.src = `./assets/img/avatars/${avatar}`;
  });
}