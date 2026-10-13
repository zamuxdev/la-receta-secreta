using RecetaSecreta.Api.Validaciones;

namespace RecetaSecreta.Api.Tests;

// Pruebas unitarias: llaman a ValidadorFoto directamente, sin API ni base de datos.
public class ValidadorFotoPruebas
{
    private static readonly byte[] Png = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0, 0, 0, 0];
    private static readonly byte[] Jpeg = [0xFF, 0xD8, 0xFF, 0xE0, 0, 0];
    private static readonly byte[] Webp = [.. "RIFF"u8, 0, 0, 0, 0, .. "WEBP"u8, 0];

    private static string DataUrl(string tipo, byte[] bytes) => $"data:image/{tipo};base64,{Convert.ToBase64String(bytes)}";

    // Una imagen con la firma correcta que pesa exactamente esa cantidad de bytes.
    private static byte[] PngDe(int tamano) => [.. Png, .. new byte[tamano - Png.Length]];

    [Theory]
    [InlineData("fotos/tacos.jpg")]
    [InlineData("fotos/avena.jpg")]
    [InlineData("fotos/ensalada.jpg")]
    public void Acepta_las_fotos_incluidas(string ruta) => Assert.Null(ValidadorFoto.Revisar(ruta));

    [Fact]
    public void Acepta_jpg_png_y_webp_reales()
    {
        Assert.Null(ValidadorFoto.Revisar(DataUrl("png", Png)));
        Assert.Null(ValidadorFoto.Revisar(DataUrl("jpeg", Jpeg)));
        Assert.Null(ValidadorFoto.Revisar(DataUrl("webp", Webp)));
    }

    [Fact]
    public void El_limite_de_2_MB_es_exacto()
    {
        Assert.Null(ValidadorFoto.Revisar(DataUrl("png", PngDe(ValidadorFoto.TamanoMaximo))));
        Assert.Equal("La foto no puede pasar de 2 MB.", ValidadorFoto.Revisar(DataUrl("png", PngDe(ValidadorFoto.TamanoMaximo + 1))));
    }

    [Theory]
    [InlineData("fotos/otra.jpg")]
    [InlineData("../../etc/passwd")]
    [InlineData("https://ejemplo.com/foto.png")]
    [InlineData("javascript:alert(1)")]
    [InlineData("data:image/gif;base64,R0lGODlhAQABAAAAACw=")]
    public void Rechaza_lo_que_no_es_foto_incluida_ni_data_url_permitida(string foto) =>
        Assert.Equal("La foto debe ser JPG, PNG o WebP de hasta 2 MB.", ValidadorFoto.Revisar(foto));

    [Fact]
    public void Rechaza_un_base64_danado() =>
        Assert.Equal("La foto no es una imagen válida.", ValidadorFoto.Revisar("data:image/png;base64,abc"));

    [Fact]
    public void Rechaza_un_contenido_que_no_coincide_con_el_tipo()
    {
        const string mensaje = "La foto no es una imagen JPG, PNG o WebP válida.";
        Assert.Equal(mensaje, ValidadorFoto.Revisar(DataUrl("png", Jpeg)));
        Assert.Equal(mensaje, ValidadorFoto.Revisar(DataUrl("jpeg", "<script>alert(1)</script>"u8.ToArray())));
    }
}
