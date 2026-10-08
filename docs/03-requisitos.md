# 3. Requisitos

## 3.1 Requerimientos funcionales

Describen qué debe hacer el sistema. Se redactan de forma verificable para poder usarlos después como base de las pruebas.

### Consulta y búsqueda

- **RF-01.** El sistema deberá mostrar un catálogo de recetas disponibles.
- **RF-02.** El sistema deberá permitir consultar el detalle completo de una receta.
- **RF-03.** El sistema deberá permitir buscar recetas mediante ingredientes.
- **RF-04.** El sistema deberá permitir consultar recetas de acuerdo con su tipo de comida.
- **RF-05.** Cuando una búsqueda no produzca resultados, el sistema deberá informar al usuario de manera clara.

### Usuarios y autenticación

- **RF-06.** El sistema deberá permitir registrar una cuenta de usuario.
- **RF-07.** El sistema deberá permitir iniciar sesión mediante las credenciales correspondientes.
- **RF-08.** El sistema deberá identificar al usuario autenticado para relacionar sus acciones con su cuenta.
- **RF-09.** Las funciones que requieran identidad deberán estar restringidas a usuarios autenticados.

### Publicación de recetas

- **RF-10.** El sistema deberá permitir a los usuarios registrados publicar una receta.
- **RF-11.** El formulario de publicación deberá permitir introducir nombre, imagen, ingredientes, preparación, tiempo y tipo de comida.
- **RF-12.** El sistema deberá validar la información antes de almacenar una nueva receta.
- **RF-13.** Cada receta deberá quedar asociada con el usuario que la publicó.
- **RF-14.** El usuario deberá poder administrar sus propias publicaciones de acuerdo con los permisos definidos.

### Favoritos

- **RF-15.** El sistema deberá permitir agregar una receta a la lista de favoritos.
- **RF-16.** El sistema deberá permitir eliminar una receta de favoritos.
- **RF-17.** El sistema deberá permitir consultar la lista personal de recetas favoritas.

Los favoritos deben estar relacionados con el usuario correspondiente, para que nadie pueda consultar o modificar los de otra persona.

### Calificaciones

- **RF-18.** El sistema deberá permitir que un usuario registrado califique una receta.
- **RF-19.** El sistema deberá relacionar cada calificación con el usuario y la receta correspondiente.
- **RF-20.** El sistema deberá controlar la cantidad de calificaciones que puede registrar un usuario sobre una misma receta, de acuerdo con las reglas definidas para el proyecto.
- **RF-21.** El sistema deberá calcular y mostrar la valoración promedio de las recetas cuando exista información suficiente.
- **RF-22.** El sistema deberá permitir consultar las recetas con las valoraciones más altas.

### Manejo de datos e interfaz

- **RF-23.** El sistema deberá utilizar JSON, XML y CSV en las funciones que correspondan de acuerdo con la arquitectura y necesidades del proyecto.
- **RF-24.** El sistema deberá mostrar mensajes claros cuando una operación se complete correctamente o cuando ocurra un error.
- **RF-25.** El sistema deberá actualizar la interfaz después de operaciones como publicar, guardar en favoritos o registrar una calificación.
- **RF-26.** El sistema deberá almacenar y recuperar correctamente la información de usuarios, recetas, favoritos y calificaciones.
- **RF-27.** La aplicación deberá organizar sus componentes de manera que puedan evolucionar hacia un entorno de despliegue en la nube.

### Relación con las funciones principales

| Función | Requerimientos |
|---|---|
| Consulta de recetas | RF-01, RF-02 |
| Búsqueda | RF-03, RF-04, RF-05 |
| Usuarios | RF-06, RF-07, RF-08, RF-09 |
| Publicación | RF-10, RF-11, RF-12, RF-13, RF-14 |
| Favoritos | RF-15, RF-16, RF-17 |
| Calificaciones | RF-18, RF-19, RF-20, RF-21, RF-22 |
| Datos e interfaz | RF-23, RF-24, RF-25, RF-26 |
| Evolución del sistema | RF-27 |

## 3.2 Requisitos no funcionales

Definen atributos de calidad, restricciones y rendimiento para que la experiencia sea óptima, segura y confiable.

> Pendiente: marcar cuáles son obligatorios y cuáles opcionales para el semestre (ver [README](README.md#puntos-por-decidir)).

### Rendimiento

- **RNF-01. Carga inicial.** La SPA debe cargarse en menos de 2.5 segundos con una conexión de banda ancha estándar.
- **RNF-02. Búsquedas.** Las búsquedas por ingrediente, categoría o título deben devolver resultados en menos de 1.0 segundo, incluso con volúmenes medianos de datos.
- **RNF-03. Imágenes.** Las fotos subidas por los usuarios deben procesarse y comprimirse automáticamente para evitar latencias en la galería.

### Seguridad y privacidad

- **RNF-04. Contraseñas.** No se almacenan en texto plano. Se aplica un algoritmo de hashing robusto (como BCrypt) con sales únicas.
- **RNF-05. Sesiones.** La comunicación entre la SPA y la API REST se autentica con tokens seguros (por ejemplo JWT) con tiempo de expiración definido.
- **RNF-06. Protección de datos.** Todo se transmite por HTTPS. La validación en el servidor debe prevenir inyecciones SQL y XSS al publicar recetas.

### Usabilidad y accesibilidad

- **RNF-07. Diseño adaptable.** La interfaz se adapta a móviles, tabletas y escritorio sin perder información.
- **RNF-08. Claridad visual.** Navegación intuitiva, con jerarquía visual clara y colores cálidos y apetitosos, de modo que cualquier persona pueda publicar o buscar recetas sin capacitación.

### Disponibilidad y confiabilidad

- **RNF-09. Operatividad continua.** El sistema debe estar disponible en la nube de forma permanente (24/7).
- **RNF-10. Errores amigables.** Ante fallas de conexión o del servidor, la aplicación muestra mensajes claros que guían al usuario para reintentar, en lugar de códigos de error crípticos.

### Mantenibilidad y escalabilidad

- **RNF-11. Separación de responsabilidades.** División estricta entre interfaz (SPA), lógica de negocio (API REST) y persistencia (base de datos), para poder hacer cambios modulares.
- **RNF-12. Código documentado.** El código sigue estándares limpios de programación y nomenclatura para facilitar su lectura y mantenimiento.

## 3.3 Consideraciones de calidad

Los requerimientos deben ser claros, verificables y suficientemente específicos para servir de base a las pruebas. Como referencia:

- Especificación de requisitos: ISO/IEC/IEEE 29148.
- Calidad del producto: ISO/IEC 25010.
- Seguridad: OWASP.
- Accesibilidad: WCAG 2.2 del W3C.
