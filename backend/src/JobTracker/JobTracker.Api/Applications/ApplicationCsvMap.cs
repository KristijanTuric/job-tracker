using CsvHelper.Configuration;
using JobTracker.Domain.Entities;

namespace JobTracker.Api.Applications
{
    public sealed class ApplicationCsvMap : ClassMap<JobApplication>
    {
        public ApplicationCsvMap()
        {
            Map(m => m.CompanyName).Name("Company");
            Map(m => m.Position).Name("Position");
            Map(m => m.Status).Name("Status");
            Map(m => m.AppliedOn).Name("Applied On");
            Map(m => m.SourceUrl).Name("Source URL");
            Map(m => m.Notes).Name("Notes");
            Map(m => m.CreatedAtUtc).Name("Created");
            Map(m => m.UpdateAtUtc).Name("Updated");
        }
    }
}
