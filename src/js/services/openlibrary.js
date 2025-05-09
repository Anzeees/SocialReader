// OPENLIBRARY.JS -- ÁNGEL MARTÍNEZ ORDIALES

// === FUNCIONES AUXILIARES ===

/**
 * Obtiene el nombre de un autor dado su key en OpenLibrary.
 * @param {string} autorKey - Ruta del autor en OpenLibrary (ej: /authors/OL12345A).
 * @returns {Promise<string>} Nombre del autor o 'Autor desconocido'.
 */
async function obtenerNombreAutor(autorKey) {
  try {
    const respuesta = await fetch(`https://openlibrary.org${autorKey}.json`);
    const datos = await respuesta.json();
    return datos.name || 'Autor desconocido';
  } catch {
    return 'Autor desconocido';
  }
}

/**
 * Traduce un código de idioma de OpenLibrary a su nombre en español.
 * @param {string} idiomaKey - Ruta del idioma en OpenLibrary (ej: /languages/eng).
 * @returns {Promise<string>} Nombre del idioma o el propio código si no está mapeado.
 */
async function obtenerNombreIdioma(idiomaKey) {
  const cod = idiomaKey.split('/').pop();
  const nombres = {
    eng: 'Inglés',
    spa: 'Español',
    fre: 'Francés',
    ger: 'Alemán',
    ita: 'Italiano',
    por: 'Portugués',
  };
  return nombres[cod] || cod;
}

// === FUNCIONES PRINCIPALES ===

/**
 * Obtiene un resumen breve de un libro a partir de su workId.
 * @param {string} workId - ID del work en OpenLibrary.
 * @returns {Promise<object|null>} Datos básicos del libro o null si falla.
 */
export async function obtenerResumenLibro(workId) {
  try {
    const res = await fetch(`https://openlibrary.org/works/${workId}.json`);
    const data = await res.json();
    return {
      id: workId,
      titulo: data.title || 'Sin título',
      autor: data.authors?.[0]?.author?.key
        ? await obtenerNombreAutor(data.authors[0].author.key)
        : 'Autor desconocido',
      portada: data.covers?.[0]
        ? `https://covers.openlibrary.org/b/id/${data.covers[0]}-M.jpg`
        : './assets/img/logotipos/portadaDefault.png',
    };
  } catch (error) {
    console.error('Error al obtener resumen del libro:', error);
    return null;
  }
}

/**
 * Obtiene los detalles completos de un libro (autor, editorial, año, etc).
 * @param {string} workId - ID del work en OpenLibrary.
 * @returns {Promise<object|null>} Datos completos del libro o null si falla.
 */
export async function obtenerDetallesLibro(workId) {
  try {
    const resWork = await fetch(`https://openlibrary.org/works/${workId}.json`);
    const workData = await resWork.json();

    const primeraEdicionKey = workData.edition_key?.[0];
    let edicionData = {};

    if (primeraEdicionKey) {
      const resEdicion = await fetch(`https://openlibrary.org/books/${primeraEdicionKey}.json`);
      edicionData = await resEdicion.json();
    }

    const isbn = edicionData.isbn_13?.[0] || edicionData.isbn_10?.[0] || 'No disponible';
    const edicion = edicionData.edition_name || 'No especificada';
    const linkOpenLibrary = `https://openlibrary.org/works/${workId}`;
    let biografiaAutor = '';
    let librosRelacionados = [];

    if (workData.authors?.[0]?.author?.key) {
      const autorKey = workData.authors[0].author.key;
      try {
        const autorRes = await fetch(`https://openlibrary.org${autorKey}.json`);
        const autorData = await autorRes.json();
        biografiaAutor = autorData.bio?.value || autorData.bio || '';
      } catch {
        biografiaAutor = '';
      }
    }

    if (workData.subjects?.[0]) {
      try {
        const relatedRes = await fetch(`https://openlibrary.org/subjects/${workData.subjects[0].toLowerCase()}.json?limit=3`);
        const relatedData = await relatedRes.json();
        librosRelacionados = (relatedData.works || []).map(libro => ({
          id: libro.key.split("/").pop(),
          portada: libro.cover_id
            ? `https://covers.openlibrary.org/b/id/${libro.cover_id}-M.jpg`
            : './assets/img/logotipos/portadaDefault.png'
        }));
      } catch {
        librosRelacionados = [];
      }
    }

    return {
      id: workId,
      titulo: workData.title || 'Sin título',
      autor: workData.authors?.[0]?.author?.key
        ? await obtenerNombreAutor(workData.authors[0].author.key)
        : 'Autor desconocido',
      portada: workData.covers?.[0]
        ? `https://covers.openlibrary.org/b/id/${workData.covers[0]}-L.jpg`
        : './assets/img/logotipos/portadaDefault.png',
      añoPublicacion: edicionData.publish_date || 'Desconocido',
      editorial: edicionData.publishers?.[0] || 'No especificada',
      idiomas: edicionData.languages
        ? await Promise.all(edicionData.languages.map(async l => await obtenerNombreIdioma(l.key)))
        : ['No especificados'],
      generos: workData.subjects?.slice(0, 5) || ['Sin datos'],
      paginas: edicionData.number_of_pages || 'No especificado',
      sinopsis: workData.description
        ? typeof workData.description === 'string'
          ? workData.description
          : workData.description.value
        : 'Sin sinopsis disponible',
      isbn,
      edicion,
      linkOpenLibrary,
      biografiaAutor,
      librosRelacionados
    };
  } catch (error) {
    console.error('Error al obtener los detalles del libro:', error);
    return null;
  }
}

/**
 * Obtiene una lista de libros de fantasía populares (simulados como "más vendidos").
 * @returns {Promise<Array<object>>} Lista de resúmenes de libros.
 */
export async function obtenerTopMasVendidos() {
  try {
    const res = await fetch('https://openlibrary.org/subjects/fantasy.json?limit=20');
    const data = await res.json();
    return Promise.all(data.works.map(libro => {
      const id = libro.key.split('/').pop();
      return obtenerResumenLibro(id);
    }));
  } catch (error) {
    console.error('Error al obtener el top más vendidos:', error);
    return [];
  }
}

/**
 * Obtiene una lista de libros populares mezclando búsquedas y fantasía.
 * @returns {Promise<Array<object>>} Lista de libros populares.
 */
export async function obtenerLibrosPopulares() {
  const urls = [
    'https://openlibrary.org/search.json?q=libro&limit=20',
    'https://openlibrary.org/subjects/fantasy.json?limit=20'
  ];

  for (const url of urls) {
    try {
      const res = await fetch(url);
      const tipo = res.headers.get("content-type") || "";
      if (!res.ok || !tipo.includes("application/json")) {
        console.warn(`Respuesta no válida desde ${url}`);
        continue;
      }

      const data = await res.json();
      const libros = data.docs || data.works;

      return libros.map(libro => {
        const id = libro.key.split('/').pop();
        return {
          id,
          titulo: libro.title,
          autor: libro.author_name?.[0] || libro.authors?.[0]?.name || 'Autor desconocido',
          portada: libro.cover_i
            ? `https://covers.openlibrary.org/b/id/${libro.cover_i}-M.jpg`
            : libro.cover_id
              ? `https://covers.openlibrary.org/b/id/${libro.cover_id}-M.jpg`
              : './assets/img/logotipos/portadaDefault.png',
        };
      });
    } catch (error) {
      console.error(`Error al intentar cargar desde ${url}:`, error);
    }
  }

  console.error("No se pudieron obtener libros populares desde ninguna fuente.");
  return [];
}
