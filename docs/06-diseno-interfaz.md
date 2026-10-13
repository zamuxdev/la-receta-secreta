# 6. Diseño de la interfaz

## 6.1 Pantallas planeadas

Antes de programar se diseñan las pantallas en Figma, que sirven de referencia para el HTML, CSS y JavaScript.

| Pantalla | Propósito | En la interfaz actual |
|---|---|---|
| Inicio | Pantalla principal con acceso a las funciones y recetas | Sí (`#/inicio`) |
| Registro de usuario | Crear una cuenta | Vacía, en construcción (`#/registro`, módulo Acceso) |
| Inicio de sesión | Acceder a las funciones que requieren autenticación | Maqueta (`#/acceso`, botón deshabilitado, módulo Acceso) |
| Galería de recetas | Recetas en tarjetas que facilitan la consulta | Sí (`#/recetas`) |
| Búsqueda de recetas | Buscar por ingredientes o tipo de comida | No, en la pantalla Recetas (módulo Búsqueda) |
| Detalle de receta | Nombre, imagen, ingredientes, preparación, tipo, calificación y favoritos | Parcial: con exportación a JSON y XML, sin calificación ni favoritos (`#/receta/<id>`) |
| Mejor valoradas | Recetas ordenadas por su calificación promedio | Vacía, en construcción (`#/mejor-valoradas`, módulo Calificaciones) |
| Publicación de receta | Registrar una receta nueva | Sí (`#/publicar`) |
| Favoritos | Consultar las recetas guardadas | Vacía, en construcción (`#/favoritos`, módulo Favoritos) |
| Perfil de usuario | Datos de la cuenta y recetas publicadas | No (la API ya tiene `GET /api/recetas/mias`) |

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

Mientras `USAR_DATOS_DE_PRUEBA` es `true` en `js/api.js`, la interfaz usa datos de prueba que imitan el contrato y se guardan en el navegador (`localStorage`). Con `false` usa la API real en `http://localhost:5166`.

## 6.3 Justificación de las decisiones de diseño

### Estructura de una sola página

Todas las pantallas viven en `index.html` y `js/app.js` muestra una a la vez según el fragmento de la URL (`#/recetas`, `#/publicar`, etc.). Es el mismo modelo de SPA de la arquitectura propuesta y se puede servir como archivos estáticos, sin servidor propio. Cada pantalla tiene un enlace directo, y el botón de retroceso del navegador funciona. Una receta tiene su propio enlace (`#/receta/5`), que se puede compartir. Si el enlace no existe, se muestra una pantalla de "Página no encontrada".

### Paleta de color

Los colores se eligieron para transmitir frescura y calidez, sin competir con las fotos de comida:

| Uso | Color | Valor |
|---|---|---|
| Fondo de la página | Crema | `#faf8f2` |
| Texto | Verde muy oscuro | `#293d32` |
| Enlaces y botón principal | Verde bosque | `#28563c` |
| Bloque de bienvenida | Verde claro | `#e6ecdb` |
| Bordes | Gris verdoso | `#d9d9cc` |
| Foco y avisos | Café | `#93633a` |

El crema da un fondo cálido y el verde evoca ingredientes frescos. Las tarjetas blancas separan el contenido del fondo. El café aparece solo en elementos que deben destacar, como el contorno de foco y el aviso sin JavaScript. Es coherente con el requisito RNF-08 de colores cálidos y apetitosos.

### Tipografía y lectura

- Se usa Arial, disponible en cualquier dispositivo, para que cargue rápido y se vea igual en todos.
- El interlineado es de 1.6 y el texto es oscuro sobre fondo claro, para leer listas de ingredientes y pasos cómodamente.
- El contenido tiene un ancho máximo de 1000 px, para que las líneas de texto no sean demasiado largas.
- Los títulos tienen interlineado más corto (1.3) para que no se separen demasiado.

### Galería y fichas

- Las tarjetas usan `flex-wrap`: se acomodan en varias columnas cuando hay espacio y pasan a una sola en pantallas pequeñas, sin código extra.
- Todas las fotos tienen proporción 4:3 (`aspect-ratio` y `object-fit: cover`) y llevan `width` y `height`. Así la galería se ve uniforme aunque las imágenes originales sean distintas, y la página no "salta" mientras cargan.
- Cada ficha muestra primero la descripción y los datos clave (categoría, tiempo y porciones), después los ingredientes (lista) y la preparación (lista numerada). Es el orden en que una persona usa la receta.

### Formulario de publicación

- Cada campo tiene su `label` visible, y las etiquetas indican las unidades (minutos, "uno por línea").
- Los tipos de campo restringen la entrada: `number` con mínimo y máximo para tiempo y porciones, `select` para la categoría y límites de longitud en los textos.
- La foto es opcional, se limita a JPG, PNG o WebP de 2 MB como máximo y se muestra una vista previa con la opción de quitarla.
- La validación en el cliente revisa el contenido antes de agregar la receta y avisa de los errores con mensajes claros (RF-12 y RF-24). Los textos se insertan como texto y no como HTML, para evitar XSS.
- Se puede exportar e importar la receta en JSON. El archivo tiene los mismos campos que la API recibe al publicar (`RecetaCrear`), así que una receta exportada desde el detalle se puede importar aquí.

### Accesibilidad y adaptación

- **Responsivo:** `viewport` configurado, una regla para pantallas de hasta 600 px (menos relleno y títulos más pequeños) y imágenes de ancho fluido.
- **Semántica:** `header`, `nav`, `main`, `section`, `article` y `footer`, además de `aria-label` en la navegación.
- **Navegación:** la sección actual se marca con `aria-current="page"` y también en negrita. Al abrir una receta se mantiene marcada "Recetas".
- **Teclado y lectores de pantalla:** contorno de foco visible (`:focus-visible`), foco en el título al cambiar de pantalla, `role="status"` en los mensajes y texto alternativo en todas las fotos.
- **Sin JavaScript:** un aviso `noscript` explica que hace falta activarlo.
- **Contraste:** texto oscuro sobre fondo claro, y botón blanco sobre verde oscuro.

### Decisiones que se tomaron por ahora

- Las recetas publicadas se guardan con la API. Con los datos de prueba se conservan en el navegador (`localStorage`) y sobreviven a recargar la página; con la API real se guardan en la base de datos.
- La pantalla "Acceso" sigue siendo una maqueta con el botón deshabilitado. La API ya tiene registro e inicio de sesión, y conectarla es tarea del módulo Acceso (tema 3).
- Búsqueda, calificaciones y favoritos ya tienen su lugar en la interfaz (ranuras y pantallas vacías) y la API ya los ofrece. Los programa cada módulo como entregable del tema 3.
