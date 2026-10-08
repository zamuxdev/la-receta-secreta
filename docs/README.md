# Documentación de La Receta Secreta

Recetario social de cocina. Proyecto del equipo 05 de Programación Web (AEB-1055), 2026-2.

Esta carpeta es la fuente de verdad de la documentación. Se edita en Markdown y se versiona junto con el código. El Word o PDF de entrega se genera a partir de estos archivos.

## Índice

| Archivo | Contenido |
|---|---|
| [01-introduccion.md](01-introduccion.md) | Descripción, planteamiento del problema, justificación y objetivos |
| [02-alcance-y-usuarios.md](02-alcance-y-usuarios.md) | Alcance, limitaciones, tipos de usuario y matriz de permisos |
| [03-requisitos.md](03-requisitos.md) | Requerimientos funcionales y no funcionales |
| [04-casos-de-uso.md](04-casos-de-uso.md) | Casos de uso y actores |
| [05-arquitectura.md](05-arquitectura.md) | Arquitectura, flujo del sistema, tecnologías y formatos de datos |
| [06-diseno-interfaz.md](06-diseno-interfaz.md) | Pantallas y justificación de las decisiones de diseño |
| [07-plan-de-trabajo.md](07-plan-de-trabajo.md) | Plan del semestre y entregables por parcial |
| [08-conceptos.md](08-conceptos.md) | Conceptos de aplicaciones web aplicados al proyecto |
| [09-referencias.md](09-referencias.md) | Referencias |

## Estado del proyecto

| Tema | Parcial | Estado |
|---|---|---|
| 1. Introducción a las aplicaciones web | 1 | Documentación en esta carpeta |
| 2. HTML, XML y CSS | 1 | Interfaz estática en la raíz del repo (galería, fichas y formulario) |
| 3. Programación del lado del cliente | 2 | Pendiente (búsqueda, calificación, favoritos) |
| 4. Programación del lado del servidor | 2 | Pendiente |
| 5. Cómputo en la nube y servicios | 3 | Pendiente |

## Puntos por decidir

- **Cómo se construye el frontend.** Vistas Razor del servidor o SPA que consume la API REST. Hoy la interfaz es una SPA estática con HTML, CSS y JavaScript. Ver [05-arquitectura.md](05-arquitectura.md).
- **XML.** Qué función concreta tendrá dentro de la aplicación (exportar recetas, feed RSS u otra). La interfaz actual exporta e importa JSON.
- **Requisitos opcionales.** Marcar cuáles requisitos no funcionales son obligatorios y cuáles opcionales para el tiempo del semestre.
- **Rol de administrador.** Solo se incluirá si forma parte de la versión final.
- **Figma.** Agregar capturas de las pantallas diseñadas a [06-diseno-interfaz.md](06-diseno-interfaz.md).
