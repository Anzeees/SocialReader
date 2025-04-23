// MAIN.JS -- ÁNGEL MARTÍNEZ ORDIALES

// === IMPORTACIONES ===
// --- Importación del router princiapl de  navegación
import { iniciarRouter } from "./router.js";

// === INICIALIZACIÓN DE LA APLICACIÓN ===
// --- Inicia el router cuando se carga el DOM
window.addEventListener("DOMContentLoaded", () => {
  iniciarRouter();
});
