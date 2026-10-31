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
  const formulario = document.getElementById('modulo-busqueda');
  const inputIngrediente = document.getElementById('input-ingrediente');
  const selectCategoria = document.getElementById('select-categoria');
  const btnLimpiar = document.getElementById('btn-limpiar');
  const mensajeResultados = document.getElementById('mensaje-resultados');

  let categoriasCargadas = false;
  let avisoCategorias = '';  // se conserva para que no lo borre el siguiente dibujo de la galería
  let filtrosAplicados = {}; // los de la última búsqueda, para explicar por qué no hubo resultados

  function mensajeDeError(error) {
    return error instanceof ErrorApi ? error.textoParaUsuario() : 'Ocurrió un error inesperado. Inténtalo de nuevo.';
  }

  // Las categorías se piden una sola vez (H2). Si fallan, se reintenta la próxima vez que se abra la pantalla.
  async function cargarCategorias() {
    try {
      const categorias = await api.listarCategorias();
      categorias.forEach((categoria) => {
        // La API devuelve { id, nombre }; el filtro de recetas usa el nombre.
        const opcion = document.createElement('option');
        opcion.value = categoria.nombre;
        opcion.textContent = categoria.nombre;
        selectCategoria.append(opcion);
      });
      categoriasCargadas = true;
      avisoCategorias = '';
    } catch (error) {
      avisoCategorias = 'No se pudieron cargar las categorías. ' + mensajeDeError(error);
    }
    mensajeResultados.textContent = avisoCategorias;
  }

  document.addEventListener('pantalla-mostrada', (evento) => {
    if (evento.detail.id !== 'recetas' || categoriasCargadas) return;
    cargarCategorias();
  });

  // Se usa un <form> para que Enter también busque (H1).
  formulario.addEventListener('submit', (evento) => {
    evento.preventDefault();
    const ingrediente = inputIngrediente.value.trim(); // ignora los espacios de más (H5)
    const categoria = selectCategoria.value;
    inputIngrediente.value = ingrediente;

    // Evita buscar por error con todo vacío (H5). Para ver todas está el botón Limpiar.
    if (!ingrediente && !categoria) {
      mensajeResultados.textContent = 'Escribe un ingrediente o elige una categoría para buscar.';
      inputIngrediente.focus();
      return;
    }
    filtrosAplicados = { categoria, ingrediente };
    catalogo.cargar(filtrosAplicados);
  });

  // Limpiar regresa a ver todas las recetas (H3).
  btnLimpiar.addEventListener('click', () => {
    formulario.reset();
    filtrosAplicados = {};
    catalogo.cargar(filtrosAplicados);
  });

  // catalogo.js avisa cada vez que dibuja la galería; si no hubo resultados, se explica por qué (H4).
  document.addEventListener('tarjetas-dibujadas', (evento) => {
    const { recetas } = evento.detail;
    const { categoria, ingrediente } = filtrosAplicados;
    mensajeResultados.textContent = avisoCategorias;
    if (recetas.length > 0) return;
    if (ingrediente && categoria) {
      mensajeResultados.textContent = `No encontramos recetas con "${ingrediente}" en la categoría ${categoria}.`;
    } else if (ingrediente) {
      mensajeResultados.textContent = `No encontramos recetas con "${ingrediente}".`;
    } else if (categoria) {
      mensajeResultados.textContent = `No encontramos recetas en la categoría ${categoria}.`;
    }
  });
})();
