using CsvHelper;
using JobTracker.Api.Auth;
using JobTracker.Api.Contacts;
using JobTracker.Domain.Entities;
using JobTracker.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System.Globalization;

namespace JobTracker.Api.Applications;

public static class ApplicationEndpoints
{
    public static RouteGroupBuilder MapApplicationEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/applications")
            .RequireAuthorization()
            .WithTags("Applications");

        #region Application Endpoints

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

        group.MapGet("/export", async (AppDbContext db, HttpContext http) =>
        {
            var userId = http.User.GetUserId();

            var apps = await db.JobApplications
            .Where(x => x.OwnerId == userId)
            .OrderByDescending(x => x.UpdateAtUtc)
            .ToListAsync();

            using var memoryStream = new MemoryStream();
            using var writer = new StreamWriter(memoryStream, System.Text.Encoding.UTF8);
            using var csv = new CsvWriter(writer, CultureInfo.InvariantCulture);

            csv.Context.RegisterClassMap<ApplicationCsvMap>();
            csv.WriteRecords(apps);

            writer.Flush();

            return Results.File(memoryStream.ToArray(), "text/csv", "applications.csv");
        }).WithName("ExportApplications");

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

        #endregion

        #region Contacts Endpoints

        // Get all contacts for a job application
        group.MapGet("/{id:guid}/contacts", async (Guid id, AppDbContext db, HttpContext http) =>
        {
            var userId = http.User.GetUserId();

            var contacts = await db.Contacts
            .Where(x => x.JobApplication.OwnerId == userId && x.JobApplicationId == id)
            .OrderBy(x => x.Name)
            .Select(x => new ContactResponse(x.Id, x.JobApplicationId, x.Name, x.Email, x.Phone, x.Role, x.Notes))
            .ToListAsync();

            return Results.Ok(contacts);

        }).WithName("ListContacts");

        // CREATE a new Contact for a specific job application
        group.MapPost("/{id:guid}/contacts", async (Guid id, CreateContactRequest request, AppDbContext db, HttpContext http) => 
        {
            var userId = http.User.GetUserId();

            var application = await db.JobApplications
                .FirstOrDefaultAsync(x => x.Id == id && x.OwnerId == userId);

            if (application is null) return Results.NotFound();

            var entity = new Contact
            {
                Id = Guid.NewGuid(),
                JobApplicationId = id,
                Name = request.Name,
                Email = request.Email,
                Phone = request.Phone,
                Role = request.Role,
                Notes = request.Notes
            };

            db.Contacts.Add(entity);
            await db.SaveChangesAsync();

            return Results.Created($"/applications/{id}/contacts/{entity.Id}", new ContactResponse(entity.Id, entity.JobApplicationId, entity.Name, entity.Email, entity.Phone, entity.Role, entity.Notes));
        }).WithName("CreateContact");

        // UPDATE an existings Contacts info
        group.MapPut("/{id:guid}/contacts/{contactId:guid}", async (Guid id, Guid contactId, UpdateContactRequest request, AppDbContext db, HttpContext http) =>
        {
            var userId = http.User.GetUserId();

            var application = await db.JobApplications
                .FirstOrDefaultAsync(x => x.Id == id && x.OwnerId == userId);

            if (application is null) return Results.NotFound();

            var entity = await db.Contacts
                .Where(x => x.Id == contactId && x.JobApplicationId == id)
                .SingleOrDefaultAsync();

            if (entity is null) return Results.NotFound();

            entity.Name = request.Name;
            entity.Email = request.Email;
            entity.Phone = request.Phone;
            entity.Role = request.Role;
            entity.Notes = request.Notes;

            await db.SaveChangesAsync();
            return Results.Ok(new ContactResponse(entity.Id, entity.JobApplicationId, entity.Name, entity.Email, entity.Phone, entity.Role, entity.Notes));
        }).WithName("UpdateContact");

        group.MapDelete("/{id:guid}/contacts/{contactId:guid}", async (Guid id, Guid contactId, AppDbContext db, HttpContext http) =>
        {
            var userId = http.User.GetUserId();

            var entity = await db.Contacts
                .Where(x => x.Id == contactId && x.JobApplicationId == id && x.JobApplication.OwnerId == userId)
                .SingleOrDefaultAsync();

            if (entity is null) return Results.NotFound();

            db.Contacts.Remove(entity);
            await db.SaveChangesAsync();

            return Results.NoContent();
        }).WithName("DeleteContact");

        #endregion

        return group;
    }
}
