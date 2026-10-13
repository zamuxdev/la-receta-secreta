using System.Net;
using System.Net.Http.Json;
using RecetaSecreta.Api.Dtos;

namespace RecetaSecreta.Api.Tests;

[Collection("Api")]
public class FavoritosPruebas(ApiDePrueba api) : PruebaDeApi(api)
{
    [Fact]
    public async Task Sin_sesion_responde_401()
    {
        var anonimo = Anonimo();

        Assert.Equal(HttpStatusCode.Unauthorized, (await anonimo.GetAsync("/api/favoritos")).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await anonimo.PutAsync("/api/favoritos/1", null)).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await anonimo.DeleteAsync("/api/favoritos/1")).StatusCode);
    }

    [Fact]
    public async Task Agregar_dos_veces_no_duplica()
    {
        var cliente = await UsuarioNuevo();
        var id = await RecetaDeEjemplo();

        Assert.Equal(HttpStatusCode.NoContent, (await cliente.PutAsync($"/api/favoritos/{id}", null)).StatusCode);
        Assert.Equal(HttpStatusCode.NoContent, (await cliente.PutAsync($"/api/favoritos/{id}", null)).StatusCode);

        var favoritos = await cliente.GetFromJsonAsync<List<RecetaResumen>>("/api/favoritos");
        Assert.Equal(id, Assert.Single(favoritos!).Id);
    }

    [Fact]
    public async Task Quitar_dos_veces_responde_204_las_dos()
    {
        var cliente = await UsuarioNuevo();
        var id = await RecetaDeEjemplo();
        await cliente.PutAsync($"/api/favoritos/{id}", null);

        Assert.Equal(HttpStatusCode.NoContent, (await cliente.DeleteAsync($"/api/favoritos/{id}")).StatusCode);
        Assert.Equal(HttpStatusCode.NoContent, (await cliente.DeleteAsync($"/api/favoritos/{id}")).StatusCode);
        Assert.Empty((await cliente.GetFromJsonAsync<List<RecetaResumen>>("/api/favoritos"))!);
    }

    [Fact]
    public async Task Una_receta_que_no_existe_responde_404()
    {
        var cliente = await UsuarioNuevo();

        Assert.Equal(HttpStatusCode.NotFound, (await cliente.PutAsync("/api/favoritos/999999", null)).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await cliente.DeleteAsync("/api/favoritos/999999")).StatusCode);
    }

    [Fact]
    public async Task Cada_quien_ve_y_quita_solo_los_suyos()
    {
        var ana = await UsuarioNuevo();
        var beto = await UsuarioNuevo();
        var id = await RecetaDeEjemplo();
        await ana.PutAsync($"/api/favoritos/{id}", null);

        // Beto no ve el favorito de Ana, y "quitarlo" no le afecta a ella.
        Assert.Empty((await beto.GetFromJsonAsync<List<RecetaResumen>>("/api/favoritos"))!);
        await beto.DeleteAsync($"/api/favoritos/{id}");
        Assert.Single((await ana.GetFromJsonAsync<List<RecetaResumen>>("/api/favoritos"))!);
    }

    [Fact]
    public async Task La_lista_va_de_la_receta_mas_nueva_a_la_mas_antigua()
    {
        var cliente = await UsuarioNuevo();
        var vieja = await Publicar(cliente, Receta("Vieja"));
        var nueva = await Publicar(cliente, Receta("Nueva"));
        // Se agregan en orden contrario para comprobar que el orden no depende de eso.
        await cliente.PutAsync($"/api/favoritos/{nueva.Id}", null);
        await cliente.PutAsync($"/api/favoritos/{vieja.Id}", null);

        var favoritos = await cliente.GetFromJsonAsync<List<RecetaResumen>>("/api/favoritos");

        Assert.Equal(["Nueva", "Vieja"], favoritos!.Select(r => r.Nombre));
    }
}
