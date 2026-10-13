using System.Globalization;
using System.Text;
using System.Text.Encodings.Web;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Text.RegularExpressions;
using System.Xml;
using System.Xml.Linq;
using RecetaSecreta.Api.Dtos;

namespace RecetaSecreta.Api.Exportacion;

// Convierte recetas a archivos descargables (RF-23): JSON y XML para una receta, CSV para los favoritos.
public static partial class Exportador
{
    private static readonly JsonSerializerOptions OpcionesJson = new(JsonSerializerDefaults.Web)
    {
        WriteIndented = true,
        // Sin foto, el campo se omite: igual que el JSON que exporta la pantalla Publicar.
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
        // Deja "Cocción" legible en lugar de "Cocción". Es seguro porque es un archivo, no HTML.
        Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping,
    };

    // Mismos campos que RecetaCrear, para que el archivo se pueda importar de nuevo en Publicar.
    public static byte[] Json(RecetaCrear receta) =>
        Encoding.UTF8.GetBytes(JsonSerializer.Serialize(receta, OpcionesJson) + "\n");

    public static byte[] Xml(RecetaCrear receta)
    {
        // XDocument escapa solo los caracteres especiales (<, &...), así el texto del usuario no rompe el XML.
        var documento = new XDocument(
            new XElement("receta",
                new XElement("nombre", Texto(receta.Nombre)),
                new XElement("descripcion", Texto(receta.Descripcion)),
                new XElement("categoria", receta.Categoria),
                new XElement("tiempo", receta.Tiempo),
                new XElement("porciones", receta.Porciones),
                new XElement("ingredientes", receta.Ingredientes.Select(i => new XElement("ingrediente", Texto(i)))),
                new XElement("pasos", receta.Pasos.Select(p => new XElement("paso", Texto(p)))),
                receta.Foto is null ? null : new XElement("foto", receta.Foto)));

        using var memoria = new MemoryStream();
        var opciones = new XmlWriterSettings { Indent = true, NewLineChars = "\n", Encoding = new UTF8Encoding(false) };
        using (var escritor = XmlWriter.Create(memoria, opciones))
            documento.Save(escritor);
        return memoria.ToArray();
    }

    public static byte[] Csv(IEnumerable<RecetaResumen> recetas)
    {
        var csv = new StringBuilder("Id,Nombre,Categoria,Tiempo,Porciones\r\n");
        foreach (var r in recetas)
            csv.Append(string.Join(',', r.Id, Celda(r.Nombre), Celda(r.Categoria), r.Tiempo, r.Porciones)).Append("\r\n");
        // La marca BOM al inicio hace que Excel lea bien los acentos.
        return [.. Encoding.UTF8.GetPreamble(), .. Encoding.UTF8.GetBytes(csv.ToString())];
    }

    // "Arroz con leche" → "arroz-con-leche", igual que el nombre que usa la pantalla Publicar.
    public static string NombreArchivo(string nombre, string extension)
    {
        var sinAcentos = new string(nombre.Normalize(NormalizationForm.FormD)
            .Where(c => CharUnicodeInfo.GetUnicodeCategory(c) != UnicodeCategory.NonSpacingMark).ToArray());
        var nombreBase = NoAlfanumerico().Replace(sinAcentos.ToLowerInvariant(), "-").Trim('-');
        return (nombreBase.Length > 0 ? nombreBase : "receta") + "." + extension;
    }

    // Una celda con coma, comillas o salto de línea va entre comillas, y sus comillas se duplican.
    // Si empieza con = + - @, Excel la ejecutaría como fórmula: se antepone ' para que sea solo texto.
    private static string Celda(string valor)
    {
        if (valor.Length > 0 && "=+-@\t\r".Contains(valor[0]))
            valor = "'" + valor;
        return valor.IndexOfAny([',', '"', '\n', '\r']) >= 0 ? "\"" + valor.Replace("\"", "\"\"") + "\"" : valor;
    }

    // XML no admite algunos caracteres de control aunque JSON sí; se quitan para no romper el archivo.
    private static string Texto(string valor) => ControlNoXml().Replace(valor, "");

    [GeneratedRegex("[^a-z0-9]+")]
    private static partial Regex NoAlfanumerico();

    [GeneratedRegex(@"[\x00-\x08\x0B\x0C\x0E-\x1F]")]
    private static partial Regex ControlNoXml();
}
