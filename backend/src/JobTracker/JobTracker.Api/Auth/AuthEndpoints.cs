using JobTracker.Domain.Identity;
using Microsoft.AspNetCore.Identity;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace JobTracker.Api.Auth;

public static class AuthEndpoints
{
    public static RouteGroupBuilder MapAuthEndpoints(this IEndpointRouteBuilder builder)
    {
        var group = builder.MapGroup("/auth")
            .WithOpenApi()
            .WithTags("Auth");

        // POST /auth/register ; REGISTER NEW USER
        group.MapPost("/register", async (
                RegisterRequest request,
                UserManager<ApplicationUser> userManager,
                JwtTokenService tokenService) =>
        {
            var user = new ApplicationUser
            {
                Id = Guid.NewGuid(),
                UserName = request.Email,
                Email = request.Email,
            };

            // UserManager.CreateAsync checks for duplicate users
            var result = await userManager.CreateAsync(user, request.Password);
            if (!result.Succeeded)
            {
                var errors = result.Errors.Select(e => new { e.Code, e.Description });
                return Results.BadRequest(new { message = "Registration failed", errors });
            }

            var token = tokenService.CreateAccessToken(user);
            return Results.Ok(new AuthorizationResponse(token));
        }).WithName("Register");

        // POST /auth/login ; LOGIN USER
        group.MapPost("/login", async (
            LoginRequest request,
            UserManager<ApplicationUser> userManager,
            JwtTokenService tokenService) =>
        {
            var user = await userManager.FindByEmailAsync(request.Email);
            if (user is null) return Results.Unauthorized();

            var ok = await userManager.CheckPasswordAsync(user, request.Password);
            if (!ok) return Results.Unauthorized();

            var token = tokenService.CreateAccessToken(user);
            return Results.Ok(new AuthorizationResponse(token));
        }).WithName("Login");

        group.MapGet("/me", (ClaimsPrincipal principal) =>
        {
            var sub = principal.FindFirstValue(JwtRegisteredClaimNames.Sub)
                        ?? principal.FindFirstValue(ClaimTypes.NameIdentifier);

            var email = principal.FindFirstValue(JwtRegisteredClaimNames.Email)
                        ?? principal.FindFirstValue(ClaimTypes.Email)
                        ?? string.Empty;

            if (!Guid.TryParse(sub, out var userId)) return Results.Unauthorized();

            return Results.Ok(new MeResponse(userId, email));
        }).RequireAuthorization()
        .WithName("Me");

        return group;
    }
}
