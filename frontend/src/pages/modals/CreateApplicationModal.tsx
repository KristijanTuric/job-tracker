import { useState } from "react";
import type { CreateJobApplicationRequest } from "../../api/applications"
import styles from '../../styles/modal.module.css';

type Props = {
    onSubmit: (request: CreateJobApplicationRequest) => Promise<void>;
    onClose: () => void;
};

export function CreateApplicationModal({ onSubmit, onClose }: Props) {
    const [companyName, setCompanyName] = useState("");
    const [position, setPosition] = useState("");
    const [status, setStatus] = useState(0);
    const [appliedOn, setAppliedOn] = useState("");
    const [sourceUrl, setSourceUrl] = useState("");
    const [notes, setNotes] = useState("");
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.SubmitEvent) {
        e.preventDefault();
        setError(null);

        try {
            await onSubmit({
                companyName,
                position,
                status,
                appliedOn: appliedOn || null,
                sourceUrl: sourceUrl || null,
                notes: notes || null,
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to create application.");
        }
    }

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <h2>New Application</h2>
                <form onSubmit={handleSubmit} className={styles.modalForm}>
                    <label>
                        Company
                        <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} required />
                    </label>
                    <label>
                        Position
                        <input value={position} onChange={(e) => setPosition(e.target.value)} required />
                    </label>
                    <label>
                        Status
                        <select value={status} onChange={(e) => setStatus(Number(e.target.value))}>
                            <option value={0}>Not Applied</option>
                            <option value={1}>Applied</option>
                            <option value={2}>Interviewing</option>
                            <option value={3}>Rejected</option>
                            <option value={4}>Accepted</option>
                            <option value={5}>Archived</option>
                        </select>
                    </label>
                    <label>
                        Applied On
                        <input type="date" value={appliedOn} onChange={(e) => setAppliedOn(e.target.value)} />
                    </label>
                    <label>
                        Source Url
                        <input type="url" value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} />
                    </label>
                    <label>
                        Notes
                        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
                    </label>
                    <div className={styles.modalActions}>
                        <button type="button" onClick={onClose}>Cancel</button>
                        <button type="submit">Create</button>
                    </div>
                </form>
                {error && <pre className="error">{error}</pre>}
            </div>
        </div>
    )
}