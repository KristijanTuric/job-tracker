namespace JobTracker.Domain.Entities;

public enum ApplicationStatus
{
    NotApplied = 0,
    Applied = 1,
    Interviewing = 2,
    Rejected = 3,
    Accepted = 4,
    Archived = 5
}
