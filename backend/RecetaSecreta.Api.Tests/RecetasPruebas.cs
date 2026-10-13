using System.Net;
using System.Net.Http.Json;
using RecetaSecreta.Api.Dtos;

namespace RecetaSecreta.Api.Tests;

[Collection("Api")]
public class RecetasPruebas(ApiDePrueba api) : PruebaDeApi(api)
{
    [Fact]
    public async Task Listar_sin_sesion_devuelve_las_recetas_de_ejemplo()
    {
        var recetas = await Anonimo().GetFromJsonAsync<List<RecetaResumen>>("/api/recetas");

        Assert.Contains(recetas!, r => r.Nombre == "Tacos de frijol con aguacate");
    }

    [Fact]
    public async Task Listar_filtra_por_categoria_e_ingrediente()
    {
        var cliente = await UsuarioNuevo();
        var marca = Guid.NewGuid().ToString("N");
        await Publicar(cliente, Receta("Con el ingrediente") with { Categoria = "Postre", Ingredientes = [$"Canela {marca}"] });
        await Publicar(cliente, Receta("Otra categoría") with { Categoria = "Cena", Ingredientes = [$"Canela {marca}"] });

        var recetas = await Anonimo().GetFromJsonAsync<List<RecetaResumen>>($"/api/recetas?categoria=Postre&ingrediente={marca.ToUpperInvariant()}");

        Assert.Equal("Con el ingrediente", Assert.Single(recetas!).Nombre);
    }

    [Fact]
    public async Task Categorias_salen_en_el_orden_del_dia()
    {
        var categorias = await Anonimo().GetFromJsonAsync<List<CategoriaDto>>("/api/categorias");

        Assert.Equal(["Desayuno", "Comida", "Cena", "Postre"], categorias!.Select(c => c.Nombre));
    }

    [Fact]
    public async Task Ver_una_receta_que_no_existe_responde_404()
    {
        Assert.Equal(HttpStatusCode.NotFound, (await Anonimo().GetAsync("/api/recetas/999999")).StatusCode);
    }

    [Fact]
    public async Task Publicar_sin_sesion_responde_401()
    {
        var respuesta = await Anonimo().PostAsJsonAsync("/api/recetas", Receta());

        Assert.Equal(HttpStatusCode.Unauthorized, respuesta.StatusCode);
    }

    [Fact]
    public async Task Publicar_liga_la_receta_a_quien_tiene_la_sesion()
    {
        var cliente = await UsuarioNuevo("Carmen");

        var receta = await Publicar(cliente, Receta("  Arroz con leche  ") with { Ingredientes = ["Arroz", "  ", "Leche"] });

        Assert.Equal("Arroz con leche", receta.Nombre);
        Assert.Equal(["Arroz", "Leche"], receta.Ingredientes);
        Assert.Equal("Carmen", receta.Autor);
        Assert.True(receta.EsMia);

        // Vista por otra persona, la receta no es suya.
        var ajena = await (await UsuarioNuevo()).GetFromJsonAsync<RecetaDetalle>($"/api/recetas/{receta.Id}");
        Assert.Equal("Carmen", ajena!.Autor);
        Assert.False(ajena.EsMia);
    }

    [Fact]
    public async Task Publicar_con_datos_invalidos_da_un_mensaje_por_campo()
    {
        var cliente = await UsuarioNuevo();
        var invalida = Receta() with { Nombre = "", Categoria = "Brunch", Tiempo = 0, Pasos = [" "] };

        var errores = await Errores(await cliente.PostAsJsonAsync("/api/recetas", invalida));

        Assert.Equal(["nombre", "tiempo"], errores.Keys.Order());
        // Las reglas de categoría y pasos se revisan después de los atributos del DTO.
        var errores2 = await Errores(await cliente.PostAsJsonAsync("/api/recetas", invalida with { Nombre = "Bien", Tiempo = 10 }));
        Assert.Equal(["categoria", "pasos"], errores2.Keys.Order());
    }

    [Fact]
    public async Task Un_valor_del_tipo_equivocado_da_un_mensaje_en_espanol()
    {
        var cliente = await UsuarioNuevo();
        var json = """{ "nombre": "x", "descripcion": "y", "categoria": "Cena", "tiempo": 4.5, "porciones": 1, "ingredientes": ["a"], "pasos": ["b"] }""";

        var respuesta = await cliente.PostAsync("/api/recetas", new StringContent(json, System.Text.Encoding.UTF8, "application/json"));

        var errores = await Errores(respuesta);
        Assert.Equal("El valor no tiene el formato correcto.", Assert.Single(errores["tiempo"]));
    }

    [Fact]
    public async Task Mis_recetas_solo_trae_las_propias()
    {
        var ana = await UsuarioNuevo();
        var beto = await UsuarioNuevo();
        var deAna = await Publicar(ana, Receta("De Ana"));
        await Publicar(beto, Receta("De Beto"));

        var mias = await ana.GetFromJsonAsync<List<RecetaResumen>>("/api/recetas/mias");

        Assert.Equal(deAna.Id, Assert.Single(mias!).Id);
        Assert.Equal(HttpStatusCode.Unauthorized, (await Anonimo().GetAsync("/api/recetas/mias")).StatusCode);
    }

    [Fact]
    public async Task Editar_reemplaza_todos_los_campos()
    {
        var cliente = await UsuarioNuevo();
        var receta = await Publicar(cliente);
        var cambios = new RecetaCrear("Editada", "Nueva", "Postre", 45, 6, ["Uno", "Dos", "Tres"], ["A", "B"], "fotos/avena.jpg");

        var respuesta = await cliente.PutAsJsonAsync($"/api/recetas/{receta.Id}", cambios);

        Assert.Equal(HttpStatusCode.OK, respuesta.StatusCode);
        var editada = await Anonimo().GetFromJsonAsync<RecetaDetalle>($"/api/recetas/{receta.Id}");
        Assert.Equal(("Editada", "Postre", 45, 6, "fotos/avena.jpg"), (editada!.Nombre, editada.Categoria, editada.Tiempo, editada.Porciones, editada.Foto));
        Assert.Equal(["Uno", "Dos", "Tres"], editada.Ingredientes);
    }

    [Fact]
    public async Task Editar_o_borrar_una_receta_ajena_responde_403()
    {
        var receta = await Publicar(await UsuarioNuevo());
        var otro = await UsuarioNuevo();

        var editar = await otro.PutAsJsonAsync($"/api/recetas/{receta.Id}", Receta("Robada"));
        var borrar = await otro.DeleteAsync($"/api/recetas/{receta.Id}");
        var borrarEjemplo = await otro.DeleteAsync($"/api/recetas/{await RecetaDeEjemplo()}");

        Assert.Equal(HttpStatusCode.Forbidden, editar.StatusCode);
        Assert.Equal("Solo quien publicó la receta puede editarla.", await Detalle(editar));
        Assert.Equal(HttpStatusCode.Forbidden, borrar.StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, borrarEjemplo.StatusCode);
    }

    [Fact]
    public async Task Borrar_quita_la_receta_y_sus_favoritos()
    {
        var autor = await UsuarioNuevo();
        var fan = await UsuarioNuevo();
        var receta = await Publicar(autor);
        await fan.PutAsync($"/api/favoritos/{receta.Id}", null);
        await fan.PutAsJsonAsync($"/api/recetas/{receta.Id}/calificacion", new CalificacionCrear(5));

        var respuesta = await autor.DeleteAsync($"/api/recetas/{receta.Id}");

        Assert.Equal(HttpStatusCode.NoContent, respuesta.StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await Anonimo().GetAsync($"/api/recetas/{receta.Id}")).StatusCode);
        Assert.Empty((await fan.GetFromJsonAsync<List<RecetaResumen>>("/api/favoritos"))!);
        Assert.Equal(HttpStatusCode.NotFound, (await autor.DeleteAsync($"/api/recetas/{receta.Id}")).StatusCode);
    }

    [Theory]
    [InlineData("fotos/tacos.jpg")]
    [InlineData("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==")]
    public async Task Publicar_acepta_fotos_validas(string foto)
    {
        var receta = await Publicar(await UsuarioNuevo(), Receta(foto: foto));

        Assert.Equal(foto, receta.Foto);
    }

    [Fact]
    public async Task Publicar_rechaza_una_foto_que_no_es_lo_que_dice()
    {
        var cliente = await UsuarioNuevo();
        // Es el texto "<script>alert(1)</script>" disfrazado de PNG.
        var falsa = Receta(foto: "data:image/png;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==");

        var errores = await Errores(await cliente.PostAsJsonAsync("/api/recetas", falsa));

        Assert.Equal("La foto no es una imagen JPG, PNG o WebP válida.", Assert.Single(errores["foto"]));
    }
}
