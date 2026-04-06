using JobTracker.Api.Auth;
using System.Net.Http.Json;

namespace JobTracker.Api.Tests;

public static class AuthHelper
{
    public static async Task<HttpClient> CreateAuthenticatedClient(
        CustomWebApplicationFactory factory,
        string email = "test@example.com",
        string password = "Test1234!")
    {
        var client = factory.CreateClient();

        await client.PostAsJsonAsync("/auth/register", new RegisterRequest(email, password));

        var loginResponse = await client.PostAsJsonAsync("/auth/login", new LoginRequest(email, password));
        var result = await loginResponse.Content.ReadFromJsonAsync<AuthorizationResponse>();

        client.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", result!.AccessToken);

        return client;
    }
}
