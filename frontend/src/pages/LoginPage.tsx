import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/auth.ts";
import '../styles/login.css';

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
        <div className="page-container">
            <h1>Login</h1>
            <form className="login-form" onSubmit={onSubmit}>
                <label>
                    Email
                    <input value={email} onChange={(e) => setEmail(e.target.value)} type="email"/>
                </label>
                <label>
                    Password
                    <input value={password} onChange={(e) => setPassword(e.target.value)} type="password"/>
                </label>
                <button type="submit">Login</button>
            </form>
            {error && <pre className="error">{error}</pre>}
        </div>
    );
}