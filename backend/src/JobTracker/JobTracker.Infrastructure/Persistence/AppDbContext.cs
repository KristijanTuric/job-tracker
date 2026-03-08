using JobTracker.Domain.Entities;
using JobTracker.Domain.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace JobTracker.Infrastructure.Persistence;

public class AppDbContext : IdentityDbContext<ApplicationUser, IdentityRole<Guid>, Guid>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) {}

    public DbSet<JobApplication> JobApplications => Set<JobApplication>();
    public DbSet<Contact> Contacts => Set<Contact>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<JobApplication>(entity =>
        {
            entity.HasKey(x => x.Id);

            entity.Property(x => x.CompanyName).HasMaxLength(200).IsRequired();
            entity.Property(x => x.Position).HasMaxLength(200).IsRequired();
            entity.Property(x => x.SourceUrl).HasMaxLength(2048);

            entity.HasOne<ApplicationUser>()
                .WithMany()
                .HasForeignKey(x => x.OwnerId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(x => new { x.OwnerId, x.Status });
            entity.HasIndex(x => x.OwnerId);
        });

        builder.Entity<Contact>(entity =>
        {
            entity.HasKey(x => x.Id);

            entity.Property(x => x.Name).HasMaxLength(200).IsRequired();
            entity.Property(x => x.Email).HasMaxLength(200);
            entity.Property(x => x.Phone).HasMaxLength(50);
            entity.Property(x => x.Role).HasMaxLength(100);

            entity.HasOne(x => x.JobApplication)
                .WithMany(x => x.Contacts)
                .HasForeignKey(x => x.JobApplicationId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
