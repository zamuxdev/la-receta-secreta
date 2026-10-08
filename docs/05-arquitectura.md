# 5. Arquitectura

## 5.1 Arquitectura tentativa: SPA + API REST + base de datos

Modelo desacoplado en tres capas:

1. **Presentación (frontend, SPA).**
   - Tecnologías: HTML5, CSS3 y JavaScript.
   - Es la interfaz que ve el usuario. Carga una sola página HTML y actualiza el contenido (galería, formularios de publicación, resultados de búsqueda, favoritos) con peticiones asíncronas, sin recargas completas.
2. **Lógica de negocio (backend, API REST).**
   - Tecnologías: C# y .NET.
   - Expone endpoints REST con los verbos HTTP estándar (GET, POST, PUT, DELETE). Valida los datos que llegan de la SPA, gestiona la autenticación, calcula promedios de calificaciones y da formato a las respuestas.
3. **Persistencia (base de datos).**
   - Tecnología: gestor relacional (por ejemplo SQL Server).
   - Guarda usuarios, recetas (título, pasos, tiempos), imágenes asociadas, favoritos por usuario y calificaciones. La API se comunica con ella mediante consultas estructuradas para mantener la integridad referencial.

> **Por decidir:** el frontend puede construirse con vistas Razor del servidor o como SPA que consume la API. Esta documentación asume la segunda opción, que es la que la interfaz actual ya sigue (ver [06-diseno-interfaz.md](06-diseno-interfaz.md)).

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
- **Publicación:** el usuario registrado completa el formulario con foto, ingredientes y pasos. El frontend valida los campos y envía un objeto JSON. ASP.NET Core valida la estructura y guarda los datos, y la foto va al almacenamiento en la nube o en el servidor.
- **Valoración y favoritos:** el servidor actualiza el promedio de la receta y guarda las asociaciones de favoritos del usuario.

## 5.3 Tecnologías

| Tecnología | Función |
|---|---|
| HTML5 | Estructura de las páginas y elementos de la interfaz |
| CSS3 | Diseño visual, distribución y presentación |
| JavaScript | Interactividad, validaciones y comunicación con la API |
| C# | Lógica del servidor, modelos, controladores y validaciones |
| .NET / ASP.NET Core Web API | Plataforma del backend y la API REST: rutas, controladores, inyección de dependencias |
| Entity Framework Core | ORM: mapea objetos a las tablas de Recetas, Ingredientes, Usuarios y Calificaciones |
| ASP.NET Core Identity / JWT | Registro, inicio de sesión y control de sesiones |
| API REST | Comunicación entre interfaz y servidor |
| JSON | Intercambio de información entre cliente y servidor |
| XML | Representación y procesamiento de información estructurada |
| CSV | Manejo y exportación de información tabular |
| Base de datos relacional | Almacenamiento persistente |
| Figma | Diseño y prototipado de las interfaces |
| Azure App Service o AWS Elastic Beanstalk | Despliegue en la nube |

## 5.4 Formatos de datos: JSON, XML y CSV

El proyecto usa tres formatos, cada uno con una función distinta.

### JSON

Es el formato principal entre la interfaz y la API REST. Transporta recetas (título, descripción, tiempo, calificación promedio), ingredientes, favoritos, calificaciones, credenciales y respuestas de estado. En .NET se serializa con `System.Text.Json` o `Newtonsoft.Json`.

```json
{
  "id": 1,
  "nombre": "Enchiladas verdes",
  "tipoComida": "Mexicana",
  "calificacion": 4.8
}
```

### XML

Representa información con etiquetas estructuradas. Permite demostrar el manejo de información estructurada e intercambiarla con otros sistemas. Usos posibles: feeds RSS o sitemap de las recetas, exportación e importación entre plataformas, y archivos de configuración. En .NET se usa `XmlSerializer` (`System.Xml.Serialization`).

```xml
<receta>
  <nombre>Enchiladas verdes</nombre>
  <tipoComida>Mexicana</tipoComida>
</receta>
```

> Pendiente: elegir cuál será el uso concreto de XML en la aplicación.

### CSV

Representa información en tablas. Sirve para exportar reportes (recetas, favoritos, calificaciones) y para cargar catálogos iniciales de ingredientes y categorías. Se procesa con `CsvHelper` o con `StreamWriter` y `StreamReader`.

```csv
ID,Nombre,TipoComida,Calificacion
1,Enchiladas verdes,Mexicana,4.8
2,Pastel de chocolate,Postres,4.6
```

## 5.5 Justificación de las decisiones técnicas

- **SPA.** Da una navegación dinámica sin recargar la página en cada interacción. Es adecuado cuando el usuario busca, consulta detalles, guarda favoritos y publica contenido.
- **API REST.** Separa la interfaz del servidor: el frontend se encarga de la presentación y la interacción, y el backend de la información y las reglas del sistema. Facilita futuras modificaciones.
- **C# y .NET.** Permiten implementar la lógica de negocio, las validaciones, los servicios y la comunicación con la base de datos, además de una API REST que responda a la interfaz.
- **Base de datos.** Conserva de forma permanente usuarios, recetas, ingredientes, favoritos y calificaciones.
- **JSON, XML y CSV.** JSON para la comunicación cliente-servidor, XML como formato adicional para información estructurada y CSV para exportación y reportes.
- **Figma.** Permite revisar distribución y navegación antes de programar, y detectar cambios a tiempo.
- **Separación de componentes.** Interfaz, API y base de datos con responsabilidades propias facilitan el mantenimiento, las pruebas y las funciones futuras.
