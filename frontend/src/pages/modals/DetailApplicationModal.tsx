import { formatStatus, type JobApplicationResponse } from "../../api/applications";
import styles from '../../styles/modal.module.css';

type Props = {
    application: JobApplicationResponse;
    onClose: () => void;
};

function formatDate(date: string | null): string {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-GB");
}

function formatDateTime(date: string): string {
    return new Date(date).toLocaleDateString("en-GB");
}

export function DetailApplicationModal({ application, onClose }: Props) {

     return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <h2>{application.companyName}</h2>
                <p className={styles.detailPosition}>{application.position}</p>

                <div className={styles.detailGrid}>
                    <div className={styles.detailLabel}>Status</div>
                    <div>{formatStatus(application.status)}</div>

                    <div className={styles.detailLabel}>Applied On</div>
                    <div>{formatDate(application.appliedOn)}</div>

                    <div className={styles.detailLabel}>Source URL</div>
                    <div>
                        {application.sourceUrl ? <a href={application.sourceUrl} target="_blank" rel="noopener noreferrer">{application.sourceUrl}</a> : "-"}
                    </div>

                    <div className={styles.detailLabel}>Notes</div>
                    <div className={styles.detailNotes}>{application.notes || "—"}</div>

                    <div className={styles.detailLabel}>Created</div>
                    <div>{formatDateTime(application.createdAtUtc)}</div>

                    <div className={styles.detailLabel}>Updated</div>
                    <div>{formatDateTime(application.updatedAtUtc)}</div>
                </div>

                <div className={styles.modalActions}>
                    <button type="button" onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    )
}