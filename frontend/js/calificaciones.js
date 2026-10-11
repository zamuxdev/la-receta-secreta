// Módulo Calificaciones. Responsable: Leilani Muñoz.
// Reglas de trabajo en AGENTS.md. Datos y endpoints en docs/10-contrato-api.md.
//
// Qué construir:
//   - En el detalle de la receta (ranura #detalle-calificacion): las estrellas para calificar de 1 a 5,
//     el promedio y el total de calificaciones. Usa api.calificar(id, puntos) y api.quitarCalificacion(id).
//   - Reglas del contrato: hace falta sesión, no se puede calificar la propia receta
//     (receta.esMia) y cada persona tiene una sola calificación por receta (receta.miCalificacion).
//   - La pantalla "Mejor valoradas" (#/mejor-valoradas): la lista de api.recetasMejorValoradas().
//
// Eventos útiles: 'receta-mostrada' (trae la receta completa) y 'pantalla-mostrada'.

(() => {
  document.addEventListener('receta-mostrada', () => {
    // TODO: dibujar las estrellas y el promedio en #detalle-calificacion.
  });

  document.addEventListener('pantalla-mostrada', (evento) => {
    if (evento.detail.id !== 'mejor-valoradas') return;
    // TODO: dibujar la lista de recetas mejor valoradas.
  });
})();
