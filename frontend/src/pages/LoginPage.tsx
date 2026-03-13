import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../api/auth.ts";
import styles from '../styles/login.module.css';

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
        <div className={styles.rootContainer}>
            <div className={styles.pageContainer}>
                <h1>Login</h1>
                <form className={styles.loginForm} onSubmit={onSubmit}>
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

                <div>
                    <p>
                        Don't have an account? <Link to="/register">Register</Link>
                    </p>
                </div>
                {error && <pre className="error">{error}</pre>}
            </div>
        </div>
    );
}