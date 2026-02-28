import { apiFetch } from "./http";

export type ApplicationStatus = "Not Applied" | "Applied" | "Interviewing" | "Rejected" | "Accepted" | "Archived";

const APPLICATION_STATUSES: ApplicationStatus[] = [
    "Not Applied",
    "Applied",
    "Interviewing",
    "Rejected",
    "Accepted",
    "Archived",
];

export function formatStatus(status: number): ApplicationStatus {
    return APPLICATION_STATUSES[status] ?? "Not Applied";
}

export type JobApplicationResponse = {
    id: string;
    companyName: string;
    position: string;
    status: number; // Because backend enum is int
    appliedOn: string | null;
    sourceUrl: string | null;
    notes: string | null;
    createdAtUtc: string;
    updatedAtUtc: string;
};

export async function listApplications(): Promise<JobApplicationResponse[]> {
    return ( await apiFetch("/api/applications")) as JobApplicationResponse[];
}