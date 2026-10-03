// Una receta JSON usa los mismos campos que el formulario.
const formularioReceta = document.getElementById('formulario-receta');
const archivoReceta = document.getElementById('archivo-receta');
const estadoJSON = document.getElementById('estado-json');
const categorias = ['Desayuno', 'Comida', 'Cena', 'Postre'];
let numeroReceta = 0;
let fotoActual = '';
const campoFoto = document.getElementById('foto');
const vistaFoto = document.getElementById('vista-foto');
const quitarFoto = document.getElementById('quitar-foto');
const fotosIncluidas = ['fotos/tacos.jpg', 'fotos/avena.jpg', 'fotos/ensalada.jpg'];

function validarFoto(foto) {
  if (foto === undefined || foto === null || foto === '') return '';
  if (typeof foto !== 'string' || foto.length > 2800000 ||
      (!fotosIncluidas.includes(foto) && !/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(foto))) {
    throw new Error('La foto debe ser JPG, PNG o WebP de hasta 2 MB.');
  }
  return foto;
}

// Comprobamos que el navegador realmente pueda abrir la imagen.
function comprobarImagen(foto) {
  if (!foto) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const imagen = new Image();
    imagen.onload = () => resolve();
    imagen.onerror = () => reject(new Error('No se pudo abrir la foto. Selecciona una imagen válida.'));
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
  try {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(archivo.type) || archivo.size > 2 * 1024 * 1024) {
      throw new Error('Elige una foto JPG, PNG o WebP de hasta 2 MB.');
    }
    const foto = await new Promise((resolve, reject) => {
      const lector = new FileReader();
      lector.onload = () => resolve(lector.result);
      lector.onerror = () => reject(new Error('No se pudo leer la foto.'));
      lector.readAsDataURL(archivo);
    });
    validarFoto(foto);
    await comprobarImagen(foto);
    mostrarFoto(foto);
    estadoJSON.textContent = 'Foto agregada.';
  } catch (error) {
    estadoJSON.textContent = error.message;
  } finally {
    campoFoto.value = '';
    bloquearArchivos(false);
  }
});

quitarFoto.addEventListener('click', () => {
  mostrarFoto('');
  estadoJSON.textContent = 'Foto quitada. Puedes agregar la receta sin foto.';
});

function validarReceta(datos) {
  if (!datos || typeof datos !== 'object' || Array.isArray(datos)) {
    throw new Error('El archivo debe contener una sola receta como objeto JSON.');
  }
  for (const [campo, limite] of [['nombre', 100], ['descripcion', 350]]) {
    if (typeof datos[campo] !== 'string' || !datos[campo].trim() || datos[campo].length > limite) {
      throw new Error(`El campo ${campo} debe tener entre 1 y ${limite} caracteres.`);
    }
  }
  if (!categorias.includes(datos.categoria)) {
    throw new Error('La categoría debe ser Desayuno, Comida, Cena o Postre.');
  }
  for (const [campo, limite] of [['tiempo', 1440], ['porciones', 100]]) {
    if (!Number.isInteger(datos[campo]) || datos[campo] < 1 || datos[campo] > limite) {
      throw new Error(`${campo} debe ser un número entero entre 1 y ${limite}.`);
    }
  }
  for (const [campo, limite] of [['ingredientes', 4000], ['pasos', 8000]]) {
    if (!Array.isArray(datos[campo]) || !datos[campo].length ||
        datos[campo].some((texto) => typeof texto !== 'string' || !texto.trim() || /[\r\n]/.test(texto)) ||
        datos[campo].join('\n').length > limite) {
      throw new Error(`${campo} debe ser una lista de textos no vacíos, sin saltos de línea y de hasta ${limite} caracteres en total.`);
    }
  }
  const foto = validarFoto(datos.foto);
  // Solo conservamos los campos conocidos; no interpretamos el archivo como HTML.
  return {
    nombre: datos.nombre.trim(), descripcion: datos.descripcion.trim(),
    categoria: datos.categoria, tiempo: datos.tiempo, porciones: datos.porciones,
    ingredientes: datos.ingredientes.map((texto) => texto.trim()),
    pasos: datos.pasos.map((texto) => texto.trim()),
    ...(foto ? { foto } : {}),
  };
}

function leerFormulario() {
  const valor = (id) => document.getElementById(id).value;
  const lineas = (id) => valor(id).split('\n').map((texto) => texto.trim()).filter(Boolean);
  return validarReceta({
    nombre: valor('titulo'), descripcion: valor('descripcion'), categoria: valor('categoria'),
    tiempo: Number(valor('tiempo')), porciones: Number(valor('porciones')),
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

archivoReceta.addEventListener('change', async () => {
  const archivo = archivoReceta.files[0];
  if (!archivo) return;
  bloquearArchivos(true);
  try {
    if (archivo.size > 3 * 1024 * 1024) throw new Error('El archivo no debe superar 3 MB.');
    const texto = (await archivo.text()).replace(/^\uFEFF/, '');
    const receta = validarReceta(JSON.parse(texto));
    await comprobarImagen(receta.foto);
    llenarFormulario(receta);
    estadoJSON.textContent = 'Receta importada. Puedes editarla, exportarla o agregarla al recetario.';
  } catch (error) {
    estadoJSON.textContent = error instanceof SyntaxError
      ? 'El archivo no contiene un JSON válido. Revisa sus comillas y comas.'
      : error.message;
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
  enlace.download = (receta.nombre.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'receta') + '.json';
  document.body.append(enlace);
  enlace.click();
  enlace.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

document.getElementById('exportar-formulario').addEventListener('click', () => {
  try {
    exportarReceta(leerFormulario());
    estadoJSON.textContent = 'Se inició la descarga de la receta en JSON.';
  } catch (error) {
    estadoJSON.textContent = error.message;
  }
});

function elemento(etiqueta, texto) {
  const nuevo = document.createElement(etiqueta);
  nuevo.textContent = texto;
  return nuevo;
}

function botonExportar(receta) {
  const boton = elemento('button', 'Exportar JSON');
  boton.type = 'button';
  boton.addEventListener('click', () => exportarReceta(receta));
  return boton;
}

function imagenReceta(receta) {
  const imagen = document.createElement('img');
  imagen.className = 'foto-receta';
  imagen.src = receta.foto;
  imagen.alt = 'Foto de ' + receta.nombre;
  return imagen;
}

formularioReceta.addEventListener('submit', (evento) => {
  evento.preventDefault();
  try {
    const receta = leerFormulario();
    const id = 'receta-' + (++numeroReceta);
    const detalle = document.createElement('div');
    detalle.className = 'pantalla';
    detalle.id = id;
    detalle.dataset.titulo = receta.nombre;
    detalle.hidden = true;
    const volver = elemento('a', '← Volver a las recetas');
    volver.href = '#/recetas';
    detalle.append(volver, elemento('h1', receta.nombre), elemento('p', receta.descripcion),
      elemento('p', `${receta.categoria} · ${receta.tiempo} minutos · ${receta.porciones} porciones`));
    if (receta.foto) {
      const imagen = imagenReceta(receta);
      imagen.classList.add('foto-detalle');
      detalle.append(imagen);
    }
    for (const [titulo, etiqueta, textos] of [
      ['Ingredientes', 'ul', receta.ingredientes], ['Preparación', 'ol', receta.pasos],
    ]) {
      const lista = document.createElement(etiqueta);
      for (const texto of textos) lista.append(elemento('li', texto));
      detalle.append(elemento('h2', titulo), lista);
    }
    detalle.append(botonExportar(receta));
    document.querySelector('main').append(detalle);

    const tarjeta = document.createElement('article');
    tarjeta.className = 'tarjeta';
    const enlace = elemento('a', 'Ver receta: ' + receta.nombre);
    enlace.href = '#/' + id;
    if (receta.foto) tarjeta.append(imagenReceta(receta));
    tarjeta.append(elemento('h2', receta.nombre), elemento('p', receta.descripcion), enlace);
    document.querySelector('.galeria').append(tarjeta);
    estadoJSON.textContent = 'Receta agregada. Exporta su JSON para conservarla después de cerrar o recargar la página.';
    window.location.hash = '#/' + id;
  } catch (error) {
    estadoJSON.textContent = error.message;
  }
});

// Exportamos también las tres recetas que ya están escritas en el HTML.
for (const [id, categoria, tiempo, porciones] of [
  ['tacos', 'Comida', 15, 2], ['avena', 'Desayuno', 10, 1], ['ensalada', 'Comida', 12, 2],
]) {
  const pantalla = document.getElementById(id);
  const receta = {
    nombre: pantalla.querySelector('h1').textContent,
    descripcion: pantalla.querySelector('p').textContent,
    categoria, tiempo, porciones,
    foto: pantalla.querySelector('img').getAttribute('src'),
    ingredientes: Array.from(pantalla.querySelectorAll('ul li'), (item) => item.textContent.trim()),
    pasos: Array.from(pantalla.querySelectorAll('ol li'), (item) => item.textContent.trim()),
  };
  pantalla.append(botonExportar(receta));
}
