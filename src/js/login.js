// LOGIN.JS -- ÁNGEL MARTÍNEZ ORDIALES

// === IMPORTACIONES ===
// --- Importación servicios de Firebase
import { auth } from "./services/firebase.js";
import { crearPerfilUsuario } from "./services/firestoreService.js";

// === ESTADO GLOBAL ===
let autenticacionCancelada = false;

// === FUNCIÓN PRINCIPAL: Cargar vista de login al iniciar ===
export function cargarVistaLogin() {
  ajustarVista();
  window.addEventListener("resize", ajustarVista);
  agregarEventoLoginMovil();
  agregarEventoRegistroMovil();
  activarEventosEscritorio();
  activarSwitchMovil();
  activarLoginSocial();
  document.getElementById("toggle").style.left = "0%";
}

// === BLOQUE: Ajuste de Vista según tamaño de pantalla ===
function ajustarVista() {
  if (window.innerWidth <= 1000) {
    document.querySelector(".izq").style.setProperty("display", "none");
    document.querySelector(".drch").style.setProperty("display", "none");
    document.querySelector(".izq2").style.setProperty("display", "none");
    document.querySelector(".drch2").style.setProperty("display", "none");
    document.querySelector(".movil").style.setProperty("display", "flex");
  } else {
    document.querySelector(".movil").style.setProperty("display", "none");
    document.querySelector(".izq").style.setProperty("display", "flex");
    document.querySelector(".drch").style.setProperty("display", "flex");
    document.querySelector(".izq2").style.setProperty("display", "none");
    document.querySelector(".drch2").style.setProperty("display", "none");
  }
}

// === BLOQUE: Activar eventos en formularios de escritorio ===
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

// === BLOQUE: Switch entre login y registro movil ===
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
          <p>O regístrate con tu correo electrónico</p>
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
          <p id="restablecerContra">¿Olvidaste tu contraseña?</p>
          <input type="submit" value="INICIAR SESIÓN" class="boton">
        </form>`;
      agregarEventoLoginMovil();
      activarRestablecer();
    }

    isLogin = !isLogin;
  });
}

// === BLOQUE: Validaciones y creación de usuario ===
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

// === BLOQUE: Inicio de sesión con correo y contraseña ===
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

// === Bloque: Restablecer contraseña ===
function activarRestablecer() {
  const parrafo = document.getElementById("restablecerContra");
  if (parrafo) {
    parrafo.addEventListener("click", () => {
      const correo = prompt("Introduce tu correo electrónico:");
      if (!correo || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) return;
      auth.sendPasswordResetEmail(correo)
        .then(() => alert("Correo de restablecimiento enviado"))
        .catch((error) => console.error(error.code, error.message));
    });
  }
}

// === BLOQUE: Login con Google, GitHub y control de errores ===
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

// === BLOQUE: Modal de error ===
function mostrarModalError(mensaje) {
  const modal = document.getElementById("modalError");
  const texto = document.getElementById("mensajeError");
  const btnCerrar = document.getElementById("btnCerrarModal");

  texto.textContent = mensaje;
  modal.classList.remove("oculto");

  btnCerrar.onclick = () => {
    modal.classList.add("oculto");
    autenticacionCancelada = false;
  };
}

cargarVistaLogin();