using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Identity;
using RecetaSecreta.Api.Models;

namespace RecetaSecreta.Api.Data;

public static class DatosIniciales
{
    // Carga las recetas de ejemplo solo si la base está vacía,
    // así reiniciar la API no duplica datos.
    public static void Sembrar(RecetaDbContext db)
    {
        if (db.Recetas.Any()) return;

        var categorias = db.Categorias.ToDictionary(c => c.Nombre);

        db.Recetas.AddRange(
            new Receta
            {
                Nombre = "Tacos de frijol con aguacate",
                Descripcion = "Una comida rápida para esos días con poco tiempo.",
                Categoria = categorias["Comida"],
                Tiempo = 15,
                Porciones = 2,
                Foto = "fotos/tacos.jpg",
                Ingredientes =
                [
                    new Ingrediente { Texto = "6 tortillas de maíz" },
                    new Ingrediente { Texto = "1 taza de frijoles cocidos" },
                    new Ingrediente { Texto = "1 aguacate" },
                    new Ingrediente { Texto = "Salsa al gusto" },
                ],
                Pasos =
                [
                    "Calienta los frijoles en una sartén.",
                    "Calienta las tortillas por ambos lados.",
                    "Rellena con frijoles, agrega aguacate y termina con salsa.",
                ],
            },
            new Receta
            {
                Nombre = "Avena con plátano",
                Descripcion = "Un desayuno sencillo para empezar bien el día.",
                Categoria = categorias["Desayuno"],
                Tiempo = 10,
                Porciones = 1,
                Foto = "fotos/avena.jpg",
                Ingredientes =
                [
                    new Ingrediente { Texto = "½ taza de avena" },
                    new Ingrediente { Texto = "1 taza de leche o bebida vegetal" },
                    new Ingrediente { Texto = "1 plátano" },
                    new Ingrediente { Texto = "Canela al gusto" },
                ],
                Pasos =
                [
                    "Mezcla la avena y la leche en una olla.",
                    "Cocina a fuego bajo durante 5 minutos, moviendo con frecuencia.",
                    "Sirve con plátano en rodajas y canela.",
                ],
            },
            new Receta
            {
                Nombre = "Ensalada de garbanzo",
                Descripcion = "Fresca, fácil de llevar y sin encender la estufa.",
                Categoria = categorias["Comida"],
                Tiempo = 12,
                Porciones = 2,
                Foto = "fotos/ensalada.jpg",
                Ingredientes =
                [
                    new Ingrediente { Texto = "1 taza de garbanzos cocidos" },
                    new Ingrediente { Texto = "1 pepino" },
                    new Ingrediente { Texto = "1 jitomate" },
                    new Ingrediente { Texto = "1 limón" },
                    new Ingrediente { Texto = "1 cucharada de aceite de oliva" },
                ],
                Pasos =
                [
                    "Lava y corta el pepino y el jitomate en cubos.",
                    "Mezcla las verduras con los garbanzos.",
                    "Añade el jugo de limón y el aceite antes de servir.",
                ],
            }
        );

        db.SaveChanges();
    }

    // Crea las cuentas de la sección CuentasIniciales de la configuración (user-secrets en local,
    // variables de entorno en el servidor), para que nadie tenga que registrarse.
    // Si el correo ya existe, no se toca: así reiniciar la API no cambia contraseñas ni duplica cuentas.
    public static void SembrarCuentas(RecetaDbContext db, IPasswordHasher<Usuario> hasher, List<CuentaInicial> cuentas)
    {
        foreach (var cuenta in cuentas)
        {
            var correo = cuenta.Correo.Trim().ToLowerInvariant();
            // Las mismas reglas que el registro (contrato 10.5). Una cuenta mal escrita detiene el arranque
            // con un mensaje claro, en lugar de quedar a medias sin que nadie se entere.
            if (cuenta.Nombre.Trim().Length is 0 or > 60 || !new EmailAddressAttribute().IsValid(correo) || cuenta.Password.Length < 8)
                throw new InvalidOperationException(
                    $"La cuenta inicial '{correo}' no es válida: necesita nombre (hasta 60 caracteres), un correo válido y una contraseña de al menos 8 caracteres.");

            // Local cubre un correo repetido dentro de la misma lista, que aún no está guardado.
            if (db.Usuarios.Any(u => u.Correo == correo) || db.Usuarios.Local.Any(u => u.Correo == correo)) continue;

            var usuario = new Usuario { Nombre = cuenta.Nombre.Trim(), Correo = correo };
            // Solo se guarda el hash, igual que en el registro.
            usuario.PasswordHash = hasher.HashPassword(usuario, cuenta.Password);
            db.Usuarios.Add(usuario);
        }
        db.SaveChanges();
    }
}

// Una cuenta precargada, tal como viene de la configuración.
public class CuentaInicial
{
    public string Nombre { get; set; } = "";
    public string Correo { get; set; } = "";
    public string Password { get; set; } = "";
}
