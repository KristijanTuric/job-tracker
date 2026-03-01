using JobTracker.Api.Applications;
using JobTracker.Api.Auth;
using JobTracker.Domain.Identity;
using JobTracker.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
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
app.MapAuthEndpoints();
app.MapApplicationEndpoints();

app.Run();
