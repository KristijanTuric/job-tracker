import { useEffect, useState } from "react";
import { createApplication, deleteApplication, formatStatus, listApplications, updateApplication } from "../api/applications";
import type { CreateJobApplicationRequest, JobApplicationResponse, UpdateJobApplicationRequest } from "../api/applications";
import { useNavigate } from "react-router-dom";
import { logout } from "../api/auth";
import '../styles/applicationList.css';
import { CreateApplicationModal } from "./CreateApplicationModal";
import { DeleteApplicationModal } from "./DeleteApplicationModal";
import { UpdateApplicationModal } from "./modals/UpdateApplicationModal";

export function ApplicationsListPage() {
    const [apps, setApps] = useState<JobApplicationResponse[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [updateId, setUpdateId] = useState<string | null>(null);
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

    async function handleCreate(request: CreateJobApplicationRequest) {
        const created = await createApplication(request);
        setApps((prev) => [...prev, created]);
        setShowModal(false);
    }

    async function handleDelete() {
        if (!deleteId) return;
        await deleteApplication(deleteId);
        setApps((prev) => prev.filter((a) => a.id !== deleteId));
        setDeleteId(null);
    }

    async function handleUpdate(request: UpdateJobApplicationRequest) {
        if (!updateId) return;
        const updated = await updateApplication(updateId, request);
        setApps((prev) => prev.map((a) => a.id === updateId ? updated : a));
        setUpdateId(null);
    }

    return (
        <div className="page-container">

            <div className="page-header">
                <h1>Applications List</h1>
                <div>
                    <button onClick={() => setShowModal(true)}>+ Add</button>
                    <button onClick={handleLogout}>Logout</button>
                </div>
            </div>

            {error && <pre className="error">{error}</pre>}

            <table className="applications-table">
                <thead>
                    <tr>
                        <th>Company</th>
                        <th>Position</th>
                        <th>Status</th>
                        <th>Updated</th>
                        <th></th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {apps.map((a) => (
                        <tr key={a.id}>
                            <td>{a.companyName}</td>
                            <td>{a.position}</td>
                            <td>{formatStatus(a.status)}</td>
                            <td>{new Date(a.updatedAtUtc).toLocaleString("en-GB")}</td>
                            <td><button onClick={() => setUpdateId(a.id)}>Edit</button></td>
                            <td><button onClick={() => setDeleteId(a.id)}>Delete</button></td>
                        </tr>
                    ))}
                </tbody>
            </table>

            { showModal && (
                <CreateApplicationModal onSubmit={handleCreate} onClose={() => setShowModal(false)} />
            )}

            { deleteId && (
                <DeleteApplicationModal onConfirm={handleDelete} onClose={() => setDeleteId(null)} />
            )}

            { updateId && (
                <UpdateApplicationModal application={apps.find((a) => a.id === updateId)!} onSubmit={handleUpdate} onClose={() => setUpdateId(null)} />
            )}

            {apps.length === 0 && !error && <p>No applications yet.</p>}
        </div>
    );
}
