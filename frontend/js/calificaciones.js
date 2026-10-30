// Módulo Calificaciones. Responsable: Leilani Muñoz.
// Reglas de trabajo en AGENTS.md. Datos y endpoints en docs/10-contrato-api.md.
//
// Qué construir:
//   - En el detalle de la receta (ranura #detalle-calificacion): las estrellas para calificar de 1 a 5,
//     el promedio y el total de calificaciones. Usa api.calificar(id, puntos) y api.quitarCalificacion(id).
//   - Reglas del contrato: hace falta sesión, no se puede calificar la propia receta
//     (receta.esMia) y cada persona tiene una sola calificación por receta (receta.miCalificacion).
//   - La pantalla "Mejor valoradas" (#/mejor-valoradas): la lista de api.recetasMejorValoradas().
//
// Eventos útiles: 'receta-mostrada' (trae la receta completa), 'sesion-cambiada' y 'pantalla-mostrada'.

(() => {
  const ranura = document.getElementById('detalle-calificacion');

  // Referencias que se dibujan en la ranura y se actualizan sin recargar.
  let recetaActual = null;
  let promedioEl = null;
  let estadoEl = null;
  let grupoEl = null;
  let quitarBoton = null;
  let peticion = 0; // para ignorar respuestas viejas si la persona vota muy rápido

  // Texto del promedio con un decimal, como "4.5 de 5 (2 calificaciones)".
  function textoPromedio(receta) {
    if (!receta.totalCalificaciones) return 'Sin calificaciones todavía.';
    const total = receta.totalCalificaciones;
    const etiqueta = total === 1 ? '1 calificación' : total + ' calificaciones';
    return receta.promedio.toFixed(1) + ' de 5 (' + etiqueta + ')';
  }

  function mensajeDeError(error) {
    return error instanceof ErrorApi ? error.textoParaUsuario() : 'Ocurrió un error inesperado. Inténtalo de nuevo.';
  }

  function pintarEstrellas(seleccion) {
    for (const boton of grupoEl.children) {
      const marcada = seleccion != null && Number(boton.dataset.puntos) <= seleccion;
      boton.classList.toggle('marcada', marcada);
      boton.setAttribute('aria-pressed', String(marcada));
    }
  }

  function crearEstrella(puntos) {
    const boton = document.createElement('button');
    boton.type = 'button';
    boton.className = 'estrella';
    boton.dataset.puntos = String(puntos);
    boton.setAttribute('aria-label', 'Calificar con ' + puntos + (puntos === 1 ? ' estrella' : ' estrellas'));
    boton.textContent = '★';
    boton.addEventListener('click', () => calificar(puntos));
    return boton;
  }

  // El botón de quitar solo se muestra cuando ya hay una calificación.
  function pintarQuitar() {
    quitarBoton.hidden = recetaActual.miCalificacion == null;
  }

  function crearBotonQuitar() {
    const boton = document.createElement('button');
    boton.type = 'button';
    boton.className = 'quitar-calificacion';
    boton.textContent = 'Quitar calificación';
    boton.addEventListener('click', quitar);
    return boton;
  }

  // Habilita o deshabilita las estrellas y el botón de quitar según las reglas.
  function habilitarControles() {
    const habilitado = !recetaActual.esMia && api.haySesion();
    for (const boton of grupoEl.children) boton.disabled = !habilitado;
    if (!quitarBoton.hidden) quitarBoton.disabled = !habilitado;
  }

  // Muestra el aviso correcto según las reglas: receta propia o sin sesión.
  function aplicarReglas() {
    habilitarControles();
    if (recetaActual.esMia) {
      estadoEl.textContent = 'No puedes calificar tus propias recetas.';
      return;
    }
    if (!api.haySesion()) {
      estadoEl.replaceChildren();
      const enlace = document.createElement('a');
      enlace.href = '#/acceso';
      enlace.textContent = 'Inicia sesión';
      estadoEl.append(enlace, ' para calificar esta receta.');
      return;
    }
    estadoEl.textContent = '';
  }

  function dibujar(receta) {
    recetaActual = receta;
    peticion++; // descarta votos en curso si cambia la receta o la sesión
    ranura.replaceChildren();

    promedioEl = document.createElement('p');
    promedioEl.className = 'calificaciones-promedio';
    promedioEl.setAttribute('role', 'status');
    promedioEl.setAttribute('aria-live', 'polite');
    promedioEl.textContent = textoPromedio(receta);

    grupoEl = document.createElement('div');
    grupoEl.className = 'calificaciones-estrellas';
    grupoEl.setAttribute('role', 'group');
    grupoEl.setAttribute('aria-label', 'Calificar la receta');
    for (let puntos = 1; puntos <= 5; puntos++) grupoEl.append(crearEstrella(puntos));

    quitarBoton = crearBotonQuitar();

    estadoEl = document.createElement('p');
    estadoEl.className = 'calificaciones-estado';
    estadoEl.setAttribute('role', 'status');
    estadoEl.setAttribute('aria-live', 'polite');

    ranura.append(promedioEl, grupoEl, quitarBoton, estadoEl);
    pintarEstrellas(receta.miCalificacion);
    pintarQuitar();
    aplicarReglas();
  }

  async function calificar(puntos) {
    if (!recetaActual || recetaActual.esMia || !api.haySesion()) return;

    const numero = ++peticion;
    estadoEl.textContent = 'Guardando calificación...';
    for (const boton of grupoEl.children) boton.disabled = true;
    quitarBoton.disabled = true;
    try {
      const resultado = await api.calificar(recetaActual.id, puntos);
      if (numero !== peticion) return;
      recetaActual.promedio = resultado.promedio;
      recetaActual.totalCalificaciones = resultado.totalCalificaciones;
      recetaActual.miCalificacion = resultado.miCalificacion;
      promedioEl.textContent = textoPromedio(recetaActual);
      pintarEstrellas(resultado.miCalificacion);
      pintarQuitar();
      estadoEl.textContent = '';
    } catch (error) {
      if (numero !== peticion) return;
      estadoEl.textContent = mensajeDeError(error);
    } finally {
      if (numero === peticion) habilitarControles();
    }
  }

  async function quitar() {
    if (!recetaActual || recetaActual.miCalificacion == null) return;

    const numero = ++peticion;
    estadoEl.textContent = 'Quitando calificación...';
    for (const boton of grupoEl.children) boton.disabled = true;
    quitarBoton.disabled = true;
    try {
      const resultado = await api.quitarCalificacion(recetaActual.id);
      if (numero !== peticion) return;
      recetaActual.promedio = resultado.promedio;
      recetaActual.totalCalificaciones = resultado.totalCalificaciones;
      recetaActual.miCalificacion = resultado.miCalificacion; // queda en null
      promedioEl.textContent = textoPromedio(recetaActual);
      pintarEstrellas(null);
      pintarQuitar();
      estadoEl.textContent = 'Calificación quitada.';
    } catch (error) {
      if (numero !== peticion) return;
      estadoEl.textContent = mensajeDeError(error);
    } finally {
      if (numero === peticion) habilitarControles();
    }
  }

  document.addEventListener('receta-mostrada', (evento) => dibujar(evento.detail.receta));

  // Si alguien entra o sale de su cuenta mientras ve una receta, se refrescan las reglas.
  document.addEventListener('sesion-cambiada', async () => {
    if (!recetaActual || ranura.closest('[hidden]')) return;
    try {
      const receta = await api.obtenerReceta(recetaActual.id);
      dibujar(receta);
    } catch (error) {
      // Sin la receta nueva no se sabe la calificación de esta sesión: se borra la anterior.
      peticion++;
      recetaActual.miCalificacion = null;
      pintarEstrellas(null);
      pintarQuitar();
      if (!api.haySesion()) {
        aplicarReglas();
        return;
      }
      for (const boton of grupoEl.children) boton.disabled = true;
      estadoEl.textContent = mensajeDeError(error) + ' Recarga la página para calificar.';
    }
  });

  // ── Pantalla "Mejor valoradas" ──────────────────────────────────────────
  function crearItemMejorValorada(receta) {
    const item = document.createElement('li');
    item.className = 'mejor-valorada-item';

    const enlace = document.createElement('a');
    enlace.href = '#/receta/' + receta.id;
    enlace.textContent = receta.nombre;

    const meta = document.createElement('span');
    meta.className = 'mejor-valorada-meta';
    const porciones = receta.porciones === 1 ? 'porción' : 'porciones';
    meta.textContent = receta.categoria + ' · ' + receta.tiempo + ' min · ' + receta.porciones + ' ' + porciones;

    const promedio = document.createElement('span');
    promedio.className = 'mejor-valorada-promedio';
    promedio.textContent = '★ ' + textoPromedio(receta);

    item.append(enlace, meta, promedio);
    return item;
  }

  async function dibujarMejorValoradas() {
    const pantalla = document.getElementById('mejor-valoradas');
    const titulo = pantalla.querySelector('h1');
    pantalla.replaceChildren(titulo);

    const estado = document.createElement('p');
    estado.className = 'mejor-valoradas-estado';
    estado.setAttribute('role', 'status');
    estado.setAttribute('aria-live', 'polite');
    estado.textContent = 'Cargando...';
    pantalla.append(estado);

    try {
      const lista = await api.recetasMejorValoradas();
      estado.textContent = '';
      if (!lista.length) {
        estado.replaceChildren();
        const enlace = document.createElement('a');
        enlace.href = '#/recetas';
        enlace.textContent = 'Explora el recetario';
        estado.append('Todavía nadie ha calificado una receta. ', enlace, ' y sé la primera persona en calificar.');
        return;
      }
      const listaEl = document.createElement('ol');
      listaEl.className = 'lista-mejor-valoradas';
      for (const receta of lista) listaEl.append(crearItemMejorValorada(receta));
      pantalla.append(listaEl);
    } catch (error) {
      estado.textContent = mensajeDeError(error);
    }
  }

  document.addEventListener('pantalla-mostrada', (evento) => {
    if (evento.detail.id === 'mejor-valoradas') dibujarMejorValoradas();
  });
})();
