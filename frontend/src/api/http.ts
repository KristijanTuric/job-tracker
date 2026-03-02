const TOKEN_KEY = "jobtracker.accessToken";

// GET / SET / CLEAR Access Token in localStorage
export function getAccessToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
}

export function setAccessToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
}

export function clearAccessToken() {
    localStorage.removeItem(TOKEN_KEY);
}

export async function apiFetch(input: string, init: RequestInit = {}) {
    const token = getAccessToken();

    const headers = new Headers(init.headers);
    headers.set("Accept", "application/json");

    if (token) {
        headers.set("Authorization", `Bearer ${token}`);
    }

    // input is represented as "/api/me"
    const res = await fetch(input, { ...init, headers });

    if (!res.ok) {
        const text = await res.text();

        if (res.status == 401) {
            clearAccessToken();
            throw new Error("Unauthorized");
        }

        throw new Error(text || `HTTP ${res.status}`);
    }

    // 204 No Content response
    if (res.status == 204) return null;

    const contentType = res.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) return res.json();

    return res.text();
}