// Datos de prueba que imitan el backend, siguiendo docs/10-contrato-api.md.
// Sirve para construir la interfaz mientras un endpoint todavía no existe.
//
// - Los datos se guardan en localStorage, así que sobreviven a recargar la página.
//   Para empezar de cero, borra la clave 'receta-secreta-prueba' (o usa el modo incógnito).
// - Hay un usuario de prueba: demo@recetasecreta.test con contraseña demo12345.
// - Aquí las contraseñas se guardan en texto plano. Solo es una imitación: el backend real no lo hace.
// - Publicar, editar, borrar, calificar y los favoritos exigen sesión, igual que el backend.

const apiPrueba = (() => {
  const CLAVE = 'receta-secreta-prueba';
  const CATEGORIAS = [
    { id: 1, nombre: 'Desayuno' },
    { id: 2, nombre: 'Comida' },
    { id: 3, nombre: 'Cena' },
    { id: 4, nombre: 'Postre' },
  ];

  function datosIniciales() {
    return {
      siguienteReceta: 4,
      siguienteUsuario: 2,
      usuarios: [{ id: 1, nombre: 'Usuario demo', correo: 'demo@recetasecreta.test', password: 'demo12345', rol: 'Usuario' }],
      favoritos: [],       // { usuarioId, recetaId }
      calificaciones: [],  // { usuarioId, recetaId, puntos }
      recetas: [
        {
          id: 1, autorId: null, nombre: 'Tacos de frijol con aguacate',
          descripcion: 'Una comida rápida para esos días con poco tiempo.',
          categoria: 'Comida', tiempo: 15, porciones: 2, foto: 'fotos/tacos.jpg',
          ingredientes: ['6 tortillas de maíz', '1 taza de frijoles cocidos', '1 aguacate', 'Salsa al gusto'],
          pasos: ['Calienta los frijoles en una sartén.', 'Calienta las tortillas por ambos lados.', 'Rellena con frijoles, agrega aguacate y termina con salsa.'],
        },
        {
          id: 2, autorId: null, nombre: 'Avena con plátano',
          descripcion: 'Un desayuno sencillo para empezar bien el día.',
          categoria: 'Desayuno', tiempo: 10, porciones: 1, foto: 'fotos/avena.jpg',
          ingredientes: ['½ taza de avena', '1 taza de leche o bebida vegetal', '1 plátano', 'Canela al gusto'],
          pasos: ['Mezcla la avena y la leche en una olla.', 'Cocina a fuego bajo durante 5 minutos, moviendo con frecuencia.', 'Sirve con plátano en rodajas y canela.'],
        },
        {
          id: 3, autorId: null, nombre: 'Ensalada de garbanzo',
          descripcion: 'Fresca, fácil de llevar y sin encender la estufa.',
          categoria: 'Comida', tiempo: 12, porciones: 2, foto: 'fotos/ensalada.jpg',
          ingredientes: ['1 taza de garbanzos cocidos', '1 pepino', '1 jitomate', '1 limón', '1 cucharada de aceite de oliva'],
          pasos: ['Lava y corta el pepino y el jitomate en cubos.', 'Mezcla las verduras con los garbanzos.', 'Añade el jugo de limón y el aceite antes de servir.'],
        },
      ],
    };
  }

  let datos = null;
  function leer() {
    if (datos) return datos;
    try { datos = JSON.parse(localStorage.getItem(CLAVE)); } catch { /* se usan los datos iniciales */ }
    if (!datos) datos = datosIniciales();
    return datos;
  }
  function guardar() {
    try { localStorage.setItem(CLAVE, JSON.stringify(datos)); } catch { /* sin almacenamiento: solo memoria */ }
  }

  // Simula la espera de la red, para que se vean los mensajes de "cargando".
  const esperar = (ms = 150) => new Promise((resolver) => setTimeout(resolver, ms));

  function usuarioPublico(u) {
    return { id: u.id, nombre: u.nombre, correo: u.correo, rol: u.rol };
  }

  // El token de prueba tiene la forma "prueba-<id del usuario>".
  function usuarioDeLaSesion() {
    const coincidencia = /^prueba-(\d+)$/.exec(sesion.token() || '');
    if (!coincidencia) return null;
    return leer().usuarios.find((u) => u.id === Number(coincidencia[1])) || null;
  }

  function exigirUsuario() {
    const usuario = usuarioDeLaSesion();
    if (!usuario) throw new ErrorApi(401, 'Inicia sesión para continuar.');
    return usuario;
  }

  function buscarReceta(id) {
    const receta = leer().recetas.find((r) => r.id === Number(id));
    if (!receta) throw new ErrorApi(404, 'No se encontró lo que buscas.');
    return receta;
  }

  function estadisticas(recetaId) {
    const puntos = leer().calificaciones.filter((c) => c.recetaId === recetaId).map((c) => c.puntos);
    return {
      promedio: puntos.length ? puntos.reduce((suma, p) => suma + p, 0) / puntos.length : null,
      totalCalificaciones: puntos.length,
    };
  }

  function resumen(r) {
    return {
      id: r.id, nombre: r.nombre, descripcion: r.descripcion, categoria: r.categoria,
      tiempo: r.tiempo, porciones: r.porciones, foto: r.foto || null,
      ...estadisticas(r.id),
    };
  }

  function detalle(r) {
    const usuario = usuarioDeLaSesion();
    const autor = leer().usuarios.find((u) => u.id === r.autorId);
    const mia = usuario && leer().calificaciones.find((c) => c.recetaId === r.id && c.usuarioId === usuario.id);
    return {
      ...resumen(r),
      ingredientes: [...r.ingredientes],
      pasos: [...r.pasos],
      autor: autor ? autor.nombre : null,
      esMia: Boolean(usuario) && r.autorId === usuario.id,
      miCalificacion: mia ? mia.puntos : null,
    };
  }

  function favoritosDe(usuario) {
    const ids = leer().favoritos.filter((f) => f.usuarioId === usuario.id).map((f) => f.recetaId);
    return leer().recetas.filter((r) => ids.includes(r.id)).sort((a, b) => b.id - a.id).map(resumen);
  }

  // Mismas reglas que backend/RecetaSecreta.Api/Exportacion/Exportador.cs.
  function nombreArchivo(nombre, extension) {
    const base = nombre.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    return (base || 'receta') + '.' + extension;
  }

  function recetaXml(datos) {
    const doc = document.implementation.createDocument(null, 'receta');
    const agregar = (padre, etiqueta, texto) => {
      const elemento = doc.createElement(etiqueta);
      // XML no admite algunos caracteres de control.
      if (texto !== undefined) elemento.textContent = String(texto).replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');
      padre.append(elemento);
      return elemento;
    };
    const raiz = doc.documentElement;
    ['nombre', 'descripcion', 'categoria', 'tiempo', 'porciones'].forEach((campo) => agregar(raiz, campo, datos[campo]));
    const ingredientes = agregar(raiz, 'ingredientes');
    datos.ingredientes.forEach((texto) => agregar(ingredientes, 'ingrediente', texto));
    const pasos = agregar(raiz, 'pasos');
    datos.pasos.forEach((texto) => agregar(pasos, 'paso', texto));
    if (datos.foto) agregar(raiz, 'foto', datos.foto);
    return '<?xml version="1.0" encoding="utf-8"?>\n' + new XMLSerializer().serializeToString(doc) + '\n';
  }

  function celdaCsv(valor) {
    let texto = String(valor);
    if (/^[=+\-@\t\r]/.test(texto)) texto = "'" + texto; // que Excel no lo tome como fórmula
    return /[",\n\r]/.test(texto) ? '"' + texto.replace(/"/g, '""') + '"' : texto;
  }

  const limpiar = (lista) => (Array.isArray(lista) ? lista : []).map((t) => String(t).trim()).filter(Boolean);

  // Mismas reglas y mensajes que el backend (docs/10-contrato-api.md, sección 10.2).
  function validarReceta(entrada) {
    const errores = {};
    const nombre = String(entrada.nombre ?? '').trim();
    const descripcion = String(entrada.descripcion ?? '').trim();
    if (!nombre) errores.nombre = ['El nombre es obligatorio.'];
    else if (nombre.length > 100) errores.nombre = ['El nombre no puede pasar de 100 caracteres.'];
    if (!descripcion) errores.descripcion = ['La descripción es obligatoria.'];
    else if (descripcion.length > 350) errores.descripcion = ['La descripción no puede pasar de 350 caracteres.'];
    if (!entrada.categoria) errores.categoria = ['La categoría es obligatoria.'];
    else if (!CATEGORIAS.some((c) => c.nombre === entrada.categoria)) {
      errores.categoria = ['La categoría debe ser Desayuno, Comida, Cena o Postre.'];
    }
    if (!Number.isInteger(entrada.tiempo) || entrada.tiempo < 1 || entrada.tiempo > 1440) {
      errores.tiempo = ['El tiempo debe estar entre 1 y 1440 minutos.'];
    }
    if (!Number.isInteger(entrada.porciones) || entrada.porciones < 1 || entrada.porciones > 100) {
      errores.porciones = ['Las porciones deben estar entre 1 y 100.'];
    }
    const ingredientes = limpiar(entrada.ingredientes);
    const pasos = limpiar(entrada.pasos);
    if (!ingredientes.length) errores.ingredientes = ['Se necesita al menos un ingrediente.'];
    if (!pasos.length) errores.pasos = ['Se necesita al menos un paso.'];
    if (entrada.foto && String(entrada.foto).length > 2800000) errores.foto = ['La foto no puede pasar de 2 MB.'];

    if (Object.keys(errores).length) {
      throw new ErrorApi(400, 'Revisa los datos que escribiste.', errores);
    }
    return {
      nombre, descripcion, categoria: entrada.categoria, tiempo: entrada.tiempo, porciones: entrada.porciones,
      ingredientes, pasos, foto: entrada.foto ? String(entrada.foto) : null,
    };
  }

  function recetaPropia(id, usuario) {
    const receta = buscarReceta(id);
    if (receta.autorId !== usuario.id) throw new ErrorApi(403, 'No tienes permiso para hacer esto.');
    return receta;
  }

  return {
    async listarRecetas({ categoria, ingrediente } = {}) {
      await esperar();
      const texto = (ingrediente || '').trim().toLowerCase();
      return leer().recetas
        .filter((r) => !categoria || r.categoria === categoria)
        .filter((r) => !texto || r.ingredientes.some((i) => i.toLowerCase().includes(texto)))
        .sort((a, b) => b.id - a.id) // las más nuevas primero
        .map(resumen);
    },

    async obtenerReceta(id) {
      await esperar();
      return detalle(buscarReceta(id));
    },

    async crearReceta(entrada) {
      await esperar();
      const usuario = exigirUsuario();
      const valida = validarReceta(entrada);
      const d = leer();
      const receta = { id: d.siguienteReceta++, autorId: usuario.id, ...valida };
      d.recetas.push(receta);
      guardar();
      return detalle(receta);
    },

    async actualizarReceta(id, entrada) {
      await esperar();
      const receta = recetaPropia(id, exigirUsuario());
      Object.assign(receta, validarReceta(entrada));
      guardar();
      return detalle(receta);
    },

    async eliminarReceta(id) {
      await esperar();
      const receta = recetaPropia(id, exigirUsuario());
      const d = leer();
      d.recetas = d.recetas.filter((r) => r.id !== receta.id);
      d.favoritos = d.favoritos.filter((f) => f.recetaId !== receta.id);
      d.calificaciones = d.calificaciones.filter((c) => c.recetaId !== receta.id);
      guardar();
      return null;
    },

    async misRecetas() {
      await esperar();
      const usuario = exigirUsuario();
      return leer().recetas.filter((r) => r.autorId === usuario.id).sort((a, b) => b.id - a.id).map(resumen);
    },

    async recetasMejorValoradas(limite = 10) {
      await esperar();
      return leer().recetas
        .map(resumen)
        .filter((r) => r.totalCalificaciones > 0)
        .sort((a, b) => b.promedio - a.promedio || b.totalCalificaciones - a.totalCalificaciones || b.id - a.id)
        .slice(0, limite);
    },

    async listarCategorias() {
      await esperar();
      return CATEGORIAS.map((c) => ({ ...c }));
    },

    async registrar({ nombre, correo, password } = {}) {
      await esperar();
      const errores = {};
      const nombreLimpio = String(nombre ?? '').trim();
      const correoLimpio = String(correo ?? '').trim().toLowerCase();
      if (!nombreLimpio) errores.nombre = ['El nombre es obligatorio.'];
      else if (nombreLimpio.length > 60) errores.nombre = ['El nombre no puede pasar de 60 caracteres.'];
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correoLimpio) || correoLimpio.length > 254) {
        errores.correo = ['Escribe un correo válido.'];
      }
      if (String(password ?? '').length < 8) errores.password = ['La contraseña debe tener al menos 8 caracteres.'];
      if (Object.keys(errores).length) throw new ErrorApi(400, 'Revisa los datos que escribiste.', errores);

      const d = leer();
      if (d.usuarios.some((u) => u.correo === correoLimpio)) {
        throw new ErrorApi(409, 'Ya existe una cuenta con ese correo.');
      }
      const usuario = { id: d.siguienteUsuario++, nombre: nombreLimpio, correo: correoLimpio, password, rol: 'Usuario' };
      d.usuarios.push(usuario);
      guardar();
      return usuarioPublico(usuario);
    },

    async iniciarSesion(correo, password) {
      await esperar();
      const usuario = leer().usuarios.find((u) => u.correo === String(correo ?? '').trim().toLowerCase());
      if (!usuario || usuario.password !== password) {
        throw new ErrorApi(401, 'Correo o contraseña incorrectos.');
      }
      return {
        token: 'prueba-' + usuario.id,
        expiraEn: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        usuario: usuarioPublico(usuario),
      };
    },

    async yo() {
      await esperar();
      return usuarioPublico(exigirUsuario());
    },

    async listarFavoritos() {
      await esperar();
      return favoritosDe(exigirUsuario());
    },

    async agregarFavorito(recetaId) {
      await esperar();
      const usuario = exigirUsuario();
      const receta = buscarReceta(recetaId);
      const d = leer();
      if (!d.favoritos.some((f) => f.usuarioId === usuario.id && f.recetaId === receta.id)) {
        d.favoritos.push({ usuarioId: usuario.id, recetaId: receta.id });
        guardar();
      }
      return null;
    },

    async quitarFavorito(recetaId) {
      await esperar();
      const usuario = exigirUsuario();
      const receta = buscarReceta(recetaId);
      const d = leer();
      d.favoritos = d.favoritos.filter((f) => !(f.usuarioId === usuario.id && f.recetaId === receta.id));
      guardar();
      return null;
    },

    async calificar(recetaId, puntos) {
      await esperar();
      const usuario = exigirUsuario();
      const receta = buscarReceta(recetaId);
      if (receta.autorId === usuario.id) throw new ErrorApi(403, 'No puedes calificar tus propias recetas.');
      if (!Number.isInteger(puntos) || puntos < 1 || puntos > 5) {
        throw new ErrorApi(400, 'Revisa los datos que escribiste.', {
          puntos: ['La calificación debe ser un número entero del 1 al 5.'],
        });
      }
      const d = leer();
      const existente = d.calificaciones.find((c) => c.usuarioId === usuario.id && c.recetaId === receta.id);
      if (existente) existente.puntos = puntos;
      else d.calificaciones.push({ usuarioId: usuario.id, recetaId: receta.id, puntos });
      guardar();
      return { ...estadisticas(receta.id), miCalificacion: puntos };
    },

    async quitarCalificacion(recetaId) {
      await esperar();
      const usuario = exigirUsuario();
      const receta = buscarReceta(recetaId);
      const d = leer();
      d.calificaciones = d.calificaciones.filter((c) => !(c.usuarioId === usuario.id && c.recetaId === receta.id));
      guardar();
      return { ...estadisticas(receta.id), miCalificacion: null };
    },

    async descargarReceta(recetaId, formato = 'json') {
      await esperar();
      const r = buscarReceta(recetaId);
      const tipo = String(formato).toLowerCase();
      if (tipo !== 'json' && tipo !== 'xml') {
        throw new ErrorApi(400, 'Revisa los datos que escribiste.', { formato: ['El formato debe ser json o xml.'] });
      }
      const datos = {
        nombre: r.nombre, descripcion: r.descripcion, categoria: r.categoria, tiempo: r.tiempo,
        porciones: r.porciones, ingredientes: [...r.ingredientes], pasos: [...r.pasos], ...(r.foto ? { foto: r.foto } : {}),
      };
      return tipo === 'xml'
        ? { archivo: new Blob([recetaXml(datos)], { type: 'application/xml' }), nombre: nombreArchivo(r.nombre, 'xml') }
        : { archivo: new Blob([JSON.stringify(datos, null, 2) + '\n'], { type: 'application/json' }), nombre: nombreArchivo(r.nombre, 'json') };
    },

    async descargarFavoritos() {
      await esperar();
      const filas = favoritosDe(exigirUsuario())
        .map((r) => [r.id, celdaCsv(r.nombre), celdaCsv(r.categoria), r.tiempo, r.porciones].join(','));
      const csv = '\uFEFF' + ['Id,Nombre,Categoria,Tiempo,Porciones', ...filas].join('\r\n') + '\r\n';
      return { archivo: new Blob([csv], { type: 'text/csv;charset=utf-8' }), nombre: 'favoritos.csv' };
    },
  };
})();
