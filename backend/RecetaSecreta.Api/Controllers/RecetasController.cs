using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RecetaSecreta.Api.Data;
using RecetaSecreta.Api.Dtos;
using RecetaSecreta.Api.Models;

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
            .Select(r => new RecetaResumen(
                r.Id, r.Nombre, r.Descripcion, r.Categoria.Nombre, r.Tiempo, r.Porciones, r.Foto,
                r.Calificaciones.Average(c => (double?)c.Puntos), r.Calificaciones.Count))
            .ToListAsync();
    }

    // GET api/recetas/5
    [HttpGet("{id:int}")]
    public async Task<ActionResult<RecetaDetalle>> Obtener(int id)
    {
        var receta = await db.Recetas.AsNoTracking()
            .Where(r => r.Id == id)
            .Select(r => new RecetaDetalle(
                r.Id, r.Nombre, r.Descripcion, r.Categoria.Nombre, r.Tiempo, r.Porciones, r.Foto,
                r.Ingredientes.OrderBy(i => i.Id).Select(i => i.Texto).ToList(), r.Pasos,
                r.Calificaciones.Average(c => (double?)c.Puntos), r.Calificaciones.Count))
            .FirstOrDefaultAsync();
        return receta is null ? NotFound() : receta;
    }

    // POST api/recetas
    [HttpPost]
    public async Task<ActionResult<RecetaDetalle>> Crear(RecetaCrear datos)
    {
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
        };
        db.Recetas.Add(receta);
        await db.SaveChangesAsync();

        var detalle = new RecetaDetalle(
            receta.Id, receta.Nombre, receta.Descripcion, receta.Categoria.Nombre, receta.Tiempo,
            receta.Porciones, receta.Foto, ingredientes, pasos, null, 0);
        return CreatedAtAction(nameof(Obtener), new { id = receta.Id }, detalle);
    }

    private static List<string> Limpiar(IEnumerable<string> textos) =>
        textos.Select(t => t.Trim()).Where(t => t.Length > 0).ToList();
}
