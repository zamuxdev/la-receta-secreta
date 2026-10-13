# Tareas del equipo

Este archivo dice **qué le toca a cada persona**, en qué orden y cómo saber que una tarea está terminada. Léelo completo una vez y después ve directo a tu sección.

> Solo Fernando edita este archivo (marca las tareas cuando se unen). Tú no lo cambies: tu trabajo va en tus archivos.

## Qué estamos construyendo

**La Receta Secreta** es una web donde la gente publica recetas, las busca, las guarda en favoritos y las califica. Ya existen la galería de recetas, la ficha de cada receta y el formulario para publicar. Ahora vamos a hacerla **dinámica**: que se pueda buscar, calificar, guardar favoritos y entrar con una cuenta.

Para que cinco personas trabajen a la vez sin pisarse, **cada una tiene su propio módulo**, con sus propios archivos.

| Persona | Módulo | En una frase |
|---|---|---|
| **Hazel Martínez** | Búsqueda | Que se pueda encontrar una receta por ingrediente o categoría |
| **Brandon Aguilar** | Favoritos | Que se puedan guardar recetas y verlas después |
| **Leilani Muñoz** | Calificaciones | Que se pueda calificar con estrellas y ver las mejor valoradas |
| **Yaret Juárez** | Acceso y publicar | Que se pueda crear una cuenta, entrar y publicar recetas |
| **Fernando González** | Backend | La parte del servidor y la base de datos |

## Antes de empezar (todas las personas)

Haz estos pasos una sola vez. Si algo no te sale, avisa en el grupo.

1. **Clona el repositorio** y ábrelo en VS Code.
2. **Instala la extensión *Live Server*** en VS Code.
3. En el explorador de archivos haz clic derecho en `frontend/index.html` y elige **Open with Live Server**. Debe abrirse el navegador y verse la galería con tres recetas. Si se ve, todo está bien.
4. **Abre tu agente de programación** (Claude Code, Codex u OpenCode) en la carpeta del proyecto. El agente lee solo las reglas del archivo `AGENTS.md`.
5. **Dile quién eres.** Tu primer mensaje al agente puede ser:

   > Soy [tu nombre] y mi módulo es [tu módulo]. Lee AGENTS.md y TASKS.md y ayúdame con mi primera tarea.

> No necesitas el servidor ni Docker. La interfaz funciona con **datos de prueba**: son recetas falsas que imitan lo que entregará el servidor. Hay un usuario de prueba para probar cosas que requieren sesión. Sus datos están al principio de `frontend/js/api-prueba.js`.

## Cómo trabajamos con git

Una **rama** es una copia de trabajo donde puedes cambiar cosas sin afectar a nadie. Un **Pull Request** (PR) es pedirle a Fernando que revise tus cambios y los una al proyecto.

**Nadie sube cambios directo a `main`.** Cada tarea sigue este ciclo:

1. Ponerte al día: `git switch main` y `git pull`.
2. Crear tu rama: `git switch -c modulo/tarea-corta` (por ejemplo `busqueda/barra-de-busqueda`).
3. Trabajar con tu agente y **probar en el navegador** que funciona.
4. Guardar: `git add .` y `git commit -m "Describe lo que cambiaste"`.
5. Subir: `git push -u origin modulo/tarea-corta`.
6. Abrir el **Pull Request** en GitHub. Fernando lo revisa, te comenta o lo une.

**Una tarea = una rama = un PR.** Es más fácil de revisar y casi no hay conflictos. Si git te muestra un conflicto, **no lo resuelvas a ciegas**: avisa a Fernando.

## Reglas importantes

- **Solo toca los archivos de tu módulo** (están listados en tu sección). Si necesitas algo de otro módulo, avisa.
- **No agregues** etiquetas `<script>` ni `<link>` al HTML: ya están puestas.
- **No uses `fetch` directo.** Todo lo que hable con el servidor pasa por el objeto `api`.
- **Puedes dejar que el agente trabaje libremente.** Él escribe el código y al terminar te da un **"Resumen para defender"**: qué hace, qué archivos tocó, cómo se conecta y cómo probarlo. **Léelo y asegúrate de entenderlo**, porque en la presentación final nos preguntarán a cada uno. Si algo no te queda claro, pregúntale.
- **Escribe tu documento de decisiones** (`docs/decisiones/...`): es parte de lo que se entrega en este parcial.

---

## Hazel Martínez: Búsqueda

**Dónde trabajas:** la pantalla **Recetas** (`#/recetas`).
**Tus archivos:** `frontend/js/busqueda.js`, `frontend/css/busqueda.css`, `docs/decisiones/busqueda.md`. En `index.html` solo el comentario "Módulo Búsqueda" de la pantalla Recetas.
**Funciones que vas a usar:** `catalogo.cargar({ categoria, ingrediente })` y `api.listarCategorias()`.

| # | Tarea | Listo cuando... |
|---|---|---|
| H1 | **Barra de búsqueda por ingrediente.** Un campo de texto con su etiqueta y un botón "Buscar". | Escribes "aguacate", pulsas Buscar y solo aparece la receta de tacos. Funciona sin importar mayúsculas. |
| H2 | **Filtro por categoría.** Un selector con las categorías (pídelas con `api.listarCategorias()`) y la opción "Todas". | Al elegir "Desayuno" solo aparece la avena, al elegir "Comida" aparecen los tacos y la ensalada, y al elegir "Todas" aparecen las tres. |
| H3 | **Combinar los dos filtros** y un botón "Limpiar". | "aguacate" dentro de "Comida" muestra solo los tacos, "aguacate" dentro de "Desayuno" no muestra ninguna, y "Limpiar" regresa a ver todas. |
| H4 | **Mensaje cuando no hay resultados** (RF-05). | Si buscas "xyz", aparece un mensaje claro como "No encontramos recetas con xyz" en lugar de una pantalla vacía. |
| H5 | **Cuidar los datos escritos.** Ignora los espacios de más y no busques con el campo vacío por error. | Buscar "  aguacate  " funciona igual que "aguacate". |
| H6 | **Que se vea bien y sea accesible.** Estilos en tu CSS, etiquetas en los campos, se ve bien en el celular. | Se usa con el teclado y se ve bien en pantalla chica. |
| H7 | **Tu documento de decisiones.** Completa `docs/decisiones/busqueda.md`. | Responde las 5 preguntas con palabras simples. |

**Pista para H4:** `catalogo.js` avisa con el evento `tarjetas-dibujadas` cada vez que dibuja la galería, y trae la lista de recetas. Si la lista está vacía, tú pones tu mensaje.

---

## Brandon Aguilar: Favoritos

**Dónde trabajas:** las tarjetas de la galería, el detalle de cada receta y la pantalla **Favoritos** (`#/favoritos`).
**Tus archivos:** `frontend/js/favoritos.js`, `frontend/css/favoritos.css`, `docs/decisiones/favoritos.md`. En `index.html` solo el bloque de la pantalla Favoritos.
**Funciones que vas a usar:** `api.listarFavoritos()`, `api.agregarFavorito(id)`, `api.quitarFavorito(id)` y `api.haySesion()`.
**Dónde se engancha tu botón:** `#detalle-acciones` (en el detalle) y `.tarjeta-acciones` (en cada tarjeta), mediante los eventos `receta-mostrada` y `tarjetas-dibujadas`.

| # | Tarea | Listo cuando... |
|---|---|---|
| B1 | **Botón de favorito en el detalle de la receta.** Dice "Guardar en favoritos" y cambia a "Quitar de favoritos". Debe ser un `<button>` real, con `aria-pressed`. | Al pulsarlo, la receta se guarda y el botón cambia de texto. Al volver a pulsarlo, se quita. |
| B2 | **Saber si la receta ya es favorita** al abrirla. El servidor no lo dice directamente: usa `api.listarFavoritos()` y revisa si el `id` está en la lista. | Si guardas una receta, sales y vuelves a entrar, el botón sigue diciendo "Quitar de favoritos". |
| B3 | **Qué pasa sin sesión.** Si no hay sesión (`api.haySesion()`), no se puede guardar. | Sin sesión aparece un mensaje amable que lleva a la pantalla de Acceso, y no un error. |
| B4 | **Botón en cada tarjeta de la galería** (en `.tarjeta-acciones`). | Puedes guardar una receta sin abrirla, y el estado coincide con el del detalle. |
| B5 | **La pantalla Favoritos.** Una lista de tus recetas guardadas, con un botón para quitarlas. | Se ven solo tus favoritas, y al quitar una desaparece de la lista. |
| B6 | **Mensajes.** Un texto cuando no tienes favoritos y otro si algo falla (por ejemplo `error.textoParaUsuario()`). | Nunca queda la pantalla en blanco. |
| B7 | **Reaccionar a la sesión.** Cuando alguien entra o sale de su cuenta, los botones se actualizan (evento `sesion-cambiada`). | Cierras sesión y los botones dejan de mostrar tus favoritas. |
| B8 | **Estilos, accesibilidad y tu documento** `docs/decisiones/favoritos.md`. | Se ve bien en el celular, se usa con el teclado y el documento responde las 5 preguntas. |

**Para probar sin esperar la pantalla de acceso de Yaret:** abre la consola del navegador (F12) y escribe `await api.iniciarSesion('demo@recetasecreta.test', 'demo12345')`.

---

## Leilani Muñoz: Calificaciones

**Dónde trabajas:** el detalle de cada receta y la pantalla **Mejor valoradas** (`#/mejor-valoradas`).
**Tus archivos:** `frontend/js/calificaciones.js`, `frontend/css/calificaciones.css`, `docs/decisiones/calificaciones.md`. En `index.html` solo el bloque de la pantalla Mejor valoradas.
**Funciones que vas a usar:** `api.calificar(id, puntos)`, `api.quitarCalificacion(id)`, `api.recetasMejorValoradas()` y `api.haySesion()`.
**Dónde se engancha tu parte:** `#detalle-calificacion` (en el detalle), con el evento `receta-mostrada`. La receta trae `promedio`, `totalCalificaciones`, `miCalificacion` y `esMia`.

| # | Tarea | Listo cuando... |
|---|---|---|
| L1 | **Mostrar el promedio.** En el detalle, algo como "4.5 de 5 (2 calificaciones)", o "Sin calificaciones todavía". | Cada receta muestra su promedio real, y una receta nueva dice que aún no tiene. |
| L2 | **Las estrellas para calificar.** Cinco botones del 1 al 5, con etiqueta accesible ("Calificar con 3 estrellas"). Si ya calificaste (`miCalificacion`), aparece marcada. | Al elegir 4 estrellas se guarda y el promedio se actualiza **sin recargar** (usa la respuesta de `api.calificar`). |
| L3 | **Cambiar y quitar la calificación.** Calificar de nuevo reemplaza la anterior, y un botón la quita. | Cambias de 4 a 2 estrellas y el promedio cambia. Al quitarla, vuelve a "sin calificar". |
| L4 | **Las reglas.** Sin sesión: un mensaje para entrar. Si la receta es tuya (`esMia`): no se puede calificar y se explica por qué. | Nunca se ve un error técnico, siempre un mensaje claro. |
| L5 | **La pantalla Mejor valoradas.** Una lista con las recetas ordenadas por promedio, mostrando el promedio. | La mejor está primero, y las que no tienen calificaciones no aparecen. |
| L6 | **Mensajes.** Un texto cuando todavía nadie ha calificado, y otro si algo falla. | Nunca queda la pantalla en blanco. |
| L7 | **Estilos, accesibilidad y tu documento** `docs/decisiones/calificaciones.md`. | Las estrellas se usan con el teclado, se ven bien en el celular y el documento responde las 5 preguntas. |

**Para probar sin esperar la pantalla de acceso de Yaret:** abre la consola (F12) y escribe `await api.iniciarSesion('demo@recetasecreta.test', 'demo12345')`.

**Opcional (L8):** mostrar el promedio también en las tarjetas de la galería. Coordínate con Brandon, porque comparten el espacio `.tarjeta-acciones`.

---

## Yaret Juárez: Acceso y publicar

**Dónde trabajas:** las pantallas **Acceso** (`#/acceso`), **Crear cuenta** (`#/registro`) y **Publicar** (`#/publicar`).
**Tus archivos:** `frontend/js/acceso.js`, `frontend/js/publicar.js`, `frontend/css/acceso.css`, `docs/decisiones/acceso-publicar.md`. En `index.html` solo los bloques de Acceso, Crear cuenta y Publicar.
**Funciones que vas a usar:** `api.iniciarSesion(correo, password)`, `api.registrar({ nombre, correo, password })`, `api.cerrarSesion()`, `api.usuarioActual()`, `api.haySesion()` y `api.crearReceta(datos)`.

> Tu módulo es el que más personas necesitan: Brandon y Leilani prueban cosas con sesión. Empieza por Y1 y Y2.

| # | Tarea | Listo cuando... |
|---|---|---|
| Y1 | **Pantalla de Acceso.** Reemplaza el formulario de ejemplo por **correo y contraseña**, con un botón "Entrar". | Entras con el usuario de prueba y la pantalla muestra que tienes sesión. Con una contraseña incorrecta aparece el mensaje del servidor. |
| Y2 | **Pantalla Crear cuenta.** Campos de nombre, correo y contraseña (mínimo 8 caracteres), con un botón "Crear cuenta". | Puedes crear una cuenta nueva y luego entrar con ella. Si el correo ya existe, se avisa con claridad. |
| Y3 | **Errores por campo.** Si el servidor rechaza un dato, el mensaje aparece **junto a su campo** (usa `error.errores`; las claves son `nombre`, `correo` y `password`). | Una contraseña de 3 letras muestra el mensaje debajo del campo de contraseña. |
| Y4 | **Mostrar quién eres y cerrar sesión.** En la pantalla de Acceso, si hay sesión: "Hola, [nombre]" y un botón "Cerrar sesión". | Cierras sesión y la pantalla vuelve a mostrar el formulario de entrada. Responde al evento `sesion-cambiada`. |
| Y5 | **Enlaces entre pantallas.** Desde Acceso se llega a Crear cuenta y al revés. | Se puede ir de una a otra sin usar el menú. |
| Y6 | **Publicar: errores por campo.** Hoy los errores salen en un solo texto. Muestra cada mensaje junto a su campo, tanto los de la validación en el navegador como los que rechace el servidor (`error.errores`). Ojo: la clave `nombre` corresponde al campo `#titulo` del formulario. | Publicar con el tiempo en 0 muestra el mensaje junto al campo de tiempo, y con el nombre vacío, junto al campo del nombre. |
| Y7 | **Publicar: aviso si no hay sesión.** Publicar exige sesión (sin ella la API responde 401). Muestra un aviso amable invitando a entrar. | Sin sesión aparece el aviso, con la sesión iniciada no. |
| Y8 | **Estilos, accesibilidad y tu documento** `docs/decisiones/acceso-publicar.md`. | Los formularios tienen sus etiquetas, se usan con el teclado y se ven bien en el celular. |

**Importante:**

- En `index.html` el formulario de Acceso que existe es solo un ejemplo con el botón desactivado. Reemplázalo.
- `publicar.js` todavía no está envuelto en `(() => { ... })();` como los demás módulos. Envuélvelo en la primera tarea en que lo toques (Y6 o Y7).

---

## Fernando González: Backend y coordinación

| # | Tarea | Estado |
|---|---|---|
| F1 | Autenticación: registro, inicio de sesión, hash de contraseñas y JWT | Hecha |
| F2 | Que publicar exija sesión y la receta quede ligada a su autor | Hecha |
| F3 | Endpoint de categorías | Hecha |
| F4 | Favoritos (agregar, quitar y listar) | Hecha |
| F5 | Calificaciones (votar, promedio y mejor valoradas) | Hecha |
| F6 | Editar y borrar recetas propias, y "mis recetas" | Hecha |
| F7 | Validar la foto en el servidor (formato real y tamaño) | Hecha |
| F8 | Exportar en XML y CSV | Hecha |
| F9 | Pruebas automatizadas del backend | Hecha |
| F10 | Revisar los Pull Requests, mantener el contrato de la API y activar la API real (`USAR_DATOS_DE_PRUEBA = false`) cuando cada parte esté lista | En curso |

---

## Cómo sabemos que algo está terminado

Una tarea está **terminada** cuando:

1. Funciona en el navegador, probada por la persona que la hizo.
2. Se ve bien en pantalla chica y se puede usar con el teclado.
3. Los errores se muestran con un mensaje claro, no con la pantalla en blanco.
4. El Pull Request está abierto y Fernando lo unió.
5. Su parte del documento de decisiones está actualizada (el agente copia ahí el resumen para defender).
6. La persona leyó el resumen y puede explicar con sus palabras qué hace su parte.

## Si te atoras

1. **Cuéntale a tu agente qué pasó** y pídele que lo arregle.
2. Revisa el archivo de tu módulo: tiene comentarios con pistas de lo que debe hacer.
3. Mira `docs/10-contrato-api.md` para saber qué datos entrega y recibe cada función.
4. Si sigues sin avanzar, **avísale a Fernando con un mensaje claro**: qué quisiste hacer, qué pasó y qué dijo el error.

## Para entregar en este parcial

El tema 3 pide un **prototipo funcional con búsqueda, calificación y favoritos con validación en el cliente**, y la **documentación de las decisiones técnicas**. Por eso cada persona debe terminar:

- Su módulo funcionando.
- Su documento en `docs/decisiones/`.
- Poder explicar qué hace su parte.
