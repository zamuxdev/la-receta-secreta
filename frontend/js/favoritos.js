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

  // Contador de carga del detalle para evitar condición de carrera (B1/B2)
  let cargaDetalleFav = 0;

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

  // Crea un párrafo de aviso "Inicia sesión para <texto>" con role="status".
  function crearAvisoSesion(texto) {
    const aviso = document.createElement('p');
    aviso.className = 'favorito-aviso';
    aviso.setAttribute('role', 'status');
    aviso.setAttribute('aria-live', 'polite');
    const enlace = document.createElement('a');
    enlace.href = '#/acceso';
    enlace.textContent = 'Inicia sesión';
    aviso.append(enlace, ' ' + texto);
    return aviso;
  }

  // ── Cargar la lista de favoritos del usuario ────────────────────────────────
  // Devuelve true si tuvo éxito, false si falló (para que el llamador pueda avisar).
  async function cargarIdsActuales() {
    if (!api.haySesion()) {
      idsActuales = new Set();
      return true;
    }
    try {
      const lista = await api.listarFavoritos();
      idsActuales = new Set(lista.map((r) => r.id));
      return true;
    } catch (error) {
      idsActuales = new Set();
      return error; // devuelve el error para que el llamador lo muestre si quiere
    }
  }

  // ── Toggle favorito (detalle y tarjetas) ───────────────────────────────────
  async function toggleFavorito(boton) {
    if (!api.haySesion()) {
      // Mostrar aviso dentro del contenedor del botón
      const contenedor = boton.parentElement;
      const avisoExistente = contenedor.querySelector('.favorito-aviso');
      if (!avisoExistente) {
        contenedor.append(crearAvisoSesion('para guardar favoritos.'));
      }
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
      // Limpiar error previo si lo había
      const errorPrevio = boton.parentElement.querySelector('.favorito-error');
      if (errorPrevio) errorPrevio.remove();
    } catch (error) {
      // Revertir si falló
      actualizarBoton(boton, eraFavorita);
      mostrarError(boton.parentElement, error);
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

  // ── Mensajes de error ──────────────────────────────────────────────────────
  // Muestra el error dentro del contenedor dado, reemplazando el anterior si existe.
  function mostrarError(contenedor, error) {
    const texto = error && typeof error.textoParaUsuario === 'function'
      ? error.textoParaUsuario()
      : 'No se pudo completar la operación.';

    let aviso = contenedor.querySelector('.favorito-error');
    if (!aviso) {
      aviso = document.createElement('p');
      aviso.className = 'favorito-error';
      aviso.setAttribute('role', 'alert');
      aviso.setAttribute('aria-live', 'assertive');
      contenedor.append(aviso);
    }
    aviso.textContent = texto;
  }

  // ── B1 / B2 / B3 — Botón en el detalle ────────────────────────────────────
  document.addEventListener('receta-mostrada', async (evento) => {
    const receta = evento.detail.receta;
    const numero = ++cargaDetalleFav;
    const ranura = document.getElementById('detalle-acciones');
    ranura.replaceChildren();

    if (!api.haySesion()) {
      ranura.append(crearAvisoSesion('para guardar esta receta en favoritos.'));
      return;
    }

    const resultado = await cargarIdsActuales();
    // Si llegó una carga más nueva mientras esperábamos, descartar esta
    if (numero !== cargaDetalleFav) return;

    if (resultado instanceof Error) {
      mostrarError(ranura, resultado);
      return;
    }

    ranura.append(crearBoton(receta.id, idsActuales.has(receta.id)));
  });

  // ── B4 — Botón en cada tarjeta ─────────────────────────────────────────────
  document.addEventListener('tarjetas-dibujadas', async () => {
    const resultado = await cargarIdsActuales();

    document.querySelectorAll('.tarjeta[data-receta-id]').forEach((tarjeta) => {
      const recetaId = Number(tarjeta.dataset.recetaId);
      const acciones = tarjeta.querySelector('.tarjeta-acciones');
      if (!acciones) return;

      if (!api.haySesion()) {
        acciones.append(crearAvisoSesion('para guardar.'));
        return;
      }

      if (resultado instanceof Error) {
        mostrarError(acciones, resultado);
        return;
      }

      acciones.append(crearBoton(recetaId, idsActuales.has(recetaId)));
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
      pantalla.append(crearAvisoSesion('para ver tus recetas favoritas.'));
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

      // B9 — Botón Descargar CSV (solo visible cuando hay favoritos)
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
      lista.forEach((receta) => ul.append(crearItemFavorito(receta, ul, estado)));
      pantalla.append(ul);

    } catch (error) {
      estado.textContent = error && typeof error.textoParaUsuario === 'function'
        ? error.textoParaUsuario()
        : 'No se pudieron cargar tus favoritos. Inténtalo de nuevo.';
    }
  }

  function crearItemFavorito(receta, lista, estado) {
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

    // Cargar favoritos si hay sesión activa
    if (api.haySesion()) {
      await cargarIdsActuales();
    }

    // Actualizar botones en las tarjetas visibles
    document.querySelectorAll('.tarjeta[data-receta-id]').forEach((tarjeta) => {
      const recetaId = Number(tarjeta.dataset.recetaId);
      const acciones = tarjeta.querySelector('.tarjeta-acciones');
      if (!acciones) return;
      acciones.replaceChildren();

      if (!api.haySesion()) {
        acciones.append(crearAvisoSesion('para guardar.'));
      } else {
        acciones.append(crearBoton(recetaId, idsActuales.has(recetaId)));
      }
    });

    // Actualizar botón en el detalle si está visible
    const ranura = document.getElementById('detalle-acciones');
    if (ranura && !ranura.closest('[hidden]')) {
      const botonDetalle = ranura.querySelector('.btn-favorito');
      if (botonDetalle) {
        const recetaId = Number(botonDetalle.dataset.recetaId);
        if (api.haySesion()) {
          actualizarBoton(botonDetalle, idsActuales.has(recetaId));
        } else {
          ranura.replaceChildren();
          ranura.append(crearAvisoSesion('para guardar esta receta en favoritos.'));
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
