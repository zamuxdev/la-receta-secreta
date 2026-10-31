# Decisiones técnicas: Búsqueda

Responsable: Hazel Martínez. Se actualiza en el mismo Pull Request que el código del módulo.

## 1. ¿Qué hace el módulo?

En la pantalla Recetas aparece una barra para buscar recetas por ingrediente y un selector para filtrar por categoría. Los dos filtros se pueden combinar. El botón "Limpiar" regresa a ver todas las recetas. Si una búsqueda no encuentra nada, aparece un mensaje que dice qué se buscó, en lugar de dejar la galería vacía sin explicación.

## 2. Archivos

| Archivo | Para qué sirve |
|---|---|
| `frontend/js/busqueda.js` | Llena el selector de categorías, lee los filtros, pide a la galería que se vuelva a dibujar y muestra los mensajes |
| `frontend/css/busqueda.css` | Estilos de la barra: en el celular los campos van uno debajo de otro y en pantalla grande van en una fila |
| `frontend/index.html` | Solo el bloque "Módulo Búsqueda" de la pantalla Recetas: el formulario y el párrafo del mensaje |
| `docs/decisiones/busqueda.md` | Este documento |

## 3. Decisiones y por qué se tomaron

**¿Por qué las categorías vienen de la API y no están escritas en el HTML?**
Así, si se agrega una categoría en la base de datos, aparece sola en el selector. Se piden con `api.listarCategorias()`, que devuelve objetos `{ id, nombre }`; en cada `<option>` se usa el `nombre`, porque el filtro de recetas busca por nombre de categoría. Se piden una sola vez; si fallan, se muestra un aviso y se vuelve a intentar la próxima vez que se abre la pantalla.

**¿Por qué no se filtra la galería en el navegador?**
La galería la dibuja `catalogo.js`. El módulo solo llama a `catalogo.cargar({ categoria, ingrediente })`, que pide las recetas filtradas a la API. Así no se duplica el código que dibuja las tarjetas y el filtro funciona igual con los datos de prueba y con el servidor real.

**¿Por qué un `<form>`?**
Para que la búsqueda funcione también al presionar Enter, que es lo que la gente espera de una barra de búsqueda. Además `role="search"` le dice al lector de pantalla que es un buscador.

**¿Cómo se cuidan los datos escritos?**
Se usa `trim()` para quitar los espacios de más, así "  aguacate  " busca lo mismo que "aguacate". Si el campo y la categoría están vacíos, no se busca y se pide escribir algo; para ver todas las recetas está el botón "Limpiar". Las mayúsculas no importan porque la API compara sin distinguirlas.

**¿Cómo se sabe que no hubo resultados?**
`catalogo.js` emite el evento `tarjetas-dibujadas` con `{ recetas }` cada vez que dibuja la galería. Si `recetas` está vacía, se arma el mensaje con los filtros de la última búsqueda, por ejemplo: No encontramos recetas con "xyz". El mensaje se escribe con `textContent`, nunca con `innerHTML`, para que lo que escribe el usuario no se interprete como HTML.

**Accesibilidad y diseño**
Cada campo tiene su `<label>`. El mensaje está en un párrafo con `role="status"`, que siempre existe en la página, para que el lector de pantalla anuncie cuando cambia. El foco se ve con un contorno café. Los colores son los de la paleta del proyecto (verde, crema y café).

## 4. Cómo se prueba

1. Abrir `frontend/index.html` con Live Server (modo de prueba) e ir a **Recetas**.
2. El selector muestra Todas, Desayuno, Comida, Cena y Postre.
3. Escribir "aguacate" y presionar Enter o Buscar: solo aparecen los tacos. "AGUACATE" da lo mismo.
4. Elegir "Desayuno" y Buscar: solo la avena. "Comida": tacos y ensalada.
5. "aguacate" con "Desayuno": no hay recetas y aparece el mensaje.
6. Buscar "xyz": aparece `No encontramos recetas con "xyz".`
7. Buscar con todo vacío: aparece "Escribe un ingrediente o elige una categoría para buscar." y no cambia la galería.
8. "Limpiar": vuelven las tres recetas.
9. Probar con el teclado (Tab, Enter) y en pantalla chica (F12, vista de celular).

## 5. Qué falta o qué limitaciones tiene

- Se busca un ingrediente a la vez; no se pueden combinar varios ingredientes.
- La búsqueda es por coincidencia de texto: "aguacates" no encuentra "aguacate".
- Cuando no hay resultados, `catalogo.js` también muestra su propio texto "No hay recetas que mostrar." debajo del mensaje del módulo.
