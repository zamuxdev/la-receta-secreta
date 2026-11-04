using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using RecetaSecreta.Api.Dtos;

namespace RecetaSecreta.Api.Tests;

// Atajos que usan todas las pruebas de la API. Cada prueba crea sus propios usuarios
// (con un correo único), así ninguna depende de lo que hizo otra.
public abstract class PruebaDeApi(ApiDePrueba api)
{
    protected const string Password = "una-contrasena-larga";

    protected HttpClient Anonimo() => api.CreateClient();

    // La misma API sobre la misma base, pero con otros valores de configuración (por ejemplo, como en el servidor publicado).
    protected WebApplicationFactory<Program> ApiConConfiguracion(Dictionary<string, string> valores) =>
        api.WithWebHostBuilder(b =>
        {
            foreach (var (clave, valor) in valores)
                b.UseSetting(clave, valor);
        });

    // Registra un usuario nuevo, inicia sesión y devuelve un cliente que ya manda su token.
    protected async Task<HttpClient> UsuarioNuevo(string nombre = "Prueba")
    {
        var correo = $"{Guid.NewGuid():N}@correo.com";
        var cliente = api.CreateClient();
        var registro = await cliente.PostAsJsonAsync("/api/auth/registro", new RegistroCrear(nombre, correo, Password));
        Assert.Equal(HttpStatusCode.Created, registro.StatusCode);

        var login = await cliente.PostAsJsonAsync("/api/auth/login", new LoginCrear(correo, Password));
        var sesion = await login.Content.ReadFromJsonAsync<LoginRespuesta>();
        cliente.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", sesion!.Token);
        return cliente;
    }

    protected static RecetaCrear Receta(string nombre = "Receta de prueba", string? foto = null) =>
        new(nombre, "Una descripción", "Cena", 20, 2, ["1 taza de arroz", "Sal"], ["Cocina el arroz"], foto);

    protected static async Task<RecetaDetalle> Publicar(HttpClient cliente, RecetaCrear? receta = null)
    {
        var respuesta = await cliente.PostAsJsonAsync("/api/recetas", receta ?? Receta());
        Assert.Equal(HttpStatusCode.Created, respuesta.StatusCode);
        return (await respuesta.Content.ReadFromJsonAsync<RecetaDetalle>())!;
    }

    // Una receta de DatosIniciales: no tiene autor, así que cualquiera puede calificarla.
    protected async Task<int> RecetaDeEjemplo()
    {
        var recetas = await Anonimo().GetFromJsonAsync<List<RecetaResumen>>("/api/recetas");
        return recetas!.Single(r => r.Nombre == "Tacos de frijol con aguacate").Id;
    }

    // Los mensajes por campo de un 400 (contrato 10.1).
    protected static async Task<Dictionary<string, string[]>> Errores(HttpResponseMessage respuesta)
    {
        Assert.Equal(HttpStatusCode.BadRequest, respuesta.StatusCode);
        using var json = JsonDocument.Parse(await respuesta.Content.ReadAsStringAsync());
        return json.RootElement.GetProperty("errors").Deserialize<Dictionary<string, string[]>>()!;
    }

    protected static async Task<string?> Detalle(HttpResponseMessage respuesta)
    {
        using var json = JsonDocument.Parse(await respuesta.Content.ReadAsStringAsync());
        return json.RootElement.TryGetProperty("detail", out var detalle) ? detalle.GetString() : null;
    }
}
