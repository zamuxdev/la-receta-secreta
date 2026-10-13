using System.Text.Json;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using RecetaSecreta.Api.Data;
using RecetaSecreta.Api.Models;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<RecetaDbContext>(opciones =>
    opciones.UseNpgsql(builder.Configuration.GetConnectionString("RecetaDb")));
builder.Services.AddControllers(opciones =>
{
    // Mensajes en español cuando un valor de la URL no se puede convertir (por ejemplo ?limite=abc).
    var mensajes = opciones.ModelBindingMessageProvider;
    mensajes.SetAttemptedValueIsInvalidAccessor((valor, _) => $"El valor '{valor}' no es válido.");
    mensajes.SetNonPropertyAttemptedValueIsInvalidAccessor(valor => $"El valor '{valor}' no es válido.");
    mensajes.SetValueMustBeANumberAccessor(_ => "Debe ser un número.");
    mensajes.SetNonPropertyValueMustBeANumberAccessor(() => "Debe ser un número.");
    mensajes.SetValueMustNotBeNullAccessor(_ => "Este dato es obligatorio.");
    mensajes.SetMissingKeyOrValueAccessor(() => "Este dato es obligatorio.");
}).ConfigureApiBehaviorOptions(opciones =>
{
    // Los errores de validación automática usan las mismas claves en camelCase
    // que el resto de la API (por ejemplo "tiempo" y no "Tiempo").
    opciones.InvalidModelStateResponseFactory = contexto =>
    {
        var errores = new Dictionary<string, string[]>();
        // La clave "" aparece cuando la petición llegó sin cuerpo.
        var jsonIlegible = contexto.ModelState.Keys.Any(clave => clave.Length == 0 || clave.StartsWith('$'));
        foreach (var (clave, estado) in contexto.ModelState)
        {
            if (estado.Errors.Count == 0)
                continue;

            if (clave.Length == 0)
            {
                errores["cuerpo"] = ["Faltan los datos de la petición."];
            }
            else if (clave.StartsWith('$'))
            {
                // "$.puntos" o "$.ingredientes[0]": el JSON trae un valor del tipo equivocado,
                // como 4.5 donde va un entero. El mensaje de .NET viene en inglés y con detalles internos.
                var campo = Regex.Match(clave, @"^\$\.?([^.\[]*)").Groups[1].Value;
                if (campo.Length == 0)
                    errores["cuerpo"] = ["El cuerpo de la petición no es un JSON válido."];
                else
                    errores[JsonNamingPolicy.CamelCase.ConvertName(campo)] = ["El valor no tiene el formato correcto."];
            }
            else if (jsonIlegible && !clave.Contains('.') && estado.Errors.All(e => e.ErrorMessage.EndsWith("field is required.")))
            {
                // Cuando el JSON no se pudo leer, .NET además reporta el parámetro completo
                // ("datos") como faltante. Ese error sobra: el campo culpable ya está arriba.
                continue;
            }
            else
            {
                errores[JsonNamingPolicy.CamelCase.ConvertName(clave)] = estado.Errors.Select(e => e.ErrorMessage).ToArray();
            }
        }
        return new BadRequestObjectResult(new ValidationProblemDetails(errores));
    };
});
builder.Services.AddOpenApi();
builder.Services.AddScoped<IPasswordHasher<Usuario>, PasswordHasher<Usuario>>();

// Sin la clave no se pueden firmar ni validar tokens: mejor fallar al arrancar con un mensaje claro.
var jwt = builder.Configuration.GetSection("Jwt");
var claveJwt = jwt["Clave"] ?? throw new InvalidOperationException(
    "Falta la clave Jwt:Clave. Créala con: dotnet user-secrets set \"Jwt:Clave\" \"<texto en base64>\" --project backend/RecetaSecreta.Api");

// Revisa la cabecera "Authorization: Bearer <token>" de cada petición. Si el token es válido,
// llena User con sus datos; los endpoints con [Authorize] responden 401 si no lo es.
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(opciones =>
    {
        // Conserva los nombres del token ("sub", "role") en lugar de cambiarlos por los largos de .NET.
        opciones.MapInboundClaims = false;
        opciones.TokenValidationParameters = new TokenValidationParameters
        {
            ValidIssuer = jwt["Emisor"],
            ValidAudience = jwt["Audiencia"],
            IssuerSigningKey = new SymmetricSecurityKey(Convert.FromBase64String(claveJwt)),
            NameClaimType = "name",
            RoleClaimType = "role",
        };
    });

// La interfaz estática corre en otro origen durante el desarrollo.
builder.Services.AddCors(opciones => opciones.AddPolicy("Desarrollo",
    politica => politica.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod()
        // Sin esto, el navegador no deja que la interfaz lea el nombre del archivo exportado.
        .WithExposedHeaders("Content-Disposition")));

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseCors("Desarrollo");

    // En desarrollo la base se crea, se actualiza y recibe recetas de ejemplo al arrancar.
    using var alcance = app.Services.CreateScope();
    var db = alcance.ServiceProvider.GetRequiredService<RecetaDbContext>();
    db.Database.Migrate();
    DatosIniciales.Sembrar(db);
}

// Primero se identifica quién llama (autenticación) y luego se revisa si puede entrar (autorización).
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
