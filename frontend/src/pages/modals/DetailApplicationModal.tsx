import { formatStatus, type JobApplicationResponse } from "../../api/applications";
import '../../styles/modal.css';

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
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2>{application.companyName}</h2>
                <p className="detail-position">{application.position}</p>

                <div className="detail-grid">
                    <div className="detail-label">Status</div>
                    <div>{formatStatus(application.status)}</div>

                    <div className="detail-label">Applied On</div>
                    <div>{formatDate(application.appliedOn)}</div>

                    <div className="detail-label">Source URL</div>
                    <div>
                        {application.sourceUrl ? <a href={application.sourceUrl} target="_blank" rel="noopener noreferrer">{application.sourceUrl}</a> : "-"}
                    </div>

                    <div className="detail-label">Notes</div>
                    <div className="detail-notes">{application.notes || "—"}</div>

                    <div className="detail-label">Created</div>
                    <div>{formatDateTime(application.createdAtUtc)}</div>

                    <div className="detail-label">Updated</div>
                    <div>{formatDateTime(application.updatedAtUtc)}</div>
                </div>

                <div className="modal-actions">
                    <button type="button" onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    )
}