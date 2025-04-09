// main.js
import { cargarVista } from './router.js';

window.addEventListener('DOMContentLoaded', () => {
    const hash = location.hash.replace('#', '') || 'login';
    cargarVista(hash);
});

window.addEventListener('hashchange', () => {
    const hash = location.hash.replace('#', '') || 'login';
    cargarVista(hash);
});