using JobTracker.Api.Auth;
using JobTracker.Domain.Entities;
using JobTracker.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace JobTracker.Api.Applications;

public static class ApplicationEndpoints
{
    public static RouteGroupBuilder MapApplicationEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/applications")
            .RequireAuthorization()
            .WithTags("Applications");

        // List current users job applications
        group.MapGet("/", async (AppDbContext db, HttpContext http) =>
        {
            var userId = http.User.GetUserId();

            var apps = await db.JobApplications
            .Where(x => x.OwnerId == userId)
            .OrderByDescending(x => x.UpdateAtUtc)
            .Select(x => new JobApplicationResponse(x.Id, x.CompanyName, x.Position, x.Status, x.AppliedOn, x.SourceUrl, x.Notes, x.CreatedAtUtc, x.UpdateAtUtc))
            .ToListAsync();

            return Results.Ok(apps);
        }).WithName("ListApplications");

        // GET job application by id, if owned by current user
        group.MapGet("/{id:guid}", async (Guid id, AppDbContext db, HttpContext http) =>
        {
            var userId = http.User.GetUserId();

            var appEntity = await db.JobApplications
            .Where(x => x.OwnerId == userId && x.Id == id)
            .SingleOrDefaultAsync();

            if (appEntity is null) return Results.NotFound();

            return Results.Ok(new JobApplicationResponse(appEntity.Id, appEntity.CompanyName, appEntity.Position, appEntity.Status, appEntity.AppliedOn, appEntity.SourceUrl, appEntity.Notes, appEntity.CreatedAtUtc, appEntity.UpdateAtUtc));

        }).WithName("GetApplication");

        // CREATE (OwnerId from token)
        group.MapPost("/", async (CreateJobApplicationRequest request, AppDbContext db, HttpContext http) =>
        {
            var userId = http.User.GetUserId();
            var now = DateTime.UtcNow;

            var entity = new JobApplication
            {
                Id = Guid.NewGuid(),
                OwnerId = userId,
                CompanyName = request.CompanyName,
                Position = request.Position,
                Status = request.Status,
                AppliedOn = request.AppliedOn,
                SourceUrl = request.SourceUrl,
                Notes = request.Notes,
                CreatedAtUtc = now,
                UpdateAtUtc = now
            };

            db.JobApplications.Add(entity);
            await db.SaveChangesAsync();

            return Results.Created($"/applications/{entity.Id}", new JobApplicationResponse(entity.Id, entity.CompanyName, entity.Position, entity.Status, entity.AppliedOn, entity.SourceUrl, entity.Notes, entity.CreatedAtUtc, entity.UpdateAtUtc));
        }).WithName("CreateApplication");

        // UPDATE if owned by current user
        group.MapPut("/{id:guid}", async (Guid id, UpdateJobApplicationRequest request, AppDbContext db, HttpContext http) =>
        {
            var userId = http.User.GetUserId();

            var entity = await db.JobApplications
            .Where(x => x.OwnerId == userId && x.Id == id)
            .SingleOrDefaultAsync();

            if (entity is null) return Results.NotFound();

            entity.CompanyName = request.CompanyName;
            entity.Position = request.Position;
            entity.Status = request.Status;
            entity.AppliedOn = request.AppliedOn;
            entity.SourceUrl = request.SourceUrl;
            entity.Notes = request.Notes;
            entity.UpdateAtUtc = DateTime.UtcNow;

            await db.SaveChangesAsync();

            return Results.Ok(new JobApplicationResponse(entity.Id, entity.CompanyName, entity.Position, entity.Status, entity.AppliedOn, entity.SourceUrl, entity.Notes, entity.CreatedAtUtc, entity.UpdateAtUtc));
        }).WithName("UpdateApplication");

        // DELETE (only if owned)
        group.MapDelete("/{id:guid}", async (Guid id, AppDbContext db, HttpContext http) =>
        {
            var userId = http.User.GetUserId();

            var entity = await db.JobApplications
            .Where(x => x.OwnerId == userId && x.Id == id)
            .SingleOrDefaultAsync();

            if (entity is null) return Results.NotFound();

            db.JobApplications.Remove(entity);
            await db.SaveChangesAsync();

            return Results.NoContent();

        }).WithName("DeleteApplication");

        return group;
    }
}
