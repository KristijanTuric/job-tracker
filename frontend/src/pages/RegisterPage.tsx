import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../api/auth";
import styles from '../styles/register.module.css';

export function RegisterPage() {
    const nav = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);

    async function onSubmit(e: React.SubmitEvent) {
        e.preventDefault();
        setError(null);

        try {
            await register({email, password});
            nav("/applications");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Register failed");
        }
    }

    return (
        <div className={styles.pageContainer}>
            <h1>Register</h1>
            <form onSubmit={onSubmit} className={styles.registerForm}>
                <label>
                    Email
                    <input value={email} onChange={(e) => setEmail(e.target.value)} type="email"/>
                </label>
                <label>
                    Password
                    <input value={password} onChange={(e) => setPassword(e.target.value)} type="password"/>
                </label>
                <button type="submit">Register</button>
            </form>

            <div>
                <p>
                    Have an account? <Link to="/login">Login</Link>
                </p>
            </div>

            {error && <pre className="error">{error}</pre>}
        </div>
    )
}