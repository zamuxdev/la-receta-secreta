# 10. Contrato de la API

Este documento es el acuerdo entre la interfaz y el backend: qué se pide, qué se responde y quién puede hacerlo. La interfaz se construye contra este contrato y el backend lo cumple.

**Reglas de trabajo**

- Si un endpoint cambia, primero se cambia este documento y después el código.
- Cada endpoint tiene un estado:
  - **Implementado:** ya existe en el backend y está probado.
  - **Propuesto:** se acordó la forma, pero todavía no existe. La interfaz puede usar datos de prueba con la misma estructura.
- Los puntos marcados como **Por decidir** se resuelven antes de programarse.

## 10.1 Convenciones generales

| Tema | Regla |
|---|---|
| URL base (desarrollo) | `http://localhost:5166` |
| Prefijo | Todas las rutas empiezan con `/api` |
| Formato | JSON, con codificación UTF-8 y `Content-Type: application/json` |
| Nombres de campos | `camelCase` (`totalCalificaciones`, no `TotalCalificaciones`) |
| Sesión | Cabecera `Authorization: Bearer <token>`, con el token que entrega el inicio de sesión |
| Identificadores | Números enteros (`id`) |
| Fechas | Texto ISO 8601 en UTC (`2026-10-09T16:35:16Z`) |

### Códigos de respuesta

| Código | Cuándo |
|---|---|
| 200 | La operación salió bien y se devuelve un resultado |
| 201 | Se creó algo; se devuelve lo creado |
| 204 | Salió bien y no hay nada que devolver |
| 400 | Los datos enviados no son válidos |
| 401 | Falta la sesión, o el token no es válido o venció |
| 403 | Hay sesión, pero no tiene permiso para esto |
| 404 | No existe lo que se pide |
| 409 | Choca con algo existente (por ejemplo un correo ya registrado) |

### Formato de los errores

Los errores 400 devuelven este formato estándar. La interfaz muestra al usuario los mensajes de `errors`, que ya vienen en español:

```json
{
  "title": "One or more validation errors occurred.",
  "status": 400,
  "errors": {
    "tiempo": ["El tiempo debe estar entre 1 y 1440 minutos."],
    "categoria": ["La categoría debe ser Desayuno, Comida, Cena o Postre."]
  }
}
```

- Cada clave de `errors` es el nombre del campo en `camelCase`, igual que en los datos que se envían. Así la interfaz puede mostrar cada mensaje junto a su campo.
- Cada clave trae una lista de mensajes.
- `title` es un texto técnico y la interfaz no debe mostrarlo. Lo que se muestra son los mensajes de `errors`.
- Esto aplica tanto a las validaciones automáticas (rangos, campos obligatorios, longitudes) como a las reglas del negocio (por ejemplo, una categoría que no existe).
- Si un campo trae un valor del tipo equivocado (por ejemplo `"puntos": 4.5` o `"tiempo": "mucho"`), su mensaje es "El valor no tiene el formato correcto.". Si la petición llega sin cuerpo o el JSON no se puede leer, el error viene en la clave `cuerpo`.
- Un error que no es de un campo puede traer `detail` con un mensaje en español listo para mostrar (por ejemplo el 401 del inicio de sesión). Si no trae `errors` ni `detail`, la interfaz muestra un mensaje general según el código.

## 10.2 Formas de los datos

### RecetaResumen

Se usa en listados y tarjetas.

```json
{
  "id": 1,
  "nombre": "Tacos de frijol con aguacate",
  "descripcion": "Una comida rápida para esos días con poco tiempo.",
  "categoria": "Comida",
  "tiempo": 15,
  "porciones": 2,
  "foto": "fotos/tacos.jpg",
  "promedio": 4.5,
  "totalCalificaciones": 2
}
```

`promedio` es `null` cuando la receta no tiene calificaciones. `foto` es `null` cuando no tiene.

### RecetaDetalle

Incluye todo lo de `RecetaResumen` más los ingredientes y los pasos.

```json
{
  "id": 1,
  "nombre": "Tacos de frijol con aguacate",
  "descripcion": "Una comida rápida para esos días con poco tiempo.",
  "categoria": "Comida",
  "tiempo": 15,
  "porciones": 2,
  "foto": "fotos/tacos.jpg",
  "ingredientes": ["6 tortillas de maíz", "1 taza de frijoles cocidos", "1 aguacate", "Salsa al gusto"],
  "pasos": ["Calienta los frijoles en una sartén.", "Calienta las tortillas por ambos lados.", "Rellena con frijoles, agrega aguacate y termina con salsa."],
  "promedio": null,
  "totalCalificaciones": 0,
  "autor": "Alex",
  "esMia": false,
  "miCalificacion": null
}
```

- `autor`: nombre del usuario que la publicó, o `null` en las recetas de ejemplo, que no tienen autor.
- `esMia`: `true` si la receta es del usuario con sesión (siempre `false` sin sesión). Sirve para mostrar editar y borrar, y para ocultar el control de calificar.
- `miCalificacion`: la puntuación del usuario con sesión, o `null` si no ha calificado (o no hay sesión).

`GET /api/recetas/{id}` es público. Si la petición trae un token válido, se usa para llenar `esMia` y `miCalificacion`.

### RecetaCrear

Lo que se envía al publicar o editar. Son los mismos campos que el JSON que exporta e importa la pantalla "Publicar".

```json
{
  "nombre": "Arroz con leche",
  "descripcion": "Postre clásico",
  "categoria": "Postre",
  "tiempo": 40,
  "porciones": 4,
  "ingredientes": ["1 taza de arroz", "1 litro de leche"],
  "pasos": ["Cocina el arroz", "Agrega la leche"],
  "foto": null
}
```

| Campo | Tipo | Reglas |
|---|---|---|
| `nombre` | texto | Obligatorio, hasta 100 caracteres |
| `descripcion` | texto | Obligatorio, hasta 350 caracteres |
| `categoria` | texto | Obligatorio: `Desayuno`, `Comida`, `Cena` o `Postre` |
| `tiempo` | entero | De 1 a 1440 (minutos) |
| `porciones` | entero | De 1 a 100 |
| `ingredientes` | lista de textos | Al menos uno; los textos vacíos se descartan |
| `pasos` | lista de textos | Al menos uno; los textos vacíos se descartan |
| `foto` | texto o `null` | Opcional. Una ruta de las fotos incluidas (`fotos/tacos.jpg`, `fotos/avena.jpg`, `fotos/ensalada.jpg`), o una imagen en formato `data:image/...;base64,` en JPG, PNG o WebP, de máximo 2 MB. El servidor decodifica la imagen y revisa que su contenido sea del formato que dice |

### Usuario

```json
{ "id": 7, "nombre": "Alex", "correo": "alex@correo.com", "rol": "Usuario" }
```

## 10.3 Recetas

| Método y ruta | Quién | Estado |
|---|---|---|
| `GET /api/recetas` | Cualquiera | Implementado |
| `GET /api/recetas/{id}` | Cualquiera | Implementado |
| `POST /api/recetas` | Con sesión | Implementado |
| `GET /api/recetas/mejor-valoradas` | Cualquiera | Implementado |
| `GET /api/recetas/mias` | Con sesión | Implementado |
| `PUT /api/recetas/{id}` | Con sesión, solo el autor | Implementado |
| `DELETE /api/recetas/{id}` | Con sesión, solo el autor | Implementado |

### GET /api/recetas

Devuelve una lista de `RecetaResumen`, de la más nueva a la más antigua.

| Parámetro (opcional) | Qué hace |
|---|---|
| `categoria` | Solo las recetas de esa categoría (`?categoria=Postre`) |
| `ingrediente` | Solo las que tienen un ingrediente que contenga ese texto, sin distinguir mayúsculas (`?ingrediente=aguacate`) |

Se pueden combinar. Si nada coincide, devuelve `[]` y la interfaz muestra el mensaje de "sin resultados" (RF-05).

### GET /api/recetas/{id}

- **200:** `RecetaDetalle`.
- **404:** la receta no existe.

### POST /api/recetas

- **Cuerpo:** `RecetaCrear`.
- **201:** `RecetaDetalle` de la receta creada, con la cabecera `Location` hacia `/api/recetas/{id}`. Su `autor` es el usuario con sesión y `esMia` es `true`.
- **400:** datos no válidos (categoría inexistente, campos fuera de rango, listas vacías). Todos los errores llegan juntos, cada uno en la clave de su campo (`categoria`, `ingredientes`, `pasos`...).
- **401:** sin sesión, o el token no es válido o venció.

El autor se toma del token, no del cuerpo: no se puede publicar a nombre de otra persona.

Mensajes posibles en `errors.foto` (también al editar):

| Mensaje | Cuándo |
|---|---|
| "La foto debe ser JPG, PNG o WebP de hasta 2 MB." | No es una foto incluida ni una data URL de esos tres formatos (por ejemplo un GIF o una URL externa) |
| "La foto no puede pasar de 2 MB." | La imagen decodificada pesa más de 2 MB |
| "La foto no es una imagen válida." | El base64 está dañado |
| "La foto no es una imagen JPG, PNG o WebP válida." | El contenido no coincide con el formato (por ejemplo un JPG enviado como `image/png`) |

### GET /api/recetas/mejor-valoradas

Lista de `RecetaResumen` ordenada por `promedio` de mayor a menor. Si dos empatan, va primero la que tiene más calificaciones, y después la más nueva. Solo incluye recetas con al menos una calificación (si ninguna tiene, devuelve `[]`).

| Parámetro (opcional) | Qué hace |
|---|---|
| `limite` | Cuántas recetas devolver, de 1 a 50 (por defecto 10). Fuera de ese rango responde 400 |

### GET /api/recetas/mias

- **200:** lista de `RecetaResumen` de las recetas del usuario con sesión, de la más nueva a la más antigua (`[]` si no tiene).
- **401:** sin sesión.

### PUT /api/recetas/{id}

- **Cuerpo:** `RecetaCrear` (reemplaza todos los campos, con las mismas reglas que al publicar).
- **200:** `RecetaDetalle` actualizado. Las calificaciones y los favoritos que ya tenía se conservan.
- **400:** datos no válidos.
- **401:** sin sesión.
- **403:** la receta es de otro usuario. Trae `detail`: "Solo quien publicó la receta puede editarla.". Las recetas de ejemplo no tienen autor, así que nadie puede editarlas.
- **404:** no existe.

### DELETE /api/recetas/{id}

- **204:** borrada, junto con sus favoritos y calificaciones.
- **401:** sin sesión.
- **403:** la receta es de otro usuario. Trae `detail`: "Solo quien publicó la receta puede borrarla.".
- **404:** no existe.

## 10.4 Categorías (implementado)

### GET /api/categorias

Cualquiera puede consultarlas. Devuelve las categorías disponibles, ordenadas por `id`. Sirve para llenar el selector del formulario sin dejarlas fijas en la interfaz.

```json
[
  { "id": 1, "nombre": "Desayuno" },
  { "id": 2, "nombre": "Comida" },
  { "id": 3, "nombre": "Cena" },
  { "id": 4, "nombre": "Postre" }
]
```

## 10.5 Usuarios y sesión (implementado)

| Método y ruta | Quién | Qué hace |
|---|---|---|
| `POST /api/auth/registro` | Cualquiera, si el registro está abierto | Crea una cuenta |
| `POST /api/auth/login` | Cualquiera | Inicia sesión y entrega el token |
| `GET /api/auth/yo` | Con sesión | Devuelve el usuario de la sesión |

### POST /api/auth/registro

```json
{ "nombre": "Alex", "correo": "alex@correo.com", "password": "una-contraseña-larga" }
```

| Campo | Reglas |
|---|---|
| `nombre` | Obligatorio, hasta 60 caracteres |
| `correo` | Obligatorio, formato de correo, hasta 254 caracteres, único |
| `password` | Obligatorio, mínimo 8 caracteres. No se exigen otras reglas (mayúsculas, símbolos, etc.) |

- **201:** `Usuario`. No inicia sesión automáticamente.
- **400:** datos no válidos.
- **409:** ya existe una cuenta con ese correo. Usa el mismo formato que el 400, con el mensaje en `errors.correo`.
- **403:** el registro está cerrado. Trae `detail`: "El registro de cuentas está cerrado. Pide tu cuenta a quien administra el sitio.". Pasa en el servidor publicado, donde solo entran las cuentas precargadas.

El registro se abre o se cierra con `Registro:Abierto` en la configuración: abierto en desarrollo (`appsettings.Development.json`) y cerrado en cualquier otro entorno (`appsettings.json`). Las cuentas precargadas salen de la sección `CuentasIniciales` (nombre, correo y contraseña de cada una); la API las crea al arrancar si su correo todavía no existe, con las mismas reglas que el registro. Las contraseñas nunca van en el repositorio: en local se ponen con `dotnet user-secrets` y en el servidor como variables de entorno (`CuentasIniciales__0__Correo`, etc.).

El correo se guarda sin espacios y en minúsculas, así que `Alex@Correo.com` y `alex@correo.com` son la misma cuenta.

### POST /api/auth/login

```json
{ "correo": "alex@correo.com", "password": "una-contraseña-larga" }
```

- **200:**

  ```json
  {
    "token": "eyJhbGciOi...",
    "expiraEn": "2026-10-10T16:35:16Z",
    "usuario": { "id": 7, "nombre": "Alex", "correo": "alex@correo.com", "rol": "Usuario" }
  }
  ```

- **400:** falta el correo o la contraseña.
- **401:** correo o contraseña incorrectos. El mensaje es el mismo en ambos casos, para no revelar qué correos existen, y viene en `detail`:

  ```json
  { "title": "Unauthorized", "status": 401, "detail": "Correo o contraseña incorrectos." }
  ```

La interfaz guarda el token y lo envía en `Authorization: Bearer <token>` en cada petición que requiera sesión. El token dura 24 horas (`Jwt:MinutosDeVida` en `appsettings.json`) y su vencimiento viene en `expiraEn`. Cuando vence, la API responde 401 y se vuelve a pedir inicio de sesión.

### GET /api/auth/yo

- **200:** `Usuario` de la sesión.
- **401:** sin sesión.

## 10.6 Favoritos (implementado)

Todos requieren sesión. Los favoritos son personales: nadie ve ni modifica los de otra persona.

| Método y ruta | Qué hace | Respuesta |
|---|---|---|
| `GET /api/favoritos` | Lista las recetas favoritas del usuario, de la más nueva a la más antigua | 200 con una lista de `RecetaResumen` (`[]` si no tiene) |
| `PUT /api/favoritos/{recetaId}` | Agrega la receta a favoritos | 204; si ya estaba, también 204 |
| `DELETE /api/favoritos/{recetaId}` | La quita de favoritos | 204; si no estaba, también 204 |

`PUT` y `DELETE` son **idempotentes**: repetirlos no produce errores ni duplicados. Si `recetaId` no existe responden 404. Sin sesión, los tres responden 401.

## 10.7 Calificaciones (implementado)

Requieren sesión. Cada usuario tiene como máximo una calificación por receta (RF-20): calificar de nuevo reemplaza la anterior. **Un usuario no puede calificar sus propias recetas**, solo las de otros miembros (CU-05).

| Método y ruta | Qué hace |
|---|---|
| `PUT /api/recetas/{id}/calificacion` | Crea o reemplaza la calificación del usuario |
| `DELETE /api/recetas/{id}/calificacion` | Quita la calificación del usuario |

### PUT /api/recetas/{id}/calificacion

```json
{ "puntos": 5 }
```

- **200:** el estado actualizado de la receta, para refrescar la interfaz sin otra petición.

  ```json
  { "promedio": 4.5, "totalCalificaciones": 2, "miCalificacion": 5 }
  ```

- **400:** `puntos` no es un entero del 1 al 5.
- **401:** sin sesión.
- **403:** la receta es del propio usuario. Trae `detail`: "No puedes calificar tus propias recetas.".
- **404:** la receta no existe.

`DELETE` devuelve el mismo objeto con los valores actualizados (`miCalificacion` en `null`). Es idempotente: si el usuario no había calificado, responde 200 igual. Responde 404 si la receta no existe.

`promedio` no viene redondeado (por ejemplo `3.6666666666666665`): la interfaz decide cuántos decimales mostrar. Es `null` si nadie ha calificado.

Para que la interfaz oculte o deshabilite el control de calificar en las recetas propias, `RecetaDetalle` incluye `esMia` (ver sección 10.2).

## 10.8 Exportación (implementado)

Cumple RF-23 (JSON, XML y CSV). La respuesta es un archivo descargable: trae la cabecera `Content-Disposition` con el nombre del archivo, que se arma con el nombre de la receta sin acentos (`arroz-con-leche.xml`).

| Ruta | Qué exporta | Sesión |
|---|---|:---:|
| `GET /api/recetas/{id}/exportar?formato=json` | Una receta en JSON (`formato` es opcional, `json` por defecto) | No |
| `GET /api/recetas/{id}/exportar?formato=xml` | Una receta en XML | No |
| `GET /api/favoritos/exportar` | Los favoritos del usuario en CSV, en el mismo orden que `GET /api/favoritos` | Sí |

- **400:** `formato` no es `json` ni `xml` (mensaje en `errors.formato`).
- **401:** el CSV de favoritos sin sesión.
- **404:** la receta no existe.

En la interfaz se usan con `api.descargarReceta(id, 'xml')` y `api.descargarFavoritos()`, que descargan el archivo en el navegador. Funcionan igual con los datos de prueba.

El JSON tiene los mismos campos que `RecetaCrear` (sin `foto` si no tiene), así que se puede importar en la pantalla Publicar:

```json
{
  "nombre": "Arroz con leche",
  "descripcion": "Postre clásico",
  "categoria": "Postre",
  "tiempo": 40,
  "porciones": 4,
  "ingredientes": ["1 taza de arroz", "1 litro de leche"],
  "pasos": ["Cocina el arroz", "Agrega la leche"]
}
```

El XML tiene los mismos campos (`foto` solo si tiene):

```xml
<?xml version="1.0" encoding="utf-8"?>
<receta>
  <nombre>Arroz con leche</nombre>
  <descripcion>Postre clásico</descripcion>
  <categoria>Postre</categoria>
  <tiempo>40</tiempo>
  <porciones>4</porciones>
  <ingredientes>
    <ingrediente>1 taza de arroz</ingrediente>
    <ingrediente>1 litro de leche</ingrediente>
  </ingredientes>
  <pasos>
    <paso>Cocina el arroz</paso>
    <paso>Agrega la leche</paso>
  </pasos>
</receta>
```

El CSV de favoritos, en UTF-8 con BOM para que Excel muestre bien los acentos:

```csv
Id,Nombre,Categoria,Tiempo,Porciones
1,Tacos de frijol con aguacate,Comida,15,2
```

- Si un texto tiene coma, comillas o saltos de línea, va entre comillas (`"Pozole, rojo"`).
- Si empieza con `=`, `+`, `-` o `@`, se le antepone `'` para que Excel no lo ejecute como fórmula.

Decisión: JSON, XML y CSV se usan así. JSON y XML exportan una receta individual (JSON además es el formato de intercambio de toda la API). CSV exporta los favoritos como tabla.

## 10.9 Resumen de endpoints

| Método | Ruta | Sesión | Estado |
|---|---|:---:|---|
| GET | `/api/recetas` | No | Implementado |
| GET | `/api/recetas/{id}` | No | Implementado |
| POST | `/api/recetas` | Sí | Implementado |
| GET | `/api/recetas/mejor-valoradas` | No | Implementado |
| GET | `/api/recetas/mias` | Sí | Implementado |
| PUT | `/api/recetas/{id}` | Sí | Implementado |
| DELETE | `/api/recetas/{id}` | Sí | Implementado |
| GET | `/api/categorias` | No | Implementado |
| POST | `/api/auth/registro` | No | Implementado |
| POST | `/api/auth/login` | No | Implementado |
| GET | `/api/auth/yo` | Sí | Implementado |
| GET | `/api/favoritos` | Sí | Implementado |
| PUT | `/api/favoritos/{recetaId}` | Sí | Implementado |
| DELETE | `/api/favoritos/{recetaId}` | Sí | Implementado |
| PUT | `/api/recetas/{id}/calificacion` | Sí | Implementado |
| DELETE | `/api/recetas/{id}/calificacion` | Sí | Implementado |
| GET | `/api/recetas/{id}/exportar` | No | Implementado |
| GET | `/api/favoritos/exportar` | Sí | Implementado |


## 10.10 Requisitos cubiertos

| Requisito | Endpoints |
|---|---|
| RF-01, RF-02 | `GET /api/recetas`, `GET /api/recetas/{id}` |
| RF-03, RF-04, RF-05 | `GET /api/recetas` con `ingrediente` y `categoria` |
| RF-06, RF-07, RF-08, RF-09 | `/api/auth/*` y la cabecera `Authorization` |
| RF-10, RF-11, RF-12, RF-13 | `POST /api/recetas` |
| RF-14 | `PUT` y `DELETE /api/recetas/{id}`, `GET /api/recetas/mias` |
| RF-15, RF-16, RF-17 | `/api/favoritos` |
| RF-18, RF-19, RF-20, RF-21 | `/api/recetas/{id}/calificacion` y los campos `promedio` |
| RF-22 | `GET /api/recetas/mejor-valoradas` |
| RF-23 | `/exportar` |
| RF-24 | Formato estándar de errores (sección 10.1) |
