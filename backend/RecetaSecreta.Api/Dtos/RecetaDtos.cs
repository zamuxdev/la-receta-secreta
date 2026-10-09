using System.ComponentModel.DataAnnotations;

namespace RecetaSecreta.Api.Dtos;

// Mismos campos que el JSON que exporta e importa la interfaz.
public record RecetaCrear(
    [Required, StringLength(100)] string Nombre,
    [Required, StringLength(350)] string Descripcion,
    [Required] string Categoria,
    [Range(1, 1440)] int Tiempo,
    [Range(1, 100)] int Porciones,
    [Required, MinLength(1)] List<string> Ingredientes,
    [Required, MinLength(1)] List<string> Pasos,
    string? Foto);

public record RecetaResumen(
    int Id, string Nombre, string Descripcion, string Categoria,
    int Tiempo, int Porciones, string? Foto, double? Promedio, int TotalCalificaciones);

public record RecetaDetalle(
    int Id, string Nombre, string Descripcion, string Categoria,
    int Tiempo, int Porciones, string? Foto,
    List<string> Ingredientes, List<string> Pasos,
    double? Promedio, int TotalCalificaciones);
