using System.Net;
using System.Net.Http.Json;
using RecetaSecreta.Api.Dtos;

namespace RecetaSecreta.Api.Tests;

[Collection("Api")]
public class CalificacionesPruebas(ApiDePrueba api) : PruebaDeApi(api)
{
    private static async Task<EstadoCalificacion> Calificar(HttpClient cliente, int recetaId, int puntos)
    {
        var respuesta = await cliente.PutAsJsonAsync($"/api/recetas/{recetaId}/calificacion", new CalificacionCrear(puntos));
        Assert.Equal(HttpStatusCode.OK, respuesta.StatusCode);
        return (await respuesta.Content.ReadFromJsonAsync<EstadoCalificacion>())!;
    }

    [Fact]
    public async Task Calificar_sin_sesion_responde_401()
    {
        var respuesta = await Anonimo().PutAsJsonAsync($"/api/recetas/{await RecetaDeEjemplo()}/calificacion", new CalificacionCrear(5));

        Assert.Equal(HttpStatusCode.Unauthorized, respuesta.StatusCode);
    }

    [Fact]
    public async Task Calcula_el_promedio_y_calificar_de_nuevo_reemplaza()
    {
        var receta = await Publicar(await UsuarioNuevo());
        var bea = await UsuarioNuevo();
        var ciro = await UsuarioNuevo();

        Assert.Equal(new EstadoCalificacion(5, 1, 5), await Calificar(bea, receta.Id, 5));
        Assert.Equal(new EstadoCalificacion(4.5, 2, 4), await Calificar(ciro, receta.Id, 4));
        // Bea cambia de opinión: sigue habiendo 2 calificaciones (RF-20).
        Assert.Equal(new EstadoCalificacion(3.5, 2, 3), await Calificar(bea, receta.Id, 3));

        var detalle = await bea.GetFromJsonAsync<RecetaDetalle>($"/api/recetas/{receta.Id}");
        Assert.Equal((3.5, 2, 3), (detalle!.Promedio, detalle.TotalCalificaciones, detalle.MiCalificacion));
    }

    [Fact]
    public async Task No_se_puede_calificar_una_receta_propia()
    {
        var autor = await UsuarioNuevo();
        var receta = await Publicar(autor);

        var respuesta = await autor.PutAsJsonAsync($"/api/recetas/{receta.Id}/calificacion", new CalificacionCrear(5));

        Assert.Equal(HttpStatusCode.Forbidden, respuesta.StatusCode);
        Assert.Equal("No puedes calificar tus propias recetas.", await Detalle(respuesta));
    }

    [Theory]
    [InlineData(0)]
    [InlineData(6)]
    public async Task Puntos_fuera_de_rango_responden_400(int puntos)
    {
        var cliente = await UsuarioNuevo();

        var respuesta = await cliente.PutAsJsonAsync($"/api/recetas/{await RecetaDeEjemplo()}/calificacion", new CalificacionCrear(puntos));

        var errores = await Errores(respuesta);
        Assert.Equal("La calificación debe ser un número entero del 1 al 5.", Assert.Single(errores["puntos"]));
    }

    [Fact]
    public async Task Calificar_una_receta_que_no_existe_responde_404()
    {
        var respuesta = await (await UsuarioNuevo()).PutAsJsonAsync("/api/recetas/999999/calificacion", new CalificacionCrear(5));

        Assert.Equal(HttpStatusCode.NotFound, respuesta.StatusCode);
    }

    [Fact]
    public async Task Quitar_la_calificacion_actualiza_el_promedio_y_se_puede_repetir()
    {
        var receta = await Publicar(await UsuarioNuevo());
        var bea = await UsuarioNuevo();
        await Calificar(bea, receta.Id, 4);

        var primera = await bea.DeleteAsync($"/api/recetas/{receta.Id}/calificacion");
        var segunda = await bea.DeleteAsync($"/api/recetas/{receta.Id}/calificacion");

        Assert.Equal(new EstadoCalificacion(null, 0, null), await primera.Content.ReadFromJsonAsync<EstadoCalificacion>());
        Assert.Equal(HttpStatusCode.OK, segunda.StatusCode);
    }

    [Fact]
    public async Task Mejor_valoradas_ordena_por_promedio_y_desempata_por_votos()
    {
        var autor = await UsuarioNuevo();
        var votantes = new[] { await UsuarioNuevo(), await UsuarioNuevo() };
        // Notas altas con un sufijo único, para no chocar con otras pruebas que también califican.
        var marca = Guid.NewGuid().ToString("N")[..6];
        var cinco = await Publicar(autor, Receta($"Cinco {marca}"));
        var cincoConMasVotos = await Publicar(autor, Receta($"Cinco con dos votos {marca}"));
        var tres = await Publicar(autor, Receta($"Tres {marca}"));
        await Publicar(autor, Receta($"Sin votos {marca}"));
        await Calificar(votantes[0], cinco.Id, 5);
        await Calificar(votantes[0], cincoConMasVotos.Id, 5);
        await Calificar(votantes[1], cincoConMasVotos.Id, 5);
        await Calificar(votantes[0], tres.Id, 3);

        var lista = await Anonimo().GetFromJsonAsync<List<RecetaResumen>>("/api/recetas/mejor-valoradas?limite=50");

        var nuestras = lista!.Where(r => r.Nombre.EndsWith(marca)).Select(r => r.Nombre);
        Assert.Equal([$"Cinco con dos votos {marca}", $"Cinco {marca}", $"Tres {marca}"], nuestras);
        Assert.All(lista!, r => Assert.True(r.TotalCalificaciones > 0));
    }

    [Theory]
    [InlineData("0")]
    [InlineData("51")]
    [InlineData("abc")]
    public async Task Mejor_valoradas_con_un_limite_invalido_responde_400(string limite)
    {
        var errores = await Errores(await Anonimo().GetAsync($"/api/recetas/mejor-valoradas?limite={limite}"));

        Assert.True(errores.ContainsKey("limite"));
    }
}
