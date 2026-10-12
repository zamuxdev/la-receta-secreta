using System.Text.Json;
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
builder.Services.AddControllers().ConfigureApiBehaviorOptions(opciones =>
{
    // Los errores de validación automática usan las mismas claves en camelCase
    // que el resto de la API (por ejemplo "tiempo" y no "Tiempo").
    opciones.InvalidModelStateResponseFactory = contexto =>
    {
        var errores = contexto.ModelState
            .Where(campo => campo.Value?.Errors.Count > 0)
            .ToDictionary(
                campo => JsonNamingPolicy.CamelCase.ConvertName(campo.Key),
                campo => campo.Value!.Errors.Select(error => error.ErrorMessage).ToArray());
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
    politica => politica.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod()));

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
