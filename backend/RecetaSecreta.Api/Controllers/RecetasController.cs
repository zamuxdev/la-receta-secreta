using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RecetaSecreta.Api.Data;
using RecetaSecreta.Api.Dtos;
using RecetaSecreta.Api.Models;
using RecetaSecreta.Api.Seguridad;
using RecetaSecreta.Api.Validaciones;

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

    // GET api/recetas/mias
    [Authorize]
    [HttpGet("mias")]
    public async Task<ActionResult<List<RecetaResumen>>> Mias()
    {
        var usuarioId = User.IdDeUsuario();
        return await db.Recetas.AsNoTracking()
            .Where(r => r.AutorId == usuarioId)
            .OrderByDescending(r => r.CreadaEn)
            .Select(Proyecciones.Resumen)
            .ToListAsync();
    }

    // GET api/recetas/5
    // Es público, pero si llega un token válido se llenan esMia y miCalificacion.
    [HttpGet("{id:int}")]
    public async Task<ActionResult<RecetaDetalle>> Obtener(int id)
    {
        var receta = await Detalle(id);
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

        var (revisados, errores) = await Revisar(datos);
        if (revisados is null)
            return ValidationProblem(new ValidationProblemDetails(errores));

        // El autor sale del token, nunca del cuerpo: así nadie publica a nombre de otro.
        var receta = new Receta { Autor = autor };
        Aplicar(receta, datos, revisados);
        db.Recetas.Add(receta);
        await db.SaveChangesAsync();

        return CreatedAtAction(nameof(Obtener), new { id = receta.Id }, await Detalle(receta.Id));
    }

    // PUT api/recetas/5
    // Reemplaza todos los campos. Solo el autor puede editarla.
    [Authorize]
    [HttpPut("{id:int}")]
    public async Task<ActionResult<RecetaDetalle>> Actualizar(int id, RecetaCrear datos)
    {
        var receta = await db.Recetas.Include(r => r.Ingredientes).FirstOrDefaultAsync(r => r.Id == id);
        if (receta is null)
            return NotFound();
        if (receta.AutorId != User.IdDeUsuario())
            return Problem(statusCode: 403, detail: "Solo quien publicó la receta puede editarla.");

        var (revisados, errores) = await Revisar(datos);
        if (revisados is null)
            return ValidationProblem(new ValidationProblemDetails(errores));

        // Quitar los ingredientes de la lista basta para que EF los borre de la base:
        // un ingrediente no puede existir sin su receta.
        receta.Ingredientes.Clear();
        Aplicar(receta, datos, revisados);
        await db.SaveChangesAsync();

        // Recién guardada, así que existe.
        return (await Detalle(id))!;
    }

    // DELETE api/recetas/5
    // Solo el autor. La base borra en cascada sus ingredientes, favoritos y calificaciones.
    [Authorize]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Borrar(int id)
    {
        var receta = await db.Recetas.FindAsync(id);
        if (receta is null)
            return NotFound();
        if (receta.AutorId != User.IdDeUsuario())
            return Problem(statusCode: 403, detail: "Solo quien publicó la receta puede borrarla.");

        db.Recetas.Remove(receta);
        await db.SaveChangesAsync();
        return NoContent();
    }

    // Lo que ve el detalle. Si hay sesión, se llenan esMia y miCalificacion.
    private Task<RecetaDetalle?> Detalle(int id)
    {
        var usuarioId = User.IdDeUsuario();
        return db.Recetas.AsNoTracking()
            .Where(r => r.Id == id)
            .Select(r => new RecetaDetalle(
                r.Id, r.Nombre, r.Descripcion, r.Categoria.Nombre, r.Tiempo, r.Porciones, r.Foto,
                r.Ingredientes.OrderBy(i => i.Id).Select(i => i.Texto).ToList(), r.Pasos,
                r.Calificaciones.Average(c => (double?)c.Puntos), r.Calificaciones.Count,
                r.Autor == null ? null : r.Autor.Nombre,
                usuarioId != null && r.AutorId == usuarioId,
                r.Calificaciones.Where(c => c.UsuarioId == usuarioId).Select(c => (int?)c.Puntos).FirstOrDefault()))
            .FirstOrDefaultAsync();
    }

    private record DatosRevisados(Categoria Categoria, List<string> Ingredientes, List<string> Pasos);

    // Las reglas que los atributos de RecetaCrear no pueden revisar solos. Se usan al crear y al editar,
    // y devuelven todos los errores juntos para que la interfaz los muestre de una vez.
    private async Task<(DatosRevisados? Revisados, Dictionary<string, string[]> Errores)> Revisar(RecetaCrear datos)
    {
        var errores = new Dictionary<string, string[]>();

        var categoria = await db.Categorias.FirstOrDefaultAsync(c => c.Nombre == datos.Categoria);
        if (categoria is null)
            errores["categoria"] = ["La categoría debe ser Desayuno, Comida, Cena o Postre."];

        var ingredientes = Limpiar(datos.Ingredientes);
        if (ingredientes.Count == 0)
            errores["ingredientes"] = ["Se necesita al menos un ingrediente."];

        var pasos = Limpiar(datos.Pasos);
        if (pasos.Count == 0)
            errores["pasos"] = ["Se necesita al menos un paso."];

        if (!string.IsNullOrWhiteSpace(datos.Foto) && ValidadorFoto.Revisar(datos.Foto) is { } errorFoto)
            errores["foto"] = [errorFoto];

        return errores.Count > 0 ? (null, errores) : (new DatosRevisados(categoria!, ingredientes, pasos), errores);
    }

    private static void Aplicar(Receta receta, RecetaCrear datos, DatosRevisados revisados)
    {
        receta.Nombre = datos.Nombre.Trim();
        receta.Descripcion = datos.Descripcion.Trim();
        receta.Categoria = revisados.Categoria;
        receta.Tiempo = datos.Tiempo;
        receta.Porciones = datos.Porciones;
        receta.Foto = string.IsNullOrWhiteSpace(datos.Foto) ? null : datos.Foto;
        receta.Pasos = revisados.Pasos;
        receta.Ingredientes.AddRange(revisados.Ingredientes.Select(t => new Ingrediente { Texto = t }));
    }

    private static List<string> Limpiar(IEnumerable<string> textos) =>
        textos.Select(t => t.Trim()).Where(t => t.Length > 0).ToList();
}
