using System.Net;
using System.Net.Http.Json;

namespace JobTracker.Api.Tests;

public class AuthTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;

    public AuthTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task Register_WithValidData_Returns200()
    {
        var client = _factory.CreateClient();

        var response = await client.PostAsJsonAsync("/auth/register",
            new { Email = "new@test.com", Password = "Test1234!" });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task Register_DuplicateEmail_ReturnsError()
    {
        var client = _factory.CreateClient();
        var request = new { Email = "dupe@test.com", Password = "Test1234!" };

        await client.PostAsJsonAsync("/auth/register", request);
        var response = await client.PostAsJsonAsync("/auth/register", request);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Login_WithCorrectCredentials_ReturnsToken()
    {
        var client = _factory.CreateClient();
        var request = new { Email = "login@test.com", Password = "Test1234!" };

        await client.PostAsJsonAsync("/auth/register", request);
        var response = await client.PostAsJsonAsync("/auth/login", request);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadAsStringAsync();
        Assert.Contains("token", body, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task Login_WithWrongPassword_Returns401()
    {
        var client = _factory.CreateClient();
        var request = new { Email = "login@test.com", Password = "Test1234!" };

        await client.PostAsJsonAsync("/auth/register", request);
        var response = await client.PostAsJsonAsync("/auth/login", new { Email = "login@test.com", Password = "NotCorrect" });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task ProtectedEndpoint_WithoutToken_Returns401()
    {
        var client = _factory.CreateClient();

        var response = await client.GetAsync("/applications");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
}
