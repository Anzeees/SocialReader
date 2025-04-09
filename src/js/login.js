console.log("JS cargado para la vista de login");

// Función que controla la visibilidad de los elementos según el tamaño de la ventana
function ajustarVista() {
  if (window.innerWidth <= 1000) {
    document.querySelector(".izq").style.display = "none";
    document.querySelector(".drch").style.display = "none";
    document.querySelector(".izq2").style.display = "none";
    document.querySelector(".drch2").style.display = "none";
    document.querySelector(".movil").style.display = "flex";
  } else {
    // Revertir cambios cuando el tamaño de la ventana es mayor a 1000px
    document.querySelector(".movil").style.display = "none";
    document.querySelector(".izq").style.display = "flex";
    document.querySelector(".drch").style.display = "flex";
    document.querySelector(".izq2").style.display = "none";
    document.querySelector(".drch2").style.display = "none";
  }
}

// Llamamos a la función de ajuste al cargar la página
ajustarVista();

// Escuchar los cambios de tamaño de la ventana para actualizar la visibilidad
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

const btnWrapper = document.querySelector(".switch-wrapper");
let isLogin = true;
btnWrapper.addEventListener("click", () => {
    console.log("Toggle switch clicked");
    const toggle = document.getElementById("toggle");
    const login = document.getElementById("login");
    const register = document.getElementById("register");
    const formulario = document.getElementById("formularioMovil");
  
    if (isLogin) {
      toggle.style.left = "50%";
      login.classList.remove("active");
      register.classList.add("active");
  
      formulario.innerHTML = ` 
        <h1>Únete a SocialReader</h1>
        <p>O regístrate con tu correo electrónico</p>
        <input type="text" name="nombre" placeholder="Nombre" required>
        <input type="email" name="correo" placeholder="Correo Electrónico" required>
        <input type="password" name="contra" placeholder="Contraseña" required>
        <input type="password" name="contra2" placeholder="Repetir Contraseña" required>
        <input type="submit" value="REGISTRARME" class="boton">`;
    } else {
      toggle.style.left = "0%";
      register.classList.remove("active");
      login.classList.add("active");
  
      formulario.innerHTML = ` 
        <h1>Vuelve a SocialReader</h1>
        <input type="email" name="correo" placeholder="Correo Electrónico" required>
        <input type="password" name="contra" placeholder="Contraseña" required>
        <p>¿Olvidaste tu contraseña?</p>
        <input type="submit" value="INICIAR SESIÓN" class="boton">`;
    }
  
    isLogin = !isLogin;
});

// Inicializar posición del toggle
document.getElementById("toggle").style.left = "0%";

