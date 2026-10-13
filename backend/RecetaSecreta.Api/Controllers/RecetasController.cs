using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RecetaSecreta.Api.Data;
using RecetaSecreta.Api.Dtos;
using RecetaSecreta.Api.Models;
using RecetaSecreta.Api.Seguridad;

namespace RecetaSecreta.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RecetasController(RecetaDbContext db) : ControllerBase
{

    // GET api/recetas?categoria=Comida&ingrediente=frijol
    [HttpGet]
    public async Task<ActionResult<List<RecetaResumen>>> Listar(string? categoria, string? ingrediente)
    {
        var consulta = db.Recetas.AsNoTracking().AsQueryable();
        if (!string.IsNullOrWhiteSpace(categoria))
            consulta = consulta.Where(r => r.Categoria.Nombre == categoria);
        if (!string.IsNullOrWhiteSpace(ingrediente))
            consulta = consulta.Where(r => r.Ingredientes.Any(i => EF.Functions.ILike(i.Texto, $"%{ingrediente}%")));

        return await consulta
            .OrderByDescending(r => r.CreadaEn)
            .Select(Proyecciones.Resumen)
            .ToListAsync();
    }

    // GET api/recetas/mejor-valoradas?limite=10
    // Solo las que tienen al menos una calificación. Si empatan en promedio, gana la que tiene más votos.
    [HttpGet("mejor-valoradas")]
    public async Task<ActionResult<List<RecetaResumen>>> MejorValoradas(
        [Range(1, 50, ErrorMessage = "El límite debe estar entre 1 y 50.")] int limite = 10) =>
        await db.Recetas.AsNoTracking()
            .Where(r => r.Calificaciones.Any())
            .OrderByDescending(r => r.Calificaciones.Average(c => c.Puntos))
            .ThenByDescending(r => r.Calificaciones.Count)
            .ThenByDescending(r => r.CreadaEn)
            .Take(limite)
            .Select(Proyecciones.Resumen)
            .ToListAsync();

    // GET api/recetas/5
    // Es público, pero si llega un token válido se llenan esMia y miCalificacion.
    [HttpGet("{id:int}")]
    public async Task<ActionResult<RecetaDetalle>> Obtener(int id)
    {
        var usuarioId = User.IdDeUsuario();
        var receta = await db.Recetas.AsNoTracking()
            .Where(r => r.Id == id)
            .Select(r => new RecetaDetalle(
                r.Id, r.Nombre, r.Descripcion, r.Categoria.Nombre, r.Tiempo, r.Porciones, r.Foto,
                r.Ingredientes.OrderBy(i => i.Id).Select(i => i.Texto).ToList(), r.Pasos,
                r.Calificaciones.Average(c => (double?)c.Puntos), r.Calificaciones.Count,
                r.Autor == null ? null : r.Autor.Nombre,
                usuarioId != null && r.AutorId == usuarioId,
                r.Calificaciones.Where(c => c.UsuarioId == usuarioId).Select(c => (int?)c.Puntos).FirstOrDefault()))
            .FirstOrDefaultAsync();
        return receta is null ? NotFound() : receta;
    }

    // POST api/recetas
    // Sin token válido, [Authorize] responde 401 antes de entrar al método (RF-10).
    [Authorize]
    [HttpPost]
    public async Task<ActionResult<RecetaDetalle>> Crear(RecetaCrear datos)
    {
        // El token puede seguir siendo válido aunque la cuenta ya no exista.
        var autor = await db.Usuarios.FindAsync(User.IdDeUsuario());
        if (autor is null)
            return Unauthorized();

        var categoria = await db.Categorias.FirstOrDefaultAsync(c => c.Nombre == datos.Categoria);

        if (categoria is null)
        {
            return ValidationProblem(new ValidationProblemDetails(new Dictionary<string, string[]>
            {
                ["categoria"] = ["La categoría debe ser Desayuno, Comida, Cena o Postre."],
            }
            ));
        }

        var ingredientes = Limpiar(datos.Ingredientes);
        var pasos = Limpiar(datos.Pasos);
        if (ingredientes.Count == 0 || pasos.Count == 0)
            return ValidationProblem(new ValidationProblemDetails(new Dictionary<string, string[]>
            {
                ["ingredientes"] = ["Se necesita al menos un ingrediente y un paso, sin textos vacíos."],
            }));

        var receta = new Receta
        {
            Nombre = datos.Nombre.Trim(),
            Descripcion = datos.Descripcion.Trim(),
            Categoria = categoria,
            Tiempo = datos.Tiempo,
            Porciones = datos.Porciones,
            Foto = string.IsNullOrWhiteSpace(datos.Foto) ? null : datos.Foto,
            Pasos = pasos,
            Ingredientes = ingredientes.Select(t => new Ingrediente { Texto = t }).ToList(),
            // El autor sale del token, nunca del cuerpo: así nadie publica a nombre de otro.
            Autor = autor,
        };
        db.Recetas.Add(receta);
        await db.SaveChangesAsync();

        var detalle = new RecetaDetalle(
            receta.Id, receta.Nombre, receta.Descripcion, receta.Categoria.Nombre, receta.Tiempo,
            receta.Porciones, receta.Foto, ingredientes, pasos, null, 0,
            autor.Nombre, EsMia: true, MiCalificacion: null);
        return CreatedAtAction(nameof(Obtener), new { id = receta.Id }, detalle);
    }

    private static List<string> Limpiar(IEnumerable<string> textos) =>
        textos.Select(t => t.Trim()).Where(t => t.Length > 0).ToList();
}
