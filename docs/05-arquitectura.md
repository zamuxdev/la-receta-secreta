# 5. Arquitectura

## 5.1 Arquitectura: SPA + API REST + base de datos

Modelo desacoplado en tres capas:

1. **Presentación (frontend, SPA).**
   - Tecnologías: HTML5, CSS3 y JavaScript.
   - Es la interfaz que ve el usuario. Carga una sola página HTML y actualiza el contenido (galería, formularios de publicación, resultados de búsqueda, favoritos) con peticiones asíncronas, sin recargas completas.
2. **Lógica de negocio (backend, API REST).**
   - Tecnologías: C# y .NET.
   - Expone endpoints REST con los verbos HTTP estándar (GET, POST, PUT, DELETE). Valida los datos que llegan de la SPA, gestiona la autenticación, calcula promedios de calificaciones y da formato a las respuestas.
3. **Persistencia (base de datos).**
   - Tecnología: PostgreSQL 17, que en desarrollo corre en Docker (`docker-compose.yml`).
   - Guarda usuarios, recetas (nombre, ingredientes, pasos, tiempos), sus fotos, categorías, favoritos por usuario y calificaciones. La API se comunica con ella mediante consultas estructuradas para mantener la integridad referencial.

> **Decisión:** el frontend es una SPA que consume la API, en lugar de vistas Razor generadas por el servidor. Así la interfaz y el backend se desarrollan por separado y se comunican solo por el contrato ([10-contrato-api.md](10-contrato-api.md)). Ver [06-diseno-interfaz.md](06-diseno-interfaz.md).

## 5.2 Flujo general del sistema

1. **Usuario → interfaz web.** El usuario realiza una acción, como buscar, consultar o publicar una receta.
2. **Interfaz → API REST.** La interfaz envía una solicitud por HTTP/HTTPS (fetch o AJAX).
3. **API → procesamiento.** La API en C# y .NET determina la operación a realizar y valida la información.
4. **API → base de datos.** Si hace falta, consulta o modifica datos.
5. **Base de datos → API.** Devuelve la información solicitada.
6. **API → interfaz.** Responde al cliente, principalmente en JSON.
7. **Interfaz → usuario.** Procesa la respuesta y muestra el resultado.

Ejemplos del flujo:

- **Entrada:** el usuario ve la galería con las recetas destacadas o mejor calificadas.
- **Búsqueda y filtrado:** el cliente pide los resultados de forma asíncrona al backend.
- **Publicación:** el usuario registrado completa el formulario con foto, ingredientes y pasos. El frontend valida los campos y envía un objeto JSON. ASP.NET Core valida la estructura y guarda los datos. La foto viaja dentro del JSON (como data URL) y el servidor revisa su formato real y su tamaño antes de guardarla.
- **Valoración y favoritos:** el servidor actualiza el promedio de la receta y guarda las asociaciones de favoritos del usuario.

## 5.3 Tecnologías

| Tecnología | Función |
|---|---|
| HTML5 | Estructura de las páginas y elementos de la interfaz |
| CSS3 | Diseño visual, distribución y presentación |
| JavaScript | Interactividad, validaciones y comunicación con la API |
| C# | Lógica del servidor, modelos, controladores y validaciones |
| .NET / ASP.NET Core Web API | Plataforma del backend y la API REST: rutas, controladores, inyección de dependencias |
| .NET 10 | Versión de la plataforma |
| Entity Framework Core (Npgsql) | ORM: mapea objetos a las tablas de Usuarios, Recetas, Ingredientes, Categorías, Favoritos y Calificaciones, y crea la base con migraciones |
| `PasswordHasher` y JWT Bearer de ASP.NET Core | Hash de contraseñas, inicio de sesión y control de sesiones con tokens |
| xUnit | Pruebas automatizadas del backend |
| API REST | Comunicación entre interfaz y servidor |
| JSON | Intercambio de información entre cliente y servidor |
| XML | Representación y procesamiento de información estructurada |
| CSV | Manejo y exportación de información tabular |
| PostgreSQL | Almacenamiento persistente |
| Docker | Levantar la base de datos en desarrollo |
| Figma | Diseño y prototipado de las interfaces |
| Azure App Service o AWS Elastic Beanstalk | Despliegue en la nube |

## 5.4 Formatos de datos: JSON, XML y CSV

El proyecto usa tres formatos, cada uno con una función distinta.

### JSON

Es el formato principal entre la interfaz y la API REST. Transporta recetas (título, descripción, tiempo, calificación promedio), ingredientes, favoritos, calificaciones, credenciales y respuestas de estado. En .NET se serializa con `System.Text.Json`, incluido en la plataforma.

```json
{
  "id": 1,
  "nombre": "Tacos de frijol con aguacate",
  "categoria": "Comida",
  "promedio": 4.5
}
```

### XML

Representa información con etiquetas estructuradas. Permite demostrar el manejo de información estructurada e intercambiarla con otros sistemas. En el proyecto se usa para exportar una receta y compartirla con otros sistemas. En .NET se genera con `System.Xml.Linq` y `XmlWriter`.

```xml
<receta>
  <nombre>Tacos de frijol con aguacate</nombre>
  <categoria>Comida</categoria>
</receta>
```

> Decisión: XML se usa para exportar una receta individual (`GET /api/recetas/{id}/exportar?formato=xml`), igual que JSON (`formato=json`). Ver [10-contrato-api.md](10-contrato-api.md#108-exportación-implementado).

### CSV

Representa información en tablas. En el proyecto se usa para exportar la lista de favoritos de un usuario (`GET /api/favoritos/exportar`), que se puede abrir en Excel. Se genera con un `StringBuilder`, sin librerías externas, siguiendo el RFC 4180 (comillas cuando hace falta) y protegiendo las celdas contra fórmulas de Excel.

```csv
Id,Nombre,Categoria,Tiempo,Porciones
1,Tacos de frijol con aguacate,Comida,15,2
```

## 5.5 Justificación de las decisiones técnicas

- **SPA.** Da una navegación dinámica sin recargar la página en cada interacción. Es adecuado cuando el usuario busca, consulta detalles, guarda favoritos y publica contenido.
- **API REST.** Separa la interfaz del servidor: el frontend se encarga de la presentación y la interacción, y el backend de la información y las reglas del sistema. Facilita futuras modificaciones.
- **C# y .NET.** Permiten implementar la lógica de negocio, las validaciones, los servicios y la comunicación con la base de datos, además de una API REST que responda a la interfaz.
- **Base de datos (PostgreSQL).** Conserva de forma permanente usuarios, recetas, ingredientes, favoritos y calificaciones. Se eligió PostgreSQL porque es gratuito y de código abierto, corre igual en Windows, Mac y Linux con Docker, y lo ofrecen los principales servicios de nube para el despliegue del parcial 3.
- **JSON, XML y CSV.** JSON para la comunicación cliente-servidor y para exportar una receta que después se puede importar, XML para exportar una receta a otros sistemas y CSV para exportar los favoritos como tabla.
- **Figma.** Permite revisar distribución y navegación antes de programar, y detectar cambios a tiempo.
- **Separación de componentes.** Interfaz, API y base de datos con responsabilidades propias facilitan el mantenimiento, las pruebas y las funciones futuras.
- **Contraseñas con `PasswordHasher` de ASP.NET Core.** Cumple RNF-04: la contraseña nunca se guarda, solo un hash calculado con PBKDF2 (HMAC-SHA512, 100 000 iteraciones) y una sal aleatoria por usuario. Por la sal, dos personas con la misma contraseña quedan con hashes distintos, y por las iteraciones probar contraseñas por fuerza bruta es lento. Se eligió en lugar de BCrypt porque ya viene incluido en .NET (no agrega dependencias), es el que usa ASP.NET Core Identity y está mantenido por Microsoft. El hash guarda su versión y parámetros, así que si en el futuro se suben las iteraciones, `VerifyHashedPassword` avisa cuándo conviene recalcularlo.
