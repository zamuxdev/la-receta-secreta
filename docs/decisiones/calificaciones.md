# Decisiones técnicas: Calificaciones

Responsable: Leilani Muñoz. Se actualiza en el mismo Pull Request que el código del módulo.

## 1. ¿Qué hace el módulo?

Por ahora, al abrir el detalle de una receta se muestra su promedio de calificaciones y cuántas personas la han calificado, por ejemplo "4.5 de 5 (2 calificaciones)". Si nadie la ha calificado, dice "Sin calificaciones todavía.".

Las estrellas para votar, quitar la calificación y la pantalla "Mejor valoradas" se agregan en las siguientes tareas del módulo.

## 2. Archivos

| Archivo | Para qué sirve |
|---|---|
| `frontend/js/calificaciones.js` | Escucha el evento `receta-mostrada` y dibuja el promedio en la ranura `#detalle-calificacion`. |
| `frontend/css/calificaciones.css` | Da color y espacio al texto del promedio, sin cambiar los estilos compartidos. |
| `docs/decisiones/calificaciones.md` | Este documento: explica qué hace el módulo, cómo se prueba y qué falta. |

## 3. Decisiones y por qué se tomaron

- **Escuchar `receta-mostrada` en lugar de leer la URL.** `catalogo.js` ya carga la receta y avisa cuando terminó; así no se hace otra petición y siempre se usa la receta que se está mostrando.
- **Usar la ranura `#detalle-calificacion`.** Es el hueco que el proyecto reserva para este módulo, así que no se toca el HTML de otras pantallas.
- **Mostrar el promedio con un decimal.** El contrato entrega el número sin redondear (por ejemplo `3.6666666666666665`); un decimal es fácil de leer y no pierde información importante.
- **Distinguir entre cero y una calificación.** "1 calificación" suena natural y evita el error de decir "1 calificaciones".
- **Construir el texto con `createElement` y `textContent`.** Cumple la regla de seguridad contra XSS y evita insertar HTML.

## 4. Cómo se prueba

1. Abre `frontend/index.html` con Live Server.
2. Entra a **Recetas** y abre cualquier receta: debe verse "Sin calificaciones todavía." debajo de los botones de favoritos.
3. Cuando esté lista la tarea de las estrellas, califica una receta y vuelve a abrir su detalle: debe aparecer el promedio con un decimal y el total de calificaciones.
4. Revisa que el texto se vea bien en una ventana angosta (celular) y que no se encime con los demás elementos.

## 5. Qué falta o qué limitaciones tiene

- Todavía no existen las estrellas para calificar ni el botón para quitar la calificación (tareas L2 y L3).
- Todavía no se muestran los mensajes para quien no tiene sesión ni para las recetas propias (tarea L4).
- La pantalla "Mejor valoradas" sigue vacía (tarea L5).

## Resumen para defender

- **Qué hace ahora:** al abrir una receta se ve su promedio ("4.5 de 5 (2 calificaciones)") o el aviso "Sin calificaciones todavía.".
- **Archivos tocados:** `frontend/js/calificaciones.js` dibuja el texto, `frontend/css/calificaciones.css` lo estiliza y este documento lo explica.
- **Cómo se conecta:** escucha el evento `receta-mostrada` que emite `catalogo.js` y escribe en la ranura `#detalle-calificacion`.
- **Decisiones:** se usa la receta que ya cargó el catálogo (sin otra petición), el promedio se redondea a un decimal y el texto se crea con `textContent` por seguridad.
- **Cómo probarlo:** abre `#/receta/1` con Live Server; debe decir "Sin calificaciones todavía.". Después de la tarea de las estrellas, califica y el promedio aparecerá sin recargar.
