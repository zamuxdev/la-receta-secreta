using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RecetaSecreta.Api.Data;
using RecetaSecreta.Api.Dtos;
using RecetaSecreta.Api.Models;

namespace RecetaSecreta.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(RecetaDbContext db, IPasswordHasher<Usuario> hasher) : ControllerBase
{
    // POST api/auth/registro
    [HttpPost("registro")]
    public async Task<ActionResult<UsuarioDto>> Registrar(RegistroCrear datos)
    {
        // En minúsculas para que Alex@Correo.com y alex@correo.com sean la misma cuenta.
        var correo = datos.Correo.Trim().ToLowerInvariant();

        if (await db.Usuarios.AnyAsync(u => u.Correo == correo))
        {
            return Conflict(new ValidationProblemDetails(new Dictionary<string, string[]>
            {
                ["correo"] = ["Ya existe una cuenta con ese correo."],
            }) { Status = 409 });
        }

        var usuario = new Usuario { Nombre = datos.Nombre.Trim(), Correo = correo };
        // Solo se guarda el hash: la contraseña nunca queda en la base.
        usuario.PasswordHash = hasher.HashPassword(usuario, datos.Password);
        db.Usuarios.Add(usuario);
        await db.SaveChangesAsync();

        return StatusCode(201, ADto(usuario));
    }

    private static UsuarioDto ADto(Usuario u) => new(u.Id, u.Nombre, u.Correo, u.Rol);
}
