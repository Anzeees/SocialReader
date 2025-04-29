// ROUTER.JS -- ÁNGEL MARTÍNEZ ORDIALES -- SOCIALREADER --

import { auth } from "./services/firebase.js";

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
  },
  search: {
    vista: 'search.html',
    estilo: 'search.css',
    script: 'search.js'
  },
  profile: {
    vista: 'profile.html',
    estilo: 'profile.css',
    script: 'profile.js'
  },
  detalle: {
    vista: 'detalles.html',
    estilo: 'detalles.css',
    script: 'detalles.js'
  },
  resena: {
    vista: 'resena.html',
    estilo: 'resena.css',
    script: 'resena.js'
  }
};

// === FUNCIÓN PRINCIPAL PARA CARGAR UNA VISTA ===
export function cargarVista(nombreRuta, parametro = null) {
  const ruta = rutas[nombreRuta];

  if (!ruta) {
    app.innerHTML = `<h2>Vista no encontrada: ${nombreRuta}</h2>`;
    styleLink.href = '';
    return;
  }

  fetch(`./views/${ruta.vista}`)
    .then(res => res.text())
    .then(html => {
      app.innerHTML = html;
      styleLink.href = `./styles/${ruta.estilo}`;

      // 💡 Si es la vista de login, forzar recarga solo si no venimos ya de un reload
      if (nombreRuta === "login" && !sessionStorage.getItem("recargadoLogin")) {
        sessionStorage.setItem("recargadoLogin", "true");
        location.reload();
        return;
      }

      // Si ya se ha recargado o no es login, cargar el script
      setTimeout(() => cargarScript(ruta.script, parametro), 0);
    })
    .catch(err => {
      app.innerHTML = `<h2>Error cargando la vista.</h2>`;
      console.error(err);
    });
}

// === FUNCIÓN AUXILIAR PARA CARGAR UN SCRIPT ===
function cargarScript(nombreScript, parametro = null) {
  if (scriptActual) {
    scriptActual.remove();
    scriptActual = null;
  }

  const nuevoScript = document.createElement("script");
  nuevoScript.type = "module";
  nuevoScript.src = `./js/${nombreScript}?t=${Date.now()}`;
  if (parametro) {
    nuevoScript.setAttribute("data-param", parametro);
  }

  document.body.appendChild(nuevoScript);
  scriptActual = nuevoScript;
}

// === INICIALIZACIÓN Y GESTIÓN DEL ENRUTADOR ===
export function iniciarRouter() {
  auth.onAuthStateChanged(user => {
    const hash = window.location.hash || "#login";
    const [vista, param] = hash.replace("#", "").split("/");

    if (user) {
      if (vista === "login") {
        window.location.hash = "#home";
        cargarVista("home");
      } else {
        cargarVista(vista, param);
      }
    } else {
      if (vista !== "login") {
        window.location.hash = "#login";
      }
      cargarVista("login");
    }
  });

  window.addEventListener("hashchange", () => {
    const [vista, param] = window.location.hash.replace("#", "").split("/");
    const user = auth.currentUser;

    if (!user && vista !== "login") {
      window.location.hash = "#login";
      return;
    }

    if (user && vista === "login") {
      window.location.hash = "#home";
      return;
    }

    cargarVista(vista, param);
  });
}