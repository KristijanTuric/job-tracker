using JobTracker.Api.Applications;
using System.Net.Http.Json;
using System.Net;
using JobTracker.Domain.Entities;

namespace JobTracker.Api.Tests;

public class ApplicationTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;

    public ApplicationTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
    }

    private async Task<HttpClient> GetClient(string email = "apptest@test.com")
    {
        return await AuthHelper.CreateAuthenticatedClient(_factory, email);
    }

    [Fact]
    public async Task CreateApplication_ReturnsCreated()
    {
        var client = await GetClient();

        var response = await client.PostAsJsonAsync("/applications",
            new CreateJobApplicationRequest("Google", "SWE", 0, null, null, null));

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        var app = await response.Content.ReadFromJsonAsync<JobApplicationResponse>();
        Assert.Equal("Google", app!.CompanyName);
        Assert.Equal("SWE", app.Position);
    }

    [Fact]
    public async Task ListApplications_ReturnsOnlyOwnData()
    {
        var clientA = await GetClient("userA@test.com");
        await clientA.PostAsJsonAsync("/applications",
            new CreateJobApplicationRequest("CompanyA", "RoleA", 0, null, null, null));

        var clientB = await GetClient("userB@test.com");
        await clientB.PostAsJsonAsync("/applications",
            new CreateJobApplicationRequest("CompanyB", "RoleB", 0, null, null, null));

        var response = await clientA.GetFromJsonAsync<List<JobApplicationResponse>>("/applications");
        Assert.Single(response!);
        Assert.Equal("CompanyA", response![0].CompanyName);
    }

    [Fact]
    public async Task UpdateApplication_ReturnsUpdatedData()
    {
        var client = await GetClient("user@test.com");
        var createResponse = await client.PostAsJsonAsync("/applications", new CreateJobApplicationRequest("OldCompany", "OldRole", 0, null, null, null));
        var created = await createResponse.Content.ReadFromJsonAsync<JobApplicationResponse>();

        var updatedResponse = await client.PutAsJsonAsync($"/applications/{created!.Id}", 
            new UpdateJobApplicationRequest("NewCompany", "NewRole", ApplicationStatus.Rejected, null, null, null));

        Assert.Equal(HttpStatusCode.OK, updatedResponse.StatusCode);

        var updated = await updatedResponse.Content.ReadFromJsonAsync<JobApplicationResponse>();
        Assert.Equal("NewCompany", updated!.CompanyName);
        Assert.Equal("NewRole", updated.Position);
        Assert.Equal(ApplicationStatus.Rejected, updated.Status);
    }

    [Fact]
    public async Task DeleteApplication_ReturnsNoContent()
    {
        var client = await GetClient("user@test.com");
        var createResponse = await client.PostAsJsonAsync("/applications", new CreateJobApplicationRequest("OldCompany", "OldRole", 0, null, null, null));
        var created = await createResponse.Content.ReadFromJsonAsync<JobApplicationResponse>();

        var deleteResponse = await client.DeleteAsync($"/applications/{created!.Id}");
        Assert.Equal(HttpStatusCode.NoContent, deleteResponse.StatusCode);

        var list = await client.GetFromJsonAsync<List<JobApplicationResponse>>("/applications");
        Assert.Empty(list!);
    }

    [Fact]
    public async Task AccessOtherUserApp_ReturnsNotFound()
    {
        var clientA = await GetClient("ownerA@test.com");
        var createResponse = await clientA.PostAsJsonAsync("/applications", new CreateJobApplicationRequest("Secret", "Role", 0, null, null, null));
        var created = await createResponse.Content.ReadFromJsonAsync<JobApplicationResponse>();

        var clientB = await GetClient("ownerB@test.com");
        var response = await clientB.GetAsync($"/applications/{created!.Id}");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
}
