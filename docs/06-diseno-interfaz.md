# 6. Diseño de la interfaz

## 6.1 Pantallas planeadas

Antes de programar se diseñan las pantallas en Figma, que sirven de referencia para el HTML, CSS y JavaScript.

| Pantalla | Propósito | En la interfaz actual |
|---|---|---|
| Inicio | Pantalla principal con acceso a las funciones y recetas | Sí (`#/inicio`) |
| Registro de usuario | Crear una cuenta | Sí (`#/registro`, módulo Acceso). Al crear la cuenta se entra solo |
| Inicio de sesión | Acceder a las funciones que requieren autenticación | Sí (`#/acceso`, módulo Acceso). Con sesión muestra "Hola, [nombre]" y "Cerrar sesión" |
| Galería de recetas | Recetas en tarjetas que facilitan la consulta | Sí (`#/recetas`), con el botón de favoritos en cada tarjeta |
| Búsqueda de recetas | Buscar por ingredientes o tipo de comida | Sí, dentro de la pantalla Recetas (módulo Búsqueda) |
| Detalle de receta | Nombre, imagen, ingredientes, preparación, tipo, calificación y favoritos | Sí (`#/receta/<id>`): con favoritos, estrellas para calificar y exportación a JSON y XML |
| Mejor valoradas | Recetas ordenadas por su calificación promedio | Sí (`#/mejor-valoradas`, módulo Calificaciones) |
| Publicación de receta | Registrar una receta nueva | Sí (`#/publicar`); exige sesión |
| Favoritos | Consultar las recetas guardadas | Sí (`#/favoritos`, módulo Favoritos), con descarga en CSV |
| Mis recetas | Recetas que publicó el usuario, para editarlas o borrarlas | Sí, en la pantalla Acceso con sesión iniciada. La edición usa `#/publicar/<id>` (módulo Acceso) |

Cada módulo y su responsable están en [`TASKS.md`](../TASKS.md).

> Pendiente: agregar aquí capturas de las pantallas en Figma.

## 6.2 Interfaz implementada

Está en la carpeta `frontend/` y no necesita compilarse:

| Archivo | Para qué sirve |
|---|---|
| `index.html` | Todas las pantallas en un solo archivo |
| `css/estilos.css` | Estilos compartidos por todas las pantallas |
| `js/app.js` | Navegación entre pantallas por la URL |
| `js/api.js` y `js/api-prueba.js` | Cliente de la API y datos de prueba que imitan el contrato ([10-contrato-api.md](10-contrato-api.md)) |
| `js/catalogo.js` | Dibuja la galería y el detalle de cada receta con los datos de la API |
| `js/publicar.js` | Formulario de publicación, que envía la receta a la API, y exportación e importación de recetas en JSON |
| `js/busqueda.js`, `js/favoritos.js`, `js/calificaciones.js`, `js/acceso.js` | Un módulo por función, con su CSS en `css/` (tema 3) |
| `fotos/` | Imágenes de las recetas de ejemplo |

Incluye una galería de recetas, la ficha de cada una (foto, tiempo, porciones, ingredientes y pasos, con botones para exportarla en JSON o XML) y un formulario para publicar con validación. La galería y las fichas no están escritas a mano: se dibujan con los datos que entrega la API (o los datos de prueba), de modo que lo que publica un usuario aparece solo.

`USAR_DATOS_DE_PRUEBA` está en `false` en `js/api.js`: la interfaz usa la API real en `http://localhost:5166`. Con `true` usa datos de prueba que imitan el contrato y se guardan en el navegador (`localStorage`); así se desarrollaron los módulos antes de conectarlos al backend.

## 6.3 Justificación de las decisiones de diseño

### Estructura de una sola página

Todas las pantallas viven en `index.html` y `js/app.js` muestra una a la vez según el fragmento de la URL (`#/recetas`, `#/publicar`, etc.). Es el mismo modelo de SPA de la arquitectura propuesta y se puede servir como archivos estáticos, sin servidor propio. Cada pantalla tiene un enlace directo, y el botón de retroceso del navegador funciona. Una receta tiene su propio enlace (`#/receta/5`), que se puede compartir. Si el enlace no existe, se muestra una pantalla de "Página no encontrada".

### Identidad visual: la loza de talavera

El primer diseño usaba fondo crema, verde y títulos serif. Funcionaba, pero es la combinación que más se repite en las páginas de recetas y en las que generan las herramientas de IA, así que el recetario no se distinguía. En el rediseño se tomó la referencia de la **talavera poblana**, la loza azul y blanca en la que se sirve la comida en muchas casas de México. Así la identidad sale del tema del proyecto (cocina mexicana casera), y el azul y el blanco hacen que resalten los colores de la comida en las fotos.

La idea se aplica con mesura: **solo un elemento llama la atención**, el "plato" de la portada (la foto de los tacos dentro de un borde a rayas cobalto con un anillo amarillo, dibujado solo con CSS). El logotipo es ese mismo plato en pequeño. Todo lo demás es sobrio: fondo claro, bordes finos y pocas sombras.

### Paleta de color

| Uso | Nombre (variable) | Valor |
|---|---|---|
| Fondo de la página | Loza (`--loza`) | `#f4f6fa` |
| Texto | Tinta (`--tinta`) | `#172a4d` |
| Texto secundario | Tinta suave (`--tinta-suave`) | `#4a5a78` |
| Enlaces, botones, marca | Cobalto (`--cobalto`) | `#1f3f8f` |
| Botón al pasar el mouse, pie de página | Cobalto oscuro (`--cobalto-oscuro`) | `#142c66` |
| Recuadros suaves (ingredientes, importar, sesión) | Cobalto claro (`--cobalto-claro`) | `#e5ebf7` |
| Bordes | Línea (`--linea`) | `#d5dcea` |
| Estrellas y borde del plato (decorativo) | Maíz (`--maiz`) | `#e3a21a` |
| Texto con acento, contorno de foco | Maíz oscuro (`--maiz-oscuro`) | `#8f5c00` |
| Fondo de avisos | Maíz claro (`--maiz-claro`) | `#fcf3dc` |
| Errores y "Borrar" / "Quitar" | Error (`--error`) | `#b42318` |

- El fondo es un blanco frío, como la porcelana, en lugar de crema.
- El cobalto es el color de acción: todo lo que se puede tocar (enlaces, botones, favoritos) es azul.
- El amarillo maíz solo aparece en lo que se califica o destaca (estrellas, promedio, avisos). Como el amarillo claro no se lee bien sobre blanco, el texto usa la versión oscura `#8f5c00` (contraste 5:1).
- Las acciones que no se pueden deshacer (borrar una receta, quitar un favorito) usan rojo, para distinguirlas de las normales.
- Los colores están como variables al inicio de `css/estilos.css`. **Los CSS de cada módulo ahora usan esas variables** (`var(--cobalto)`...) en lugar de colores escritos a mano, para que un cambio de color se haga en un solo lugar.

### Tipografía y lectura

- Títulos en **Alegreya** (negrita 800) y texto en **Alegreya Sans**. Las diseñó Juan Pablo del Peral, de Huerta Tipográfica (Argentina), para textos largos en español; tienen un trazo caligráfico que da el aire de recetario escrito a mano sin perder legibilidad. Son de la misma familia, así que combinan, y se distinguen bien porque una tiene remates (serif) y la otra no.
- Se cargan desde Google Fonts (un `<link>` en `index.html`). **Si no hay internet**, la página no se rompe: usa las fuentes del sistema que siguen en la lista (Palatino o Georgia para títulos, Segoe UI o Arial para texto).
- Escala de tamaños fija, en variables (`--t-chico` 15 px, `--t-texto` 18 px, `--t-entrada` 21 px, `--t-h3` 22 px, `--t-h2` 28 px, `--t-h1` 44 px, `--t-portada` 64 px). Entre los tamaños principales cada uno es de 1.2 a 1.6 veces el anterior; `--t-h3` queda casi igual que la entrada y se distingue por la letra de título. En el celular se reducen.
- Interlineado de 1.55 en el texto y 1.15 en los títulos. Los párrafos tienen un ancho máximo de 68 caracteres para que las líneas no sean demasiado largas.
- Se quitó la etiqueta en mayúsculas "RECETAS PARA TODOS LOS DÍAS" de la portada y las mayúsculas de los datos de cada tarjeta: el texto en mayúsculas se lee más lento y no aportaba información.

### Galería y fichas

- La galería usa CSS Grid con `auto-fill`: caben tantas columnas como permita la pantalla y pasan a una sola en el celular, sin código extra. Todas las tarjetas de una fila miden lo mismo.
- Toda la tarjeta abre la receta (el enlace se estira con `::before`), así el objetivo para hacer clic o tocar es grande. El botón de favoritos queda encima y sigue funcionando aparte.
- Las tarjetas ya no "flotan" con sombra ni se elevan al pasar el mouse: solo cambia el borde a cobalto. Indica que se puede abrir sin mover la página.
- Los radios de las esquinas siguen la jerarquía: 6 px en botones y campos, 10 px en tarjetas y recuadros, y el plato de la portada es un círculo.
- En el detalle, la foto y el resumen van lado a lado en pantalla grande. La descripción va en letra de título para que se lea como una entrada. Los ingredientes van en un recuadro cobalto claro, separados por líneas para no perder el renglón, y los pasos tienen su número en un círculo (son una secuencia, por eso llevan número).
- Todas las fotos tienen proporción 4:3 (`aspect-ratio` y `object-fit: cover`) y llevan `width` y `height`. Así la galería se ve uniforme aunque las imágenes originales sean distintas, y la página no "salta" mientras cargan.
- Cada ficha muestra primero la descripción y los datos clave (categoría, tiempo y porciones), después los ingredientes (lista) y la preparación (lista numerada). Es el orden en que una persona usa la receta.
- Las listas de Favoritos, Mejor valoradas y Mis recetas son una sola hoja blanca con renglones separados por líneas, en lugar de una tarjeta por elemento. En Mejor valoradas los tres primeros lugares llevan el círculo relleno.

### Formulario de publicación

- Cada campo tiene su `label` visible, y las etiquetas indican las unidades (minutos, "uno por línea").
- Los tipos de campo restringen la entrada: `number` con mínimo y máximo para tiempo y porciones, `select` para la categoría y límites de longitud en los textos.
- La foto es opcional, se limita a JPG, PNG o WebP de 2 MB como máximo y se muestra una vista previa con la opción de quitarla.
- La validación en el cliente revisa el contenido antes de agregar la receta y avisa de los errores con mensajes claros (RF-12 y RF-24). Los textos se insertan como texto y no como HTML, para evitar XSS.
- Se puede exportar e importar la receta en JSON. El archivo tiene los mismos campos que la API recibe al publicar (`RecetaCrear`), así que una receta exportada desde el detalle se puede importar aquí.

### Accesibilidad y adaptación

- **Responsivo:** `viewport` configurado, reglas para pantallas de hasta 860 px (una sola columna, el plato arriba del texto) y 600 px (menos relleno, escala de letra más chica y botones a todo el ancho). El pie de página queda abajo aunque la pantalla tenga poco contenido y imágenes de ancho fluido.
- **Semántica:** `header`, `nav`, `main`, `section`, `article` y `footer`, además de `aria-label` en la navegación.
- **Navegación:** la sección actual se marca con `aria-current="page"`, con una barra cobalto debajo y en negrita (no solo con color). Al abrir una receta se mantiene marcada "Recetas".
- **Teclado y lectores de pantalla:** contorno de foco visible (`:focus-visible`, maíz oscuro), foco en el título al cambiar de pantalla, `role="status"` en los mensajes y texto alternativo en todas las fotos. El título que recibe el foco por código no dibuja contorno, porque no es un control y el contorno aparecía sobre la portada al cargar.
- **Sin JavaScript:** un aviso `noscript` explica que hace falta activarlo.
- **Contraste:** texto azul tinta sobre fondo claro y botón blanco sobre cobalto, ambos por arriba de 4.5:1.
- **Movimiento:** casi no hay animaciones; las transiciones de color de botones y estrellas se desactivan si el sistema pide reducir el movimiento (`prefers-reduced-motion`).

### Decisiones que se tomaron por ahora

- Las recetas publicadas se guardan con la API real en la base de datos. Con `USAR_DATOS_DE_PRUEBA = true` se conservan en el navegador (`localStorage`) y sobreviven a recargar la página.
- Búsqueda, calificaciones, favoritos y acceso ya están programados, cada uno en su módulo, y se conectan con el resto mediante eventos y ranuras (ver `AGENTS.md`, sección 6). Sus decisiones están en [decisiones/](decisiones/).
- El promedio de calificaciones solo se muestra en el detalle y en "Mejor valoradas", no en las tarjetas de la galería (tarea opcional L8 de [TASKS.md](../TASKS.md)).
