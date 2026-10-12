// Cliente de la API. Todos los módulos hablan con el backend a través de `api`.
// Los endpoints y los datos están definidos en docs/10-contrato-api.md.
//
// Uso:
//   const recetas = await api.listarRecetas({ categoria: 'Postre' });
//   try { await api.calificar(3, 5); } catch (error) { mostrar(error.textoParaUsuario()); }

// true: usa datos de prueba que imitan el contrato (js/api-prueba.js).
// false: usa el backend real. Cámbialo cuando el endpoint que necesitas ya exista.
const USAR_DATOS_DE_PRUEBA = true;
const URL_API = 'http://localhost:5166/api';

// Error que lanzan todas las funciones de `api` cuando algo sale mal.
class ErrorApi extends Error {
  constructor(estado, mensaje, errores = {}) {
    super(mensaje);
    this.estado = estado;   // 0 = sin conexión; si no, el código HTTP (400, 401, 404...)
    this.errores = errores; // en un 400: { campo: ['mensaje', ...] }
  }

  // Texto listo para mostrar al usuario: los mensajes por campo, o el mensaje general.
  textoParaUsuario() {
    const mensajes = Object.values(this.errores).flat();
    return mensajes.length ? mensajes.join(' ') : this.message;
  }
}

// Sesión del usuario. Se guarda en localStorage, y en memoria si el navegador no lo permite.
// Cuando cambia, se avisa con el evento 'sesion-cambiada' en `document`.
const sesion = (() => {
  const CLAVE = 'receta-secreta-sesion';
  let memoria = { token: null, usuario: null };

  function leer() {
    try {
      const guardada = JSON.parse(localStorage.getItem(CLAVE));
      if (guardada && guardada.token) return guardada;
    } catch { /* sin almacenamiento: se usa la memoria */ }
    return memoria;
  }

  function avisar() {
    document.dispatchEvent(new CustomEvent('sesion-cambiada'));
  }

  return {
    token: () => leer().token,
    usuario: () => leer().usuario,
    iniciada: () => Boolean(leer().token),
    guardar(token, usuario) {
      memoria = { token, usuario };
      try { localStorage.setItem(CLAVE, JSON.stringify(memoria)); } catch { /* ver arriba */ }
      avisar();
    },
    cerrar() {
      memoria = { token: null, usuario: null };
      try { localStorage.removeItem(CLAVE); } catch { /* ver arriba */ }
      avisar();
    },
  };
})();

const MENSAJES_POR_ESTADO = {
  400: 'Revisa los datos que escribiste.',
  401: 'Inicia sesión para continuar.',
  403: 'No tienes permiso para hacer esto.',
  404: 'No se encontró lo que buscas.',
  409: 'Ya existe un registro con esos datos.',
};

// Implementación real: habla con el backend por HTTP.
const apiReal = (() => {
  async function peticion(metodo, ruta, cuerpo) {
    const cabeceras = {};
    if (cuerpo !== undefined) cabeceras['Content-Type'] = 'application/json';
    if (sesion.token()) cabeceras.Authorization = 'Bearer ' + sesion.token();

    let respuesta;
    try {
      respuesta = await fetch(URL_API + ruta, {
        method: metodo,
        headers: cabeceras,
        body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
      });
    } catch {
      throw new ErrorApi(0, 'No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.');
    }

    if (respuesta.status === 204) return null;
    let datos = null;
    try { datos = await respuesta.json(); } catch { /* respuesta sin cuerpo JSON */ }

    if (!respuesta.ok) {
      // Si el servidor manda un mensaje propio en `detail` (por ejemplo, el del login), se usa ese.
      const mensaje = respuesta.status >= 500
        ? 'Algo salió mal en el servidor. Inténtalo más tarde.'
        : (datos && datos.detail) || MENSAJES_POR_ESTADO[respuesta.status] || 'No se pudo completar la operación.';
      throw new ErrorApi(respuesta.status, mensaje, (datos && datos.errors) || {});
    }
    return datos;
  }

  function consulta(parametros) {
    const texto = new URLSearchParams(
      Object.entries(parametros).filter(([, valor]) => valor !== undefined && valor !== null && valor !== ''),
    ).toString();
    return texto ? '?' + texto : '';
  }

  return {
    listarRecetas: ({ categoria, ingrediente } = {}) =>
      peticion('GET', '/recetas' + consulta({ categoria, ingrediente })),
    obtenerReceta: (id) => peticion('GET', `/recetas/${id}`),
    crearReceta: (datos) => peticion('POST', '/recetas', datos),
    actualizarReceta: (id, datos) => peticion('PUT', `/recetas/${id}`, datos),
    eliminarReceta: (id) => peticion('DELETE', `/recetas/${id}`),
    misRecetas: () => peticion('GET', '/recetas/mias'),
    recetasMejorValoradas: (limite = 10) => peticion('GET', '/recetas/mejor-valoradas' + consulta({ limite })),
    listarCategorias: () => peticion('GET', '/categorias'),

    registrar: (datos) => peticion('POST', '/auth/registro', datos),
    iniciarSesion: (correo, password) => peticion('POST', '/auth/login', { correo, password }),
    yo: () => peticion('GET', '/auth/yo'),

    listarFavoritos: () => peticion('GET', '/favoritos'),
    agregarFavorito: (recetaId) => peticion('PUT', `/favoritos/${recetaId}`),
    quitarFavorito: (recetaId) => peticion('DELETE', `/favoritos/${recetaId}`),

    calificar: (recetaId, puntos) => peticion('PUT', `/recetas/${recetaId}/calificacion`, { puntos }),
    quitarCalificacion: (recetaId) => peticion('DELETE', `/recetas/${recetaId}/calificacion`),
  };
})();

const implementacion = USAR_DATOS_DE_PRUEBA ? apiPrueba : apiReal;

// Si el servidor dice que la sesión no es válida (venció el token), se cierra la sesión local.
async function llamar(nombre, ...argumentos) {
  try {
    return await implementacion[nombre](...argumentos);
  } catch (error) {
    if (error instanceof ErrorApi && error.estado === 401 && nombre !== 'iniciarSesion' && sesion.iniciada()) {
      sesion.cerrar();
    }
    throw error;
  }
}

const api = {
  // Recetas
  listarRecetas: (filtros) => llamar('listarRecetas', filtros),
  obtenerReceta: (id) => llamar('obtenerReceta', id),
  crearReceta: (datos) => llamar('crearReceta', datos),
  actualizarReceta: (id, datos) => llamar('actualizarReceta', id, datos),
  eliminarReceta: (id) => llamar('eliminarReceta', id),
  misRecetas: () => llamar('misRecetas'),
  recetasMejorValoradas: (limite) => llamar('recetasMejorValoradas', limite),
  listarCategorias: () => llamar('listarCategorias'),

  // Usuarios y sesión
  registrar: (datos) => llamar('registrar', datos),
  async iniciarSesion(correo, password) {
    const { token, usuario } = await llamar('iniciarSesion', correo, password);
    sesion.guardar(token, usuario);
    return usuario;
  },
  cerrarSesion: () => sesion.cerrar(),
  usuarioActual: () => sesion.usuario(), // sin llamar al servidor; null si no hay sesión
  haySesion: () => sesion.iniciada(),

  // Favoritos
  listarFavoritos: () => llamar('listarFavoritos'),
  agregarFavorito: (recetaId) => llamar('agregarFavorito', recetaId),
  quitarFavorito: (recetaId) => llamar('quitarFavorito', recetaId),

  // Calificaciones
  calificar: (recetaId, puntos) => llamar('calificar', recetaId, puntos),
  quitarCalificacion: (recetaId) => llamar('quitarCalificacion', recetaId),
};
