// Módulo Búsqueda. Responsable: Hazel Martínez.
// Reglas de trabajo en AGENTS.md. Datos y endpoints en docs/10-contrato-api.md.
//
// Qué construir en la pantalla "Recetas":
//   - Una barra de búsqueda por ingrediente y un selector de categoría
//     (las categorías se piden con api.listarCategorias()).
//   - Al buscar, llamar a catalogo.cargar({ categoria, ingrediente }) para redibujar la galería.
//   - Un mensaje claro cuando no hay resultados (RF-05).
//   - El HTML va en index.html, en el comentario "Módulo Búsqueda" de la pantalla Recetas.

(() => {
  document.addEventListener('pantalla-mostrada', (evento) => {
    if (evento.detail.id !== 'recetas') return;
    // TODO: preparar la barra de búsqueda y los filtros.
  });
})();
