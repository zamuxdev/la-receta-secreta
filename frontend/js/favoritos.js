// Módulo Favoritos. Responsable: Brandon Aguilar.
// Reglas de trabajo en AGENTS.md. Datos y endpoints en docs/10-contrato-api.md.
//
// Funciones implementadas:
//   B1 - Botón de favorito en el detalle de la receta (toggle guardar/quitar)
//   B2 - Saber si la receta ya es favorita al abrirla (listarFavoritos + búsqueda por id)
//   B3 - Sin sesión: mensaje amable con enlace a Acceso
//   B4 - Botón en cada tarjeta de la galería (.tarjeta-acciones)
//   B5 - Pantalla Favoritos: lista de recetas guardadas con botón para quitar
//   B6 - Mensajes de lista vacía y de error
//   B7 - Reaccionar al evento sesion-cambiada para actualizar botones
//   B8 - Estilos en favoritos.css, accesibilidad con aria-pressed
//   B9 - Botón "Descargar en CSV" en la pantalla Favoritos (RF-23)

(() => {
  // ── Estado en memoria ──────────────────────────────────────────────────────
  // Set con los ids de las recetas que son favoritas del usuario actual.
  let idsActuales = new Set();

  // ── Helpers ────────────────────────────────────────────────────────────────
  function crearBoton(recetaId, esFavorita) {
    const boton = document.createElement('button');
    boton.type = 'button';
    boton.className = 'btn-favorito';
    boton.dataset.recetaId = String(recetaId);
    actualizarBoton(boton, esFavorita);
    boton.addEventListener('click', () => toggleFavorito(boton));
    return boton;
  }

  function actualizarBoton(boton, esFavorita) {
    boton.setAttribute('aria-pressed', String(esFavorita));
    boton.textContent = esFavorita ? '♥ Quitar de favoritos' : '♡ Guardar en favoritos';
  }

  // ── Cargar la lista de favoritos del usuario ────────────────────────────────
  async function cargarIdsActuales() {
    if (!api.haySesion()) {
      idsActuales = new Set();
      return;
    }
    try {
      const lista = await api.listarFavoritos();
      idsActuales = new Set(lista.map((r) => r.id));
    } catch {
      idsActuales = new Set();
    }
  }

  // ── Toggle favorito (detalle y tarjetas) ───────────────────────────────────
  async function toggleFavorito(boton) {
    if (!api.haySesion()) {
      mostrarMensajeSinSesion(boton.closest('#detalle-acciones') ? 'detalle' : 'tarjeta');
      return;
    }

    const recetaId = Number(boton.dataset.recetaId);
    const eraFavorita = idsActuales.has(recetaId);

    // Actualizar UI de inmediato (optimista) y desactivar mientras se espera
    boton.disabled = true;
    const nuevaEsFavorita = !eraFavorita;
    actualizarBoton(boton, nuevaEsFavorita);

    try {
      if (eraFavorita) {
        await api.quitarFavorito(recetaId);
        idsActuales.delete(recetaId);
      } else {
        await api.agregarFavorito(recetaId);
        idsActuales.add(recetaId);
      }
      // Sincronizar todos los botones con ese id (tarjeta + detalle)
      sincronizarBotones(recetaId, nuevaEsFavorita);
    } catch (error) {
      // Revertir si falló
      actualizarBoton(boton, eraFavorita);
      mostrarError(boton, error);
    } finally {
      boton.disabled = false;
    }
  }

  // Actualiza todos los botones del documento que comparten el mismo recetaId
  function sincronizarBotones(recetaId, esFavorita) {
    document.querySelectorAll(`.btn-favorito[data-receta-id="${recetaId}"]`).forEach((b) => {
      actualizarBoton(b, esFavorita);
    });
  }

  // ── Mensajes de error y sin sesión ─────────────────────────────────────────
  function mostrarMensajeSinSesion(contexto) {
    const contenedor = contexto === 'detalle'
      ? document.getElementById('detalle-acciones')
      : null;

    const aviso = document.createElement('p');
    aviso.className = 'favorito-aviso';
    aviso.innerHTML = '<a href="#/acceso">Inicia sesión</a> para guardar favoritos.';

    if (contenedor) {
      // Reemplazar solo el aviso si ya hay uno
      const existente = contenedor.querySelector('.favorito-aviso');
      if (existente) existente.replaceWith(aviso);
      else contenedor.append(aviso);
    }
  }

  function mostrarError(boton, error) {
    const texto = error && typeof error.textoParaUsuario === 'function'
      ? error.textoParaUsuario()
      : 'No se pudo completar la operación.';
    // Mostrar el error cerca del botón sin romper el layout
    let aviso = boton.nextElementSibling;
    if (!aviso || !aviso.classList.contains('favorito-error')) {
      aviso = document.createElement('p');
      aviso.className = 'favorito-error';
      boton.after(aviso);
    }
    aviso.textContent = texto;
    // Limpiar después de 4 segundos
    setTimeout(() => aviso.remove(), 4000);
  }

  // ── B1 / B2 / B3 — Botón en el detalle ────────────────────────────────────
  document.addEventListener('receta-mostrada', async (evento) => {
    const receta = evento.detail.receta;
    const ranura = document.getElementById('detalle-acciones');
    ranura.replaceChildren();

    if (!api.haySesion()) {
      const aviso = document.createElement('p');
      aviso.className = 'favorito-aviso';
      aviso.innerHTML = '<a href="#/acceso">Inicia sesión</a> para guardar esta receta en favoritos.';
      ranura.append(aviso);
      return;
    }

    await cargarIdsActuales();
    const esFavorita = idsActuales.has(receta.id);
    ranura.append(crearBoton(receta.id, esFavorita));
  });

  // ── B4 — Botón en cada tarjeta ─────────────────────────────────────────────
  document.addEventListener('tarjetas-dibujadas', async () => {
    await cargarIdsActuales();

    document.querySelectorAll('.tarjeta[data-receta-id]').forEach((tarjeta) => {
      const recetaId = Number(tarjeta.dataset.recetaId);
      const acciones = tarjeta.querySelector('.tarjeta-acciones');
      if (!acciones) return;

      if (!api.haySesion()) {
        const aviso = document.createElement('p');
        aviso.className = 'favorito-aviso';
        aviso.innerHTML = '<a href="#/acceso">Inicia sesión</a> para guardar.';
        acciones.append(aviso);
        return;
      }

      const esFavorita = idsActuales.has(recetaId);
      acciones.append(crearBoton(recetaId, esFavorita));
    });
  });

  // ── B5 / B6 / B9 — Pantalla Favoritos ─────────────────────────────────────
  document.addEventListener('pantalla-mostrada', async (evento) => {
    if (evento.detail.id !== 'favoritos') return;
    await dibujarPantallaFavoritos();
  });

  async function dibujarPantallaFavoritos() {
    const pantalla = document.getElementById('favoritos');
    // Limpiar todo excepto el h1
    const h1 = pantalla.querySelector('h1');
    pantalla.replaceChildren(h1);

    if (!api.haySesion()) {
      const aviso = document.createElement('p');
      aviso.className = 'favorito-aviso';
      aviso.innerHTML = '<a href="#/acceso">Inicia sesión</a> para ver tus recetas favoritas.';
      pantalla.append(aviso);
      return;
    }

    const estado = document.createElement('p');
    estado.id = 'estado-favoritos';
    estado.setAttribute('role', 'status');
    estado.setAttribute('aria-live', 'polite');
    estado.textContent = 'Cargando favoritos...';
    pantalla.append(estado);

    try {
      const lista = await api.listarFavoritos();
      idsActuales = new Set(lista.map((r) => r.id));

      estado.textContent = '';

      if (lista.length === 0) {
        estado.textContent = 'Todavía no tienes recetas guardadas. Explora el recetario y guarda las que más te gusten.';
        return;
      }

      // B9 — Botón Descargar CSV
      const btnDescarga = document.createElement('button');
      btnDescarga.type = 'button';
      btnDescarga.id = 'btn-descargar-csv';
      btnDescarga.textContent = 'Descargar en CSV';
      pantalla.append(btnDescarga);

      btnDescarga.addEventListener('click', async () => {
        btnDescarga.disabled = true;
        estado.textContent = 'Preparando el archivo...';
        try {
          await api.descargarFavoritos();
          estado.textContent = 'Archivo descargado.';
        } catch (error) {
          estado.textContent = error && typeof error.textoParaUsuario === 'function'
            ? error.textoParaUsuario()
            : 'No se pudo descargar el archivo.';
        } finally {
          btnDescarga.disabled = false;
        }
      });

      // Lista de recetas favoritas
      const ul = document.createElement('ul');
      ul.className = 'lista-favoritos';
      lista.forEach((receta) => ul.append(crearItemFavorito(receta, ul, estado, pantalla)));
      pantalla.append(ul);

    } catch (error) {
      estado.textContent = error && typeof error.textoParaUsuario === 'function'
        ? error.textoParaUsuario()
        : 'No se pudieron cargar tus favoritos. Inténtalo de nuevo.';
    }
  }

  function crearItemFavorito(receta, lista, estado, pantalla) {
    const li = document.createElement('li');
    li.className = 'favorito-item';
    li.dataset.recetaId = receta.id;

    const enlace = document.createElement('a');
    enlace.href = '#/receta/' + receta.id;
    enlace.textContent = receta.nombre;

    const meta = document.createElement('span');
    meta.className = 'favorito-meta';
    meta.textContent = ` — ${receta.categoria} · ${receta.tiempo} min · ${receta.porciones} ${receta.porciones === 1 ? 'porción' : 'porciones'}`;

    const btnQuitar = document.createElement('button');
    btnQuitar.type = 'button';
    btnQuitar.className = 'btn-quitar-favorito';
    btnQuitar.textContent = 'Quitar';
    btnQuitar.setAttribute('aria-label', 'Quitar ' + receta.nombre + ' de favoritos');

    btnQuitar.addEventListener('click', async () => {
      btnQuitar.disabled = true;
      try {
        await api.quitarFavorito(receta.id);
        idsActuales.delete(receta.id);
        li.remove();
        // Si ya no quedan items, volver a dibujar la pantalla (mostrará el mensaje vacío)
        if (!lista.querySelectorAll('.favorito-item').length) {
          await dibujarPantallaFavoritos();
        }
      } catch (error) {
        btnQuitar.disabled = false;
        estado.textContent = error && typeof error.textoParaUsuario === 'function'
          ? error.textoParaUsuario()
          : 'No se pudo quitar el favorito.';
      }
    });

    li.append(enlace, meta, btnQuitar);
    return li;
  }

  // ── B7 — Reaccionar a sesion-cambiada ──────────────────────────────────────
  document.addEventListener('sesion-cambiada', async () => {
    // Limpiar el estado en memoria
    idsActuales = new Set();

    // Actualizar botones en las tarjetas visibles
    const tarjetas = document.querySelectorAll('.tarjeta[data-receta-id]');
    if (tarjetas.length > 0) {
      if (api.haySesion()) {
        await cargarIdsActuales();
      }
      tarjetas.forEach((tarjeta) => {
        const recetaId = Number(tarjeta.dataset.recetaId);
        const acciones = tarjeta.querySelector('.tarjeta-acciones');
        if (!acciones) return;
        acciones.replaceChildren();

        if (!api.haySesion()) {
          const aviso = document.createElement('p');
          aviso.className = 'favorito-aviso';
          aviso.innerHTML = '<a href="#/acceso">Inicia sesión</a> para guardar.';
          acciones.append(aviso);
        } else {
          acciones.append(crearBoton(recetaId, idsActuales.has(recetaId)));
        }
      });
    }

    // Actualizar botón en el detalle si está visible
    const ranura = document.getElementById('detalle-acciones');
    if (ranura && !ranura.closest('[hidden]')) {
      const botonDetalle = ranura.querySelector('.btn-favorito');
      if (botonDetalle) {
        const recetaId = Number(botonDetalle.dataset.recetaId);
        if (api.haySesion()) {
          await cargarIdsActuales();
          actualizarBoton(botonDetalle, idsActuales.has(recetaId));
        } else {
          ranura.replaceChildren();
          const aviso = document.createElement('p');
          aviso.className = 'favorito-aviso';
          aviso.innerHTML = '<a href="#/acceso">Inicia sesión</a> para guardar esta receta en favoritos.';
          ranura.append(aviso);
        }
      }
    }

    // Si la pantalla de favoritos está visible, redibujarla
    const pantallaFav = document.getElementById('favoritos');
    if (pantallaFav && !pantallaFav.hidden) {
      await dibujarPantallaFavoritos();
    }
  });
})();
