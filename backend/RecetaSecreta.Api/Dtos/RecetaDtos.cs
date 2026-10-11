using System.ComponentModel.DataAnnotations;

namespace RecetaSecreta.Api.Dtos;

// Mismos campos que el JSON que exporta e importa la interfaz.
public record RecetaCrear(
    [Required(ErrorMessage = "El nombre es obligatorio.")]
    [StringLength(100, ErrorMessage = "El nombre no puede pasar de 100 caracteres.")] string Nombre,
    [Required(ErrorMessage = "La descripción es obligatoria.")]
    [StringLength(350, ErrorMessage = "La descripción no puede pasar de 350 caracteres.")] string Descripcion,
    [Required(ErrorMessage = "La categoría es obligatoria.")] string Categoria,
    [Range(1, 1440, ErrorMessage = "El tiempo debe estar entre 1 y 1440 minutos.")] int Tiempo,
    [Range(1, 100, ErrorMessage = "Las porciones deben estar entre 1 y 100.")] int Porciones,
    [Required(ErrorMessage = "Se necesita al menos un ingrediente."),
     MinLength(1, ErrorMessage = "Se necesita al menos un ingrediente.")] List<string> Ingredientes,
    [Required(ErrorMessage = "Se necesita al menos un paso."),
     MinLength(1, ErrorMessage = "Se necesita al menos un paso.")] List<string> Pasos,
    string? Foto);

public record RecetaResumen(
    int Id, string Nombre, string Descripcion, string Categoria,
    int Tiempo, int Porciones, string? Foto, double? Promedio, int TotalCalificaciones);

public record RecetaDetalle(
    int Id, string Nombre, string Descripcion, string Categoria,
    int Tiempo, int Porciones, string? Foto,
    List<string> Ingredientes, List<string> Pasos,
    double? Promedio, int TotalCalificaciones);
