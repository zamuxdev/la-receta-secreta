using System.Text;
using RecetaSecreta.Api.Dtos;
using RecetaSecreta.Api.Exportacion;

namespace RecetaSecreta.Api.Tests;

// Pruebas unitarias del Exportador, sin API ni base de datos.
public class ExportadorPruebas
{
    private static RecetaResumen Favorita(string nombre) => new(7, nombre, "d", "Postre", 40, 4, null, null, 0);

    // El CSV sin la marca BOM del inicio, separado en líneas.
    private static string[] Lineas(byte[] csv) =>
        Encoding.UTF8.GetString(csv[3..]).Split("\r\n", StringSplitOptions.RemoveEmptyEntries);

    [Theory]
    [InlineData("Arroz con leche", "arroz-con-leche.xml")]
    [InlineData("Café de olla ¡rápido!", "cafe-de-olla-rapido.xml")]
    [InlineData("  --Pan--  ", "pan.xml")]
    [InlineData("¿¡!?", "receta.xml")]
    public void El_nombre_del_archivo_sale_del_nombre_de_la_receta(string nombre, string esperado) =>
        Assert.Equal(esperado, Exportador.NombreArchivo(nombre, "xml"));

    [Fact]
    public void Csv_sin_favoritos_solo_trae_el_encabezado() =>
        Assert.Equal(["Id,Nombre,Categoria,Tiempo,Porciones"], Lineas(Exportador.Csv([])));

    [Theory]
    [InlineData("Arroz con leche", "Arroz con leche")]
    [InlineData("Tacos, al pastor", "\"Tacos, al pastor\"")]
    [InlineData("Pay \"de la abuela\"", "\"Pay \"\"de la abuela\"\"\"")]
    [InlineData("=SUMA(A1:A9)", "'=SUMA(A1:A9)")]
    [InlineData("-Pan", "'-Pan")]
    public void Csv_escapa_comas_comillas_y_formulas(string nombre, string celda) =>
        Assert.Equal($"7,{celda},Postre,40,4", Lineas(Exportador.Csv([Favorita(nombre)]))[1]);

    [Fact]
    public void Xml_quita_caracteres_de_control_que_xml_no_admite()
    {
        var receta = new RecetaCrear("Pan\u0001", "Línea 1\nLínea 2", "Postre", 40, 4, ["Harina"], ["Hornear"], null);

        var xml = Encoding.UTF8.GetString(Exportador.Xml(receta));

        Assert.Contains("<nombre>Pan</nombre>", xml);
        Assert.Contains("Línea 1\nLínea 2", xml);
        Assert.DoesNotContain("<foto>", xml);
    }

    [Fact]
    public void Json_omite_la_foto_si_no_hay()
    {
        var receta = new RecetaCrear("Pan", "d", "Postre", 40, 4, ["Harina"], ["Hornear"], null);

        var json = Encoding.UTF8.GetString(Exportador.Json(receta));

        Assert.DoesNotContain("foto", json);
        Assert.Contains("\"nombre\": \"Pan\"", json);
    }
}
