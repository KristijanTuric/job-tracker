import { useEffect, useMemo, useState } from "react";
import { createApplication, deleteApplication, exportApplications, formatStatus, listApplications, updateApplication } from "../api/applications";
import type { CreateJobApplicationRequest, JobApplicationResponse, UpdateJobApplicationRequest } from "../api/applications";
import { useNavigate } from "react-router-dom";
import { logout } from "../api/auth";
import styles from '../styles/applicationList.module.css';
import defaultStyles from '../styles/defaults.module.css';
import { CreateApplicationModal } from "./modals/CreateApplicationModal";
import { DeleteApplicationModal } from "./modals/DeleteApplicationModal";
import { UpdateApplicationModal } from "./modals/UpdateApplicationModal";
import { DetailApplicationModal } from "./modals/DetailApplicationModal";
import { createContact, type CreateContactRequest } from "../api/contacts";
import { ChatsIcon, CheckCircleIcon, CircleIcon, DownloadIcon, NotePencilIcon, PaperPlaneTiltIcon, PlusCircleIcon, SignOutIcon, TrashIcon, XCircleIcon } from "@phosphor-icons/react";

export function ApplicationsListPage() {
    const [apps, setApps] = useState<JobApplicationResponse[]>([]);
    const [shownApps, setShownApps] = useState<JobApplicationResponse[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [updateId, setUpdateId] = useState<string | null>(null);
    const [detailId, setDetailId] = useState<string | null>(null);

    //const lastStatus = useRef(-1);
    const [lastStatus, setLastStatus] = useState(-1);

    const nav = useNavigate();

    useEffect(() => {
        (async () => {
            try {
                const data = await listApplications();
                setApps(data);
                setShownApps(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load applications");
            }
        })();
    }, []);

    const stats = useMemo(() => {
        const counts = { notApplied: 0, applied: 0, interviewing: 0, rejected: 0, accepted: 0 };
        for (const app of apps) {
            const s = formatStatus(app.status);
            if (s === "Not Applied") counts.notApplied++;
            else if (s === "Applied") counts.applied++;
            else if (s === "Interviewing") counts.interviewing++;
            else if (s === "Rejected") counts.rejected++;
            else if (s === "Accepted") counts.accepted++;
        }
        return counts;
    }, [apps]);

    async function handleLogout() {
        await logout();
        nav("/login");
    }

    async function handleCreate(request: CreateJobApplicationRequest, contacts: CreateContactRequest[]) {
        const created = await createApplication(request);
        const updated = [...apps, created];
        setApps(updated);

        for (const contact of contacts) {
            await createContact(created.id, contact);
        }

        refreshApplications(updated);
        setShowModal(false);
    }

    async function handleDelete() {
        if (!deleteId) return;
        await deleteApplication(deleteId);
        const updated = apps.filter((a) => a.id !== deleteId);
        setApps(updated);
        refreshApplications(updated);
        setDeleteId(null);
    }

    async function handleUpdate(request: UpdateJobApplicationRequest) {
        if (!updateId) return;
        const updated = await updateApplication(updateId, request);
        const updatedApps = apps.map((a) => a.id === updateId ? updated : a);
        setApps(updatedApps);
        refreshApplications(updatedApps);
        setUpdateId(null);
    }

    async function exportApps() {
        try {
            await exportApplications();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to export applications");
        }
    }

    function handleFiltering(query: number) {
        if (lastStatus === query) {
            setShownApps(apps);
            setLastStatus(-1);
        } else {
            setShownApps(query === null ? apps : apps.filter((a) => a.status === query));
            setLastStatus(query);
        }
    }

    function refreshApplications(updatedApps: JobApplicationResponse[]) {
        if (lastStatus !== -1) {
            setShownApps(updatedApps.filter((a) => a.status === lastStatus));
        } else {
            setShownApps(updatedApps);
        }
    }

    return (
        <div className={styles.pageContainer}>

            <div className={styles.pageHeader}>
                <h1>Your Applications</h1>
                <div className={styles.actions}>
                    <button className={`${defaultStyles.iconTextButton}`} onClick={() => setShowModal(true)}><PlusCircleIcon size={32} /> Add Application</button>
                    <button className={`${defaultStyles.iconTextButton}`} onClick={exportApps}><DownloadIcon size={32} /> Export Applications</button>
                    <button className={`${defaultStyles.deleteButton} ${defaultStyles.iconButton}`} onClick={handleLogout}><SignOutIcon size={32} /></button>
                </div>
            </div>

            {error && <pre className="error">{error}</pre>}

            <div className={styles.statsContainer}>
                <div className={`${styles.statsElement} ${styles.notApplied} ${lastStatus === 0 ? styles.statSelected : ""}`} 
                    onClick={() => handleFiltering(0)}>            
                    <span>Not Applied</span>
                    <strong>{stats.notApplied} <CircleIcon fontWeight={"bold"} size={30} /></strong>
                </div>
                <div className={`${styles.statsElement} ${styles.applied} ${lastStatus === 1 ? styles.statSelected : ""}`} 
                    onClick={() => handleFiltering(1)}>
                    <span>Applied</span>
                    <strong>{stats.applied} <PaperPlaneTiltIcon size={30} /></strong>
                </div>
                <div className={`${styles.statsElement} ${styles.interviewing} ${lastStatus === 2 ? styles.statSelected : ""}`} 
                    onClick={() => handleFiltering(2)}>
                    <span>Interviewing</span>
                    <strong>{stats.interviewing} <ChatsIcon size={30} /></strong>
                </div>
                <div className={`${styles.statsElement} ${styles.rejected} ${lastStatus === 3 ? styles.statSelected : ""}`} 
                    onClick={() => handleFiltering(3)}>
                    <span>Rejected</span>
                    <strong>{stats.rejected} <XCircleIcon size={30} /></strong>
                </div>
                <div className={`${styles.statsElement} ${styles.accepted} ${lastStatus === 4 ? styles.statSelected : ""}`} 
                    onClick={() => handleFiltering(4)}>
                    <span>Accepted</span>
                    <strong>{stats.accepted} <CheckCircleIcon size={30} /></strong>
                </div>
            </div>

            <table className={styles.applicationsTable}>
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
                    {shownApps.map((a) => (
                        <tr key={a.id} onClick={() => setDetailId(a.id)}>
                            <td>{a.companyName}</td>
                            <td>{a.position}</td>
                            <td>{formatStatus(a.status)}</td>
                            <td>{new Date(a.updatedAtUtc).toLocaleString("en-GB")}</td>
                            <td><button className={`${defaultStyles.editButton} ${defaultStyles.iconButton}`} onClick={(e) => { e.stopPropagation(); setUpdateId(a.id); }}><NotePencilIcon size={30} /></button></td>
                            <td><button className={`${defaultStyles.deleteButton} ${defaultStyles.iconButton}`} onClick={(e) => { e.stopPropagation(); setDeleteId(a.id); }}><TrashIcon size={30} /></button></td>
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

            { detailId && (
                <DetailApplicationModal application={apps.find((a) => a.id === detailId)!} onClose={() => setDetailId(null)} />
            )}

            {apps.length === 0 && !error && <p className={styles.emptyApplications}>No applications yet</p>}
        </div>
    );
}
