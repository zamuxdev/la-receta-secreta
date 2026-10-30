# Decisiones técnicas: Calificaciones

Responsable: Leilani Muñoz. Se actualiza en el mismo Pull Request que el código del módulo.

## 1. ¿Qué hace el módulo?

Al abrir el detalle de una receta se ven cinco estrellas para calificarla de 1 a 5, junto con su promedio y cuántas personas la han calificado, por ejemplo "4.5 de 5 (2 calificaciones)". Si nadie la ha calificado, dice "Sin calificaciones todavía.".

Al tocar una estrella se guarda la calificación y el promedio se actualiza al instante, sin recargar la página. Si la persona ya había calificado, su puntuación queda marcada en las estrellas.

Quitar la calificación, los avisos para quien no tiene sesión o para las recetas propias, y la pantalla "Mejor valoradas" se agregan en las siguientes tareas del módulo.

## 2. Archivos

| Archivo | Para qué sirve |
|---|---|
| `frontend/js/calificaciones.js` | Escucha el evento `receta-mostrada`, dibuja el promedio y las estrellas en la ranura `#detalle-calificacion`, y guarda la calificación con `api.calificar`. |
| `frontend/css/calificaciones.css` | Da color y espacio al promedio y a las estrellas, sin cambiar los estilos compartidos. |
| `docs/decisiones/calificaciones.md` | Este documento: explica qué hace el módulo, cómo se prueba y qué falta. |

## 3. Decisiones y por qué se tomaron

- **Escuchar `receta-mostrada` en lugar de leer la URL.** `catalogo.js` ya carga la receta y avisa cuando terminó; así no se hace otra petición y siempre se usa la receta que se está mostrando.
- **Usar la ranura `#detalle-calificacion`.** Es el hueco que el proyecto reserva para este módulo, así que no se toca el HTML de otras pantallas.
- **Las estrellas son `<button>` reales, no `div`.** Así se usan con el teclado (con Tab y Enter) sin trabajo extra, y cada una tiene su `aria-label` ("Calificar con 3 estrellas").
- **Actualizar con la respuesta de `api.calificar`.** El servidor devuelve el promedio nuevo, el total y `miCalificacion`, así que se pintan de nuevo sin recargar ni hacer otra petición.
- **Mostrar el promedio con un decimal.** El contrato entrega el número sin redondear (por ejemplo `3.6666666666666665`); un decimal es fácil de leer y no pierde información importante.
- **Distinguir entre cero y una calificación.** "1 calificación" suena natural y evita el error de decir "1 calificaciones".
- **`role="status"` y `aria-live` en el promedio y en el estado.** Como el texto cambia sin recargar, así los lectores de pantalla avisan del cambio.
- **Construir todo con `createElement` y `textContent`.** Cumple la regla de seguridad contra XSS y evita insertar HTML.

## 4. Cómo se prueba

1. Abre `frontend/index.html` con Live Server.
2. Entra a **Recetas** y abre cualquier receta: se ven las cinco estrellas y, si nadie la ha calificado, "Sin calificaciones todavía.".
3. Inicia sesión con el usuario de prueba: en la consola (F12) escribe `await api.iniciarSesion('demo@recetasecreta.test', 'demo12345')`.
4. Toca una estrella (por ejemplo la cuarta). Aparece "Guardando calificación..." y enseguida el promedio cambia, sin recargar, y quedan marcadas las estrellas elegidas.
5. Abre de nuevo la receta: tu calificación sigue marcada y el promedio se conserva.
6. Revisa que las estrellas se vean bien y se usen con el teclado en una ventana angosta (celular).

## 5. Qué falta o qué limitaciones tiene

- Todavía no se puede quitar la calificación ni se reemplaza al volver a tocar otra estrella con su botón propio (tarea L3).
- Los avisos para quien no tiene sesión y para las recetas propias son provisionales; falta el enlace a la pantalla de Acceso y la explicación completa (tarea L4).
- La pantalla "Mejor valoradas" sigue vacía (tarea L5).

## Resumen para defender

- **Qué hace ahora:** en el detalle de una receta se ven cinco estrellas y el promedio; al tocar una estrella se guarda la calificación y el promedio cambia al instante, sin recargar.
- **Archivos tocados:** `frontend/js/calificaciones.js` dibuja las estrellas y guarda la calificación, `frontend/css/calificaciones.css` las estiliza y este documento lo explica.
- **Cómo se conecta:** escucha el evento `receta-mostrada` de `catalogo.js`, escribe en la ranura `#detalle-calificacion` y guarda con `api.calificar(id, puntos)`.
- **Decisiones:** las estrellas son botones accesibles con `aria-label`, y el promedio se actualiza con la respuesta del servidor para no recargar; todo se arma con `textContent`.
- **Cómo probarlo:** abre una receta, inicia sesión con `await api.iniciarSesion('demo@recetasecreta.test', 'demo12345')` en la consola, toca una estrella y mira cómo cambia el promedio al momento.
