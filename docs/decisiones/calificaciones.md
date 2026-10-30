# Decisiones técnicas: Calificaciones

Responsable: Leilani Muñoz. Se actualiza en el mismo Pull Request que el código del módulo.

## 1. ¿Qué hace el módulo?

Al abrir el detalle de una receta se ven cinco estrellas para calificarla de 1 a 5, junto con su promedio y cuántas personas la han calificado, por ejemplo "4.5 de 5 (2 calificaciones)". Si nadie la ha calificado, dice "Sin calificaciones todavía.".

Al tocar una estrella se guarda la calificación y el promedio se actualiza al instante, sin recargar. Si ya habías calificado, tu puntuación queda marcada, y tocar otra estrella la reemplaza. También aparece un botón "Quitar calificación" para dejar la receta sin calificar.

Las reglas del sitio se respetan y se explican: sin sesión aparece "Inicia sesión" con un enlace a la pantalla de Acceso, y en una receta propia se avisa "No puedes calificar tus propias recetas." con las estrellas desactivadas.

La pantalla **Mejor valoradas** muestra la lista de recetas ordenadas por promedio, de mayor a menor, cada una con su promedio y su enlace al detalle. Las recetas sin calificaciones no aparecen, y si nadie ha calificado se muestra un mensaje claro con un enlace para explorar el recetario.

## 2. Archivos

| Archivo | Para qué sirve |
|---|---|
| `frontend/js/calificaciones.js` | Escucha `receta-mostrada`, `sesion-cambiada` y `pantalla-mostrada`. Dibuja el promedio, las estrellas y el botón de quitar en `#detalle-calificacion`, aplica las reglas (sesión y receta propia), y dibuja la pantalla "Mejor valoradas" con `api.recetasMejorValoradas()`. |
| `frontend/css/calificaciones.css` | Da color y espacio al promedio, a las estrellas, al botón de quitar, a los avisos y a la lista de mejor valoradas, sin cambiar los estilos compartidos. |
| `docs/decisiones/calificaciones.md` | Este documento: explica qué hace el módulo, cómo se prueba y qué falta. |
| `frontend/index.html` (solo el bloque "Mejor valoradas") | Se quitó el texto "en construcción" para que el JS dibuje la lista. |

## 3. Decisiones y por qué se tomaron

- **Escuchar `receta-mostrada` en lugar de leer la URL.** `catalogo.js` ya carga la receta y avisa cuando terminó; así no se hace otra petición y siempre se usa la receta que se está mostrando.
- **Usar la ranura `#detalle-calificacion`.** Es el hueco que el proyecto reserva para este módulo, así que no se toca el HTML de otras pantallas.
- **Las estrellas son `<button>` reales, no `div`.** Así se usan con el teclado (con Tab y Enter) sin trabajo extra, y cada una tiene su `aria-label` ("Calificar con 3 estrellas").
- **Actualizar con la respuesta de `api.calificar`.** El servidor devuelve el promedio nuevo, el total y `miCalificacion`, así que se pintan de nuevo sin recargar ni hacer otra petición.
- **El botón "Quitar calificación" solo aparece si ya calificaste.** No tiene sentido quitarla si no hay calificación, y `api.quitarCalificacion` devuelve el promedio nuevo para actualizarlo al instante.
- **Sin sesión, se desactivan las estrellas y se muestra un enlace a Acceso.** Así no se intenta calificar sin permiso y la persona sabe cómo seguir. Se usa el mismo estilo de aviso que el módulo de Favoritos.
- **En una receta propia, las estrellas se desactivan y se explica por qué.** El servidor devuelve 403, pero es mejor prevenir y explicar con "No puedes calificar tus propias recetas." en lugar de dejar que aparezca un error.
- **Escuchar `sesion-cambiada`.** Si alguien entra o sale de su cuenta mientras ve la receta, se vuelve a pedir la receta para refrescar las reglas y `miCalificacion`.
- **En "Mejor valoradas" se confía en el orden del servidor.** `api.recetasMejorValoradas()` ya entrega las recetas ordenadas por promedio y sin las que no tienen calificaciones, así que no se reordena en la interfaz.
- **Mensajes de "Mejor valoradas" claros y sin pantalla en blanco.** Mientras carga se muestra "Cargando...", si nadie ha calificado se explica con un enlace al recetario, y si falla se muestra el mensaje del error.
- **Mostrar el promedio con un decimal.** El contrato entrega el número sin redondear (por ejemplo `3.6666666666666665`); un decimal es fácil de leer y no pierde información importante.
- **Distinguir entre cero y una calificación.** "1 calificación" suena natural y evita el error de decir "1 calificaciones".
- **`role="status"` y `aria-live` en los textos que cambian.** Como cambian sin recargar, así los lectores de pantalla avisan del cambio.
- **Construir todo con `createElement` y `textContent`.** Cumple la regla de seguridad contra XSS y evita insertar HTML.

## 4. Cómo se prueba

1. Abre `frontend/index.html` con Live Server.
2. **Sin sesión:** abre una receta. Se ven las estrellas desactivadas y el aviso "Inicia sesión para calificar esta receta." con enlace a Acceso.
3. Inicia sesión con el usuario de prueba: en la consola (F12) escribe `await api.iniciarSesion('demo@recetasecreta.test', 'demo12345')`.
4. Al entrar, las estrellas se activan y puedes calificar. Toca una estrella: el promedio cambia al instante, sin recargar. Toca otra para reemplazarla y "Quitar calificación" para eliminarla.
5. **Receta propia:** publica una receta con el usuario de prueba y ábrela. Debe decir "No puedes calificar tus propias recetas." con las estrellas desactivadas.
6. **Mejor valoradas:** abre la pantalla desde el menú. Aparecen solo las recetas con calificaciones, la mejor primero, cada una con su promedio y su enlace. Si ninguna tiene calificaciones, se ve el mensaje de que todavía nadie ha calificado.
7. Revisa que todo se vea bien y se use con el teclado en una ventana angosta (celular).

## 5. Qué falta o qué limitaciones tiene

- Revisión final de estilos y accesibilidad en todas las pantallas (tarea L7).
- El promedio no se muestra todavía en las tarjetas de la galería (opcional L8, coordinar con Favoritos).

## Resumen para defender

- **Qué hace ahora:** se puede calificar, cambiar y quitar la calificación sin recargar, con reglas claras para sesión y recetas propias, y una pantalla "Mejor valoradas" con las recetas ordenadas por promedio.
- **Archivos tocados:** `calificaciones.js` dibuja el detalle y la pantalla de mejor valoradas, `calificaciones.css` les da estilo, `index.html` (solo el bloque de mi pantalla) y este documento.
- **Cómo se conecta:** escucha `receta-mostrada`, `sesion-cambiada` y `pantalla-mostrada`, y usa `api.calificar`, `api.quitarCalificacion`, `api.obtenerReceta` y `api.recetasMejorValoradas`.
- **Decisiones:** las estrellas son botones accesibles, el orden de "Mejor valoradas" viene del servidor, y todo se actualiza sin recargar.
- **Cómo probarlo:** califica varias recetas con el usuario de prueba y abre "Mejor valoradas" para verlas ordenadas; comprueba también los avisos de sesión y de receta propia.
