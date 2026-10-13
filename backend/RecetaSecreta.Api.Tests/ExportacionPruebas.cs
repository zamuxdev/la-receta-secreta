using System.Net;
using System.Net.Http.Json;
using System.Text;
using System.Xml.Linq;
using RecetaSecreta.Api.Dtos;

namespace RecetaSecreta.Api.Tests;

[Collection("Api")]
public class ExportacionPruebas(ApiDePrueba api) : PruebaDeApi(api)
{
    [Fact]
    public async Task Json_se_puede_volver_a_publicar()
    {
        var cliente = await UsuarioNuevo();
        var original = await Publicar(cliente, Receta("Pozole rojo"));

        var respuesta = await Anonimo().GetAsync($"/api/recetas/{original.Id}/exportar?formato=json");

        Assert.Equal("application/json", respuesta.Content.Headers.ContentType!.MediaType);
        Assert.Equal("pozole-rojo.json", respuesta.Content.Headers.ContentDisposition!.FileNameStar);
        var exportada = await respuesta.Content.ReadFromJsonAsync<RecetaCrear>();
        Assert.Equal(Receta("Pozole rojo").Ingredientes, exportada!.Ingredientes);
        await Publicar(cliente, exportada);
    }

    [Fact]
    public async Task Xml_es_valido_aunque_el_texto_traiga_caracteres_especiales()
    {
        var receta = await Publicar(await UsuarioNuevo(), Receta("Salsa <roja> & \"picante\""));

        var respuesta = await Anonimo().GetAsync($"/api/recetas/{receta.Id}/exportar?formato=XML");

        Assert.Equal("application/xml", respuesta.Content.Headers.ContentType!.MediaType);
        var xml = XDocument.Parse(await respuesta.Content.ReadAsStringAsync());
        Assert.Equal("Salsa <roja> & \"picante\"", xml.Root!.Element("nombre")!.Value);
        Assert.Equal(["1 taza de arroz", "Sal"], xml.Root.Element("ingredientes")!.Elements("ingrediente").Select(e => e.Value));
    }

    [Fact]
    public async Task Un_formato_desconocido_responde_400_y_una_receta_inexistente_404()
    {
        var id = await RecetaDeEjemplo();

        var errores = await Errores(await Anonimo().GetAsync($"/api/recetas/{id}/exportar?formato=pdf"));

        Assert.Equal("El formato debe ser json o xml.", Assert.Single(errores["formato"]));
        Assert.Equal(HttpStatusCode.NotFound, (await Anonimo().GetAsync("/api/recetas/999999/exportar")).StatusCode);
    }

    [Fact]
    public async Task Csv_de_favoritos_exige_sesion()
    {
        Assert.Equal(HttpStatusCode.Unauthorized, (await Anonimo().GetAsync("/api/favoritos/exportar")).StatusCode);
    }

    [Fact]
    public async Task Csv_de_favoritos_trae_encabezado_y_una_fila_por_favorito()
    {
        var cliente = await UsuarioNuevo();
        var receta = await Publicar(cliente, Receta("Tacos, \"al pastor\""));
        await cliente.PutAsync($"/api/favoritos/{receta.Id}", null);

        var respuesta = await cliente.GetAsync("/api/favoritos/exportar");
        var bytes = await respuesta.Content.ReadAsByteArrayAsync();

        Assert.Equal("favoritos.csv", respuesta.Content.Headers.ContentDisposition!.FileNameStar);
        Assert.Equal(Encoding.UTF8.GetPreamble(), bytes[..3]);
        var lineas = Encoding.UTF8.GetString(bytes[3..]).Split("\r\n", StringSplitOptions.RemoveEmptyEntries);
        Assert.Equal(["Id,Nombre,Categoria,Tiempo,Porciones", $"{receta.Id},\"Tacos, \"\"al pastor\"\"\",Cena,20,2"], lineas);
    }
}
