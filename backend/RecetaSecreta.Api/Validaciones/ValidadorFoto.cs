using System.Text.RegularExpressions;

namespace RecetaSecreta.Api.Validaciones;

// La foto llega como texto: una de las fotos incluidas en la interfaz, o una imagen
// en data URL ("data:image/png;base64,..."). La interfaz ya la revisa, pero cualquiera
// puede llamar a la API directamente, así que el servidor vuelve a revisarla.
public static partial class ValidadorFoto
{
    public const int TamanoMaximo = 2 * 1024 * 1024; // 2 MB

    // Las mismas que fotosIncluidas en frontend/js/publicar.js.
    private static readonly HashSet<string> FotosIncluidas = ["fotos/tacos.jpg", "fotos/avena.jpg", "fotos/ensalada.jpg"];

    // Los primeros bytes de cada formato ("número mágico"). El tipo que dice el texto
    // se puede inventar; el contenido real no.
    private static readonly Dictionary<string, Func<byte[], bool>> Formatos = new()
    {
        ["jpeg"] = b => b.Length > 3 && b[0] == 0xFF && b[1] == 0xD8 && b[2] == 0xFF,
        ["png"] = b => b.Length > 8 && b.AsSpan(0, 8).SequenceEqual(new byte[] { 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A }),
        ["webp"] = b => b.Length > 12 && b.AsSpan(0, 4).SequenceEqual("RIFF"u8) && b.AsSpan(8, 4).SequenceEqual("WEBP"u8),
    };

    [GeneratedRegex(@"^data:image/(jpeg|png|webp);base64,([A-Za-z0-9+/]+={0,2})$")]
    private static partial Regex DataUrl();

    // Devuelve el mensaje de error, o null si la foto es válida.
    public static string? Revisar(string foto)
    {
        if (FotosIncluidas.Contains(foto))
            return null;

        // Base64 ocupa 4 caracteres por cada 3 bytes: se descarta lo enorme antes de decodificarlo.
        if (foto.Length > TamanoMaximo / 3 * 4 + 100)
            return "La foto no puede pasar de 2 MB.";

        var partes = DataUrl().Match(foto);
        if (!partes.Success)
            return "La foto debe ser JPG, PNG o WebP de hasta 2 MB.";

        var base64 = partes.Groups[2].Value;
        var bytes = new byte[base64.Length / 4 * 3];
        if (!Convert.TryFromBase64String(base64, bytes, out var leidos))
            return "La foto no es una imagen válida.";
        bytes = bytes[..leidos];

        if (bytes.Length > TamanoMaximo)
            return "La foto no puede pasar de 2 MB.";
        if (!Formatos[partes.Groups[1].Value](bytes))
            return "La foto no es una imagen JPG, PNG o WebP válida.";
        return null;
    }
}
