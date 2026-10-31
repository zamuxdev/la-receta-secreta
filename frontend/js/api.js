// Cliente de la API. Todos los módulos hablan con el backend a través de `api`.
// Los endpoints y los datos están definidos en docs/10-contrato-api.md.
//
// Uso:
//   const recetas = await api.listarRecetas({ categoria: 'Postre' });
//   try { await api.calificar(3, 5); } catch (error) { mostrar(error.textoParaUsuario()); }
//   await api.descargarReceta(3, 'xml'); // el navegador descarga el archivo

// true: usa datos de prueba que imitan el contrato (js/api-prueba.js).
// false: usa el backend real. Cámbialo cuando el endpoint que necesitas ya exista.
const USAR_DATOS_DE_PRUEBA = false;
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
// Si se cerró porque el servidor rechazó el token, el evento trae { motivo: 'vencida' }.
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

  function avisar(motivo) {
    document.dispatchEvent(new CustomEvent('sesion-cambiada', { detail: motivo ? { motivo } : {} }));
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
    cerrar(motivo) {
      memoria = { token: null, usuario: null };
      try { localStorage.removeItem(CLAVE); } catch { /* ver arriba */ }
      avisar(motivo);
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
  // Con comoArchivo, una respuesta correcta se devuelve como { archivo, nombre } en lugar de JSON.
  async function peticion(metodo, ruta, cuerpo, { comoArchivo = false } = {}) {
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
    if (respuesta.ok && comoArchivo) return { archivo: await respuesta.blob(), nombre: nombreDelArchivo(respuesta) };
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

  // El servidor manda el nombre en la cabecera Content-Disposition (filename*=UTF-8''nombre.xml).
  function nombreDelArchivo(respuesta) {
    const cabecera = respuesta.headers.get('Content-Disposition') || '';
    const codificado = /filename\*=UTF-8''([^;]+)/i.exec(cabecera);
    if (codificado) return decodeURIComponent(codificado[1]);
    const simple = /filename="?([^";]+)"?/i.exec(cabecera);
    return simple ? simple[1] : 'archivo';
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

    descargarReceta: (recetaId, formato) =>
      peticion('GET', `/recetas/${recetaId}/exportar` + consulta({ formato }), undefined, { comoArchivo: true }),
    descargarFavoritos: () => peticion('GET', '/favoritos/exportar', undefined, { comoArchivo: true }),
  };
})();

const implementacion = USAR_DATOS_DE_PRUEBA ? apiPrueba : apiReal;

// Si el servidor dice que la sesión no es válida (venció el token), se cierra la sesión local.
async function llamar(nombre, ...argumentos) {
  try {
    return await implementacion[nombre](...argumentos);
  } catch (error) {
    if (error instanceof ErrorApi && error.estado === 401 && nombre !== 'iniciarSesion' && sesion.iniciada()) {
      sesion.cerrar('vencida');
    }
    throw error;
  }
}

// Hace que el navegador descargue un archivo creado en la página.
function guardarDescarga({ archivo, nombre }) {
  const url = URL.createObjectURL(archivo);
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = nombre;
  document.body.append(enlace);
  enlace.click();
  enlace.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
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

  // Exportación (RF-23): descargan el archivo en el navegador.
  // formato: 'json' o 'xml'. Los favoritos se descargan en CSV y requieren sesión.
  descargarReceta: async (recetaId, formato = 'json') => guardarDescarga(await llamar('descargarReceta', recetaId, formato)),
  descargarFavoritos: async () => guardarDescarga(await llamar('descargarFavoritos')),
};
