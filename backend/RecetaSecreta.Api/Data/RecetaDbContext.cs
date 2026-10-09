using Microsoft.EntityFrameworkCore;
using RecetaSecreta.Api.Models;

namespace RecetaSecreta.Api.Data;

public class RecetaDbContext(DbContextOptions<RecetaDbContext> options) : DbContext(options)
{
    public DbSet<Usuario> Usuarios => Set<Usuario>();
    public DbSet<Receta> Recetas => Set<Receta>();
    public DbSet<Ingrediente> Ingredientes => Set<Ingrediente>();
    public DbSet<Favorito> Favoritos => Set<Favorito>();
    public DbSet<Calificacion> Calificaciones => Set<Calificacion>();
    public DbSet<Categoria> Categorias => Set<Categoria>();

    protected override void OnModelCreating(ModelBuilder modelo)
    {
        modelo.Entity<Usuario>(e =>
        {
            e.Property(u => u.Nombre).HasMaxLength(60);
            e.Property(u => u.Correo).HasMaxLength(254);
            e.HasIndex(u => u.Correo).IsUnique();
        });

        modelo.Entity<Receta>(e =>
        {
            e.Property(r => r.Nombre).HasMaxLength(100);
            e.Property(r => r.Descripcion).HasMaxLength(350);
            // Restrict: no se puede borrar una categoría que todavía tiene recetas.
            e.HasOne(r => r.Categoria).WithMany()
                .HasForeignKey(r => r.CategoriaId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(r => r.Autor).WithMany(u => u.Recetas)
                .HasForeignKey(r => r.AutorId).OnDelete(DeleteBehavior.SetNull);
        });

        modelo.Entity<Ingrediente>(e =>
        {
            e.Property(i => i.Texto).HasMaxLength(200);
            e.HasOne<Receta>().WithMany(r => r.Ingredientes)
                .HasForeignKey(i => i.RecetaId).OnDelete(DeleteBehavior.Cascade);
        });

        // Un usuario guarda una receta una sola vez.
        modelo.Entity<Favorito>(e =>
        {
            e.HasKey(f => new { f.UsuarioId, f.RecetaId });
            e.HasOne(f => f.Usuario).WithMany().HasForeignKey(f => f.UsuarioId);
            e.HasOne(f => f.Receta).WithMany().HasForeignKey(f => f.RecetaId);
        });

        // Un usuario califica una receta una sola vez (RF-20), de 1 a 5.
        modelo.Entity<Calificacion>(e =>
        {
            e.HasKey(c => new { c.UsuarioId, c.RecetaId });
            e.HasOne(c => c.Usuario).WithMany().HasForeignKey(c => c.UsuarioId);
            e.HasOne(c => c.Receta).WithMany(r => r.Calificaciones).HasForeignKey(c => c.RecetaId);
            e.ToTable(t => t.HasCheckConstraint("CK_Calificacion_Puntos", "\"Puntos\" BETWEEN 1 AND 5"));
        });

        modelo.Entity<Categoria>(e =>
        {
            e.Property(c => c.Nombre).HasMaxLength(20);
            e.HasIndex(c => c.Nombre).IsUnique();
            e.HasData(
                new Categoria { Id = 1, Nombre = "Desayuno" },
                new Categoria { Id = 2, Nombre = "Comida" },
                new Categoria { Id = 3, Nombre = "Cena" },
                new Categoria { Id = 4, Nombre = "Postre" }

            );
        });
    }
}
