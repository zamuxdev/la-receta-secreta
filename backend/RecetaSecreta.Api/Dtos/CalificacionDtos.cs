using System.ComponentModel.DataAnnotations;

namespace RecetaSecreta.Api.Dtos;

public record CalificacionCrear(
    [Range(1, 5, ErrorMessage = "La calificación debe ser un número entero del 1 al 5.")] int Puntos);

// Lo que cambia en la receta al calificar, para refrescar la interfaz sin otra petición.
public record EstadoCalificacion(double? Promedio, int TotalCalificaciones, int? MiCalificacion);
