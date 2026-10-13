using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using RecetaSecreta.Api.Data;
using RecetaSecreta.Api.Dtos;
using RecetaSecreta.Api.Models;
using RecetaSecreta.Api.Seguridad;

namespace RecetaSecreta.Api.Controllers;

// La calificación es un recurso dentro de la receta: /api/recetas/5/calificacion.
// Cada usuario tiene a lo más una por receta (RF-20), así que no lleva id propio.
[Authorize]
[ApiController]
[Route("api/recetas/{recetaId:int}/calificacion")]
public class CalificacionesController(RecetaDbContext db) : ControllerBase
{
    // PUT api/recetas/5/calificacion   { "puntos": 4 }
    // Crea la calificación o reemplaza la anterior.
    [HttpPut]
    public async Task<ActionResult<EstadoCalificacion>> Calificar(int recetaId, CalificacionCrear datos)
    {
        var receta = await db.Recetas.Where(r => r.Id == recetaId)
            .Select(r => new { r.AutorId }).FirstOrDefaultAsync();
        if (receta is null)
            return NotFound();

        // El token puede seguir siendo válido aunque la cuenta ya no exista.
        var usuarioId = User.IdDeUsuario()!.Value;
        if (!await db.Usuarios.AnyAsync(u => u.Id == usuarioId))
            return Unauthorized();

        // Calificar lo propio inflaría el promedio (CU-05).
        if (receta.AutorId == usuarioId)
            return Problem(statusCode: 403, detail: "No puedes calificar tus propias recetas.");

        var calificacion = await db.Calificaciones.FindAsync(usuarioId, recetaId);
        if (calificacion is null)
            db.Calificaciones.Add(new Calificacion { UsuarioId = usuarioId, RecetaId = recetaId, Puntos = datos.Puntos });
        else
            calificacion.Puntos = datos.Puntos;

        try
        {
            await db.SaveChangesAsync();
        }
        catch (DbUpdateException e) when (e.InnerException is PostgresException { SqlState: PostgresErrorCodes.UniqueViolation })
        {
            // Otra petición al mismo tiempo ya la creó: se reemplaza su valor.
            await db.Calificaciones
                .Where(c => c.UsuarioId == usuarioId && c.RecetaId == recetaId)
                .ExecuteUpdateAsync(c => c.SetProperty(x => x.Puntos, datos.Puntos));
        }
        return await Estado(recetaId, usuarioId);
    }

    // DELETE api/recetas/5/calificacion
    // Es idempotente: si no había calificado, responde igual con el estado actual.
    [HttpDelete]
    public async Task<ActionResult<EstadoCalificacion>> Quitar(int recetaId)
    {
        if (!await db.Recetas.AnyAsync(r => r.Id == recetaId))
            return NotFound();

        var usuarioId = User.IdDeUsuario()!.Value;
        await db.Calificaciones
            .Where(c => c.UsuarioId == usuarioId && c.RecetaId == recetaId)
            .ExecuteDeleteAsync();
        return await Estado(recetaId, usuarioId);
    }

    // El promedio se calcula en la base cada vez, en lugar de guardarlo, para que nunca quede desfasado.
    private Task<EstadoCalificacion> Estado(int recetaId, int usuarioId) =>
        db.Recetas.AsNoTracking()
            .Where(r => r.Id == recetaId)
            .Select(r => new EstadoCalificacion(
                r.Calificaciones.Average(c => (double?)c.Puntos),
                r.Calificaciones.Count,
                r.Calificaciones.Where(c => c.UsuarioId == usuarioId).Select(c => (int?)c.Puntos).FirstOrDefault()))
            .FirstAsync();
}
