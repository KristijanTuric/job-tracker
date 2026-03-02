import { apiFetch, setAccessToken, clearAccessToken } from "./http";

export type LoginRequest = { email: string; password: string };
export type RegisterRequest = { email: string, password: string };
export type AuthorizationResponse = { accessToken: string };
export type MeResponse = { userId: string; email: string };

export async function login(request: LoginRequest): Promise<void> {
    try {
        const data = (await apiFetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(request),
        })) as AuthorizationResponse;

        setAccessToken(data.accessToken);
    } catch {
        throw new Error("Invalid email or password");
    }
}

export async function register(request: RegisterRequest): Promise<void> {
    try {
        const data = (await apiFetch("api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(request),
        })) as AuthorizationResponse;

        setAccessToken(data.accessToken);
    } catch (err) {
        if (err instanceof Error) {
            try {
                const body = JSON.parse(err.message);
                const firstError = body.errors?.[0]?.description ?? body.message;
                throw new Error(firstError);
            } catch (parseErr) {
                // If it's not a JSON, then throw original error
                if (parseErr instanceof SyntaxError) throw err;
                throw parseErr;
            }
        }
        throw err;
    }
    
}

export async function logout(): Promise<void> {
    clearAccessToken();
}

export async function me(): Promise<MeResponse> {
    return (await apiFetch("/api/me")) as MeResponse;
}