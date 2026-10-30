// Pantalla Publicar (módulo Acceso y publicar). Responsable: Yaret Juárez.
// Una receta JSON usa los mismos campos que el formulario.
//
// - Los errores se muestran junto a su campo: los de la validación en el navegador y los que
//   rechace el servidor (error.errores). La clave `nombre` corresponde al campo #titulo.
// - Publicar exige sesión: sin ella se muestra un aviso que invita a entrar.

(() => {
  const formularioReceta = document.getElementById('formulario-receta');
  const archivoReceta = document.getElementById('archivo-receta');
  const estadoJSON = document.getElementById('estado-json');
  const avisoSesion = document.getElementById('aviso-publicar-sesion');
  const categorias = ['Desayuno', 'Comida', 'Cena', 'Postre'];
  let fotoActual = '';
  const campoFoto = document.getElementById('foto');
  const vistaFoto = document.getElementById('vista-foto');
  const quitarFoto = document.getElementById('quitar-foto');
  const fotosIncluidas = ['fotos/tacos.jpg', 'fotos/avena.jpg', 'fotos/ensalada.jpg'];

  // Clave de error (la del contrato de la API) → id del campo en el formulario.
  const camposPorClave = {
    nombre: 'titulo', descripcion: 'descripcion', categoria: 'categoria', tiempo: 'tiempo',
    porciones: 'porciones', ingredientes: 'ingredientes', pasos: 'pasos', foto: 'foto',
  };

  const MENSAJE_FOTO = 'La foto debe ser JPG, PNG o WebP de hasta 2 MB.';

  // Error de validación con los mensajes por campo, igual que error.errores de la API.
  class ErrorValidacion extends Error {
    constructor(errores, mensaje = 'Revisa los datos marcados.') {
      super(mensaje);
      this.errores = errores;
    }

    // Todos los mensajes en un solo texto (para la importación desde JSON, que no tiene campos).
    textoCompleto() {
      const mensajes = Object.values(this.errores).flat();
      return mensajes.length ? mensajes.join(' ') : this.message;
    }
  }

  // --- Errores por campo ---

  function limpiarErrores() {
    for (const id of Object.values(camposPorClave)) {
      const campo = document.getElementById(id);
      const parrafo = document.getElementById('error-' + id);
      campo.removeAttribute('aria-invalid');
      parrafo.textContent = '';
      parrafo.hidden = true;
    }
  }

  // Devuelve los mensajes que no tienen campo, para mostrarlos en el mensaje general.
  function mostrarErrores(errores) {
    let primero = null;
    const sinCampo = [];
    for (const [clave, mensajes] of Object.entries(errores)) {
      const id = camposPorClave[clave];
      if (!id) {
        sinCampo.push(...[].concat(mensajes));
        continue;
      }
      const campo = document.getElementById(id);
      const parrafo = document.getElementById('error-' + id);
      parrafo.textContent = [].concat(mensajes).join(' ');
      parrafo.hidden = false;
      campo.setAttribute('aria-invalid', 'true');
      if (!primero) primero = campo;
    }
    // Se lleva el foco al primer campo con error para corregirlo sin buscarlo.
    if (primero) primero.focus();
    return sinCampo;
  }

  // --- Aviso de sesión ---

  function actualizarAvisoSesion() {
    avisoSesion.hidden = api.haySesion();
  }

  // --- Foto ---

  function fotoValida(foto) {
    return foto === undefined || foto === null || foto === '' || (typeof foto === 'string' && foto.length <= 2800000 &&
      (fotosIncluidas.includes(foto) || /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(foto)));
  }

  // Comprobamos que el navegador realmente pueda abrir la imagen.
  function comprobarImagen(foto) {
    if (!foto) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const imagen = new Image();
      imagen.onload = () => resolve();
      imagen.onerror = () => reject(new ErrorValidacion({ foto: ['No se pudo abrir la foto. Selecciona una imagen válida.'] }));
      imagen.src = foto;
    });
  }

  function mostrarFoto(foto) {
    fotoActual = foto || '';
    vistaFoto.hidden = !fotoActual;
    quitarFoto.hidden = !fotoActual;
    if (fotoActual) vistaFoto.src = fotoActual;
    else vistaFoto.removeAttribute('src');
    campoFoto.value = '';
  }

  function bloquearArchivos(bloquear) {
    archivoReceta.disabled = bloquear;
    campoFoto.disabled = bloquear;
    quitarFoto.disabled = bloquear;
    formularioReceta.querySelector('button[type="submit"]').disabled = bloquear;
    document.getElementById('exportar-formulario').disabled = bloquear;
  }

  campoFoto.addEventListener('change', async () => {
    const archivo = campoFoto.files[0];
    if (!archivo) return;
    bloquearArchivos(true);
    limpiarErrores();
    try {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(archivo.type) || archivo.size > 2 * 1024 * 1024) {
        throw new ErrorValidacion({ foto: ['Elige una foto JPG, PNG o WebP de hasta 2 MB.'] });
      }
      const foto = await new Promise((resolve, reject) => {
        const lector = new FileReader();
        lector.onload = () => resolve(lector.result);
        lector.onerror = () => reject(new ErrorValidacion({ foto: ['No se pudo leer la foto.'] }));
        lector.readAsDataURL(archivo);
      });
      if (!fotoValida(foto)) throw new ErrorValidacion({ foto: [MENSAJE_FOTO] });
      await comprobarImagen(foto);
      mostrarFoto(foto);
      estadoJSON.textContent = 'Foto agregada.';
    } catch (error) {
      if (error instanceof ErrorValidacion) {
        mostrarErrores(error.errores);
        estadoJSON.textContent = '';
      } else {
        estadoJSON.textContent = error.message;
      }
    } finally {
      campoFoto.value = '';
      bloquearArchivos(false);
    }
  });

  quitarFoto.addEventListener('click', () => {
    mostrarFoto('');
    estadoJSON.textContent = 'Foto quitada. Puedes agregar la receta sin foto.';
  });

  // --- Validación de la receta ---

  // Revisa todos los campos a la vez y lanza un ErrorValidacion con un mensaje por campo.
  function validarReceta(datos) {
    if (!datos || typeof datos !== 'object' || Array.isArray(datos)) {
      throw new ErrorValidacion({}, 'El archivo debe contener una sola receta como objeto JSON.');
    }
    const errores = {};
    const textoValido = (texto, limite) => typeof texto === 'string' && texto.trim() && texto.length <= limite;
    if (!textoValido(datos.nombre, 100)) errores.nombre = ['Escribe el nombre de la receta (hasta 100 caracteres).'];
    if (!textoValido(datos.descripcion, 350)) errores.descripcion = ['Escribe una descripción (hasta 350 caracteres).'];
    if (!categorias.includes(datos.categoria)) errores.categoria = ['Elige una categoría: Desayuno, Comida, Cena o Postre.'];
    if (!Number.isInteger(datos.tiempo) || datos.tiempo < 1 || datos.tiempo > 1440) {
      errores.tiempo = ['El tiempo debe ser un número entero de 1 a 1440 minutos.'];
    }
    if (!Number.isInteger(datos.porciones) || datos.porciones < 1 || datos.porciones > 100) {
      errores.porciones = ['Las porciones deben ser un número entero de 1 a 100.'];
    }
    const listaValida = (lista, limite) => Array.isArray(lista) && lista.length &&
      lista.every((texto) => typeof texto === 'string' && texto.trim() && !/[\r\n]/.test(texto)) &&
      lista.join('\n').length <= limite;
    if (!listaValida(datos.ingredientes, 4000)) {
      errores.ingredientes = ['Escribe al menos un ingrediente, uno por línea (hasta 4000 caracteres en total).'];
    }
    if (!listaValida(datos.pasos, 8000)) {
      errores.pasos = ['Escribe al menos un paso, uno por línea (hasta 8000 caracteres en total).'];
    }
    if (!fotoValida(datos.foto)) errores.foto = [MENSAJE_FOTO];
    if (Object.keys(errores).length) throw new ErrorValidacion(errores);

    // Solo conservamos los campos conocidos; no interpretamos el archivo como HTML.
    return {
      nombre: datos.nombre.trim(), descripcion: datos.descripcion.trim(),
      categoria: datos.categoria, tiempo: datos.tiempo, porciones: datos.porciones,
      ingredientes: datos.ingredientes.map((texto) => texto.trim()),
      pasos: datos.pasos.map((texto) => texto.trim()),
      ...(datos.foto ? { foto: datos.foto } : {}),
    };
  }

  function leerFormulario() {
    const valor = (id) => document.getElementById(id).value;
    const lineas = (id) => valor(id).split('\n').map((texto) => texto.trim()).filter(Boolean);
    // Un número vacío se envía como 0 para que la validación lo marque.
    const numero = (id) => (valor(id).trim() === '' ? 0 : Number(valor(id)));
    return validarReceta({
      nombre: valor('titulo'), descripcion: valor('descripcion'), categoria: valor('categoria'),
      tiempo: numero('tiempo'), porciones: numero('porciones'),
      ingredientes: lineas('ingredientes'), pasos: lineas('pasos'),
      foto: fotoActual,
    });
  }

  function llenarFormulario(receta) {
    document.getElementById('titulo').value = receta.nombre;
    for (const campo of ['descripcion', 'categoria', 'tiempo', 'porciones']) {
      document.getElementById(campo).value = receta[campo];
    }
    document.getElementById('ingredientes').value = receta.ingredientes.join('\n');
    document.getElementById('pasos').value = receta.pasos.join('\n');
    mostrarFoto(receta.foto);
  }

  // --- Importar y exportar JSON ---

  archivoReceta.addEventListener('change', async () => {
    const archivo = archivoReceta.files[0];
    if (!archivo) return;
    bloquearArchivos(true);
    limpiarErrores();
    try {
      if (archivo.size > 3 * 1024 * 1024) throw new Error('El archivo no debe superar 3 MB.');
      const texto = (await archivo.text()).replace(/^﻿/, '');
      const receta = validarReceta(JSON.parse(texto));
      await comprobarImagen(receta.foto);
      llenarFormulario(receta);
      estadoJSON.textContent = 'Receta importada. Puedes editarla, exportarla o agregarla al recetario.';
    } catch (error) {
      if (error instanceof SyntaxError) {
        estadoJSON.textContent = 'El archivo no contiene un JSON válido. Revisa sus comillas y comas.';
      } else {
        // El archivo no está en el formulario todavía, así que los errores van juntos en un texto.
        estadoJSON.textContent = error instanceof ErrorValidacion ? 'El archivo tiene errores: ' + error.textoCompleto() : error.message;
      }
    } finally {
      archivoReceta.value = '';
      bloquearArchivos(false);
    }
  });

  function exportarReceta(receta) {
    const archivo = new Blob([JSON.stringify(receta, null, 2) + '\n'], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(archivo);
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = (receta.nombre.normalize('NFD').replace(/[̀-ͯ]/g, '')
      .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'receta') + '.json';
    document.body.append(enlace);
    enlace.click();
    enlace.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  // Muestra el error de leerFormulario o de la API: junto a cada campo, y lo demás en el mensaje general.
  function mostrarError(error) {
    if (error instanceof ErrorValidacion) {
      const sinCampo = mostrarErrores(error.errores);
      estadoJSON.textContent = sinCampo.length ? sinCampo.join(' ') : error.message;
    } else if (error instanceof ErrorApi && error.estado === 401) {
      // Sin sesión o la sesión venció: se muestra el aviso para entrar.
      actualizarAvisoSesion();
      estadoJSON.textContent = 'Para publicar necesitas entrar a tu cuenta.';
      avisoSesion.focus();
    } else if (error instanceof ErrorApi && Object.keys(error.errores).length) {
      const sinCampo = mostrarErrores(error.errores);
      estadoJSON.textContent = sinCampo.length ? sinCampo.join(' ') : 'Revisa los datos marcados.';
    } else {
      estadoJSON.textContent = error instanceof ErrorApi ? error.textoParaUsuario() : error.message;
    }
  }

  document.getElementById('exportar-formulario').addEventListener('click', () => {
    limpiarErrores();
    try {
      exportarReceta(leerFormulario());
      estadoJSON.textContent = 'Se inició la descarga de la receta en JSON.';
    } catch (error) {
      mostrarError(error);
    }
  });

  // --- Publicar ---

  // La receta se envía a la API y se abre su detalle, que dibuja js/catalogo.js.
  formularioReceta.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    limpiarErrores();
    estadoJSON.textContent = '';
    try {
      const receta = leerFormulario();
      // Sin sesión no se llama a la API: se avisa y se invita a entrar.
      if (!api.haySesion()) {
        actualizarAvisoSesion();
        estadoJSON.textContent = 'Para publicar necesitas entrar a tu cuenta.';
        avisoSesion.focus();
        return;
      }
      bloquearArchivos(true);
      estadoJSON.textContent = 'Publicando la receta...';
      const creada = await api.crearReceta(receta);
      estadoJSON.textContent = 'Receta publicada.';
      formularioReceta.reset();
      mostrarFoto('');
      window.location.hash = '#/receta/' + creada.id;
    } catch (error) {
      mostrarError(error);
    } finally {
      bloquearArchivos(false);
    }
  });

  document.addEventListener('pantalla-mostrada', (evento) => {
    if (evento.detail.id !== 'publicar') return;
    limpiarErrores();
    actualizarAvisoSesion();
  });

  document.addEventListener('sesion-cambiada', actualizarAvisoSesion);
})();
