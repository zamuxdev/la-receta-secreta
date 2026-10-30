# Decisiones técnicas: Acceso y publicar

Responsable: Yaret Juárez. Se actualiza en el mismo Pull Request que el código del módulo.

## 1. ¿Qué hace el módulo?

Permite **crear una cuenta**, **entrar** con correo y contraseña, ver **quién tiene la sesión iniciada** ("Hola, [nombre]") y **cerrar sesión**. Si algún dato está mal, el mensaje aparece **debajo del campo** que hay que corregir. Desde Acceso se llega a Crear cuenta y al revés.

Pendiente en este módulo: las reglas de sesión de Publicar (Y6, Y7) y "Mis recetas" con editar y borrar (Y9 a Y11).

## 2. Archivos

| Archivo | Para qué sirve |
|---|---|
| `frontend/js/acceso.js` | La lógica de las pantallas Acceso y Crear cuenta: valida los datos, llama a la API, muestra los errores y el saludo. |
| `frontend/css/acceso.css` | Estilos de los mensajes de error, del recuadro "Hola, [nombre]" y del botón a lo ancho en el celular. |
| `frontend/index.html` (bloques Acceso y Registro) | Los formularios: campos con su `label`, un párrafo de error por campo y el mensaje general con `role="status"`. |

## 3. Decisiones y por qué se tomaron

- **Se valida en el navegador antes de llamar a la API** (correo con formato válido, contraseña de al menos 8 caracteres, nombre de hasta 60). Así la persona ve el error al instante. El servidor vuelve a validar, y si rechaza algo, su mensaje (`error.errores`) también se pone junto al campo, usando las claves `nombre`, `correo` y `password`.
- **El foco va al primer campo con error**, y cada campo está ligado a su mensaje con `aria-describedby` y marcado con `aria-invalid`. Así un lector de pantalla lee el error, y con el teclado se corrige sin buscarlo.
- **El correo repetido (409) se muestra junto al campo de correo**, aunque la respuesta no traiga errores por campo, porque es ahí donde está el problema.
- **Después de crear la cuenta se entra automáticamente.** La API no inicia sesión al registrar, así que `acceso.js` llama a `api.iniciarSesion` con los mismos datos y lleva a Acceso, donde ya se ve "Hola, [nombre]". Esto le ahorra un paso a la persona. Si ese inicio falla, se lleva a Acceso con el correo ya escrito.
- **El botón se desactiva mientras se espera a la API** ("Entrando...", "Creando tu cuenta...") para no enviar el formulario dos veces.
- **La pantalla escucha el evento `sesion-cambiada`**: cuando alguien entra, sale o la sesión vence, el saludo y el formulario se actualizan solos.
- **El nombre del usuario se escribe con `textContent`**, nunca como HTML, para evitar XSS.

## 4. Cómo se prueba

Con Live Server abierto en `frontend/index.html`:

1. Ve a **Acceso** y pulsa **Entrar** sin escribir nada: aparece un mensaje debajo de cada campo.
2. Escribe `demo@recetasecreta.test` con la contraseña `malamala`: aparece "Correo o contraseña incorrectos.".
3. Cambia la contraseña a `demo12345`: aparece "Hola, Usuario demo" y el botón **Cerrar sesión**. Al recargar la página, la sesión sigue.
4. Pulsa **Cerrar sesión**: vuelve el formulario de entrada.
5. Pulsa **Crea una cuenta**. Escribe una contraseña de 3 letras: el mensaje sale debajo de la contraseña.
6. Usa el correo `demo@recetasecreta.test`: aparece "Ya existe una cuenta con ese correo." debajo del correo.
7. Usa un correo nuevo y una contraseña de 8 caracteres: entras solo y ves "Hola, [tu nombre]". Cierra sesión y vuelve a entrar con esa cuenta.
8. Repite con la ventana angosta (modo celular, F12) y usando solo el teclado (Tab y Enter).

## 5. Qué falta o qué limitaciones tiene

- Falta Y6 y Y7 (errores por campo y aviso de sesión en Publicar) y Y9 a Y11 (Mis recetas, editar y borrar).
- No hay "olvidé mi contraseña", porque la API no lo tiene.
- Con los datos de prueba, las cuentas se guardan solo en el navegador. Con la API real se guardan en la base de datos.
