using System.Security.Claims;
using Microsoft.IdentityModel.JsonWebTokens;

namespace RecetaSecreta.Api.Seguridad;

public static class UsuarioClaims
{
    // El id del usuario viene en "sub" del token; es null si no hay sesión.
    public static int? IdDeUsuario(this ClaimsPrincipal usuario) =>
        int.TryParse(usuario.FindFirstValue(JwtRegisteredClaimNames.Sub), out var id) ? id : null;
}
