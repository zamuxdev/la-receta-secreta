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
    let categoriasCargadas = false;

    document.addEventListener('pantalla-mostrada', async (evento) => {
        if (evento.detail.id !== 'recetas') return;

        const inputIngrediente = document.getElementById('input-ingrediente');
        const selectCategoria = document.getElementById('select-categoria');
        const btnBuscar = document.getElementById('btn-buscar');
        const btnLimpiar = document.getElementById('btn-limpiar');
        const mensajeResultados = document.getElementById('mensaje-resultados');

        // 1. Cargar las categorías solo la primera vez que se abre la pantalla (H2)
        if (!categoriasCargadas) {
            try {
                const categorias = await api.listarCategorias();
                categorias.forEach(cat => {
                    const opcion = document.createElement('option');
                    opcion.value = cat;
                    opcion.textContent = cat;
                    selectCategoria.appendChild(opcion);
                });
                categoriasCargadas = true;
            } catch (error) {
                console.error("Error al cargar categorías", error);
            }

            // 2. Función para buscar ignorando espacios (H1, H3, H5)
            const realizarBusqueda = () => {
                const ingrediente = inputIngrediente.value.trim(); 
                const categoria = selectCategoria.value;
                
                mensajeResultados.classList.add('mensaje-oculto');
                catalogo.cargar({ categoria, ingrediente });
            };

            btnBuscar.addEventListener('click', realizarBusqueda);

            // 3. Botón para limpiar los filtros (H3)
            btnLimpiar.addEventListener('click', () => {
                inputIngrediente.value = '';
                selectCategoria.value = '';
                mensajeResultados.classList.add('mensaje-oculto');
                catalogo.cargar({ categoria: '', ingrediente: '' });
            });
        }
    });

    // 4. Mostrar mensaje cuando no hay resultados (H4)
    document.addEventListener('tarjetas-dibujadas', (e) => {
        const recetas = e.detail || [];
        const mensajeResultados = document.getElementById('mensaje-resultados');
        const inputIngrediente = document.getElementById('input-ingrediente');
        
        // Si no estamos en la pantalla correcta o no existe el elemento, salimos
        if (!mensajeResultados) return;

        if (recetas.length === 0) {
            const busqueda = inputIngrediente.value.trim();
            mensajeResultados.textContent = busqueda 
                ? `No encontramos recetas con "${busqueda}"` 
                : "No encontramos recetas en esta categoría.";
            mensajeResultados.classList.remove('mensaje-oculto');
        } else {
            mensajeResultados.classList.add('mensaje-oculto');
        }
    });
})();

