// Módulo Favoritos. Responsable: Brandon Aguilar.
// Reglas de trabajo en AGENTS.md. Datos y endpoints en docs/10-contrato-api.md.
//
// Qué construir:
//   - Un botón de corazón en cada tarjeta (dentro de <div class="tarjeta-acciones">) y en el detalle
//     de la receta (ranura #detalle-acciones). Agregar y quitar con api.agregarFavorito / api.quitarFavorito.
//   - La pantalla "Favoritos" (#/favoritos): la lista de api.listarFavoritos().
//   - Solo con sesión iniciada (api.haySesion()). Sin sesión, invitar a ir a Acceso.
//
// Eventos útiles (los emiten js/catalogo.js, js/app.js y js/api.js):
//   'tarjetas-dibujadas', 'receta-mostrada', 'pantalla-mostrada', 'sesion-cambiada'.

(() => {
  document.addEventListener('tarjetas-dibujadas', () => {
    // TODO: agregar el botón de corazón a cada .tarjeta-acciones.
  });

  document.addEventListener('receta-mostrada', () => {
    // TODO: agregar el botón de corazón en #detalle-acciones.
  });

  document.addEventListener('pantalla-mostrada', (evento) => {
    if (evento.detail.id !== 'favoritos') return;
    // TODO: dibujar la lista de favoritos.
  });
})();
