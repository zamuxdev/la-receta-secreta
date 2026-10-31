# Decisiones técnicas: Acceso y publicar

Responsable: Yaret Juárez. Se actualiza en el mismo Pull Request que el código del módulo.

## 1. ¿Qué hace el módulo?

Permite **crear una cuenta**, **entrar** con correo y contraseña, ver **quién tiene la sesión iniciada** ("Hola, [nombre]") y **cerrar sesión**. Si algún dato está mal, el mensaje aparece **debajo del campo** que hay que corregir. Desde Acceso se llega a Crear cuenta y al revés.

En la pantalla **Publicar**, cada error aparece **junto a su campo** (por ejemplo, el tiempo en 0 o el nombre vacío), y si no hay sesión se muestra un **aviso** con enlaces para entrar o crear una cuenta.

Con la sesión iniciada, la pantalla Acceso muestra **Mis recetas**: la lista de las recetas que publicaste, cada una con su enlace al detalle y los botones **Editar** (abre el formulario lleno, que guarda los cambios) y **Borrar** (pide confirmación).

## 2. Archivos

| Archivo | Para qué sirve |
|---|---|
| `frontend/js/acceso.js` | La lógica de las pantallas Acceso y Crear cuenta: valida los datos, llama a la API, muestra los errores y el saludo. También dibuja "Mis recetas" y borra recetas. |
| `frontend/js/publicar.js` | El formulario Publicar: valida la receta, la envía con `api.crearReceta` (o `api.actualizarReceta` al editar), muestra los errores por campo y el aviso de sesión. También importa y exporta la receta en JSON. |
| `frontend/css/acceso.css` | Estilos de los mensajes de error (también los de Publicar), del recuadro "Hola, [nombre]", del aviso de sesión y del botón a lo ancho en el celular. |
| `frontend/index.html` (bloques Acceso, Registro y Publicar) | Los formularios: campos con su `label`, un párrafo de error por campo y el mensaje general con `role="status"`. En Publicar, además, el aviso de sesión. |

## 3. Decisiones y por qué se tomaron

- **Se valida en el navegador antes de llamar a la API** (correo con formato válido, contraseña de al menos 8 caracteres, nombre de hasta 60). Así la persona ve el error al instante. El servidor vuelve a validar, y si rechaza algo, su mensaje (`error.errores`) también se pone junto al campo, usando las claves `nombre`, `correo` y `password`.
- **El foco va al primer campo con error**, y cada campo está ligado a su mensaje con `aria-describedby` y marcado con `aria-invalid`. Así un lector de pantalla lee el error, y con el teclado se corrige sin buscarlo.
- **El correo repetido (409) se muestra junto al campo de correo**, aunque la respuesta no traiga errores por campo, porque es ahí donde está el problema.
- **Después de crear la cuenta se entra automáticamente.** La API no inicia sesión al registrar, así que `acceso.js` llama a `api.iniciarSesion` con los mismos datos y lleva a Acceso, donde ya se ve "Hola, [nombre]". Esto le ahorra un paso a la persona. Si ese inicio falla, se lleva a Acceso con el correo ya escrito.
- **El botón se desactiva mientras se espera a la API** ("Entrando...", "Creando tu cuenta...") para no enviar el formulario dos veces.
- **La pantalla escucha el evento `sesion-cambiada`**: cuando alguien entra, sale o la sesión vence, el saludo y el formulario se actualizan solos. Si el servidor rechazó el token (el evento trae `motivo: 'vencida'`), Acceso muestra "Tu sesión venció. Vuelve a entrar." para que la persona sepa por qué salió.
- **El nombre del usuario se escribe con `textContent`**, nunca como HTML, para evitar XSS.

### Publicar (Y6 y Y7)

- **La validación de la receta revisa todos los campos a la vez** y devuelve un mensaje por campo, con las mismas claves que usa la API (`nombre`, `descripcion`, `categoria`, `tiempo`, `porciones`, `ingredientes`, `pasos`, `foto`). Así el mismo código pone junto a su campo tanto los errores del navegador como los del servidor. La clave `nombre` se muestra en el campo `#titulo`.
- **El formulario lleva `novalidate`**: sin él, el navegador mostraba su propia burbuja (por ejemplo con el tiempo en 0) y no dejaba ver nuestros mensajes en español junto al campo.
- **Sin sesión no se llama a la API.** El aviso "Para publicar una receta necesitas una cuenta" aparece arriba desde que se abre la pantalla, y al intentar publicar se lleva el foco a él. Si la API responde 401 (por ejemplo, porque la sesión venció), se muestra el mismo aviso. Importar y exportar JSON sí funciona sin sesión, porque no usa el servidor.
- **Al importar un JSON con errores** se muestran todos juntos en el mensaje general, porque los datos todavía no están en el formulario.
- **Ingredientes y pasos no tienen límite de caracteres.** Antes el formulario los limitaba a 4000 y 8000 caracteres, pero ese límite no está en el contrato ni en el servidor, así que se quitó para no rechazar recetas que la API sí acepta.
- **`publicar.js` se envolvió en `(() => { ... })();`**, como los demás módulos, para que sus variables no choquen con las de otros archivos.

### Mis recetas, editar y borrar (Y9 a Y11)

- **"Mis recetas" está en la pantalla Acceso, debajo del saludo**, y solo aparece con sesión. Se pide con `api.misRecetas()` cada vez que se abre la pantalla o cambia la sesión, así que siempre está al día. Las recetas de ejemplo no salen porque no tienen autor.
- **Editar reutiliza el formulario de Publicar** en la ruta `#/publicar/<id>`, en lugar de hacer otra pantalla. `publicar.js` recibe el `id` en el evento `pantalla-mostrada`, pide la receta con `api.obtenerReceta(id)`, llena el formulario y cambia el título a "Editar receta" y el botón a "Guardar cambios". Al enviar usa `api.actualizarReceta(id, datos)`. Las mismas validaciones y errores por campo sirven para publicar y para editar.
- **Si la receta no es tuya, no se llena el formulario**: se revisa `esMia` antes, y si aun así el servidor responde 403 o 404 al guardar, se muestra un mensaje claro. Si al volver a `#/publicar` se venía de editar, el formulario queda vacío para publicar una nueva. Si solo saliste a mirar algo mientras escribías una receta nueva, no se borra lo que llevabas.
- **Borrar pide confirmación con `confirm()`**, porque no se puede deshacer. Después se vuelve a pedir la lista, y el foco pasa al título "Mis recetas" porque el botón pulsado ya no existe. La galería se actualiza sola, porque `catalogo.js` la vuelve a pedir cada vez que se abre Recetas.
- **Los botones Editar y Borrar dicen el nombre de la receta a los lectores de pantalla** (`aria-label="Borrar Tacos..."`), porque en una lista con varios "Borrar" no se sabría cuál es cuál.
- **Si el servidor contesta tarde** (por ejemplo, abriste otra receta antes de que llegara la primera), la respuesta vieja se ignora para no llenar el formulario con datos equivocados.

### Estilos y accesibilidad (Y8)

Se revisaron las pantallas Acceso, Crear cuenta y Publicar (también con la lista de Mis recetas) en una pantalla de 320 px de ancho y en pantalla grande:

- **Cada campo tiene su `label`** y está ligado a su mensaje de error (y a su ayuda, si tiene) con `aria-describedby`. No hay ids repetidos ni referencias rotas.
- **Los campos obligatorios llevan `aria-required="true"`**, para que el lector de pantalla diga que son obligatorios. No se usa `required` porque mostraría la burbuja del navegador en lugar de nuestros mensajes. La foto dice "(opcional)" en su etiqueta.
- **Los errores no dependen solo del color**: llevan texto, un borde más grueso y `aria-invalid`. El rojo (`--error`, `#b42318`) contrasta bien sobre el fondo claro.
- **Todo se usa con el teclado**: el orden de Tab sigue el orden de la pantalla, el foco va al primer campo con error y nunca se quita el contorno de foco de `estilos.css`.
- **Los mensajes generales usan `role="status"`**, así el lector de pantalla los anuncia sin mover el foco.
- **En el celular** no hay desplazamiento horizontal, y los botones de los formularios ocupan todo el ancho para tocarlos fácil.
- **Al editar, la pestaña del navegador dice "Editar receta"**, igual que el título de la pantalla.
- Los estilos están solo en `acceso.css`, con la paleta del proyecto: no se cambió `estilos.css`.

## 4. Cómo se prueba

Con el backend corriendo y Live Server abierto en `frontend/index.html`:

> **Usuario para probar:** el usuario `demo@recetasecreta.test` (contraseña `demo12345`) solo existe con `USAR_DATOS_DE_PRUEBA = true`. Con la API real la base no trae usuarios: crea primero una cuenta en **Crear cuenta** y usa ese correo donde aquí dice el usuario de prueba.

1. Ve a **Acceso** y pulsa **Entrar** sin escribir nada: aparece un mensaje debajo de cada campo.
2. Escribe `demo@recetasecreta.test` con la contraseña `malamala`: aparece "Correo o contraseña incorrectos.".
3. Cambia la contraseña a `demo12345`: aparece "Hola, Usuario demo" y el botón **Cerrar sesión**. Al recargar la página, la sesión sigue.
4. Pulsa **Cerrar sesión**: vuelve el formulario de entrada.
5. Pulsa **Crea una cuenta**. Escribe una contraseña de 3 letras: el mensaje sale debajo de la contraseña.
6. Usa el correo `demo@recetasecreta.test`: aparece "Ya existe una cuenta con ese correo." debajo del correo.
7. Usa un correo nuevo y una contraseña de 8 caracteres: entras solo y ves "Hola, [tu nombre]". Cierra sesión y vuelve a entrar con esa cuenta.
8. Repite con la ventana angosta (modo celular, F12) y usando solo el teclado (Tab y Enter).

Publicar:

1. Sin sesión, abre **Publicar**: arriba aparece el aviso para entrar o crear una cuenta.
2. Pulsa **Agregar al recetario** con todo vacío: cada campo muestra su mensaje y el foco va al nombre.
3. Llena todo, pero deja el tiempo en 0: el mensaje sale solo junto al tiempo. Corrígelo y borra el nombre: el mensaje sale junto al nombre.
4. Con todo bien y sin sesión, pulsa **Agregar al recetario**: no se publica y se señala el aviso.
5. Entra con el usuario de prueba y vuelve a Publicar: el aviso ya no aparece y la receta se publica y abre su detalle.

Mis recetas, editar y borrar:

1. Entra con el usuario de prueba. En Acceso, debajo del saludo, dice "Todavía no has publicado recetas" con un enlace para publicar. Las tres recetas de ejemplo no aparecen.
2. Publica una receta y vuelve a Acceso: aparece en la lista, y su nombre lleva a su detalle.
3. Pulsa **Editar**: se abre el formulario lleno, con el título "Editar receta" y el botón "Guardar cambios". Cambia el tiempo y guarda: el detalle muestra el tiempo nuevo.
4. Abre `#/publicar/1` (una receta de ejemplo): dice "Solo quien publicó la receta puede editarla." Abre `#/publicar/999`: dice que no se encontró.
5. Abre **Publicar** desde el menú: el formulario está vacío para una receta nueva.
6. En Acceso, pulsa **Borrar** y cancela: no pasa nada. Pulsa de nuevo y acepta: desaparece de la lista y de la galería.

## 5. Qué falta o qué limitaciones tiene

- No hay "olvidé mi contraseña", porque la API no lo tiene.
- Con los datos de prueba, las cuentas se guardan solo en el navegador. Con la API real se guardan en la base de datos.
