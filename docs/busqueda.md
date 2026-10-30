# Decisiones: Módulo Búsqueda

1. **¿Cómo resolviste la búsqueda ignorando espacios vacíos?**
Usé la función `trim()` de JavaScript sobre el valor que el usuario escribe en el input. Esto borra automáticamente los espacios que sobran al principio y al final antes de ejecutar la búsqueda.

2. **¿Cómo integraste el selector de categorías?**
Llamé a la función asíncrona `api.listarCategorias()` cuando se muestra la página. Con lo que me devolvió, usé un ciclo para crear etiquetas `<option>` y las metí dentro del selector de categoría en el HTML.

3. **¿Cómo combinaste los filtros de categoría e ingrediente?**
Hice una función que lee al mismo tiempo lo que hay en el campo de texto y lo que está seleccionado en la categoría. Luego, le pasa esos dos valores directamente a la función `catalogo.cargar({ categoria, ingrediente })`.

4. **¿Cómo muestras el mensaje de resultados vacíos sin sobreescribir la galería?**
Puse un contenedor `<div>` oculto en el HTML debajo de los botones. Luego, agregué un escuchador para el evento `tarjetas-dibujadas`; si detecta que la lista de recetas viene vacía, le quito la clase que lo oculta y le inyecto el mensaje de que no se encontró nada.

5. **¿Qué medidas de accesibilidad y diseño responsivo aplicaste?**
Usé etiquetas `<label>` vinculadas con el atributo `for` a cada input para que funcione con lectores de pantalla. En CSS usé Flexbox: en celulares los botones y campos se apilan hacia abajo (columna), y en pantallas más grandes cambian a una sola fila horizontal.