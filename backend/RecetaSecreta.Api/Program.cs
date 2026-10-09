using Microsoft.EntityFrameworkCore;
using RecetaSecreta.Api.Data;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<RecetaDbContext>(opciones =>
    opciones.UseNpgsql(builder.Configuration.GetConnectionString("RecetaDb")));
builder.Services.AddControllers();
builder.Services.AddOpenApi();

// La interfaz estática corre en otro origen durante el desarrollo.
builder.Services.AddCors(opciones => opciones.AddPolicy("Desarrollo",
    politica => politica.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod()));

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseCors("Desarrollo");

    // En desarrollo la base se crea y actualiza sola al arrancar.
    using var alcance = app.Services.CreateScope();
    alcance.ServiceProvider.GetRequiredService<RecetaDbContext>().Database.Migrate();
}

app.UseAuthorization();
app.MapControllers();

app.Run();
