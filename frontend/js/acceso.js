// Módulo Acceso. Responsable: Yaret Juárez.
// Reglas de trabajo en AGENTS.md. Datos y endpoints en docs/10-contrato-api.md.
// También le corresponde conectar el formulario de publicar (js/publicar.js) con las reglas de sesión.
//
// Qué construir:
//   - La pantalla "Acceso" (#/acceso): iniciar sesión con api.iniciarSesion(correo, password).
//   - La pantalla "Crear cuenta" (#/registro): api.registrar({ nombre, correo, password }).
//     La contraseña debe tener al menos 8 caracteres.
//   - Mostrar quién tiene la sesión iniciada y un botón para cerrarla (api.cerrarSesion()).
//   - Mostrar los errores por campo que traiga error.errores, con error.textoParaUsuario() como apoyo.
//
// Pista: en modo de prueba hay un usuario demo; sus datos están al inicio de js/api-prueba.js.
// El evento 'sesion-cambiada' avisa cuando alguien inicia o cierra sesión.

(() => {
  document.addEventListener('pantalla-mostrada', (evento) => {
    if (evento.detail.id !== 'acceso' && evento.detail.id !== 'registro') return;
    // TODO: preparar los formularios de acceso y de registro.
  });

  document.addEventListener('sesion-cambiada', () => {
    // TODO: actualizar lo que se muestra según haya sesión o no.
  });
})();
