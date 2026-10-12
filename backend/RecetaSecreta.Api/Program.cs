using System.Text.Json;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
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

app.UseAuthorization();
app.MapControllers();

app.Run();
