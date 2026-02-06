using JobTracker.Domain.Entities;

namespace JobTracker.Api.Applications;

public sealed record CreateJobApplicationRequest(
    string CompanyName,
    string Position,
    ApplicationStatus Status,
    DateOnly? AppliedOn,
    string? SourceUrl,
    string? Notes);

public sealed record UpdateJobApplicationRequest(
    string CompanyName,
    string Position,
    ApplicationStatus Status,
    DateOnly? AppliedOn,
    string? SourceUrl,
    string? Notes);

public sealed record JobApplicationResponse(
    Guid Id,
    string CompanyName,
    string Position,
    ApplicationStatus Status,
    DateOnly? AppliedOn,
    string? SourceUrl,
    string? Notes,
    DateTime CreatedAtUtc,
    DateTime UpdatedAtUtc);