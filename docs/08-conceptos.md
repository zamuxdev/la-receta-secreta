# 8. Conceptos de aplicaciones web

El documento original numera 20 apartados, el último es la relación con el proyecto. Aquí se agrega HTTPS como concepto propio.

Cada concepto se relaciona con La Receta Secreta.

| Concepto | Definición | En La Receta Secreta |
|---|---|---|
| **Aplicación web** | Sistema que funciona en un navegador y permite realizar acciones: registrar usuarios, enviar formularios, buscar y almacenar datos. A diferencia de una página informativa, permite interactuar con la información. | Permite publicar, consultar, buscar, guardar y calificar recetas. |
| **Cliente** | Dispositivo y, sobre todo, navegador desde el que se accede. Interpreta los recursos del servidor, muestra la interfaz y envía solicitudes. | La interfaz donde se navega, se busca, se publica y se consultan favoritos. |
| **Servidor** | Recibe y procesa solicitudes de los clientes. Consulta bases de datos, valida datos, gestiona permisos y sesiones, y guarda información. | Procesa recetas, usuarios, favoritos y calificaciones. |
| **Modelo cliente-servidor** | El cliente solicita y el servidor responde, normalmente por HTTP. | Separa la interfaz de los procesos que gestionan la información. |
| **Front-end** | Parte con la que el usuario interactúa. Se construye con HTML (estructura), CSS (presentación) y JavaScript (comportamiento). | Presenta recetas y fotos, ofrece los formularios y las herramientas de búsqueda, guardado y calificación. |
| **Back-end** | Parte que corre en el servidor: lógica de negocio, validación y comunicación con el almacenamiento. | Gestiona las operaciones de recetas, usuarios, favoritos y calificaciones. |
| **Base de datos** | Sistema organizado para almacenar información que se puede consultar y modificar, incluso después de cerrar el navegador. | Guarda usuarios, recetas, ingredientes, categorías, calificaciones y favoritos. |
| **HTTP** | Protocolo de solicitudes y respuestas entre cliente y servidor. GET consulta, POST envía o crea, PUT actualiza y DELETE elimina. | GET para consultar recetas y POST para enviar una receta nueva. |
| **HTTPS** | HTTP cifrado con TLS. Protege la información en tránsito para que no pueda leerse ni modificarse en el camino. | Toda la comunicación entre la interfaz y la API usa HTTPS (RNF-06), sobre todo por las contraseñas y las sesiones. |
| **API** | Mecanismo que permite que componentes de software se comuniquen con reglas definidas. | Comunica la interfaz con los servicios que procesan los datos. |
| **Aplicación web dinámica** | Su contenido cambia según las solicitudes, los datos y las acciones del usuario. | Recetas, calificaciones y favoritos cambian conforme los usuarios participan. |
| **Interfaz de usuario (UI)** | Elementos con los que una persona interactúa. Debe organizar la información con claridad. | Inicio, menú, buscador, categorías, tarjetas, formularios y favoritos. |
| **Experiencia de usuario (UX)** | Percepción al usar el sistema: facilidad, navegación, claridad, accesibilidad y eficiencia. | Encontrar una receta, ver sus pasos y guardarla sin pasos innecesarios. |
| **Diseño responsivo** | La interfaz se adapta a diferentes tamaños de pantalla. | Recetas, imágenes, botones y formularios se ven bien en computadora, teléfono y tableta. |
| **Autenticación y autorización** | Autenticar es comprobar la identidad. Autorizar es decidir qué puede hacer cada usuario. | Un usuario autenticado publica y modifica lo suyo. Un visitante solo consulta. |
| **Validación de datos** | Comprobar que lo que envía el usuario tenga el formato esperado antes de procesarlo o guardarlo. OWASP recomienda validar los datos no confiables lo más pronto posible. | Al publicar, verificar nombre, ingredientes y procedimiento. |
| **Seguridad web** | Medidas para proteger la aplicación, los usuarios y la información: validar entradas, controlar el acceso, proteger sesiones y manejar bien los errores. | Se considera desde el inicio, sobre todo al almacenar cuentas y contenido de la comunidad. |
| **Persistencia de datos** | Conservar la información para recuperarla después, normalmente en una base de datos. | Las recetas, favoritos y calificaciones deben guardarse. |
| **Computación en la nube** | Acceso por red a recursos configurables (servidores, almacenamiento, aplicaciones) bajo demanda, según NIST. | Aloja la aplicación y los servicios para que los usuarios accedan por Internet. |
| **Despliegue web** | Pasar la aplicación del entorno de desarrollo a uno donde la usen los usuarios. | Hace que deje de ser un proyecto local y quede disponible en Internet. |

## Cómo se relacionan

La aplicación usa un front-end para la interfaz y un back-end para procesar solicitudes y administrar la información. Se comunican por HTTP, cifrado con HTTPS. Las recetas, usuarios, favoritos y calificaciones se mantienen con persistencia. Se consideran la validación y la seguridad para evitar que se procese información incorrecta o no autorizada. Los servicios en la nube hacen que la aplicación esté disponible mediante Internet.
