import { useEffect, useState } from "react";
import { formatStatus, type JobApplicationResponse } from "../../api/applications";
import styles from '../../styles/modal.module.css';
import contactStyles from '../../styles/contacts.module.css';
import defaultStyles from '../../styles/defaults.module.css';
import { deleteContact, listContacts, updateContact, type ContactResponse, type UpdateContactRequest } from "../../api/contacts";
import { DataLoadingComponent } from "../../components/DataLoadingComponent";
import { DetailContactModal } from "./Contacts/DetailContactModal";
import { DeleteApplicationModal } from "./DeleteApplicationModal";
import { UpdateContactModal } from "./Contacts/UpdateContactModal";
import { NotePencilIcon, TrashIcon } from "@phosphor-icons/react";

type Props = {
    application: JobApplicationResponse;
    onClose: () => void;
};

function formatDate(date: string | null): string {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("de-DE");
}

function formatDateTime(date: string): string {
    return new Date(date).toLocaleDateString("de-DE");
}

export function DetailApplicationModal({ application, onClose }: Props) {
    const [contacts, setContacts] = useState<ContactResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [detailId, setDetailId] = useState<string | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [editId, setEditId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
            (async () => {
                try {
                    setLoading(true);
                    const data = await listContacts(application.id);
                    setContacts(data);
                } catch (err) {
                    setError(err instanceof Error ? err.message : "Failed to load contacts.");
                } finally {
                    setLoading(false);
                }
            })();
        }, []);

    async function handleEditContact(request: UpdateContactRequest): Promise<void> {
        if (!editId) return;
        const updated = await updateContact(application.id, editId, request);
        setContacts((prev) => prev.map((c) => c.id === editId ? updated : c));
        setEditId(null);
    }

    async function handleDeleteContact(): Promise<void> {
        if (!deleteId) return;
        await deleteContact(application.id, deleteId);
        setContacts((prev) => prev.filter((c) => c.id !== deleteId));
        setDeleteId(null);
    }

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <h2>{application.companyName}</h2>
                <p className={styles.detailPosition}>{application.position}</p>

                <div className={styles.detailGrid}>
                    <div className={styles.detailLabel}>Status</div>
                    <div className={styles.detailDisplay}>{formatStatus(application.status)}</div>        

                    <div className={styles.detailLabel}>Applied On</div>
                    <div className={styles.detailDisplay}>{formatDate(application.appliedOn)}</div>

                    <div className={styles.detailLabel}>Source URL</div>
                    <div className={styles.detailDisplay}>
                        {application.sourceUrl ? <a href={application.sourceUrl} target="_blank" rel="noopener noreferrer">{application.sourceUrl}</a> : "-"}
                    </div>

                    <div className={styles.detailLabel}>Notes</div>
                    <div className={`${styles.detailNotes} ${styles.detailDisplay}`}>{application.notes || "-"}</div>

                    <div className={styles.detailLabel}>Created</div>
                    <div className={styles.detailDisplay}>{formatDateTime(application.createdAtUtc)}</div>

                    <div className={styles.detailLabel}>Updated</div>
                    <div className={styles.detailDisplay}>{formatDateTime(application.updatedAtUtc)}</div>

                    <div className={styles.detailLabel}>Contacts</div>
                    <div className={styles.detailDisplay}>
                        {contacts.map((c) => (
                            <div key={c.id} className={contactStyles.contactContainer} onClick={() => setDetailId(c.id)}>
                                <div className={contactStyles.contactName}>{c.name}</div>
                                <div className={contactStyles.contactActions}>
                                    <button type="button" onClick={ (e) => {e.stopPropagation(); setEditId(c.id) }} 
                                        className={`${defaultStyles.iconButton} ${defaultStyles.editButton}`}><NotePencilIcon size={30}/></button>
                                    <button type="button" onClick={ (e) => {e.stopPropagation(); setDeleteId(c.id)}} 
                                        className={`${defaultStyles.iconButton} ${defaultStyles.deleteButton}`}><TrashIcon size={30} /></button>
                                </div>                                
                            </div>
                        ))}
                        {contacts.length <= 0 && <div>-</div>}
                    </div>
                    
                </div>
                {error && <pre className="error">{error}</pre>}
                <div className={styles.modalActions}>
                    <button type="button" onClick={onClose} className={`${defaultStyles.defaultButton} ${defaultStyles.modalCancelButton}`}>Close</button>
                </div>
                {loading && <DataLoadingComponent></DataLoadingComponent>}
                {detailId && <DetailContactModal contact={contacts.find((c) => c.id === detailId)!} onClose={() => setDetailId(null)}></DetailContactModal>}
                {deleteId && <DeleteApplicationModal onConfirm={handleDeleteContact} onClose={() => setDeleteId(null)}></DeleteApplicationModal>}
                {editId && <UpdateContactModal contact={contacts.find((c) => c.id === editId)!} onClose={() => setEditId(null)} onSubmit={handleEditContact}></UpdateContactModal>}
            </div>
        </div>
    )
}