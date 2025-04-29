/** LOGIN.JS -- ÁNGEL MARTÍNEZ ORDIALES -- SOCIALREADER --
===========================================================
Proyecto: SocialReader
Autor: Ángel Martínez Ordiales
Archivo: login.js
Descripción: Módulo de autenticación de usuarios.
*/

// === IMPORTACIONES ===
import { auth } from "./services/firebase.js";
import { crearPerfilUsuario } from "./services/firestoreService.js";

// === ESTADO GLOBAL ===
let autenticacionCancelada = false;
let popupEnCurso = false;

if (performance.navigation.type === 1) {

} else {
  location.reload();
}

/**
 * Carga la vista de login inicial y asigna los eventos (Función principal).
 * @function
 */
function cargarVistaLogin() {
  ajustarVista();
  window.addEventListener("resize", ajustarVista);
  agregarEventoLoginMovil();
  agregarEventoRegistroMovil();
  activarEventosEscritorio();
  activarSwitchMovil();
  activarLoginSocial();
  activarEventoRestablecerGlobal();
  document.getElementById("toggle").style.left = "0%";
}
// === BLOQUES FUNCIONALES ===
/**
 * Ajusta la vista entre escritorio y móvil según el ancho de pantalla.
 * @function
 */
function ajustarVista() {
  const izq = document.querySelector(".izq");
  const drch = document.querySelector(".drch");
  const izq2 = document.querySelector(".izq2");
  const drch2 = document.querySelector(".drch2");
  const movil = document.querySelector(".movil");

  // Si ninguno existe (no estamos en login), salir
  if (!izq && !drch && !izq2 && !drch2 && !movil) {
    return;
  }

  if (window.innerWidth <= 1000) {
    if (izq) izq.style.display = "none";
    if (drch) drch.style.display = "none";
    if (izq2) izq2.style.display = "none";
    if (drch2) drch2.style.display = "none";
    if (movil) movil.style.display = "flex";
  } else {
    if (movil) movil.style.display = "none";
    if (izq) izq.style.display = "flex";
    if (drch) drch.style.display = "flex";
    if (izq2) izq2.style.display = "none";
    if (drch2) drch2.style.display = "none";
  }
}

/**
 * Activa los eventos de login, registro y cambio entre formularios de escritorio.
 * @function
 */
function activarEventosEscritorio() {
  document.getElementById("formLogin").addEventListener("submit", (e) => {
    e.preventDefault();
    autenticacionCancelada = false;
    const correo = document.getElementById("correoinicio").value.trim();
    const contra = document.getElementById("contrainicio").value.trim();
    manejarLogin(correo, contra);
  });

  document.getElementById("formRegister").addEventListener("submit", (e) => {
    e.preventDefault();
    autenticacionCancelada = false;
    const nombre = document.getElementById("nombre").value.trim();
    const correo = document.getElementById("correoregistro").value.trim();
    const contra1 = document.getElementById("contraregistro").value;
    const contra2 = document.getElementById("contraregistro2").value;
    manejarRegistro(nombre, correo, contra1, contra2);
  });

  document.getElementById("btnRegistrarme").addEventListener("click", () => {
    document.querySelector(".izq").style.display = "none";
    document.querySelector(".drch").style.display = "none";
    document.querySelector(".movil").style.display = "none";
    document.querySelector(".izq2").style.display = "flex";
    document.querySelector(".drch2").style.display = "flex";
  });

  document.getElementById("btnIniciar").addEventListener("click", () => {
    document.querySelector(".izq").style.display = "flex";
    document.querySelector(".drch").style.display = "flex";
    document.querySelector(".movil").style.display = "none";
    document.querySelector(".izq2").style.display = "none";
    document.querySelector(".drch2").style.display = "none";
  });
}

/**
 * Agrega el evento de login para el formulario de móvil.
 * @function
 */
function agregarEventoLoginMovil() {
  const form = document.getElementById("formLoginMovil");
  if (!form) return;
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    autenticacionCancelada = false;
    const correo = form.correo.value.trim();
    const contra = form.contra.value.trim();
    manejarLogin(correo, contra);
  });
}

/**
 * Agrega el evento de registro para el formulario de móvil.
 * @function
 */
function agregarEventoRegistroMovil() {
  const form = document.getElementById("formRegisterMovil");
  if (!form) return;
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    autenticacionCancelada = false;
    const nombre = form.nombre.value.trim();
    const correo = form.correo.value.trim();
    const contra1 = form.contra.value;
    const contra2 = form.contra2.value;
    manejarRegistro(nombre, correo, contra1, contra2);
  });
}

/**
 * Activa el switch de cambio entre login y registro en móvil.
 * @function
 */
function activarSwitchMovil() {
  const btnWrapper = document.querySelector(".switch-wrapper");
  if (!btnWrapper) return;

  let isLogin = true;
  btnWrapper.addEventListener("click", () => {
    const toggle = document.getElementById("toggle");
    const login = document.getElementById("login");
    const register = document.getElementById("register");
    const contenedor = document.getElementById("formularioMovil");

    if (isLogin) {
      toggle.style.left = "50%";
      login.classList.remove("active");
      register.classList.add("active");
      contenedor.innerHTML = `
        <form id="formRegisterMovil">
          <h1>Únete a SocialReader</h1>
          <p>O regístrate con tu email</p>
          <input type="text" name="nombre" id="nombre" placeholder="Nombre" required>
          <input type="email" name="correo" id="correoregistro" placeholder="Correo Electrónico" required>
          <input type="password" name="contra" id="contraregistro" placeholder="Contraseña" required>
          <input type="password" name="contra2" id="contraregistro2" placeholder="Repetir Contraseña" required>
          <input type="submit" value="REGISTRARME" class="boton">
        </form>`;
      agregarEventoRegistroMovil();
    } else {
      toggle.style.left = "0%";
      register.classList.remove("active");
      login.classList.add("active");
      contenedor.innerHTML = `
        <form id="formLoginMovil">
          <h1>Vuelve a SocialReader</h1>
          <input type="email" name="correo" placeholder="Correo Electrónico" required>
          <input type="password" name="contra" placeholder="Contraseña" required>
          <center><a id="restablecerContra">¿Olvidaste tu contraseña?</a></center>
          <input type="submit" value="INICIAR SESIÓN" class="boton">
        </form>`;
      agregarEventoLoginMovil();
    }

    isLogin = !isLogin;
  });
}

/**
 * Maneja el proceso de registro de usuario.
 * @function
 * @param {string} nombre - Nombre del usuario.
 * @param {string} correo - Correo electrónico del usuario.
 * @param {string} contra1 - Contraseña ingresada.
 * @param {string} contra2 - Confirmación de la contraseña.
 */
function manejarRegistro(nombre, correo, contra1, contra2) {
  const patronSeguridad = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/;

  if (nombre.length < 3)
    return mostrarModalError("El nombre debe tener al menos 3 caracteres");

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo))
    return mostrarModalError("Correo inválido");

  if (!patronSeguridad.test(contra1))
    return mostrarModalError("La contraseña debe tener al menos 8 caracteres, incluyendo mayúsculas, minúsculas, números y un símbolo");

  if (contra1 !== contra2)
    return mostrarModalError("Las contraseñas no coinciden");

  auth.createUserWithEmailAndPassword(correo, contra1)
    .then((cred) => crearPerfilUsuario(cred.user, nombre))
    .then(() => {
      localStorage.setItem("usuarioAutenticado", "true");
      window.location.hash = "#home";
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    })
    .catch((error) => {
      console.error(error.code, error.message);
      mostrarModalError("Error al registrarse. Inténtalo más tarde.");
    });
}

/**
 * Maneja el inicio de sesión de usuario.
 * @function
 * @param {string} correo - Correo electrónico del usuario.
 * @param {string} contra - Contraseña del usuario.
 */
function manejarLogin(correo, contra) {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo))
    return mostrarModalError("Correo inválido");
  if (contra.length < 6)
    return mostrarModalError("Contraseña muy corta");

  auth.signInWithEmailAndPassword(correo, contra)
    .then(() => {
      localStorage.setItem("usuarioAutenticado", "true");
      window.location.hash = "#home";
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    })
    .catch((error) => {
      if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
        mostrarModalError("Correo o contraseña incorrectos.");
      } else {
        console.error(error.code, error.message);
        mostrarModalError("Error al iniciar sesión. Inténtalo más tarde.");
      }
    });
}

/**
 * Activa los eventos de inicio de sesión con proveedores sociales (Google, GitHub, Apple).
 * Maneja el flujo de autenticación con Firebase y errores comunes como cierre del popup
 * o conflictos de credenciales. En caso de éxito, redirige al usuario a la vista principal.
 */
function activarLoginSocial() {
  const iniciarSocial = (provider) => {
    autenticacionCancelada = false;

    auth.signInWithPopup(provider)
      .then((result) => {
        autenticacionCancelada = false;
        return crearPerfilUsuario(result.user);
      })
      .then(() => {
        localStorage.setItem("usuarioAutenticado", "true");
        window.location.hash = "#home";
        window.dispatchEvent(new HashChangeEvent("hashchange"));
      })
      .catch((error) => {
        if (error.code === "auth/popup-closed-by-user") {
          autenticacionCancelada = true;
          console.warn("Popup cerrado por el usuario.");
        } else if (error.code === "auth/account-exists-with-different-credential") {
          mostrarModalError("Ya existe una cuenta con ese correo. Usa el método original.");
        } else if (!autenticacionCancelada) {
          mostrarModalError("Error al autenticar. Intenta más tarde.");
        }
      });
  };

  document.querySelectorAll(".btn-google").forEach((btn) =>
    btn.addEventListener("click", () => iniciarSocial(new firebase.auth.GoogleAuthProvider()))
  );

  document.querySelectorAll(".btn-github").forEach((btn) =>
    btn.addEventListener("click", () => iniciarSocial(new firebase.auth.GithubAuthProvider()))
  );

  document.querySelectorAll(".btn-apple").forEach((btn) =>
    btn.addEventListener("click", () => {
      mostrarModalError("Este servicio aún no está disponible.");
    })
  );
}

/**
 * Activa el evento de restablecer contraseña cuando se hace click en cualquier elemento
 * con ID "restablecerContra". Aplica para versiones móvil y escritorio.
 * Utiliza delegación de eventos.
 * @returns {void}
 */
function activarEventoRestablecerGlobal() {
  document.addEventListener("click", (e) => {
    if (e.target?.id === "restablecerContra") {
      mostrarModalRestablecer();
    }
  });
}

/**
 * Muestra el modal de restablecimiento de contraseña.
 * Permite al usuario introducir un correo para enviar un email de recuperación.
 * @returns {void}
 */
function mostrarModalRestablecer() {
  const modal = document.getElementById("modalRestablecer");
  const inputCorreo = document.getElementById("correoRecuperacion");
  if (!modal || !inputCorreo) return;

  inputCorreo.value = "";
  modal.classList.remove("oculto");

  document.getElementById("btnEnviarRecuperacion").onclick = () => {
    const correo = inputCorreo.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      mostrarModalError("Correo inválido");
      return;
    }

    auth.sendPasswordResetEmail(correo)
      .then(() => {
        modal.classList.add("oculto");
        mostrarModalError("Correo de restablecimiento enviado.");
      })
      .catch((error) => {
        console.error(error.code, error.message);
        mostrarModalError("Error al enviar correo. Intenta más tarde.");
      });
  };

  document.getElementById("btnCerrarRecuperacion").onclick = () => {
    modal.classList.add("oculto");
  };
}

/**
 * Muestra un modal de error con un mensaje personalizado y opcionalmente redirige al cerrar.
 * Si el modal no existe (en otras vistas), simplemente no hace nada.
 * @param {string} mensaje - Mensaje de error a mostrar.
 * @param {string} [redireccion] - Ruta opcional a redirigir al cerrar el modal.
 */
function mostrarModalError(mensaje, redireccion = null) {
  const modal = document.getElementById("modalError");
  const texto = document.getElementById("mensajeError");
  const btnCerrar = document.getElementById("btnCerrarModal");

  // Si alguno de los elementos no existe, no mostramos modal
  if (!modal || !texto || !btnCerrar) {
    console.warn("Modal de error no disponible en esta vista.");
    return;
  }

  texto.textContent = mensaje;
  modal.classList.remove("oculto");

  btnCerrar.onclick = () => {
    modal.classList.add("oculto");
    if (redireccion) {
      window.location.hash = redireccion;
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    }
  };
}

cargarVistaLogin();