using System.Linq.Expressions;
using RecetaSecreta.Api.Dtos;
using RecetaSecreta.Api.Models;

namespace RecetaSecreta.Api.Data;

// Conversiones de entidad a DTO que EF Core traduce a SQL. Se comparten para que
// todas las listas de recetas devuelvan exactamente los mismos campos.
public static class Proyecciones
{
    public static readonly Expression<Func<Receta, RecetaResumen>> Resumen = r => new RecetaResumen(
        r.Id, r.Nombre, r.Descripcion, r.Categoria.Nombre, r.Tiempo, r.Porciones, r.Foto,
        r.Calificaciones.Average(c => (double?)c.Puntos), r.Calificaciones.Count);
}
