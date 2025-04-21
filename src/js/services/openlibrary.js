// --- Función auxiliar para obtener el nombre del autor desde su key
async function obtenerNombreAutor(autorKey) {
    try {
      const respuesta = await fetch(`https://openlibrary.org${autorKey}.json`);
      const datos = await respuesta.json();
      return datos.name || 'Autor desconocido';
    } catch {
      return 'Autor desconocido';
    }
  }
  
  // --- Función auxiliar para traducir código de idioma
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
  
  // --- Función para obtener solo los datos básicos de un libro
  export async function obtenerResumenLibro(workId) {
    try {
      const res = await fetch(`https://openlibrary.org/works/${workId}.json`);
      const data = await res.json();
      const resumen = {
        id: workId,
        titulo: data.title || 'Sin título',
        autor: data.authors?.[0]?.author?.key
          ? await obtenerNombreAutor(data.authors[0].author.key)
          : 'Autor desconocido',
        portada: data.covers?.[0]
          ? `https://covers.openlibrary.org/b/id/${data.covers[0]}-M.jpg`
          : './assets/img/logotipos/portadaDefault.png',
      };
  
      return resumen;
    } catch (error) {
      console.error('Error al obtener resumen del libro:', error);
      return null;
    }
  }
  
  // --- Función para obtener los detalles completos del libro
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
      const detalles = {
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
      };
  
      return detalles;
    } catch (error) {
      console.error('Error al obtener los detalles del libro:', error);
      return null;
    }
  }
  
  //--- Función para obtener el top de libros más vendidos (por tema)
  export async function obtenerTopMasVendidos() {
    try {
      const res = await fetch('https://openlibrary.org/subjects/fantasy.json?limit=10');
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
  
// --- Función alternativa para obtener libros populares
export async function obtenerLibrosPopulares() {
  const urls = [
    'https://openlibrary.org/search.json?q=libro&limit=10', // Búsqueda más segura
    'https://openlibrary.org/subjects/fantasy.json?limit=10' // Alternativa por temática
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
      const libros = data.docs || data.works; // depende del endpoint

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