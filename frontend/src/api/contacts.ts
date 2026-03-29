import { apiFetch } from "./http";

export type CreateContactRequest = {
    name: string;
    email: string | null;
    phone: string | null;
    role: string | null;
    notes: string | null;
}

export type UpdateContactRequest = {
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

export interface LocalContact {
    _id: number;
    serverId: string | null;
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

export async function updateContact(jobApplicationId: string, contactId: string, request: UpdateContactRequest): Promise<ContactResponse> {
    return ( await apiFetch(`api/applications/${jobApplicationId}/contacts/${contactId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
    })) as ContactResponse;
}

export async function deleteContact(jobApplicationId: string, contactId: string): Promise<void> {
    return ( await apiFetch(`api/applications/${jobApplicationId}/contacts/${contactId}`, {
        method: "DELETE",
    }));
}