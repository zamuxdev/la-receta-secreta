using System.ComponentModel.DataAnnotations;

namespace RecetaSecreta.Api.Dtos;

public record RegistroCrear(
    [Required(ErrorMessage = "El nombre es obligatorio.")]
    [StringLength(60, ErrorMessage = "El nombre no puede pasar de 60 caracteres.")]
    string Nombre,
    [Required(ErrorMessage = "El correo es obligatorio.")]
    [EmailAddress(ErrorMessage = "El correo no tiene un formato válido.")]
    [StringLength(254, ErrorMessage ="El correo no puede pasar de 254 caracteres.")]
    string Correo,
    [Required(ErrorMessage = "La contraseña es obligatoria.")]
    [MinLength(8,ErrorMessage = "La contraseña debe tener al menos 8 caracteres.")]
    string Password);

// Sin reglas de formato: si el correo no existe, el login responde el mismo 401 genérico.
public record LoginCrear(
    [Required(ErrorMessage = "El correo es obligatorio.")]
    string Correo,
    [Required(ErrorMessage = "La contraseña es obligatoria.")]
    string Password);

public record UsuarioDto(
    int Id,
    string Nombre,
    string Correo,
    string Rol
);

// Lo que devuelve el login: el token para la cabecera Authorization y quién entró.
public record LoginRespuesta(string Token, DateTime ExpiraEn, UsuarioDto Usuario);