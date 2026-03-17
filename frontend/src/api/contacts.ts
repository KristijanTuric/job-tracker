import { apiFetch } from "./http";

export type CreateContactRequest = {
    name: string;
    email: string | null;
    phone: string | null;
    role: string | null;
    notes: string | null;
}

export type ContactResponse = {
    id: string;
    jobApplicationId: string;
    name: string;
    email: string | null;
    phone: string | null;
    role: string | null;
    notes: string | null;
}

export async function listContacts(jobApplicationId: string): Promise<ContactResponse[]> {
    return ( await apiFetch(`api/applications/${jobApplicationId}/contacts`)) as ContactResponse[];
}

export async function createContact(jobApplicationId: string, request: CreateContactRequest): Promise<ContactResponse> {
    return ( await apiFetch(`api/applications/${jobApplicationId}/contacts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
    })) as ContactResponse;
}