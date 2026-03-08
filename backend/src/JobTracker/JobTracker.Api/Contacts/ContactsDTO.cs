namespace JobTracker.Api.Contacts;

public sealed record CreateContactRequest(
    string Name,
    string? Email,
    string? Phone,
    string? Role,
    string? Notes
);
public sealed record UpdateContactRequest(
    string Name,
    string? Email,
    string? Phone,
    string? Role,
    string? Notes
);

public sealed record ContactResponse(
    Guid Id,
    Guid JobApplicationId,
    string Name,
    string? Email,
    string? Phone,
    string? Role,
    string? Notes
);
