import { useEffect, useState } from "react";
import { formatStatus, listApplications } from "../api/applications";
import type { JobApplicationResponse } from "../api/applications";
import { useNavigate } from "react-router-dom";
import { logout } from "../api/auth";

export function ApplicationsListPage() {
    const [apps, setApps] = useState<JobApplicationResponse[]>([]);
    const [error, setError] = useState<string | null>(null);
    const nav = useNavigate();

    useEffect(() => {
        (async () => {
            try {
                const data = await listApplications();
                setApps(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load applications");
            }
        })();
    }, []);

    async function handleLogout() {
        await logout();
        nav("/login");
    }

    return (
        <div style={{ maxWidth: 900, margin: "40px auto" }}>

            <div>
                <h1>Applications List</h1>
                <button onClick={handleLogout}>Logout</button>
            </div>

            {error && <pre style={{ color: "crimson", whiteSpace: "pre-wrap" }}>{error}</pre>}

            <table width="100%" cellPadding={8}>
                <thead>
                    <tr>
                        <th align="left">Company</th>
                        <th align="left">Position</th>
                        <th align="left">Status</th>
                        <th align="left">Updated</th>
                    </tr>
                </thead>
                <tbody>
                    {apps.map((a) => (
                        <tr key={a.id}>
                            <td>{a.companyName}</td>
                            <td>{a.position}</td>
                            <td>{formatStatus(a.status)}</td>
                            <td>{new Date(a.updatedAtUtc).toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {apps.length === 0 && !error && <p>No applications yet.</p>}
        </div>
    );
}
