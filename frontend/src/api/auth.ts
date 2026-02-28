import { apiFetch, setAccessToken, clearAccessToken } from "./http";

export type LoginRequest = { email: string; password: string };
export type AuthorizationResponse = { accessToken: string };
export type MeResponse = { userId: string; email: string };

export async function login(request: LoginRequest): Promise<void> {
    const data = (await apiFetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
    })) as AuthorizationResponse;

    setAccessToken(data.accessToken);
}

export async function logout(): Promise<void> {
    clearAccessToken();
}

export async function me(): Promise<MeResponse> {
    return (await apiFetch("/api/me")) as MeResponse;
}