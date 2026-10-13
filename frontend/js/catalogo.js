// Catálogo: dibuja la galería de recetas y el detalle de una receta con los datos de la API.
// Lo mantiene Fernando. Los demás módulos se enganchan sin editar este archivo:
//
// Eventos que emite (en `document`):
//   'tarjetas-dibujadas'  evento.detail = { recetas }
//       Ya están las tarjetas en .galeria. Cada <article class="tarjeta" data-receta-id="N">
//       tiene un <div class="tarjeta-acciones"> vacío para que un módulo agregue su botón.
//   'receta-mostrada'     evento.detail = { receta }   (receta tiene la forma RecetaDetalle)
//       Ya se dibujó el detalle. Las ranuras #detalle-acciones y #detalle-calificacion
//       están vacías para que cada módulo ponga ahí lo suyo.
//
// Función pública:
//   catalogo.cargar(filtros)  vuelve a dibujar la galería; ej. { categoria: 'Postre', ingrediente: 'arroz' }.
//                             Los filtros se recuerdan al volver a la pantalla Recetas.

(() => {
  const galeria = document.querySelector('.galeria');
  const estadoCatalogo = document.getElementById('estado-catalogo');
  const detalle = {
    titulo: document.querySelector('#receta-detalle h1'),
    estado: document.getElementById('estado-detalle'),
    contenido: document.getElementById('detalle-contenido'),
    foto: document.getElementById('detalle-foto'),
    descripcion: document.getElementById('detalle-descripcion'),
    meta: document.getElementById('detalle-meta'),
    acciones: document.getElementById('detalle-acciones'),
    calificacion: document.getElementById('detalle-calificacion'),
    ingredientes: document.getElementById('detalle-ingredientes'),
    pasos: document.getElementById('detalle-pasos'),
    exportar: document.getElementById('detalle-exportar'),
    exportarXml: document.getElementById('detalle-exportar-xml'),
  };

  let filtrosActuales = {};
  let cargaGaleria = 0;  // sirve para ignorar respuestas viejas si el usuario cambia de pantalla rápido
  let cargaDetalle = 0;
  let recetaMostrada = null;

  function elemento(etiqueta, texto) {
    const nuevo = document.createElement(etiqueta);
    nuevo.textContent = texto;
    return nuevo;
  }

  function textoMeta(receta) {
    const porciones = receta.porciones === 1 ? 'porción' : 'porciones';
    return `${receta.categoria} · ${receta.tiempo} minutos · ${receta.porciones} ${porciones}`;
  }

  function mensajeDeError(error) {
    return error instanceof ErrorApi ? error.textoParaUsuario() : 'Ocurrió un error inesperado. Inténtalo de nuevo.';
  }

  function tarjeta(receta) {
    const articulo = document.createElement('article');
    articulo.className = 'tarjeta';
    articulo.dataset.recetaId = receta.id;
    if (receta.foto) {
      const foto = document.createElement('img');
      foto.className = 'foto-receta';
      foto.src = receta.foto;
      foto.alt = 'Foto de ' + receta.nombre;
      foto.width = 800;
      foto.height = 600;
      articulo.append(foto);
    }
    const enlace = elemento('a', 'Ver receta: ' + receta.nombre);
    enlace.href = '#/receta/' + receta.id;
    const acciones = document.createElement('div');
    acciones.className = 'tarjeta-acciones';
    articulo.append(elemento('h2', receta.nombre), elemento('p', textoMeta(receta)),
      elemento('p', receta.descripcion), enlace, acciones);
    return articulo;
  }

  async function cargar(filtros = filtrosActuales) {
    filtrosActuales = filtros;
    const numero = ++cargaGaleria;
    estadoCatalogo.textContent = 'Cargando recetas...';
    try {
      const recetas = await api.listarRecetas(filtros);
      if (numero !== cargaGaleria) return;
      galeria.replaceChildren(...recetas.map(tarjeta));
      estadoCatalogo.textContent = recetas.length ? '' : 'No hay recetas que mostrar.';
      document.dispatchEvent(new CustomEvent('tarjetas-dibujadas', { detail: { recetas } }));
    } catch (error) {
      if (numero !== cargaGaleria) return;
      galeria.replaceChildren();
      estadoCatalogo.textContent = mensajeDeError(error);
    }
  }

  function dibujarDetalle(receta) {
    recetaMostrada = receta;
    detalle.titulo.textContent = receta.nombre;
    document.title = receta.nombre + ' | La Receta Secreta';
    detalle.descripcion.textContent = receta.descripcion;
    detalle.meta.textContent = textoMeta(receta);
    detalle.foto.hidden = !receta.foto;
    if (receta.foto) {
      detalle.foto.src = receta.foto;
      detalle.foto.alt = 'Foto de ' + receta.nombre;
    } else {
      detalle.foto.removeAttribute('src');
    }
    detalle.ingredientes.replaceChildren(...receta.ingredientes.map((texto) => elemento('li', texto)));
    detalle.pasos.replaceChildren(...receta.pasos.map((texto) => elemento('li', texto)));
    detalle.acciones.replaceChildren();
    detalle.calificacion.replaceChildren();
    detalle.contenido.hidden = false;
  }

  async function mostrarDetalle(id) {
    const numero = ++cargaDetalle;
    detalle.contenido.hidden = true;
    detalle.estado.textContent = '';
    detalle.titulo.textContent = 'Cargando receta...';
    if (!/^\d+$/.test(id || '')) {
      detalle.titulo.textContent = 'Receta no encontrada';
      detalle.estado.textContent = 'Ese enlace no corresponde a ninguna receta.';
      return;
    }
    try {
      const receta = await api.obtenerReceta(id);
      if (numero !== cargaDetalle) return;
      dibujarDetalle(receta);
      document.dispatchEvent(new CustomEvent('receta-mostrada', { detail: { receta } }));
    } catch (error) {
      if (numero !== cargaDetalle) return;
      detalle.titulo.textContent = error instanceof ErrorApi && error.estado === 404
        ? 'Receta no encontrada' : 'No se pudo cargar la receta';
      detalle.estado.textContent = mensajeDeError(error);
    }
  }

  // El archivo lo arma la API (GET /api/recetas/{id}/exportar?formato=...).
  // El JSON tiene los mismos campos que el formulario de publicar, así que se puede importar ahí.
  async function exportar(boton, formato) {
    if (!recetaMostrada) return;
    const nombreFormato = formato.toUpperCase();
    boton.disabled = true;
    detalle.estado.textContent = `Preparando el archivo ${nombreFormato}...`;
    try {
      await api.descargarReceta(recetaMostrada.id, formato);
      detalle.estado.textContent = `Se descargó el archivo ${nombreFormato}.`;
    } catch (error) {
      detalle.estado.textContent = mensajeDeError(error);
    } finally {
      boton.disabled = false;
    }
  }

  detalle.exportar.addEventListener('click', () => exportar(detalle.exportar, 'json'));
  detalle.exportarXml.addEventListener('click', () => exportar(detalle.exportarXml, 'xml'));

  document.addEventListener('pantalla-mostrada', (evento) => {
    const { id, parametro } = evento.detail;
    if (id === 'recetas') cargar();
    if (id === 'receta-detalle') mostrarDetalle(parametro);
  });

  window.catalogo = { cargar };
})();
