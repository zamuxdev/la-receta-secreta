// Todas las pantallas están en index.html. Solo mostramos una a la vez.
const enlacesMenu = document.querySelectorAll('nav a');

function mostrarPantalla() {
  const pantallas = document.querySelectorAll('.pantalla');
  // Ejemplo: #/recetas se convierte en recetas. Sin fragmento, abrimos inicio.
  const fragmento = window.location.hash;
  const ruta = !fragmento || fragmento === '#/'
    ? 'inicio'
    : fragmento.startsWith('#/') ? fragmento.slice(2) : 'no-encontrada';
  const destino = Array.from(pantallas).find((pantalla) => pantalla.id === ruta);
  const pantallaActual = destino || document.getElementById('no-encontrada');

  for (const pantalla of pantallas) {
    pantalla.hidden = pantalla !== pantallaActual;
  }

  // Al abrir una receta, el menú mantiene marcada la sección Recetas.
  const esReceta = ['tacos', 'avena', 'ensalada'].includes(ruta) || ruta.startsWith('receta-');
  const seccion = esReceta ? 'recetas' : ruta;
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
}

// Los formularios se manejan en el navegador, sin enviar datos a un servidor.
for (const formulario of document.querySelectorAll('form')) {
  formulario.addEventListener('submit', (evento) => evento.preventDefault());
}

window.addEventListener('hashchange', mostrarPantalla);
mostrarPantalla();
