console.log("JS cargado para la vista de login");

// --- Eventos para escritorio
document.getElementById("formLogin").addEventListener("submit", function (e) {
  e.preventDefault();
  const correo = document.getElementById("correoinicio").value.trim();
  const contra = document.getElementById("contrainicio").value.trim();
  manejarLogin(correo, contra, "Escritorio");
});

document.getElementById("formRegister").addEventListener("submit", function (e) {
  e.preventDefault();
  const nombre = document.getElementById("nombre").value.trim();
  const correo = document.getElementById("correoregistro").value.trim();
  const contra1 = document.getElementById("contraregistro").value;
  const contra2 = document.getElementById("contraregistro2").value;
  manejarRegistro(nombre, correo, contra1, contra2, "Escritorio");
});

// --- Funciones para eventos móviles (dinámicos)
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
  document.title = "SignUp - Social Reader";
  btnRegistrarme.addEventListener("click", function () {
    document.title = "SignUp - Social Reader";
    document.querySelector(".izq").style.display = "none";
    document.querySelector(".drch").style.display = "none";
    document.querySelector(".movil").style.display = "none";
    document.querySelector(".izq2").style.display = "flex";
    document.querySelector(".drch2").style.display = "flex";
  });
}

if (btnIniciar) {
  document.title = "LogIn - Social Reader";
  btnIniciar.addEventListener("click", function () {
    document.title = "LogIn - Social Reader";
    document.querySelector(".izq").style.display = "flex";
    document.querySelector(".drch").style.display = "flex";
    document.querySelector(".movil").style.display = "none";
    document.querySelector(".izq2").style.display = "none";
    document.querySelector(".drch2").style.display = "none";
  });
}

// SWITCH entre formularios tamaño movil
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
agregarEventoLoginMovil(); // Por si se carga en login


// Funciones de validacion datos de formulario

// Validacion Correo
function esCorreoValido(correo) {
  const patron = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return patron.test(correo);
}

// Manejo validacion inputs login
function manejarLogin(correo, contra, origen) {
  if (!esCorreoValido(correo)) {
    console.log(`Correo inválido en ${origen}`);
    return;
  }

  if (contra.length < 6) {
    console.log(`La contraseña debe tener al menos 6 caracteres (${origen})`);
    return;
  }

  console.log(`Formulario LOGIN (${origen}) válido:`, { correo, contra });
}

// Manejo validacion inputs registro
function manejarRegistro(nombre, correo, contra1, contra2, origen) {
  if (nombre.trim().length < 3) {
    console.log(`El nombre debe tener al menos 3 caracteres (${origen})`);
    return;
  }

  if (!esCorreoValido(correo)) {
    console.log(`Correo inválido en ${origen}`);
    return;
  }

  if (contra1.length < 6) {
    console.log(`La contraseña debe tener al menos 6 caracteres (${origen})`);
    return;
  }

  if (contra1 !== contra2) {
    console.log(`Las contraseñas no coinciden (${origen})`);
    return;
  }

  console.log(`Formulario REGISTRO (${origen}) válido:`, { nombre, correo, contra1 });
}