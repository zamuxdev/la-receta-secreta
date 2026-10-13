using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using RecetaSecreta.Api.Data;
using RecetaSecreta.Api.Dtos;
using RecetaSecreta.Api.Exportacion;
using RecetaSecreta.Api.Models;
using RecetaSecreta.Api.Seguridad;

namespace RecetaSecreta.Api.Controllers;

// Todo el controlador exige sesión, y cada consulta se filtra por el usuario del token:
// así nadie puede ver ni cambiar los favoritos de otra persona (contrato 10.6).
[Authorize]
[ApiController]
[Route("api/[controller]")]
public class FavoritosController(RecetaDbContext db) : ControllerBase
{
    // GET api/favoritos
    [HttpGet]
    public async Task<ActionResult<List<RecetaResumen>>> Listar()
    {
        var usuarioId = User.IdDeUsuario();
        return await db.Favoritos.AsNoTracking()
            .Where(f => f.UsuarioId == usuarioId)
            .Select(f => f.Receta)
            .OrderByDescending(r => r.CreadaEn)
            .Select(Proyecciones.Resumen)
            .ToListAsync();
    }

    // GET api/favoritos/exportar
    // Los favoritos del usuario como tabla CSV, en el mismo orden que la lista.
    [HttpGet("exportar")]
    public async Task<IActionResult> Exportar()
    {
        var favoritos = (await Listar()).Value!;
        return File(Exportador.Csv(favoritos), "text/csv; charset=utf-8", "favoritos.csv");
    }

    // PUT api/favoritos/5
    // Es idempotente: si ya estaba en favoritos responde 204 igual y no la duplica.
    [HttpPut("{recetaId:int}")]
    public async Task<IActionResult> Agregar(int recetaId)
    {
        if (!await db.Recetas.AnyAsync(r => r.Id == recetaId))
            return NotFound();

        // El token puede seguir siendo válido aunque la cuenta ya no exista.
        var usuarioId = User.IdDeUsuario();
        if (!await db.Usuarios.AnyAsync(u => u.Id == usuarioId))
            return Unauthorized();

        if (await db.Favoritos.AnyAsync(f => f.UsuarioId == usuarioId && f.RecetaId == recetaId))
            return NoContent();

        db.Favoritos.Add(new Favorito { UsuarioId = usuarioId!.Value, RecetaId = recetaId });
        try
        {
            await db.SaveChangesAsync();
        }
        catch (DbUpdateException e) when (e.InnerException is PostgresException { SqlState: PostgresErrorCodes.UniqueViolation })
        {
            // Dos peticiones al mismo tiempo: la otra ya la guardó, y el resultado es el mismo.
        }
        return NoContent();
    }

    // DELETE api/favoritos/5
    // También es idempotente: si no estaba en favoritos responde 204.
    [HttpDelete("{recetaId:int}")]
    public async Task<IActionResult> Quitar(int recetaId)
    {
        if (!await db.Recetas.AnyAsync(r => r.Id == recetaId))
            return NotFound();

        var usuarioId = User.IdDeUsuario();
        // Borra directo en la base, sin cargar el registro antes.
        await db.Favoritos
            .Where(f => f.UsuarioId == usuarioId && f.RecetaId == recetaId)
            .ExecuteDeleteAsync();
        return NoContent();
    }
}
