namespace JobTracker.Domain.Entities;

public sealed class JobApplication
{
    public Guid Id { get; set; }
    
    public Guid OwnerId { get; set; }

    public string CompanyName { get; set; } = string.Empty;
    public string Position {  get; set; } = string.Empty;

    public ApplicationStatus Status { get; set; } = ApplicationStatus.NotApplied;

    public DateOnly? AppliedOn { get; set; }
    public string? SourceUrl { get; set; }
    public string? Notes {  get; set; }

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime UpdateAtUtc { get; set; } = DateTime.UtcNow;
}
