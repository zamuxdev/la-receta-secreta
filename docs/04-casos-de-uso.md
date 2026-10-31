# 4. Casos de uso

Describen las interacciones principales de los perfiles de usuario con el sistema. El administrador no aparece porque es un rol propuesto para una versión posterior (ver [02-alcance-y-usuarios.md](02-alcance-y-usuarios.md#administrador)).

## Actores

1. **Visitante (usuario anónimo).** Entra sin iniciar sesión. Puede ver la página de bienvenida, explorar la galería y buscar recetas por ingredientes o categorías.
2. **Usuario registrado.** Miembro con cuenta activa. Hace todo lo que hace un visitante y además crea y sube recetas, guarda favoritos y califica con estrellas.

## CU-01: Consultar y buscar recetas

- **Actor principal:** visitante / usuario registrado.
- **Descripción:** el usuario explora el recetario para encontrar platillos de su interés.
- **Flujo principal:**
  1. El usuario ingresa a la pantalla Recetas (la galería), desde la página de inicio o el menú.
  2. El sistema muestra todas las recetas, de la más nueva a la más antigua. Las mejor calificadas están en su propia pantalla, "Mejor valoradas".
  3. El usuario busca por ingrediente o filtra por categoría (Desayuno, Comida, Cena o Postre), o combina las dos.
  4. El sistema procesa la solicitud mediante la API y actualiza la interfaz con las fichas coincidentes (foto, nombre, categoría, tiempo, porciones y descripción). Si nada coincide, muestra un mensaje que dice qué se buscó.
  5. El usuario abre una receta para ver los pasos completos.

## CU-02: Registrarse e iniciar sesión

- **Actor principal:** visitante.
- **Descripción:** crear una cuenta, o acceder a una existente, para usar las funciones de interacción.
- **Flujo principal:**
  1. El usuario elige registrarse e indica nombre, correo y contraseña.
  2. El sistema valida que el correo no esté registrado y guarda las credenciales de forma segura.
  3. El usuario ingresa sus datos en el formulario de inicio de sesión.
  4. El sistema autentica las credenciales y genera un token de sesión (dura 24 horas), con lo que se habilita el acceso personalizado.
- **Nota:** después de registrarse, la interfaz inicia sesión sola con los mismos datos, así que el usuario no tiene que repetir los pasos 3 y 4.

## CU-03: Publicar nueva receta

- **Actor principal:** usuario registrado.
- **Descripción:** el usuario comparte su receta con la comunidad.
- **Flujo principal:**
  1. El usuario autenticado abre el formulario de publicación.
  2. Ingresa nombre, descripción, categoría, tiempo estimado, porciones, ingredientes y pasos, y puede adjuntar una fotografía (opcional, JPG, PNG o WebP de hasta 2 MB).
  3. El sistema valida que los campos obligatorios estén completos y que el formato sea correcto.
  4. El usuario confirma el envío.
  5. El sistema guarda la receta en la base de datos, la asocia con su autor y la publica de inmediato en la galería.

## CU-04: Guardar en favoritos

- **Actor principal:** usuario registrado.
- **Descripción:** marcar recetas para consultarlas después.
- **Flujo principal:**
  1. Mientras navega por la galería o ve el detalle de una receta, el usuario identifica un platillo de su interés.
  2. Hace clic en el botón "♡ Guardar en favoritos" de la tarjeta o del detalle.
  3. El sistema registra la asociación entre el usuario y la receta.
  4. El botón cambia a "♥ Quitar de favoritos" para mostrar que la receta ya está guardada.
- **Además:** en la pantalla Favoritos el usuario ve sus recetas guardadas, las quita y las descarga en CSV. Sin sesión se le pide iniciarla.

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
  1. El usuario consulta la lista de recetas que ha publicado ("Mis recetas", en la pantalla Acceso con la sesión iniciada).
  2. Elige una y la edita, o la borra.
  3. El sistema comprueba que la receta sea suya. Si no lo es, rechaza la operación.
  4. Al editar, el sistema valida los datos igual que al publicar y conserva las calificaciones y favoritos que tenía. Al borrar, elimina también sus favoritos y calificaciones.
  5. La interfaz muestra la receta actualizada, o deja de mostrarla si se borró.
