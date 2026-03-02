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

export type CreateJobApplicationRequest = {
    companyName: string;
    position: string;
    status: number;
    appliedOn: string | null;
    sourceUrl: string | null;
    notes: string | null;
}

export type UpdateJobApplicationRequest = {
    companyName: string;
    position: string;
    status: number;
    appliedOn: string | null;
    sourceUrl: string | null;
    notes: string | null;
}

export async function listApplications(): Promise<JobApplicationResponse[]> {
    return ( await apiFetch("/api/applications")) as JobApplicationResponse[];
}

export async function createApplication(request: CreateJobApplicationRequest): Promise<JobApplicationResponse> {
    return (await apiFetch("/api/applications", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(request),
    })) as JobApplicationResponse;
}

export async function deleteApplication(id: string): Promise<void> {
    return (await apiFetch(`/api/applications/${id}`, {
        method: "DELETE",
    }));
}