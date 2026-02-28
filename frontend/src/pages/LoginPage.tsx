import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/auth.ts";

export function LoginPage() {
    const nav = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);

    async function onSubmit(e: React.SubmitEvent) {
        e.preventDefault();
        setError(null);

        try {
            await login({email, password});
            nav("/applications");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Login failed");
        }
    }

    return (
        <div style={{ maxWidth: 420, margin: "40px auto" }}>
            <h1>Login</h1>
            <form onSubmit={onSubmit}>
                <label htmlFor="">
                    Email
                    <input value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: "100%" }} />
                </label>
                <label htmlFor="">
                    Password
                    <input value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: "100%" }} />
                </label>
                <button type="submit">Login</button>
            </form>
            {error && <pre style={{ color: "crimson", whiteSpace: "pre-wrap" }}>{error}</pre>}
        </div>
    );
}