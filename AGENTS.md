# AGENTS.md: reglas para trabajar en La Receta Secreta

Este archivo lo leen los agentes de programación (Claude Code, Codex, OpenCode). Sirve para que cinco personas trabajen en paralelo sin pisarse. Si eres un agente, sigue estas reglas y no las cambies por tu cuenta.

## 1. Qué es el proyecto

Recetario social de cocina: se publican, buscan, guardan y califican recetas. Es un proyecto del equipo 05 de Programación Web (AEB-1055). Las personas del equipo casi no saben programar: tú escribes el código, pero ellas deben **entender lo que hacen** y poder explicarlo en la presentación.

- **Interfaz:** `frontend/`. HTML, CSS y JavaScript sin frameworks. Es una página única (`frontend/index.html`) con pantallas que cambian según la URL (`#/recetas`, `#/publicar`...).
- **Backend:** `backend/`. API REST en C# y .NET con PostgreSQL, que corre con Docker. Lo desarrolla Fernando.
- **Documentación:** `docs/`. El archivo que más importa para trabajar es [`docs/10-contrato-api.md`](docs/10-contrato-api.md).

## 2. Cómo trabajar con la persona que te usa

**Modo normal: trabaja con libertad y termina el trabajo.** Es el modo para las cuatro personas que hacen la interfaz. La persona quiere avanzar rápido, no una clase.

1. **Pregunta una sola vez su nombre y su módulo** (sección 4) si no lo sabes. Si no responde o no queda claro, sigue en modo normal. Trabaja en el módulo de esa persona (archivos de la sección 4).
2. **Escribe tú todo el código.** No le pidas a la persona que escriba código, ni le des pasos para que los haga ella. Si una tarea de [`TAREAS.md`](TAREAS.md) se puede terminar, termínala completa.
3. **No pidas confirmación en cada paso.** Decide con criterio y sigue adelante. Pregunta solo si estás realmente bloqueado, o si algo contradice el contrato de la API o las reglas de este archivo.
4. **Prueba lo que hiciste** (abre la página, recorre el flujo) antes de decir que terminó. Si no pudiste probar algo, dilo.
5. **Al terminar, da un "Resumen para defender".** Es lo único que se exige en cuanto a explicar. La persona debe poder contarlo en la presentación, así que escríbelo en lenguaje sencillo, en 4 a 6 líneas:
   - **Qué hace ahora** que antes no hacía, desde el punto de vista de quien usa la web.
   - **Qué archivos tocaste** y para qué sirve cada uno.
   - **Cómo se conecta** con el resto (con qué función de `api`, evento o ranura trabaja).
   - **Qué decisiones tomaste y por qué.**
   - **Cómo probarlo** en el navegador.

   Copia ese mismo resumen en el documento del módulo (`docs/decisiones/<modulo>.md`), dentro del mismo Pull Request. Así queda documentado sin trabajo extra.
6. **Si la persona pregunta cómo o por qué funciona algo, explícalo** con claridad y sin sermones. No conviertas cada tarea en una lección.
7. **Mantén los cambios dentro del trabajo pedido.** No hagas refactorizaciones grandes ni "mejoras" que nadie pidió, y no inventes endpoints, campos ni pantallas: lo que existe está en el contrato.
8. **Nunca ocultes un error.** Si algo no funcionó o no lo pudiste probar, dilo.

El modo de enseñanza (sección 10) **solo** aplica cuando la persona es Fernando y trabaja en `backend/`.

## 3. Reglas de git (obligatorias)

- **Nunca hagas commit ni push directo a `main`.** Cada tarea va en su propia rama.
- Nombre de la rama: `modulo/descripcion-corta`, por ejemplo `favoritos/boton-corazon`.
- Antes de empezar: `git switch main`, `git pull` y luego `git switch -c <rama>`.
- Commits pequeños, con mensaje claro que diga **qué** cambió.
- Al terminar: `git push -u origin <rama>` y abrir un **Pull Request** hacia `main`. Fernando lo revisa y lo une. Nadie une su propio PR.
- **No toques archivos de otro módulo** (sección 4). Si necesitas un cambio ahí, pídelo en el PR o avisa a su responsable.
- Si hay un conflicto de git, **no lo resuelvas a ciegas**: avisa a Fernando.
- No subas contraseñas, tokens ni claves. No subas archivos de `bin/`, `obj/`, `node_modules/` ni PDFs.

## 4. Quién hace qué

Cada persona es dueña de un módulo. Cada módulo tiene sus **propios archivos**, para que casi nunca se editen los mismos. La lista detallada de tareas de cada una, con el orden y cuándo está lista cada una, está en [`TAREAS.md`](TAREAS.md): léela para saber qué le toca a la persona con la que trabajas.

| Módulo | Responsable (sugerido) | Qué construye | Contrato (API) | Requisitos |
|---|---|---|---|---|
| **Búsqueda** | Hazel Martínez | Barra de búsqueda por ingrediente, filtro por categoría (el selector se llena desde la API), mensaje cuando no hay resultados | `GET /api/recetas`, `GET /api/categorias` | RF-03, RF-04, RF-05 |
| **Favoritos** | Brandon Aguilar | Botón de corazón en las fichas y en el detalle, pantalla "Favoritos", quitar de favoritos | `/api/favoritos` | RF-15, RF-16, RF-17 |
| **Calificaciones** | Leilani Muñoz | Estrellas en el detalle de la receta, mostrar el promedio, pantalla "Mejor valoradas" | `/api/recetas/{id}/calificacion`, `GET /api/recetas/mejor-valoradas` | RF-18 a RF-22 |
| **Acceso y publicar** | Yaret Juárez | Registro e inicio de sesión (mostrar quién entró, cerrar sesión) y las reglas de sesión del formulario "Publicar" | `/api/auth/*`, `POST /api/recetas` | RF-06 a RF-13 |
| **Backend y base** | Fernando González | API en .NET, base de datos, cliente de la API, enrutador, catálogo, contrato, revisión de PRs | Todo `backend/` | Todos |

### Archivos de cada módulo (solo edita los tuyos)

| Módulo | Archivos |
|---|---|
| Búsqueda | `frontend/js/busqueda.js`, `frontend/css/busqueda.css`, `docs/decisiones/busqueda.md` |
| Favoritos | `frontend/js/favoritos.js`, `frontend/css/favoritos.css`, `docs/decisiones/favoritos.md` |
| Calificaciones | `frontend/js/calificaciones.js`, `frontend/css/calificaciones.css`, `docs/decisiones/calificaciones.md` |
| Acceso y publicar | `frontend/js/acceso.js`, `frontend/js/publicar.js`, `frontend/css/acceso.css`, `docs/decisiones/acceso-publicar.md` |
| Fernando | `backend/`, `frontend/js/api.js`, `frontend/js/api-prueba.js`, `frontend/js/catalogo.js`, `frontend/js/app.js`, `docs/10-contrato-api.md`, `docker-compose.yml`, este archivo |

### Archivos compartidos (cuidado)

`frontend/index.html` y `frontend/css/estilos.css` los edita más de una persona. Reglas:

- En `index.html`, **solo modifica el bloque de tu pantalla** (cada pantalla tiene un comentario `<!-- Pantalla: ... -->`) y no cambies el orden del resto.
- Las etiquetas `<script>` y `<link>` de cada módulo ya están en `index.html`: **no agregues ni muevas etiquetas**. Si necesitas una librería o archivo nuevo, pídelo a Fernando.
- En `estilos.css` **no agregues estilos**: usa el CSS de tu módulo. Si algo de `estilos.css` debe cambiar, pídelo en el PR.
- No cambies los colores, la tipografía ni las clases existentes. El diseño está justificado en `docs/06-diseno-interfaz.md`.

## 5. El contrato de la API es la fuente de verdad

- La interfaz se construye contra [`docs/10-contrato-api.md`](docs/10-contrato-api.md): rutas, campos y errores.
- **No inventes campos ni endpoints.** Si falta algo, abre un PR que cambie el contrato primero, y Fernando lo aprueba.
- Todas las llamadas al backend pasan por el objeto `api` de `frontend/js/api.js`. **No uses `fetch` directamente en tu módulo.** Lee ese archivo para ver todas las funciones disponibles, por ejemplo `api.listarRecetas({ categoria, ingrediente })`, `api.agregarFavorito(id)`, `api.calificar(id, puntos)` o `api.descargarReceta(id, 'xml')`.
- **Modo de prueba:** mientras `USAR_DATOS_DE_PRUEBA` sea `true` en `api.js`, la interfaz usa datos de prueba que imitan el contrato (`api-prueba.js`) y no necesita el backend. Hay un usuario de prueba cuyos datos están al inicio de `api-prueba.js`. Fernando cambia a `false` cuando el backend tenga lo que necesitas, no lo cambies tú.
- Si una función de `api` falla, lanza un `ErrorApi`. Muestra `error.textoParaUsuario()` al usuario, o los mensajes por campo de `error.errores` (claves en `camelCase`, como los campos del contrato). Revisa `error.estado` para casos como 401 (sin sesión) o 403.
- La sesión la maneja `api`: `api.haySesion()`, `api.usuarioActual()`, `api.iniciarSesion(...)`, `api.cerrarSesion()`.

## 6. Cómo se conectan los módulos

Los módulos no se llaman entre sí ni editan los archivos de otros. Se coordinan con **eventos** (en `document`) y **ranuras** (huecos vacíos en el HTML):

| Evento | Quién lo emite | Qué trae | Para qué |
|---|---|---|---|
| `pantalla-mostrada` | `app.js` | `{ id, parametro }` | Iniciar tu pantalla cuando se abre (por ejemplo `id === 'favoritos'`) |
| `tarjetas-dibujadas` | `catalogo.js` | `{ recetas }` | Agregar botones a cada tarjeta de la galería |
| `receta-mostrada` | `catalogo.js` | `{ receta }` | Agregar cosas al detalle de una receta |
| `sesion-cambiada` | `api.js` | nada | Actualizar lo que depende de si hay sesión |

| Ranura | Dónde está | Quién la usa |
|---|---|---|
| `.tarjeta-acciones` dentro de cada `<article class="tarjeta" data-receta-id="N">` | Galería | Favoritos |
| `#detalle-acciones` | Detalle de receta | Favoritos |
| `#detalle-calificacion` | Detalle de receta | Calificaciones |
| El comentario `Módulo Búsqueda` en la pantalla Recetas | `index.html` | Búsqueda |

- La galería la dibuja `catalogo.js`. Para volver a dibujarla con filtros, llama a `catalogo.cargar({ categoria, ingrediente })`.
- El detalle de una receta es la ruta `#/receta/<id>`. Los enlaces a una receta deben apuntar ahí.
- Las pantallas "Mejor valoradas", "Favoritos" y "Crear cuenta" ya existen vacías en `index.html`: rellena la tuya.
- **Envuelve todo tu archivo JS en `(() => { ... })();`**, como en los archivos de cada módulo. Si no, tus variables chocan con las de otros módulos y se rompe la página.
- Cada archivo `.js` de módulo ya tiene los `TODO` de lo que le toca.

## 7. Reglas de código (interfaz)

- **JavaScript sencillo y sin librerías.** Nada de React, jQuery ni frameworks. No instales paquetes.
- Nombres de variables, funciones y comentarios **en español**, como el código existente. Comentarios cortos que expliquen el porqué.
- **Nunca insertes texto del usuario como HTML** (`innerHTML`). Usa `textContent` o `createElement`. Es una regla de seguridad contra XSS.
- Valida los datos en el cliente **antes** de enviarlos, con mensajes claros, pero recuerda que el servidor también valida.
- **Accesibilidad obligatoria:** cada campo con `label`, cada imagen con `alt`, botones reales (`<button>`) y no `div`, foco visible, mensajes con `role="status"` o `aria-live`. No quites el contorno de foco.
- Que se vea bien en pantalla chica (móvil) y grande. Prueba las dos.
- Mientras algo carga, muestra un mensaje ("Cargando..."). Si falla, muestra un mensaje claro y no dejes la pantalla en blanco.
- No dejes `console.log` de depuración ni código comentado.

## 8. Documentar las decisiones técnicas

El tema 3 pide "documentación de las decisiones técnicas". Cada responsable mantiene **su archivo** en `docs/decisiones/<modulo>.md` (ya existe la plantilla) y lo actualiza en el mismo PR que el código. Debe responder, con palabras simples:

1. ¿Qué hace el módulo?
2. ¿Qué archivos tiene y para qué sirve cada uno?
3. ¿Qué decisiones se tomaron y por qué?
4. ¿Cómo se prueba?
5. ¿Qué falta o qué limitaciones tiene?

## 9. Cómo correr el proyecto

- **Solo la interfaz** (lo normal para los módulos de interfaz): abre la carpeta del proyecto en VS Code, instala la extensión *Live Server*, haz clic derecho en `frontend/index.html` y elige *Open with Live Server*. Con el modo de prueba activado no necesitas nada más.
- **Con el backend real:**
  1. Abre Docker Desktop.
  2. `docker compose up -d`
  3. **Solo la primera vez**, crea la clave que firma las sesiones (se guarda en tu computadora, no en el repositorio). En la terminal de Git Bash: `dotnet user-secrets set "Jwt:Clave" "$(openssl rand -base64 64 | tr -d '\n')" --project backend/RecetaSecreta.Api`. Sin ella la API no arranca y te dice cómo crearla.
  4. `dotnet run --project backend/RecetaSecreta.Api`
  5. La API queda en `http://localhost:5166/api/recetas`. Para que la interfaz la use, `USAR_DATOS_DE_PRUEBA` debe ser `false` en `frontend/js/api.js`.
- Para reiniciar la base con los datos de ejemplo: `docker compose down -v`, y de nuevo los pasos anteriores.
- Los datos del modo de prueba se guardan en el navegador (`localStorage`). Para empezar de cero, borra los datos del sitio o usa una ventana de incógnito.

## 10. Modo enseñanza: solo Fernando, solo en `backend/`

**Esta sección aplica únicamente si la persona es Fernando y el trabajo es en `backend/`.** Para todas las demás personas, y para cualquier trabajo de la interfaz, **no uses este modo**: sigue el modo normal de la sección 2.

Fernando está aprendiendo .NET a propósito. Cuando trabajes en `backend/` con él:

- **Explica cada concepto nuevo** y compáralo con Spring Boot si ayuda (él ya lo conoce).
- **No escribas todo el código de golpe.** Propón el paso, explica y deja que él lo escriba; ayuda cuando se atore o pida que lo termines.
- Si cambias el modelo de datos, genera una **migración nueva** (no edites las anteriores): `dotnet ef migrations add <Nombre> --project backend/RecetaSecreta.Api`.
- Detén la API antes de compilar o generar migraciones, porque bloquea los archivos.
- Los DTOs **no usan entidades**. Las contraseñas **nunca** se guardan en texto plano. Nada de claves en el código.
- Las validaciones devuelven el formato de errores del contrato (sección 10.1), con claves en `camelCase` y mensajes en español.

## 11. Qué NO hacer

- No hagas push a `main`. No borres ramas ni historial. No uses `git push --force`.
- No modifiques `backend/` si no eres Fernando.
- No cambies el contrato de la API sin pasar por un PR aprobado.
- No agregues dependencias ni herramientas nuevas sin preguntar.
- No dejes tareas a medias sin decirlo. Si no terminaste, explica qué falta.
- No hagas cambios fuera de lo que se pidió.

## 12. Estado y orden de trabajo

**Estado actual:**

- Documentación de las unidades 1 y 2 hecha.
- Interfaz con galería y detalle dibujados desde la API (con datos de prueba), formulario de publicar conectado a la API, y el esqueleto de los cuatro módulos.
- Backend con recetas (listar, ver, publicar), categorías (`GET /api/categorias`), datos de ejemplo y autenticación (registro, inicio de sesión con JWT y `yo`). Publicar ya exige sesión y liga la receta a su autor. Favoritos (`/api/favoritos`), calificaciones (`/api/recetas/{id}/calificacion`) y mejor valoradas implementados. Editar, borrar y "mis recetas" implementados. El servidor valida la foto (formato real y tamaño). Exportación en JSON, XML y CSV implementada (`api.descargarReceta`, `api.descargarFavoritos`). Le faltan las pruebas automatizadas.

**Orden:** el **tema 3** (parcial 2) es la interfaz dinámica: búsqueda, calificación y favoritos con validación en el cliente. Cada módulo se desarrolla primero con datos de prueba y se conecta a la API real cuando el backend lo tenga.

> Este archivo lo mantiene Fernando. Si algo aquí no funciona o confunde, avísale en lugar de cambiarlo.
