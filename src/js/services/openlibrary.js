// OPENLIBRARY.JS — SOCIALREADER — Datos desde OpenLibrary (completo y optimizado)

// === FUNCIONES AUXILIARES ===

async function obtenerNombreAutor(autorKey) {
  try {
    const res = await fetch(`https://openlibrary.org${autorKey}.json`);
    const datos = await res.json();
    return datos.name || 'Autor desconocido';
  } catch {
    return 'Autor desconocido';
  }
}

async function obtenerBiografiaAutor(autorKey) {
  try {
    const res = await fetch(`https://openlibrary.org${autorKey}.json`);
    const datos = await res.json();
    return typeof datos.bio === 'string'
      ? datos.bio
      : datos.bio?.value || '';
  } catch {
    return '';
  }
}

function traducirIdioma(idiomaKey) {
  const cod = idiomaKey.split('/').pop();
  const idiomas = {
    eng: 'Inglés', spa: 'Español', fre: 'Francés', ger: 'Alemán',
    ita: 'Italiano', por: 'Portugués', cat: 'Catalán', glg: 'Gallego'
  };
  return idiomas[cod] || cod;
}

// === FUNCIÓN PARA OBTENER RESUMEN BREVE ===

export async function obtenerResumenLibro(workId) {
  try {
    const res = await fetch(`https://openlibrary.org/works/${workId}.json`);
    if (!res.ok) throw new Error('No se pudo obtener el resumen');
    const data = await res.json();

    const autorKey = data.authors?.[0]?.author?.key || null;
    const nombreAutor = autorKey ? await obtenerNombreAutor(autorKey) : 'Autor desconocido';
    const portada = data.covers?.[0]
      ? `https://covers.openlibrary.org/b/id/${data.covers[0]}-M.jpg`
      : './assets/img/logotipos/portadaDefault.png';

    return { id: workId, titulo: data.title || 'Sin título', autor: nombreAutor, portada };
  } catch (error) {
    console.error('Error al obtener resumen del libro:', error);
    return null;
  }
}

// === FUNCIÓN PRINCIPAL: DETALLES COMPLETOS DEL LIBRO ===

export async function obtenerDetallesLibro(workId) {
  try {
    // 1. WORK
    const resWork = await fetch(`https://openlibrary.org/works/${workId}.json`);
    if (!resWork.ok) throw new Error('No se pudo obtener el work');
    const workData = await resWork.json();

    // 2. AUTOR
    const autorKey = workData.authors?.[0]?.author?.key || null;
    const nombreAutor = autorKey ? await obtenerNombreAutor(autorKey) : 'Autor desconocido';
    const biografiaAutor = autorKey ? await obtenerBiografiaAutor(autorKey) : '';

    // 3. EDICIÓN
    let edicionData = {};
    const editionKey = workData.edition_key?.[0];
    if (editionKey) {
      const resEd = await fetch(`https://openlibrary.org/books/${editionKey}.json`);
      if (resEd.ok) edicionData = await resEd.json();
    }

    // 4. DATOS GENERALES
    const isbn = edicionData.isbn_13?.[0] || edicionData.isbn_10?.[0] || 'No disponible';
    const edicion = edicionData.edition_name || 'No especificada';
    const añoPublicacion = edicionData.publish_date || 'Desconocido';
    const editorial = edicionData.publishers?.[0] || 'No especificada';
    const paginas = edicionData.number_of_pages || 'No especificado';
    const idiomas = edicionData.languages?.map(l => traducirIdioma(l.key)) || ['No especificados'];

    // 5. OTRAS CATEGORÍAS
    const generos = workData.subjects?.slice(0, 8) || ['Sin datos'];
    const lugares = [...new Set(workData.subject_places || [])];
    const personajes = [...new Set(workData.subject_people || [])];
    const epocas = [...new Set(workData.subject_times || [])];

    // 6. DESCRIPCIÓN / SINOPSIS
    let sinopsis = 'Sin sinopsis disponible';
    if (workData.description) {
      sinopsis = typeof workData.description === 'string'
        ? workData.description
        : workData.description.value || sinopsis;
    }

    // 7. ENLACES EXTERNOS
    const enlacesExternos = workData.links?.map(link => ({
      titulo: link.title || 'Enlace externo',
      url: link.url
    })) || [];

    // 8. LIBROS RELACIONADOS
    const librosRelacionados = await (async () => {
      try {
        const subject = workData.subjects?.[0];
        if (!subject) return [];
        const res = await fetch(`https://openlibrary.org/subjects/${subject.toLowerCase().replace(/\s/g, '_')}.json?limit=3`);
        if (!res.ok) return [];
        const data = await res.json();
        return data.works.map(libro => ({
          id: libro.key.split('/').pop(),
          portada: libro.cover_id
            ? `https://covers.openlibrary.org/b/id/${libro.cover_id}-M.jpg`
            : './assets/img/logotipos/portadaDefault.png'
        }));
      } catch {
        return [];
      }
    })();

    // 9. RETORNO FINAL
    return {
      id: workId,
      titulo: workData.title || 'Sin título',
      subtitulo: workData.subtitle || '',
      autor: nombreAutor,
      portada: workData.covers?.[0]
        ? `https://covers.openlibrary.org/b/id/${workData.covers[0]}-L.jpg`
        : './assets/img/logotipos/portadaDefault.png',
      añoPublicacion,
      editorial,
      idiomas,
      generos,
      paginas,
      sinopsis,
      isbn,
      edicion,
      biografiaAutor,
      enlacesExternos,
      librosRelacionados,
      lugares,
      personajes,
      epocas,
      linkOpenLibrary: `https://openlibrary.org/works/${workId}`
    };
  } catch (error) {
    console.error('Error al obtener los detalles del libro:', error);
    return null;
  }
}

// === FUNCIONES PARA VISTAS ===

export async function obtenerTopMasVendidos() {
  try {
    const res = await fetch('https://openlibrary.org/subjects/fantasy.json?limit=20');
    if (!res.ok) throw new Error('Error al obtener libros de fantasía');
    const data = await res.json();
    return Promise.all(
      data.works.map(libro => obtenerResumenLibro(libro.key.split('/').pop()))
    );
  } catch (error) {
    console.error('Error al obtener el top más vendidos:', error);
    return [];
  }
}

export async function obtenerLibrosPopulares() {
  const urls = [
    'https://openlibrary.org/search.json?q=bestseller&limit=15',
    'https://openlibrary.org/subjects/fantasy.json?limit=15'
  ];

  for (const url of urls) {
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const data = await res.json();
      const libros = data.docs || data.works || [];

      return libros.map(libro => {
        const id = libro.key?.split('/').pop() || libro.cover_edition_key;
        return {
          id,
          titulo: libro.title || 'Sin título',
          autor: libro.author_name?.[0] || libro.authors?.[0]?.name || 'Autor desconocido',
          portada: libro.cover_i || libro.cover_id
            ? `https://covers.openlibrary.org/b/id/${libro.cover_i || libro.cover_id}-M.jpg`
            : './assets/img/logotipos/portadaDefault.png'
        };
      });
    } catch (error) {
      console.error('Error al obtener libros populares:', error);
    }
  }

  console.warn('No se pudo cargar ningún libro popular.');
  return [];
}
