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
  }
};

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
      setTimeout(() => cargarScript(ruta.script, parametro), 0);
    })
    .catch(err => {
      app.innerHTML = `<h2>Error cargando la vista.</h2>`;
      console.error(err);
    });
}

function cargarScript(nombreScript, parametro = null) {
  if (scriptActual) {
    scriptActual.remove(); // elimina el script anterior
    scriptActual = null;
  }

  const nuevoScript = document.createElement("script");
  nuevoScript.type = "module";
  nuevoScript.src = `./js/${nombreScript}?t=${Date.now()}`; // cache busting
  if (parametro) {
    nuevoScript.setAttribute("data-param", parametro);
  }
  document.body.appendChild(nuevoScript);
  scriptActual = nuevoScript;
}

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
