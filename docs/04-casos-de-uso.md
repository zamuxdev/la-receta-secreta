# 4. Casos de uso

Describen las interacciones principales de los perfiles de usuario con el sistema. El administrador no aparece porque es un rol propuesto para una versión posterior (ver [02-alcance-y-usuarios.md](02-alcance-y-usuarios.md#administrador)).

## Actores

1. **Visitante (usuario anónimo).** Entra sin iniciar sesión. Puede ver la página de bienvenida, explorar la galería y buscar recetas por ingredientes o categorías.
2. **Usuario registrado.** Miembro con cuenta activa. Hace todo lo que hace un visitante y además crea y sube recetas, guarda favoritos y califica con estrellas.

## CU-01: Consultar y buscar recetas

- **Actor principal:** visitante / usuario registrado.
- **Descripción:** el usuario explora el recetario para encontrar platillos de su interés.
- **Flujo principal:**
  1. El usuario ingresa a la página principal (galería de recetas).
  2. El sistema muestra las recetas más recientes o populares.
  3. El usuario busca por ingrediente o filtra por categoría (Desayuno, Comida, Cena o Postre), o combina las dos.
  4. El sistema procesa la solicitud mediante la API y actualiza la interfaz con las fichas coincidentes (foto, ingredientes principales y tiempo de preparación).
  5. El usuario abre una receta para ver los pasos completos.

## CU-02: Registrarse e iniciar sesión

- **Actor principal:** visitante.
- **Descripción:** crear una cuenta, o acceder a una existente, para usar las funciones de interacción.
- **Flujo principal:**
  1. El usuario elige registrarse e indica nombre, correo y contraseña.
  2. El sistema valida que el correo no esté registrado y guarda las credenciales de forma segura.
  3. El usuario ingresa sus datos en el formulario de inicio de sesión.
  4. El sistema autentica las credenciales y genera un token de sesión, con lo que se habilita el acceso personalizado.

## CU-03: Publicar nueva receta

- **Actor principal:** usuario registrado.
- **Descripción:** el usuario comparte su receta con la comunidad.
- **Flujo principal:**
  1. El usuario autenticado abre el formulario de publicación.
  2. Ingresa título, descripción, categoría, tiempo estimado, ingredientes y pasos, y adjunta una fotografía.
  3. El sistema valida que los campos obligatorios estén completos y que el formato sea correcto.
  4. El usuario confirma el envío.
  5. El sistema guarda la receta en la base de datos, la asocia con su autor y la publica de inmediato en la galería.

## CU-04: Guardar en favoritos

- **Actor principal:** usuario registrado.
- **Descripción:** marcar recetas para consultarlas después.
- **Flujo principal:**
  1. Mientras navega o ve el detalle de una receta, el usuario identifica un platillo de su interés.
  2. Hace clic en "Guardar en favoritos" (corazón o marcador).
  3. El sistema registra la asociación entre el usuario y la receta.
  4. El ícono cambia de estado para mostrar que la receta ya está guardada.

## CU-05: Calificar recetas

- **Actor principal:** usuario registrado.
- **Descripción:** emitir una valoración numérica o por estrellas basada en su experiencia.
- **Flujo principal:**
  1. El usuario abre el detalle de una receta publicada por otro miembro.
  2. Elige una calificación de 1 a 5 estrellas.
  3. El sistema guarda el voto (si ya había calificado, reemplaza el anterior) y recalcula el promedio de la receta.
  4. La interfaz muestra el nuevo promedio.
- **Excepciones:** un usuario no puede calificar sus propias recetas, y sin sesión se le pide iniciarla.

## CU-06: Administrar mis recetas

- **Actor principal:** usuario registrado.
- **Descripción:** el usuario corrige o elimina las recetas que publicó (RF-14).
- **Flujo principal:**
  1. El usuario consulta la lista de recetas que ha publicado.
  2. Elige una y la edita, o la borra.
  3. El sistema comprueba que la receta sea suya. Si no lo es, rechaza la operación.
  4. Al editar, el sistema valida los datos igual que al publicar y conserva las calificaciones y favoritos que tenía. Al borrar, elimina también sus favoritos y calificaciones.
  5. La interfaz muestra la receta actualizada, o deja de mostrarla si se borró.
