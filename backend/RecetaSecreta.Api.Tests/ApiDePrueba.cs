using System.Security.Cryptography;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using RecetaSecreta.Api.Data;

namespace RecetaSecreta.Api.Tests;

// Levanta la API completa en memoria, sin abrir un puerto: las peticiones van directo a ella.
// Usa su propia base (receta_secreta_pruebas) en el mismo PostgreSQL de Docker, así las pruebas
// nunca tocan los datos de desarrollo. La base se borra y se crea de nuevo en cada corrida.
public class ApiDePrueba : WebApplicationFactory<Program>
{
    // Se puede cambiar con la variable de entorno RECETA_PRUEBAS_DB.
    private static readonly string Conexion = Environment.GetEnvironmentVariable("RECETA_PRUEBAS_DB")
        ?? "Host=localhost;Port=5432;Database=receta_secreta_pruebas;Username=receta;Password=receta_dev";

    public ApiDePrueba()
    {
        using var db = new RecetaDbContext(new DbContextOptionsBuilder<RecetaDbContext>().UseNpgsql(Conexion).Options);
        db.Database.EnsureDeleted();
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        // En Development la API aplica las migraciones y siembra las recetas de ejemplo al arrancar.
        builder.UseEnvironment("Development");
        builder.UseSetting("ConnectionStrings:RecetaDb", Conexion);
        // Una clave nueva en cada corrida: las pruebas no dependen de los user-secrets de nadie.
        builder.UseSetting("Jwt:Clave", Convert.ToBase64String(RandomNumberGenerator.GetBytes(64)));
        builder.UseSetting("Logging:LogLevel:Default", "Warning");
    }
}

// Todas las clases con [Collection("Api")] comparten una sola API y una sola base, y corren una tras otra.
[CollectionDefinition("Api")]
public class ColeccionApi : ICollectionFixture<ApiDePrueba>;
