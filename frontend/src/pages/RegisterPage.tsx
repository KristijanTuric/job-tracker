import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../api/auth";
import styles from '../styles/register.module.css';
import { LoadingComponent } from "../components/LoadingComponent";

export function RegisterPage() {
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
            await register({email, password});
            nav("/applications");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Register failed");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className={styles.rootContainer}>
            <div className={styles.pageContainer}>
                <Link className={styles.homeLink} to={"/"}>Home</Link>
                <h1>Register</h1>
                <form onSubmit={onSubmit} className={styles.registerForm}>                    
                    <input autoFocus value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email"/>
                    <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password"/>
                    {error && <pre className="error">{error}</pre>}
                    <button type="submit">Register</button>
                </form>

                <div className={styles.loginLink}>
                    <p>
                        Have an account? <Link to="/login">Login</Link>
                    </p>
                </div>
                {loading && <LoadingComponent></LoadingComponent>}
            </div>
        </div>        
    )
}