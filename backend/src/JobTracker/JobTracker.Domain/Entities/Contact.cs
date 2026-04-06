namespace JobTracker.Domain.Entities;

public sealed class Contact
{
    public Guid Id { get; set; }
    public Guid JobApplicationId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Role { get; set; }
    public string? Notes { get; set; }

    public required JobApplication JobApplication { get; set; }  // Navigation property
}
