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
  const ranura = document.getElementById('detalle-calificacion');

  // Texto del promedio con un decimal, como "4.5 de 5 (2 calificaciones)".
  function textoPromedio(receta) {
    if (!receta.totalCalificaciones) return 'Sin calificaciones todavía.';
    const total = receta.totalCalificaciones;
    const etiqueta = total === 1 ? '1 calificación' : total + ' calificaciones';
    return receta.promedio.toFixed(1) + ' de 5 (' + etiqueta + ')';
  }

  function mostrarPromedio({ receta }) {
    const resumen = document.createElement('p');
    resumen.className = 'calificaciones-promedio';
    resumen.textContent = textoPromedio(receta);
    ranura.replaceChildren(resumen);
  }

  document.addEventListener('receta-mostrada', (evento) => mostrarPromedio(evento.detail));
})();
