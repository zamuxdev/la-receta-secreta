# 6. Diseño de la interfaz

## 6.1 Pantallas planeadas

Antes de programar se diseñan las pantallas en Figma, que sirven de referencia para el HTML, CSS y JavaScript.

| Pantalla | Propósito | En la interfaz actual |
|---|---|---|
| Inicio | Pantalla principal con acceso a las funciones y recetas | Sí (`#/inicio`) |
| Registro de usuario | Crear una cuenta | No (tema 4) |
| Inicio de sesión | Acceder a las funciones que requieren autenticación | Maqueta (`#/acceso`, botón deshabilitado) |
| Galería de recetas | Recetas en tarjetas que facilitan la consulta | Sí (`#/recetas`) |
| Búsqueda de recetas | Buscar por ingredientes o tipo de comida | No (tema 3) |
| Detalle de receta | Nombre, imagen, ingredientes, preparación, tipo, calificación y favoritos | Parcial: sin calificación ni favoritos |
| Publicación de receta | Registrar una receta nueva | Sí (`#/publicar`) |
| Favoritos | Consultar las recetas guardadas | No (tema 3) |
| Perfil de usuario | Datos de la cuenta y recetas publicadas | No |

> Pendiente: agregar aquí capturas de las pantallas en Figma.

## 6.2 Interfaz implementada (tema 2)

Está en la raíz del repositorio y no necesita servidor:

- `index.html`: todas las pantallas en un solo archivo.
- `estilos.css`: estilos compartidos por todas las pantallas.
- `app.js`: navegación entre pantallas.
- `recetas.js`: formulario de publicación y exportación e importación de recetas en JSON.
- `fotos/`: imágenes de las recetas de ejemplo.

Incluye una galería con tres recetas, la ficha de cada una (foto, tiempo, porciones, ingredientes y pasos) y un formulario para publicar con validación.

## 6.3 Justificación de las decisiones de diseño

### Estructura de una sola página

Todas las pantallas viven en `index.html` y `app.js` muestra una a la vez según el fragmento de la URL (`#/recetas`, `#/publicar`, etc.). Es el mismo modelo de SPA de la arquitectura propuesta y funciona en GitHub Pages sin servidor. Cada pantalla tiene un enlace directo, y el botón de retroceso del navegador funciona. Si el enlace no existe, se muestra una pantalla de "Página no encontrada".

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
- Se puede exportar e importar la receta en JSON. Así se prueba el formato de intercambio de datos antes de tener servidor.

### Accesibilidad y adaptación

- **Responsivo:** `viewport` configurado, una regla para pantallas de hasta 600 px (menos relleno y títulos más pequeños) y imágenes de ancho fluido.
- **Semántica:** `header`, `nav`, `main`, `section`, `article` y `footer`, además de `aria-label` en la navegación.
- **Navegación:** la sección actual se marca con `aria-current="page"` y también en negrita. Al abrir una receta se mantiene marcada "Recetas".
- **Teclado y lectores de pantalla:** contorno de foco visible (`:focus-visible`), foco en el título al cambiar de pantalla, `role="status"` en los mensajes y texto alternativo en todas las fotos.
- **Sin JavaScript:** un aviso `noscript` explica que hace falta activarlo.
- **Contraste:** texto oscuro sobre fondo claro, y botón blanco sobre verde oscuro.

### Decisiones que se tomaron por ahora

- Las recetas nuevas solo viven mientras la página está abierta. Para conservarlas hay que exportar el JSON. La persistencia llega con el servidor (tema 4).
- La pantalla "Acceso" es una maqueta con el botón deshabilitado, porque la autenticación llega con el servidor.
- No hay búsqueda, calificación ni favoritos todavía. Son los entregables del tema 3.
