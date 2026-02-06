using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace JobTracker.Api.Auth;

public static class ClaimsPrincipalExtensions
{
    public static Guid GetUserId(this ClaimsPrincipal principal)
    {
        var sub = principal.FindFirstValue(JwtRegisteredClaimNames.Sub)
            ?? principal.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!Guid.TryParse(sub, out var userId))
            throw new InvalidOperationException("User id claim (sub) is missing or invalid.");

        return userId;
    }
}
