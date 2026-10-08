# 2. Alcance y tipos de usuario

## 2.1 Alcance funcional

La aplicación contempla:

- **Catálogo de recetas:** presentación de las recetas disponibles.
- **Detalle de receta:** nombre, imagen, ingredientes, preparación, tiempo y tipo de comida.
- **Búsqueda:** por ingredientes o tipo de comida.
- **Publicación:** creación de recetas por usuarios registrados.
- **Favoritos:** recetas de interés de cada usuario.
- **Calificaciones:** valoración de recetas y cálculo de resultados.
- **Cuentas de usuario:** necesarias para las funciones que requieren identificación.

Estructura de una receta:

| Dato | Descripción |
|---|---|
| Nombre | Nombre del platillo |
| Imagen | Representación visual de la receta |
| Ingredientes | Lista de ingredientes requeridos |
| Preparación | Pasos para elaborar el platillo |
| Tiempo | Tiempo aproximado de preparación |
| Tipo | Clasificación de la receta |

## 2.2 Alcance técnico

Se usarán C# y .NET como tecnologías principales, con HTML, CSS y JavaScript para la interfaz. Los datos usarán estos formatos:

- **JSON:** intercambio y representación de información estructurada.
- **XML:** representación estructurada y posible intercambio de datos.
- **CSV:** información tabular, importación o exportación.

Cada formato debe tener una función concreta dentro del sistema, sin duplicar información innecesariamente. Las pantallas se diseñan antes en Figma o una herramienta equivalente.

La aplicación debe separar la interfaz, la lógica de aplicación y el manejo de datos. Esto permite modificar una parte sin afectar a las demás. .NET ofrece configuración, inyección de dependencias, autenticación, autorización y registro de eventos.

> Nota: el requisito se menciona como ".NET Core", pero desde .NET 5 la plataforma se llama simplemente .NET. La versión concreta se fija en la etapa de implementación.

## 2.3 Despliegue

Se contempla pasar de un entorno local a la nube, manteniendo separadas la configuración, la aplicación y el almacenamiento. El despliegue es una etapa posterior (parcial 3). No todo tiene que estar implementado desde el primer parcial.

## 2.4 Limitaciones

Quedan fuera del alcance inicial:

- aplicación móvil nativa
- pagos o comercio electrónico
- carrito de compras, pedidos o venta de alimentos
- funciones profesionales de nutrición o diagnóstico médico
- inteligencia artificial para recomendar recetas
- moderación automática avanzada con inteligencia artificial
- modelos de aprendizaje automático

Podrían considerarse como ampliaciones futuras.

## 2.5 Resumen del alcance

| Funcionalidad | Alcance |
|---|---|
| Catálogo y detalle | Incluido |
| Publicación de recetas | Incluido |
| Búsqueda | Incluido |
| Favoritos | Incluido |
| Calificaciones | Incluido |
| Usuarios | Incluido |
| JSON / XML / CSV | Incluido |
| Diseño en Figma | Incluido |
| Nube | Etapa posterior |
| Aplicación móvil | Fuera del alcance |
| Pagos / comercio | Fuera del alcance |
| IA avanzada | Fuera del alcance |

## 2.6 Tipos de usuario

### Visitante

Accede sin iniciar sesión. Puede consultar el catálogo, ver el detalle de una receta, buscar y filtrar por tipo de comida. No puede publicar recetas, guardar favoritos ni calificar.

### Usuario registrado

Tiene una cuenta. Además de lo que hace un visitante, puede publicar recetas, guardar y consultar favoritos, calificar y administrar sus propias publicaciones según las reglas del sistema. Es el principal participante de la comunidad.

### Administrador

Rol propuesto para la evolución del sistema. Podría administrar usuarios, gestionar contenido y categorías, atender contenido reportado y supervisar la plataforma. Solo se implementa si forma parte de la versión final.

## 2.7 Matriz de permisos

| Función | Visitante | Usuario | Administrador |
|---|:---:|:---:|:---:|
| Consultar recetas | Sí | Sí | Sí |
| Buscar recetas | Sí | Sí | Sí |
| Ver detalles | Sí | Sí | Sí |
| Publicar receta | No | Sí | Sí |
| Favoritos | No | Sí | Sí |
| Calificar | No | Sí | Sí |
| Administrar publicaciones propias | No | Sí | Sí |
| Administrar usuarios | No | No | Sí* |
| Moderar contenido | No | No | Sí* |

\* Funcionalidad propuesta para una versión posterior.

La separación de funciones aplica el principio de autorización: un visitante no puede ejecutar operaciones que modifiquen información.
