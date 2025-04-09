// router.js (Encargado de cargar las vistas)

// Función para cargar una vista HTML y su CSS
export async function cargarVista(nombreVista) {
    try {
        const res = await fetch(`./views/${nombreVista}.html`);
        if (!res.ok) throw new Error('Error al cargar la vista: ' + res.statusText);

        // Extraer el HTML como texto
        const html = await res.text();

        // Insertar contenido en el contenedor app del index.html
        const appElement = document.getElementById('app');
        appElement.innerHTML = html;

        // Cambiar el estilo (CSS) de la vista
        const link = document.getElementById('vista-style');
        link.setAttribute('href', `./styles/${nombreVista}.css`);

        // Cargar el JS de la vista correspondiente
        await cargarJSVista(nombreVista);
    } catch (error) {
        console.error('Error al cargar la vista:', error);
        document.getElementById('app').innerHTML = '<h1>Error al cargar la vista</h1>';
    }
}

// Función para cargar el archivo JS correspondiente a la vista
async function cargarJSVista(nombreVista) {
    try {
        // Cargar el archivo JS de la vista desde la carpeta js/
        await import(`./${nombreVista}.js`);
        console.log(`JS de ${nombreVista} cargado correctamente.`);
    } catch (error) {
        console.error('Error al cargar el JS de la vista:', error);
    }
}
