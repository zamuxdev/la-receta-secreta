namespace RecetaSecreta.Api.Models;

public class Usuario
{
    public int Id { get; set; }
    public string Nombre { get; set; } = "";
    public string Correo { get; set; } = "";
    public string PasswordHash { get; set; } = "";
    public string Rol { get; set; } = "Usuario";
    public List<Receta> Recetas { get; set; } = [];
}

public class Receta
{
    public int Id { get; set; }
    public string Nombre { get; set; } = "";
    public string Descripcion { get; set; } = "";
    public int CategoriaId { get; set; }
    public Categoria Categoria { get; set; } = null!;
    public int Tiempo { get; set; }
    public int Porciones { get; set; }
    // Ruta de una foto incluida o una imagen en data URL (JPG, PNG o WebP).
    public string? Foto { get; set; }
    public List<string> Pasos { get; set; } = [];
    public DateTime CreadaEn { get; set; } = DateTime.UtcNow;

    // Nulo hasta que exista autenticación.
    public int? AutorId { get; set; }
    public Usuario? Autor { get; set; }

    public List<Ingrediente> Ingredientes { get; set; } = [];
    public List<Calificacion> Calificaciones { get; set; } = [];
}

public class Ingrediente
{
    public int Id { get; set; }
    public int RecetaId { get; set; }
    public string Texto { get; set; } = "";
}

public class Favorito
{
    public int UsuarioId { get; set; }
    public Usuario Usuario { get; set; } = null!;
    public int RecetaId { get; set; }
    public Receta Receta { get; set; } = null!;
}

public class Calificacion
{
    public int UsuarioId { get; set; }
    public Usuario Usuario { get; set; } = null!;
    public int RecetaId { get; set; }
    public Receta Receta { get; set; } = null!;
    public int Puntos { get; set; }
}

public class Categoria
{
    public int Id { get; set; }
    public string Nombre { get; set; } = "";
}
