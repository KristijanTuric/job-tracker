namespace JobTracker.Api.Auth;

public sealed record RegisterRequest(string Email, string Password);
public sealed record LoginRequest(string Email, string Password);
public sealed record AuthorizationResponse(string AccessToken);
public sealed record MeResponse(Guid UserId, string Email);
