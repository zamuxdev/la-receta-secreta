using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;
using RecetaSecreta.Api.Data;
using RecetaSecreta.Api.Dtos;
using RecetaSecreta.Api.Models;
using RecetaSecreta.Api.Seguridad;

namespace RecetaSecreta.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(
    RecetaDbContext db, IPasswordHasher<Usuario> hasher, IConfiguration configuracion) : ControllerBase
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

    // POST api/auth/login
    [HttpPost("login")]
    public async Task<ActionResult<LoginRespuesta>> IniciarSesion(LoginCrear datos)
    {
        var correo = datos.Correo.Trim().ToLowerInvariant();
        var usuario = await db.Usuarios.AsNoTracking().FirstOrDefaultAsync(u => u.Correo == correo);

        if (usuario is null)
        {
            // Se calcula un hash igual, para que responder no sea más rápido
            // cuando el correo no existe y no se pueda adivinar qué cuentas hay.
            hasher.HashPassword(new Usuario(), datos.Password);
            return CredencialesIncorrectas();
        }
        if (hasher.VerifyHashedPassword(usuario, usuario.PasswordHash, datos.Password) == PasswordVerificationResult.Failed)
            return CredencialesIncorrectas();

        return CrearSesion(usuario);
    }

    // GET api/auth/yo
    [Authorize]
    [HttpGet("yo")]
    public async Task<ActionResult<UsuarioDto>> Yo()
    {
        // "sub" es el id del usuario que guardamos en el token al iniciar sesión.
        var id = User.IdDeUsuario();
        var usuario = await db.Usuarios.AsNoTracking().FirstOrDefaultAsync(u => u.Id == id);
        // El token puede ser válido aunque la cuenta ya no exista.
        return usuario is null ? Unauthorized() : ADto(usuario);
    }

    // El mismo mensaje si falla el correo o la contraseña (contrato 10.5).
    private ObjectResult CredencialesIncorrectas() =>
        Problem(statusCode: 401, detail: "Correo o contraseña incorrectos.");

    // El token lleva quién es el usuario y vence en Jwt:MinutosDeVida.
    // Se firma con Jwt:Clave, que vive en user-secrets y no en el código.
    private LoginRespuesta CrearSesion(Usuario usuario)
    {
        var jwt = configuracion.GetSection("Jwt");
        var expiraEn = DateTime.UtcNow.AddMinutes(jwt.GetValue<int>("MinutosDeVida"));
        var clave = new SymmetricSecurityKey(Convert.FromBase64String(jwt["Clave"]!));

        var token = new JsonWebTokenHandler().CreateToken(new SecurityTokenDescriptor
        {
            Issuer = jwt["Emisor"],
            Audience = jwt["Audiencia"],
            Expires = expiraEn,
            Subject = new ClaimsIdentity(
            [
                new Claim(JwtRegisteredClaimNames.Sub, usuario.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Name, usuario.Nombre),
                new Claim(JwtRegisteredClaimNames.Email, usuario.Correo),
                new Claim("role", usuario.Rol),
            ]),
            SigningCredentials = new SigningCredentials(clave, SecurityAlgorithms.HmacSha256),
        });

        return new LoginRespuesta(token, expiraEn, ADto(usuario));
    }

    private static UsuarioDto ADto(Usuario u) => new(u.Id, u.Nombre, u.Correo, u.Rol);
}
