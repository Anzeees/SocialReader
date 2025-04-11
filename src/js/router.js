// --- Importar firebase auth
import { auth } from "./firebase.js";

// --- Guardar el elemento app, estilo y js
const app = document.getElementById('app');
const styleLink = document.getElementById('vista-style');
let scriptActual = null;
// --- Definicion de las vistas
const rutas = {
  login: {
    vista: 'login.html',
    estilo: 'login.css',
    script: 'login.js'
  },
  home: {
    vista: 'home.html',
    estilo: 'home.css',
    script: 'home.js'
  }
};

// --- Funciones para cargar vistas, scripts y estilos
export function cargarVista(nombre) {
  const ruta = rutas[nombre];
  // Vista no definida
  if (!ruta) {
    app.innerHTML = `<h2>Vista no encontrada: ${nombre}</h2>`;
    styleLink.href = '';
    return;
  }
  // Cargar vista y script
  fetch(`./views/${ruta.vista}`)
    .then(res => res.text())
    .then(html => {
      app.innerHTML = html;
      styleLink.href = `./styles/${ruta.estilo}`;
      setTimeout(() => cargarScript(ruta.script), 0);
    })
    .catch(err => {
      app.innerHTML = `<h2>Error cargando la vista.</h2>`;
      console.error(err);
    });
}

//  --- Cargar script de la vista actual
function cargarScript(nombreScript) {
  if (scriptActual) {
    scriptActual.remove();
  }

  const nuevoScript = document.createElement('script');
  nuevoScript.type = 'module';
  nuevoScript.src = `./js/${nombreScript}`;
  document.body.appendChild(nuevoScript);
  scriptActual = nuevoScript;
}

// --- Funcion iniciar router
export function iniciarRouter() {
  // Escuchar cambios en el estado de autenticación (Firebase)
  auth.onAuthStateChanged(user => {
    const hash = window.location.hash || "#login";
    let vista = hash.replace("#", "");

    if (user) {
      // Usuario autenticado
      if (vista === "login") {
        window.location.hash = "#home";
        vista = "home";
      }
    } else {
      // Usuario NO autenticado
      if (vista !== "login") {
        window.location.hash = "#login";
        vista = "login";
      }
    }

    cargarVista(vista);
  });

  // Reaccionar a cambios en la URL
  window.addEventListener("hashchange", () => {
    const vista = window.location.hash.replace("#", "");
    const user = auth.currentUser;

    if (!user && vista !== "login") {
      window.location.hash = "#login";
      return;
    }

    if (user && vista === "login") {
      window.location.hash = "#home";
      return;
    }

    cargarVista(vista);
  });
}
