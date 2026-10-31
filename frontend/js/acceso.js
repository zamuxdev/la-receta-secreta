// Módulo Acceso. Responsable: Yaret Juárez.
// Reglas de trabajo en AGENTS.md. Datos y endpoints en docs/10-contrato-api.md.
// También le corresponde conectar el formulario de publicar (js/publicar.js) con las reglas de sesión.
//
// Pantallas de este archivo:
//   - "Acceso" (#/acceso): entrar con correo y contraseña, ver quién tiene la sesión y cerrarla.
//     Con sesión, también "Mis recetas": la lista de recetas propias con Editar y Borrar.
//   - "Crear cuenta" (#/registro): crear una cuenta nueva y entrar con ella.
//
// Los errores se muestran junto a su campo: primero los de la validación en el navegador y,
// si el servidor rechaza algo, los de error.errores (claves nombre, correo y password).

(() => {
  const FORMATO_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const formularioAcceso = document.getElementById('formulario-acceso');
  const estadoAcceso = document.getElementById('estado-acceso');
  const bloqueSesion = document.getElementById('sesion-iniciada');
  const nombreUsuario = document.getElementById('nombre-usuario');
  const botonCerrar = document.getElementById('cerrar-sesion');
  const sinCuenta = document.getElementById('acceso-sin-cuenta');
  const seccionMisRecetas = document.getElementById('mis-recetas');
  const estadoMisRecetas = document.getElementById('estado-mis-recetas');
  const listaMisRecetas = document.getElementById('lista-mis-recetas');
  const pantallaAcceso = document.getElementById('acceso');

  const formularioRegistro = document.getElementById('formulario-registro');
  const estadoRegistro = document.getElementById('estado-registro');

  // Relaciona cada clave de error de la API con su campo en cada formulario.
  const camposAcceso = {
    correo: document.getElementById('acceso-correo'),
    password: document.getElementById('acceso-password'),
  };
  const camposRegistro = {
    nombre: document.getElementById('registro-nombre'),
    correo: document.getElementById('registro-correo'),
    password: document.getElementById('registro-password'),
  };

  // --- Errores por campo ---

  // El párrafo de error de cada campo tiene el id "error-" + id del campo.
  function parrafoDeError(campo) {
    return document.getElementById('error-' + campo.id);
  }

  function limpiarErrores(campos) {
    for (const campo of Object.values(campos)) {
      campo.removeAttribute('aria-invalid');
      const parrafo = parrafoDeError(campo);
      parrafo.textContent = '';
      parrafo.hidden = true;
    }
  }

  // errores: { clave: ['mensaje', ...] }. Devuelve true si pudo poner algún mensaje junto a un campo.
  function mostrarErrores(campos, errores) {
    let primero = null;
    for (const [clave, mensajes] of Object.entries(errores)) {
      const campo = campos[clave];
      if (!campo) continue;
      const parrafo = parrafoDeError(campo);
      parrafo.textContent = [].concat(mensajes).join(' ');
      parrafo.hidden = false;
      campo.setAttribute('aria-invalid', 'true');
      if (!primero) primero = campo;
    }
    // Se lleva el foco al primer campo con error para que se corrija sin buscarlo.
    if (primero) primero.focus();
    return Boolean(primero);
  }

  // --- Validación en el navegador (antes de llamar a la API) ---

  function validarAcceso(correo, password) {
    const errores = {};
    if (!correo) errores.correo = ['Escribe tu correo.'];
    else if (!FORMATO_CORREO.test(correo)) errores.correo = ['Escribe un correo válido, por ejemplo alex@correo.com.'];
    if (!password) errores.password = ['Escribe tu contraseña.'];
    return errores;
  }

  function validarRegistro({ nombre, correo, password }) {
    const errores = {};
    if (!nombre) errores.nombre = ['Escribe tu nombre.'];
    else if (nombre.length > 60) errores.nombre = ['El nombre no puede pasar de 60 caracteres.'];
    if (!correo) errores.correo = ['Escribe tu correo.'];
    else if (!FORMATO_CORREO.test(correo) || correo.length > 254) {
      errores.correo = ['Escribe un correo válido, por ejemplo alex@correo.com.'];
    }
    if (password.length < 8) errores.password = ['La contraseña debe tener al menos 8 caracteres.'];
    return errores;
  }

  // Muestra el error de la API: junto a su campo si se puede y, si no, en el mensaje general.
  function mostrarErrorApi(error, campos, estado, campoDeConflicto) {
    const errores = error instanceof ErrorApi ? { ...error.errores } : {};
    // Un 409 (correo repetido) se muestra junto al correo aunque no traiga errores por campo.
    if (error instanceof ErrorApi && error.estado === 409 && !Object.keys(errores).length && campoDeConflicto) {
      errores[campoDeConflicto] = [error.textoParaUsuario()];
    }
    if (mostrarErrores(campos, errores)) {
      estado.textContent = 'Revisa los datos marcados.';
    } else {
      estado.textContent = error instanceof ErrorApi
        ? error.textoParaUsuario()
        : 'No se pudo completar la operación. Inténtalo de nuevo.';
    }
  }

  // Desactiva el botón mientras se espera a la API, para no enviar dos veces.
  function esperando(formulario, activo) {
    formulario.querySelector('button[type="submit"]').disabled = activo;
  }

  // --- Pantalla Acceso ---

  // Muestra el saludo o el formulario según haya sesión.
  function actualizarVistaAcceso() {
    const usuario = api.usuarioActual();
    const conSesion = api.haySesion() && usuario;
    bloqueSesion.hidden = !conSesion;
    formularioAcceso.hidden = Boolean(conSesion);
    sinCuenta.hidden = Boolean(conSesion);
    nombreUsuario.textContent = conSesion ? usuario.nombre : '';
    seccionMisRecetas.hidden = !conSesion;
    if (!conSesion) {
      listaMisRecetas.replaceChildren();
      estadoMisRecetas.textContent = '';
    } else if (!pantallaAcceso.hidden) {
      // Solo se piden las recetas si la pantalla Acceso está a la vista.
      cargarMisRecetas();
    }
  }

  // --- Mis recetas (RF-14) ---

  // Cuenta las cargas para ignorar una respuesta vieja si se pidió otra después.
  let cargaActual = 0;

  async function cargarMisRecetas() {
    const carga = ++cargaActual;
    estadoMisRecetas.textContent = 'Cargando tus recetas...';
    try {
      const recetas = await api.misRecetas();
      if (carga !== cargaActual) return;
      dibujarMisRecetas(recetas);
    } catch (error) {
      if (carga !== cargaActual) return;
      listaMisRecetas.replaceChildren();
      estadoMisRecetas.textContent = error instanceof ErrorApi
        ? error.textoParaUsuario()
        : 'No se pudieron cargar tus recetas. Inténtalo de nuevo.';
    }
  }

  function dibujarMisRecetas(recetas) {
    listaMisRecetas.replaceChildren();
    if (!recetas.length) {
      // Mensaje que invita a publicar, hecho con nodos y no como HTML.
      const enlace = document.createElement('a');
      enlace.href = '#/publicar';
      enlace.textContent = 'Publica tu primera receta';
      estadoMisRecetas.replaceChildren('Todavía no has publicado recetas. ', enlace, '.');
      return;
    }
    estadoMisRecetas.textContent = recetas.length === 1 ? 'Tienes 1 receta publicada.' : `Tienes ${recetas.length} recetas publicadas.`;
    for (const receta of recetas) listaMisRecetas.append(elementoReceta(receta));
  }

  function elementoReceta(receta) {
    const item = document.createElement('li');
    item.className = 'mi-receta';

    const enlace = document.createElement('a');
    enlace.href = '#/receta/' + receta.id;
    enlace.textContent = receta.nombre;

    const meta = document.createElement('span');
    meta.className = 'mi-receta-meta';
    meta.textContent = `${receta.categoria} · ${receta.tiempo} min`;

    // El nombre de la receta va en aria-label para que el lector de pantalla diga qué se edita o borra.
    const editar = document.createElement('button');
    editar.type = 'button';
    editar.textContent = 'Editar';
    editar.setAttribute('aria-label', 'Editar ' + receta.nombre);
    editar.addEventListener('click', () => {
      window.location.hash = '#/publicar/' + receta.id;
    });

    const borrar = document.createElement('button');
    borrar.type = 'button';
    borrar.textContent = 'Borrar';
    borrar.setAttribute('aria-label', 'Borrar ' + receta.nombre);
    borrar.addEventListener('click', () => borrarReceta(receta, borrar));

    const acciones = document.createElement('div');
    acciones.className = 'mi-receta-acciones';
    acciones.append(editar, borrar);

    item.append(enlace, meta, acciones);
    return item;
  }

  async function borrarReceta(receta, boton) {
    // confirm() pide confirmación porque borrar no se puede deshacer.
    if (!confirm(`¿Borrar la receta "${receta.nombre}"? Esta acción no se puede deshacer.`)) return;
    boton.disabled = true;
    estadoMisRecetas.textContent = 'Borrando la receta...';
    try {
      await api.eliminarReceta(receta.id);
      await cargarMisRecetas();
      // Se antepone al mensaje de la lista ("Tienes 2 recetas..." o la invitación a publicar).
      estadoMisRecetas.prepend(`Se borró la receta "${receta.nombre}". `);
      // El foco vuelve al título de la sección, porque el botón ya no existe.
      document.getElementById('titulo-mis-recetas').focus();
    } catch (error) {
      boton.disabled = false;
      estadoMisRecetas.textContent = error instanceof ErrorApi
        ? error.textoParaUsuario()
        : 'No se pudo borrar la receta. Inténtalo de nuevo.';
    }
  }

  formularioAcceso.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    limpiarErrores(camposAcceso);
    estadoAcceso.textContent = '';

    const correo = camposAcceso.correo.value.trim();
    const password = camposAcceso.password.value;
    const errores = validarAcceso(correo, password);
    if (mostrarErrores(camposAcceso, errores)) {
      estadoAcceso.textContent = 'Revisa los datos marcados.';
      return;
    }

    esperando(formularioAcceso, true);
    estadoAcceso.textContent = 'Entrando...';
    try {
      await api.iniciarSesion(correo, password);
      formularioAcceso.reset();
      estadoAcceso.textContent = 'Entraste a tu cuenta.';
      botonCerrar.focus();
    } catch (error) {
      // Un 401 trae el mensaje del servidor ("Correo o contraseña incorrectos.").
      mostrarErrorApi(error, camposAcceso, estadoAcceso);
    } finally {
      esperando(formularioAcceso, false);
    }
  });

  botonCerrar.addEventListener('click', () => {
    api.cerrarSesion();
    estadoAcceso.textContent = 'Cerraste tu sesión.';
    camposAcceso.correo.focus();
  });

  // --- Pantalla Crear cuenta ---

  formularioRegistro.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    limpiarErrores(camposRegistro);
    estadoRegistro.textContent = '';

    const datos = {
      nombre: camposRegistro.nombre.value.trim(),
      correo: camposRegistro.correo.value.trim(),
      password: camposRegistro.password.value,
    };
    const errores = validarRegistro(datos);
    if (mostrarErrores(camposRegistro, errores)) {
      estadoRegistro.textContent = 'Revisa los datos marcados.';
      return;
    }

    esperando(formularioRegistro, true);
    estadoRegistro.textContent = 'Creando tu cuenta...';
    try {
      await api.registrar(datos);
    } catch (error) {
      mostrarErrorApi(error, camposRegistro, estadoRegistro, 'correo');
      esperando(formularioRegistro, false);
      return;
    }

    // Registrar no inicia sesión (contrato), así que se entra con los mismos datos para ahorrar un paso.
    try {
      await api.iniciarSesion(datos.correo, datos.password);
      formularioRegistro.reset();
      window.location.hash = '#/acceso';
      estadoAcceso.textContent = 'Tu cuenta se creó y ya entraste.';
    } catch {
      formularioRegistro.reset();
      window.location.hash = '#/acceso';
      camposAcceso.correo.value = datos.correo;
      estadoAcceso.textContent = 'Tu cuenta se creó. Escribe tu contraseña para entrar.';
    } finally {
      esperando(formularioRegistro, false);
      estadoRegistro.textContent = '';
    }
  });

  // --- Eventos generales ---

  document.addEventListener('pantalla-mostrada', (evento) => {
    if (evento.detail.id === 'acceso') {
      limpiarErrores(camposAcceso);
      actualizarVistaAcceso();
    } else if (evento.detail.id === 'registro') {
      limpiarErrores(camposRegistro);
      estadoRegistro.textContent = '';
    } else {
      // Al salir de Acceso se borra el mensaje para que no aparezca viejo al volver.
      estadoAcceso.textContent = '';
    }
  });

  // Alguien entró o salió (también si la sesión venció): se actualiza la pantalla.
  document.addEventListener('sesion-cambiada', (evento) => {
    // Si el servidor rechazó el token, se explica por qué hay que volver a entrar.
    if (evento.detail && evento.detail.motivo === 'vencida') {
      estadoAcceso.textContent = 'Tu sesión venció. Vuelve a entrar.';
    }
    actualizarVistaAcceso();
  });
})();
