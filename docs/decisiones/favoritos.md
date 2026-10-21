# Decisiones técnicas: Favoritos

Responsable: Brandon Aguilar. Se actualiza en el mismo Pull Request que el código del módulo.

## 1. ¿Qué hace el módulo?

Permite al usuario guardar recetas en una lista personal de favoritos y consultarla en la pantalla `/favoritos`. En cada tarjeta de la galería y en el detalle de cada receta aparece un botón que dice "Guardar en favoritos" o "Quitar de favoritos" según el estado actual. Si el usuario no tiene sesión iniciada, el botón se reemplaza por un mensaje amable con enlace a la pantalla de Acceso. La pantalla Favoritos muestra la lista de recetas guardadas, permite quitarlas una a una y descargar el listado en CSV.

## 2. Archivos

| Archivo | Para qué sirve |
|---|---|
| `frontend/js/favoritos.js` | Lógica completa del módulo: botones, pantalla Favoritos, descarga CSV y reacción a eventos |
| `frontend/css/favoritos.css` | Estilos exclusivos del módulo (botones, lista, mensajes) |
| `frontend/index.html` | Bloque de la pantalla `#favoritos` (solo el `<h1>`; el resto lo genera JS) |
| `docs/decisiones/favoritos.md` | Este documento |

## 3. Decisiones y por qué se tomaron

**¿Por qué se usa `listarFavoritos()` para saber si una receta ya es favorita?**
El endpoint `GET /recetas/{id}` no incluye un campo `esFavorita` en el contrato de la API. La única manera de saberlo es obtener la lista completa con `api.listarFavoritos()` y buscar el `id` de la receta. Se guarda el resultado en un `Set` en memoria (`idsActuales`) para no repetir la llamada al servidor en cada tarjeta.

**¿Por qué actualización optimista en el botón?**
El toggle cambia el texto e `aria-pressed` de inmediato, antes de que llegue la respuesta del servidor. Esto hace la interfaz sentirse rápida. Si la operación falla, se revierte el cambio y se muestra un mensaje de error.

**¿Por qué se sincronizan todos los botones con el mismo `recetaId`?**
Un usuario puede ver la misma receta en la galería y abrir su detalle. Si guarda desde la tarjeta, el botón del detalle también debe actualizarse (y viceversa). La función `sincronizarBotones` busca todos los `.btn-favorito[data-receta-id="N"]` del documento y los actualiza juntos.

**¿Por qué se redibuja la pantalla Favoritos cuando se quita el último item?**
Al quitar el último favorito la lista queda vacía. En lugar de dejar un `<ul>` vacío, se llama a `dibujarPantallaFavoritos()` que muestra el mensaje "Todavía no tienes recetas guardadas" y oculta el botón CSV, que no tiene sentido sin favoritos (B9).

**¿Por qué el botón CSV se desactiva (`disabled`) cuando la lista está vacía?**
El requisito B9 dice que sin favoritos el botón no se puede usar. Se optó por no mostrarlo en ese caso (se redibuja la pantalla con el mensaje vacío) en lugar de mostrarlo desactivado, porque no aporta información al usuario cuando no hay nada que descargar.

## 4. Cómo se prueba

1. Abrir `index.html` en el navegador (sin servidor basta, con `USAR_DATOS_DE_PRUEBA = true`).
2. Ir a **Recetas** y verificar que cada tarjeta muestra "Inicia sesión para guardar." (sin sesión).
3. Ir a **Favoritos** y verificar el mensaje de "Inicia sesión para ver tus recetas favoritas."
4. Abrir la consola (F12) y ejecutar `await api.iniciarSesion('demo@recetasecreta.test', 'demo12345')`.
5. Volver a **Recetas**: los botones ahora dicen "♡ Guardar en favoritos".
6. Pulsar el botón en una tarjeta → cambia a "♥ Quitar de favoritos". Abrir el detalle de esa receta → el botón ya dice "♥ Quitar de favoritos" (B2).
7. Pulsar el botón en el detalle → cambia a "♡ Guardar en favoritos". La tarjeta también se actualiza (B4).
8. Guardar dos recetas. Ir a **Favoritos** → aparecen ambas y el botón "Descargar en CSV" (B5, B9).
9. Pulsar "Descargar en CSV" → aparece "Preparando el archivo..." y se descarga `favoritos.csv`. Abrirlo en Excel y verificar acentos y dos filas (B9).
10. Quitar una receta desde la pantalla Favoritos → desaparece de la lista (B5).
11. Quitar la última → aparece el mensaje de lista vacía y desaparece el botón CSV (B6, B9).
12. Cerrar sesión desde la consola con `api.cerrarSesion()` → los botones de tarjetas y detalle vuelven a mostrar el mensaje de "Inicia sesión" (B7).

## 5. Qué falta o qué limitaciones tiene

- La sincronización entre pestañas del navegador no es inmediata: si se guarda un favorito en otra pestaña, los botones de esta no se actualizan hasta que se vuelve a cargar la pantalla.
- No hay paginación en la pantalla Favoritos; si el usuario tiene muchas recetas guardadas, se muestran todas de una vez.
- El estado en memoria (`idsActuales`) se pierde al recargar la página, pero se reconstruye en la siguiente llamada a `cargarIdsActuales()`, por lo que no afecta la funcionalidad.
