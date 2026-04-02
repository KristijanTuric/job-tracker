import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../api/auth.ts";
import styles from '../styles/login.module.css';
import { LoadingComponent } from "../components/LoadingComponent.tsx";

export function LoginPage() {
    const nav = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function onSubmit(e: React.SubmitEvent) {
        e.preventDefault();
        setError(null);

        try {
            setLoading(true);
            await login({email, password});
            nav("/applications");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Login failed");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className={styles.rootContainer}>
            <div className={styles.pageContainer}>
                <Link className={styles.homeLink} to={"/"}>Home</Link>
                <h1>Login</h1>
                <form className={styles.loginForm} onSubmit={onSubmit}>                    
                    <input autoFocus value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email" />
                    <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" />
                    {error && <pre className="error">{error}</pre>}
                    <button type="submit">LOGIN</button>
                </form>

                <div className={styles.registerLink}>
                    <p>
                        Don't have an account? <Link to="/register">Register</Link>
                    </p>
                </div>
                {loading && <LoadingComponent></LoadingComponent>}
            </div>
        </div>
    );
}