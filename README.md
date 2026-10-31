# La Receta Secreta

Recetario social de cocina: se publican, buscan, guardan y califican recetas. Proyecto del equipo 05 de Programación Web (AEB-1055), 2026-2.

## Partes del proyecto

| Carpeta | Qué tiene |
|---|---|
| [`frontend/`](frontend/) | Interfaz: una sola página (`index.html`) con HTML, CSS y JavaScript, sin frameworks |
| [`backend/`](backend/) | API REST en C# y .NET 10 con PostgreSQL, y sus pruebas automatizadas |
| [`docs/`](docs/) | Documentación del proyecto. El contrato de la API está en [`docs/10-contrato-api.md`](docs/10-contrato-api.md) |

## Cómo correrlo

La interfaz usa la API real (`USAR_DATOS_DE_PRUEBA = false` en `frontend/js/api.js`), así que necesita el backend corriendo.

**Necesitas:** Docker Desktop, el [SDK de .NET 10](https://dotnet.microsoft.com/download/dotnet/10.0) y VS Code con la extensión *Live Server*. No hace falta instalar PostgreSQL: lo levanta Docker.

Todos los comandos se corren desde la carpeta del repositorio.

1. **Levanta la base de datos.** Abre Docker Desktop y corre:

   ```bash
   docker compose up -d
   ```

2. **Solo la primera vez, crea la clave que firma las sesiones.** Se guarda en tu computadora, no en el repositorio. Sin ella la API no arranca. Usa el comando de tu terminal:

   En **PowerShell** (la terminal por defecto de Windows y de VS Code en Windows):

   ```powershell
   $b = New-Object byte[] 64; [Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($b); dotnet user-secrets set "Jwt:Clave" ([Convert]::ToBase64String($b)) --project backend/RecetaSecreta.Api
   ```

   En **Git Bash**, macOS o Linux:

   ```bash
   dotnet user-secrets set "Jwt:Clave" "$(openssl rand -base64 64 | tr -d '\n')" --project backend/RecetaSecreta.Api
   ```

   Debe responder `Successfully saved Jwt:Clave to the secret store.`

3. **Arranca la API:**

   ```bash
   dotnet run --project backend/RecetaSecreta.Api
   ```

   Queda en http://localhost:5166/api/recetas. Al arrancar crea las tablas (aplica las migraciones) y carga los datos de ejemplo, así que no hay que correr nada más. Déjala abierta mientras usas la interfaz.

4. **Abre la interfaz.** En VS Code, clic derecho en `frontend/index.html` y *Open with Live Server*. Se abre en el navegador (por lo general en http://127.0.0.1:5500/frontend/index.html) y debe verse la galería con tres recetas.

**Para empezar de cero** con los datos de ejemplo: `docker compose down -v` y repite los pasos 1 y 3.

**Sin backend:** cambia `USAR_DATOS_DE_PRUEBA` a `true` en `frontend/js/api.js` en tu copia, sin subir ese cambio. Usa datos de prueba que se guardan en el navegador.

### Ver la base de datos

Desde la terminal, sin instalar nada:

```bash
docker compose exec db psql -U receta -d receta_secreta
```

`\dt` lista las tablas y `\q` sale. Los nombres de las tablas llevan mayúsculas, así que van entre comillas dobles: `SELECT * FROM "Recetas";`

Con un programa gráfico (DBeaver, pgAdmin o la extensión *PostgreSQL* de VS Code), conéctate a `localhost`, puerto `5432`, base `receta_secreta`, usuario `receta`, contraseña `receta_dev`. Son credenciales solo de desarrollo, definidas en `docker-compose.yml`.

### Problemas comunes

- **`openssl` no se reconoce:** estás en PowerShell. Usa el comando de PowerShell del paso 2.
- **La API dice que falta `Jwt:Clave`:** no hiciste el paso 2.
- **La API no se conecta a la base:** revisa que Docker Desktop esté abierto y que `docker compose up -d` haya terminado. Si ya tienes otro PostgreSQL instalado en el puerto 5432, detenlo, porque choca con el de Docker.
- **La galería dice que no se pudo cargar:** la API no está corriendo (paso 3).

Las pruebas automatizadas del backend y la revisión del CI están en [`AGENTS.md`](AGENTS.md#9-cómo-correr-el-proyecto).

## Cómo trabajamos

- [`TASKS.md`](TASKS.md): qué le toca a cada persona del equipo.
- [`AGENTS.md`](AGENTS.md): reglas de trabajo (ramas, Pull Requests, archivos de cada módulo) para las personas y los agentes de programación.
