// --- Importamos funcion firebase authentication
import { auth } from "./firebase.js";

// console.log("JS cargado para la vista de login");

// --- Eventos para escritorio (Formularios de inicio de sesión y registro)
document.getElementById("formLogin").addEventListener("submit", function (e) {
  e.preventDefault();
  const correo = document.getElementById("correoinicio").value.trim();
  const contra = document.getElementById("contrainicio").value.trim();
  manejarLogin(correo, contra, "Escritorio");
});

document
  .getElementById("formRegister")
  .addEventListener("submit", function (e) {
    e.preventDefault();
    const nombre = document.getElementById("nombre").value.trim();
    const correo = document.getElementById("correoregistro").value.trim();
    const contra1 = document.getElementById("contraregistro").value;
    const contra2 = document.getElementById("contraregistro2").value;
    manejarRegistro(nombre, correo, contra1, contra2, "Escritorio");
  });

// --- Funciones para eventos móviles (Formularios de inicio de sesión y registro)
function agregarEventoLoginMovil() {
  const form = document.getElementById("formLoginMovil");
  if (!form) return;
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const correo = form.correo.value.trim();
    const contra = form.contra.value.trim();
    manejarLogin(correo, contra, "Móvil");
  });
}

function agregarEventoRegistroMovil() {
  const form = document.getElementById("formRegisterMovil");
  if (!form) return;
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const nombre = form.nombre.value.trim();
    const correo = form.correo.value.trim();
    const contra1 = form.contra.value;
    const contra2 = form.contra2.value;
    manejarRegistro(nombre, correo, contra1, contra2, "Móvil");
  });
}

// --- Cambios visuales y alternancia de formularios
function ajustarVista() {
  if (window.innerWidth <= 1000) {
    document.querySelector(".izq").style.display = "none";
    document.querySelector(".drch").style.display = "none";
    document.querySelector(".izq2").style.display = "none";
    document.querySelector(".drch2").style.display = "none";
    document.querySelector(".movil").style.display = "flex";
  } else {
    document.querySelector(".movil").style.display = "none";
    document.querySelector(".izq").style.display = "flex";
    document.querySelector(".drch").style.display = "flex";
    document.querySelector(".izq2").style.display = "none";
    document.querySelector(".drch2").style.display = "none";
  }
}
ajustarVista();
window.addEventListener("resize", ajustarVista);

const btnRegistrarme = document.getElementById("btnRegistrarme");
const btnIniciar = document.getElementById("btnIniciar");
if (btnRegistrarme) {
  btnRegistrarme.addEventListener("click", function () {
    document.querySelector(".izq").style.display = "none";
    document.querySelector(".drch").style.display = "none";
    document.querySelector(".movil").style.display = "none";
    document.querySelector(".izq2").style.display = "flex";
    document.querySelector(".drch2").style.display = "flex";
  });
}
if (btnIniciar) {
  btnIniciar.addEventListener("click", function () {
    document.querySelector(".izq").style.display = "flex";
    document.querySelector(".drch").style.display = "flex";
    document.querySelector(".movil").style.display = "none";
    document.querySelector(".izq2").style.display = "none";
    document.querySelector(".drch2").style.display = "none";
  });
}

// SWITCH entre formularios tamaño móvil
const btnWrapper = document.querySelector(".switch-wrapper");
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
        <input type="text" name="nombre" placeholder="Nombre" required>
        <input type="email" name="correo" placeholder="Correo Electrónico" required>
        <input type="password" name="contra" placeholder="Contraseña" required>
        <input type="password" name="contra2" placeholder="Repetir Contraseña" required>
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
        <p>¿Olvidaste tu contraseña?</p>
        <input type="submit" value="INICIAR SESIÓN" class="boton">
      </form>`;
    agregarEventoLoginMovil();
  }

  isLogin = !isLogin;
});

document.getElementById("toggle").style.left = "0%";
agregarEventoLoginMovil();

// --- Registro
function manejarRegistro(nombre, correo, contra1, contra2, origen) {
  if (nombre.trim().length < 3)
    return console.log("El nombre debe tener al menos 3 caracteres");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo))
    return console.log("Correo inválido");
  if (contra1.length < 6)
    return console.log("La contraseña debe tener al menos 6 caracteres");
  if (contra1 !== contra2) return console.log("Las contraseñas no coinciden");

  auth
    .createUserWithEmailAndPassword(correo, contra1)
    .then((userCredential) => {
      const user = userCredential.user;

      // Enviar correo de verificación
      user
        .sendEmailVerification()
        .then(() => {
          alert(
            "Registro exitoso. Por favor, verifica tu correo electrónico antes de iniciar sesión."
          );
          auth.signOut(); // Cerramos sesión hasta que verifique
        })
        .catch((error) => {
          console.error("Error al enviar verificación:", error);
          alert("No se pudo enviar el correo de verificación.");
        });
    })
    .catch((error) => {
      console.error(error.code, error.message);
      alert(error.message);
    });
}

// --- Login
function manejarLogin(correo, contra, origen) {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo))
    return alert("Correo inválido");
  if (contra.length < 6) return alert("Contraseña muy corta");

  auth
    .signInWithEmailAndPassword(correo, contra)
    .then((userCredential) => {
      const user = userCredential.user;

      if (user.emailVerified) {
        console.log("Inicio de sesión exitoso:", user.email);
        localStorage.setItem("usuarioAutenticado", "true");
        window.location.hash = "#home";
        window.dispatchEvent(new HashChangeEvent("hashchange"));
      } else {
        alert(
          "Por favor, verifica tu correo electrónico antes de iniciar sesión."
        );
        auth.signOut(); // Evitar sesión activa
      }
    })
    .catch((error) => {
      console.error("Error al iniciar sesión:", error.code, error.message);
      alert("Correo o contraseña incorrectos.");
    });
}

// --- Inicio de sesión con Google
document.querySelectorAll("#google").forEach((btn) => {
  btn.addEventListener("click", () => {
    const provider = new firebase.auth.GoogleAuthProvider();

    auth
      .signInWithPopup(provider)
      .then((result) => {
        const user = result.user;
        console.log("Inicio con Google:", user.email);
        localStorage.setItem("usuarioAutenticado", "true");
        window.location.hash = "#home";
        window.dispatchEvent(new HashChangeEvent("hashchange"));
      })
      .catch((error) => {
        console.error("Error Google:", error);
        alert("Error al iniciar sesión con Google.");
      });
  });
});

// --- Inicio de sesión con GitHub
document.querySelectorAll("#github").forEach((btn) => {
  btn.addEventListener("click", () => {
    const provider = new firebase.auth.GithubAuthProvider();

    auth
      .signInWithPopup(provider)
      .then((result) => {
        const user = result.user;
        console.log("Inicio con GitHub:", user.email);
        localStorage.setItem("usuarioAutenticado", "true");
        window.location.hash = "#home";
        window.dispatchEvent(new HashChangeEvent("hashchange"));
      })
      .catch((error) => {
        console.error("Error GitHub:", error.code, error.message);
        alert("Error al iniciar sesión con GitHub.");
      });
  });
});

// --- Inicio de sesión con Apple (requiere configuración previa en Firebase y Apple Developer)
document.querySelectorAll("#apple").forEach((btn) => {
  btn.addEventListener("click", () => {
    alert("Funcionalidad no disponible en este momento.");
    //     const provider = new firebase.auth.OAuthProvider('apple.com');

    //     auth.signInWithPopup(provider)
    //       .then((result) => {
    //         const user = result.user;
    //         console.log("Inicio con Apple:", user.email);
    //         localStorage.setItem("usuarioAutenticado", "true");
    //         window.location.hash = "#home";
    //         window.dispatchEvent(new HashChangeEvent("hashchange"));
    //       })
    //       .catch((error) => {
    //         console.error("Error Apple:", error.code, error.message);
    //         alert("Error al iniciar sesión con Apple.");
    //       });
  });
});

// --- Restablecer contraseña
const parrafoRestablecer = document.getElementById("restablecerContra");
if (parrafoRestablecer) {
  parrafoRestablecer.addEventListener("click", () => {
    const correo = prompt("Introduce tu correo electrónico para restablecer la contraseña:");
    if (!correo || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      alert("Por favor, introduce un correo válido.");
      return;
    }

    auth.sendPasswordResetEmail(correo)
      .then(() => {
        alert("Se ha enviado un correo para restablecer tu contraseña.");
      })
      .catch((error) => {
        console.error("Error al enviar el correo de restablecimiento:", error.code, error.message);
        alert("No se pudo enviar el correo. ¿Estás seguro de que ese correo está registrado?");
      });
  });
}
