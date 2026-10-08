# 1. Introducción

## 1.1 Descripción del proyecto

La Receta Secreta, recetario social de cocina, es una aplicación web para crear un espacio digital donde los usuarios compartan, consulten y organicen recetas. Cada receta incluye nombre, ingredientes, procedimiento e imágenes.

La aplicación tiene un enfoque social: los usuarios participan en la creación y valoración del contenido. Las funciones principales son:

- publicar recetas
- buscar por ingredientes o categorías de comida
- guardar recetas en favoritos
- calificar los platillos publicados

Tendrá componentes del lado del cliente y del lado del servidor. El cliente presenta la información y permite la interacción mediante formularios, botones y búsquedas. El servidor procesa solicitudes, valida información y gestiona los datos. Ambos se comunican mediante HTTP, protegido con HTTPS en producción. Al final del semestre se despliega en la nube.

No es solo una página para mostrar recetas. Es una aplicación web dinámica que integra interfaz, interacción con usuarios, procesamiento de información, almacenamiento de datos y servicios en la nube.

**Entregable final:** recetario social funcional y desplegado, donde se publican, buscan, guardan y califican recetas, con documentación técnica y de uso, presentado por el equipo.

## 1.2 Planteamiento del problema

Las recetas se encuentran repartidas entre páginas web, redes sociales y blogs, con estructuras distintas, lo que dificulta encontrar un platillo específico. Además, quien consulta una receta suele querer conservarla, compartir las suyas o conocer la valoración de otros. Si esas funciones no están en un mismo espacio, hay que usar varias herramientas.

Una aplicación así también plantea problemas técnicos. Las recetas deben almacenarse de forma organizada para poder consultarse, modificarse y recuperarse. Las búsquedas, favoritos y calificaciones requieren procesar datos y comunicar el navegador con el servidor.

**Pregunta central:** ¿cómo desarrollar una aplicación web que permita centralizar y organizar recetas de cocina, facilitando su publicación, búsqueda, consulta, almacenamiento y calificación, mediante una arquitectura que integre correctamente el lado del cliente, el lado del servidor, la persistencia de datos y servicios en la nube?

## 1.3 Justificación

- **Social y funcional.** Los usuarios no solo consumen información, también la crean. Publicar permite compartir experiencias culinarias. La búsqueda, los favoritos y la calificación facilitan organizar y consultar el contenido.
- **Tecnológica.** El proyecto aplica estructura de páginas (HTML), presentación (CSS), comportamiento (JavaScript), comunicación cliente-servidor, procesamiento de solicitudes y almacenamiento. Separar responsabilidades facilita la organización y el mantenimiento: el cliente se ocupa de la interacción y el servidor de la validación, las solicitudes y el acceso a datos.
- **Nube.** Según NIST, la computación en la nube da acceso bajo demanda a recursos compartidos y configurables, lo que permite desplegar con mayor disponibilidad.
- **Seguridad.** Una aplicación con participación de usuarios debe proteger y validar los datos que recibe.
- **Académica.** Integra los conocimientos de análisis, diseño, desarrollo, almacenamiento, despliegue y mantenimiento en un producto concreto.

## 1.4 Objetivos

### Objetivo general

Diseñar y desarrollar La Receta Secreta, una aplicación web para la creación, consulta y participación comunitaria en torno a recetas de cocina. Permitirá publicar recetas con información estructurada, buscarlas por distintos criterios, guardarlas en favoritos y calificarlas.

Se desarrollará con C# y .NET, con una arquitectura que separe responsabilidades, manejo de datos en JSON, XML y CSV, y una interfaz diseñada previamente en Figma o una herramienta equivalente. También contempla las condiciones para desplegarla en la nube.

No se busca solo una interfaz visual, sino una solución organizada que considere funcionalidad, validación, seguridad, persistencia, usabilidad y capacidad de evolución.

### Objetivos específicos

| Clave | Objetivo | Descripción |
|---|---|---|
| OE-01 | Diseñar la interfaz | Diseñar en Figma (o equivalente) la página principal, catálogo, detalle de receta, publicación, favoritos y autenticación. |
| OE-02 | Implementar la publicación de recetas | Formulario estructurado con nombre, imagen, ingredientes, preparación, tiempo y tipo de comida, para usuarios registrados. |
| OE-03 | Implementar consulta y búsqueda | Localizar recetas por ingrediente y tipo de comida, con un mensaje cuando no haya coincidencias. |
| OE-04 | Implementar favoritos | Guardar recetas de interés, consultar la colección personal y eliminar recetas de ella. |
| OE-05 | Implementar calificaciones | Registrar valoraciones, obtener promedios y consultar las recetas mejor valoradas. |
| OE-06 | Gestionar la información | Estructura para usuarios, recetas, favoritos y calificaciones que se pueda validar, consultar y actualizar. |
| OE-07 | Considerar seguridad y control de acceso | Restringir publicar, calificar y administrar favoritos a usuarios autenticados y autorizados. |
| OE-08 | Preparar la evolución del sistema | Que la solución pueda pasar del entorno local a un despliegue en la nube. |
