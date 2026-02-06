using Microsoft.AspNetCore.Identity;

namespace JobTracker.Domain.Identity;

/// <summary>
/// Define our own user type, for later extension
/// </summary>
public class ApplicationUser : IdentityUser<Guid>
{

}
