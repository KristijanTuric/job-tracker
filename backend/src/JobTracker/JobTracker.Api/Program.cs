using JobTracker.Api.Applications;
using JobTracker.Api.Auth;
using JobTracker.Domain.Identity;
using JobTracker.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Swagger Configuration
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    // Enables "Authorize" button in Swagger UI
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter: Bearer {your JWT token}"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// For DI of time-related operations
builder.Services.AddSingleton(TimeProvider.System);

var connectionString = builder.Configuration.GetConnectionString("Default") ?? throw new InvalidOperationException("Connection string 'Default' not found.");

// PostgreSQL database context using EF Core
builder.Services.AddDbContext<AppDbContext>(options => options.UseNpgsql(connectionString));

// Sets up user managment (password hashing, validation, ...)
builder.Services.AddIdentityCore<ApplicationUser>(options =>
{
    options.User.RequireUniqueEmail = true;
})
.AddRoles<IdentityRole<Guid>>() // Enables role base authorization
.AddEntityFrameworkStores<AppDbContext>() // Connects ASP.NET Identity to the DB
.AddSignInManager(); // Adds password verification functionality

// JWT Authentication

// Reads JWT configuration
var issuer = builder.Configuration["Jwt:Issuer"] ?? throw new InvalidOperationException("Jwt:Issuer not configured.");
var audience = builder.Configuration["Jwt:Audience"] ?? throw new InvalidOperationException("Jwt:Audience not configured.");
var signingKey = builder.Configuration["Jwt:SigningKey"] ?? throw new InvalidOperationException("Jwt:SigningKey not configured.");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        // Token validation rules
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true, // Token must be issued by the configuration issuer
            ValidIssuer = issuer,
            ValidateAudience = true, // Token must be intended for this API
            ValidAudience = audience,
            ValidateIssuerSigningKey = true, // Token signature must match the signing key
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(signingKey)),
            ValidateLifetime = true, // Token must not have expired
            ClockSkew = TimeSpan.FromMinutes(1) // 1-minute grace period for clock differences between servers
        };
    });

builder.Services.AddAuthorization();

// Register custom JwtToken Service
builder.Services.AddScoped<JwtTokenService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection(); // Redirects HTTP -> HTTPS
// IMPORTANT: auth middleware must be in pipeline
app.UseAuthentication(); // MUST come before Authorization ; validates JWT Tokens and populates ClaimsPrincipal
app.UseAuthorization(); // Checks if user has permission to access endpoints

// ENDPOINTS

// POST /auth/register ; REGISTER NEW USER
app.MapPost("/auth/register", async (
        RegisterRequest request,
        UserManager<ApplicationUser> userManager) =>
{
    var user = new ApplicationUser
    {
        Id = Guid.NewGuid(),
        UserName = request.Email,
        Email = request.Email
    };

    var result = await userManager.CreateAsync(user, request.Password);
    if (!result.Succeeded)
    {
        var errors = result.Errors.Select(e => new { e.Code, e.Description });
        return Results.BadRequest(new { message = "Registration failed", errors });
    }

    return Results.Created($"/users/{user.Id}", new { userId = user.Id, email = user.Email });
})
.WithName("Register")
.WithOpenApi();


app.MapPost("/auth/login", async (
        LoginRequest request,
        UserManager<ApplicationUser> userManager,
        JwtTokenService tokenService) =>
{
    var user = await userManager.FindByEmailAsync(request.Email);
    if (user is null)
        return Results.Unauthorized();

    var ok = await userManager.CheckPasswordAsync(user, request.Password);
    if (!ok)
        return Results.Unauthorized();

    var token = tokenService.CreateAccessToken(user);
    return Results.Ok(new AuthorizationResponse(token));
})
.WithName("Login")
.WithOpenApi();

app.MapGet("/me", (ClaimsPrincipal principal) =>
{
    var sub = principal.FindFirstValue(JwtRegisteredClaimNames.Sub)
              ?? principal.FindFirstValue(ClaimTypes.NameIdentifier);

    var email = principal.FindFirstValue(JwtRegisteredClaimNames.Email)
                ?? principal.FindFirstValue(ClaimTypes.Email)
                ?? string.Empty;

    if (!Guid.TryParse(sub, out var userId))
        return Results.Unauthorized();

    return Results.Ok(new MeResponse(userId, email));
})
.RequireAuthorization()
.WithName("Me")
.WithOpenApi();

app.MapApplicationEndpoints();

app.Run();
