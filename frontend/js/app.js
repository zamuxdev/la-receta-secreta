// Todas las pantallas están en index.html. Solo mostramos una a la vez.
//
// Cuando se muestra una pantalla se emite el evento 'pantalla-mostrada' en `document`,
// con { id, parametro } en `evento.detail`. Cada módulo escucha ese evento para iniciarse.
// Ejemplo: #/receta/5 muestra la pantalla 'receta-detalle' con parametro "5", y #/publicar/5
// muestra 'publicar' con parametro "5" (para editar esa receta).
const enlacesMenu = document.querySelectorAll('nav a');

function mostrarPantalla() {
  const pantallas = document.querySelectorAll('.pantalla');
  // Ejemplo: #/recetas se convierte en recetas. Sin fragmento, abrimos inicio.
  const fragmento = window.location.hash;
  const ruta = !fragmento || fragmento === '#/'
    ? 'inicio'
    : fragmento.startsWith('#/') ? fragmento.slice(2) : 'no-encontrada';

  // Una ruta con una barra solo es válida como receta/<id> o publicar/<id>; las demás no existen.
  const conParametro = { receta: 'receta-detalle', publicar: 'publicar' };
  const partes = ruta.split('/');
  let nombre = partes[0];
  let parametro = partes[1];
  if (partes.length === 2 && conParametro[nombre] && parametro) {
    nombre = conParametro[nombre];
  } else if (partes.length > 1) {
    nombre = 'no-encontrada';
    parametro = undefined;
  }

  const destino = Array.from(pantallas).find((pantalla) => pantalla.id === nombre);
  const pantallaActual = destino || document.getElementById('no-encontrada');

  for (const pantalla of pantallas) {
    pantalla.hidden = pantalla !== pantallaActual;
  }

  // Al abrir una receta el menú mantiene marcada Recetas, y Registro cuenta como Acceso.
  const secciones = { 'receta-detalle': 'recetas', registro: 'acceso' };
  const seccion = secciones[nombre] || nombre;
  for (const enlace of enlacesMenu) {
    if (enlace.getAttribute('href') === '#/' + seccion) {
      enlace.setAttribute('aria-current', 'page');
    } else {
      enlace.removeAttribute('aria-current');
    }
  }

  document.title = pantallaActual.dataset.titulo + ' | La Receta Secreta';
  const titulo = pantallaActual.querySelector('h1');
  titulo.setAttribute('tabindex', '-1');
  titulo.focus({ preventScroll: true });
  window.scrollTo(0, 0);

  document.dispatchEvent(new CustomEvent('pantalla-mostrada', {
    detail: { id: pantallaActual.id, parametro: pantallaActual === destino ? parametro : undefined },
  }));
}

// Los formularios se manejan en el navegador, sin enviar datos a un servidor.
for (const formulario of document.querySelectorAll('form')) {
  formulario.addEventListener('submit', (evento) => evento.preventDefault());
}

window.addEventListener('hashchange', mostrarPantalla);
mostrarPantalla();
