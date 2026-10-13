# La Receta Secreta

Recetario social de cocina: se publican, buscan, guardan y califican recetas. Proyecto del equipo 05 de Programación Web (AEB-1055), 2026-2.

## Partes del proyecto

| Carpeta | Qué tiene |
|---|---|
| [`frontend/`](frontend/) | Interfaz: una sola página (`index.html`) con HTML, CSS y JavaScript, sin frameworks |
| [`backend/`](backend/) | API REST en C# y .NET 10 con PostgreSQL, y sus pruebas automatizadas |
| [`docs/`](docs/) | Documentación del proyecto. El contrato de la API está en [`docs/10-contrato-api.md`](docs/10-contrato-api.md) |

## Cómo correrlo

**Solo la interfaz.** Abre `frontend/index.html` con la extensión *Live Server* de VS Code. Usa datos de prueba que se guardan en el navegador, así que no necesita el backend.

**Con el backend** (necesita Docker y el SDK de .NET 10):

```bash
docker compose up -d
dotnet run --project backend/RecetaSecreta.Api
```

La primera vez hay que crear la clave que firma las sesiones, y para que la interfaz use la API hay que cambiar `USAR_DATOS_DE_PRUEBA` a `false` en `frontend/js/api.js`. Los pasos completos y las pruebas automatizadas están en [`AGENTS.md`](AGENTS.md#9-cómo-correr-el-proyecto).

## Cómo trabajamos

- [`TASKS.md`](TASKS.md): qué le toca a cada persona del equipo.
- [`AGENTS.md`](AGENTS.md): reglas de trabajo (ramas, Pull Requests, archivos de cada módulo) para las personas y los agentes de programación.
