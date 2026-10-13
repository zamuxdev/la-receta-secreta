using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RecetaSecreta.Api.Data;
using RecetaSecreta.Api.Dtos;

namespace RecetaSecreta.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoriasController(RecetaDbContext db) : ControllerBase
{
    // GET api/categorias
    // Ordenadas por id para que salgan en el orden del día: Desayuno, Comida, Cena, Postre.
    [HttpGet]
    public async Task<ActionResult<List<CategoriaDto>>> Listar() =>
        await db.Categorias.AsNoTracking()
            .OrderBy(c => c.Id)
            .Select(c => new CategoriaDto(c.Id, c.Nombre))
            .ToListAsync();
}
