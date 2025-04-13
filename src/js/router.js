import { auth } from "./firebase.js";

const app = document.getElementById('app');
const styleLink = document.getElementById('vista-style');
let scriptActual = null;

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

export function cargarVista(nombre) {
  const ruta = rutas[nombre];
  if (!ruta) {
    app.innerHTML = `<h2>Vista no encontrada: ${nombre}</h2>`;
    styleLink.href = '';
    return;
  }

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

function cargarScript(nombreScript) {
  if (scriptActual) {
    scriptActual.remove(); // elimina el script anterior
    scriptActual = null;
  }

  const nuevoScript = document.createElement("script");
  nuevoScript.type = "module";
  nuevoScript.src = `./js/${nombreScript}?t=${Date.now()}`; // cache busting
  document.body.appendChild(nuevoScript);
  scriptActual = nuevoScript;
}

export function iniciarRouter() {
  auth.onAuthStateChanged(user => {
    const hash = window.location.hash || "#login";
    let vista = hash.replace("#", "");

    if (user) {
      if (vista === "login") {
        window.location.hash = "#home";
        vista = "home";
      }
    } else {
      if (vista !== "login") {
        window.location.hash = "#login";
        vista = "login";
      }
    }

    cargarVista(vista);
  });

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
