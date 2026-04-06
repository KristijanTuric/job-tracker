import { useEffect, useRef, useState } from "react";
import type { JobApplicationResponse, UpdateJobApplicationRequest } from "../../api/applications"
import styles from '../../styles/modal.module.css';
import createStyles from '../../styles/createApplication.module.css'
import defaultStyles from '../../styles/defaults.module.css';
import contactStyles from '../../styles/contacts.module.css';
import { CustomSelect } from "../../components/CustomSelect";
import { CreateContactModal } from "./Contacts/CreateContactModal";
import { createContact, deleteContact, listContacts, updateContact, type CreateContactRequest, type LocalContact } from "../../api/contacts";
import { ArchiveBoxIcon, ChatsIcon, CheckCircleIcon, CircleIcon, NotePencilIcon, PaperPlaneTiltIcon, PlusCircleIcon, TrashIcon, XCircleIcon } from "@phosphor-icons/react";
import { DataLoadingComponent } from "../../components/DataLoadingComponent";
import { DetailContactModal } from "./Contacts/DetailContactModal";
import { EditContactModal } from "./Contacts/EditContactModal";
import { DeleteModal } from "./DeleteModal";

type Props = {
    application: JobApplicationResponse;
    onSubmit: (request: UpdateJobApplicationRequest) => Promise<void>;
    onClose: () => void;
};

export function UpdateApplicationModal({ application, onSubmit, onClose }: Props) {
    const [companyName, setCompanyName] = useState(application.companyName);
    const [loading, setLoading] = useState(false);
    const [position, setPosition] = useState(application.position);
    const [status, setStatus] = useState(application.status);
    const [appliedOn, setAppliedOn] = useState(application.appliedOn ?? "");
    const [sourceUrl, setSourceUrl] = useState(application.sourceUrl ?? "");
    const [notes, setNotes] = useState(application.notes ?? "");

    const [showCreateContact, setShowCreateContact] = useState(false);

    const [contacts, setContacts] = useState<LocalContact[]>([]);
    const originalContacts = useRef<LocalContact[]>([]);
    const nextId = useRef(1);

    const [detailId, setDetailId] = useState<number | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [editId, setEditId] = useState<number | null>(null);

    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const data = await listContacts(application.id);
                const mapped: LocalContact[] = data.map((c) => ({
                    _id: nextId.current++,
                    serverId: c.id,
                    name: c.name,
                    email: c.email ?? null,
                    phone: c.phone ?? null,
                    role: c.role ?? null,
                    notes: c.notes ?? null,
                }));
                setContacts(mapped);
                originalContacts.current = mapped;
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load contacts.");
            } finally {
                setLoading(false);
            }
        })();
    }, [application.id]);

    function handleAddContact(request: CreateContactRequest) {
        setContacts((prev) => [...prev, { ...request, _id: nextId.current++, serverId: null}]);
        setShowCreateContact(false);
    }

    function handleEditContact(updated: CreateContactRequest) {
        if (!editId) return;
        setContacts((prev) => prev.map((c) => c._id === editId ? { ...c, ...updated } : c));
        setEditId(null);
    }

    function handleDeleteContact() {
        if (!deleteId) return;
        setContacts((prev) => prev.filter((c) => c._id !== deleteId));
        setDeleteId(null);
    }

    function showAddContactModal() {
        setShowCreateContact(true);
    }

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

            const original = originalContacts.current;

            // Firstly delete all original contacts that were deleted from contacts
            const deleted = original.filter((o) => o.serverId && !contacts.some((c) => c.serverId === o.serverId));
            for (const d of deleted) {
                await deleteContact(application.id, d.serverId!);
            }

            // Then create the new contacts
            const created = contacts.filter((c) => c.serverId === null);
            for (const c of created) {
                const { _id: _, serverId: _s, ...request } = c;
                await createContact(application.id, request);
            }

            const updated = contacts.filter((c) => {
                if (!c.serverId) return false;
                const orig = original.find((o) => o.serverId === c.serverId);
                if (!orig) return false;
                return (
                    c.name !== orig.name ||
                    c.email !== orig.email ||
                    c.phone !== orig.phone ||
                    c.role !== orig.role ||
                    c.notes !== orig.notes
                );
            });
            for (const u of updated) {
                const { _id: _, serverId, ...request } = u;
                await updateContact(application.id, serverId!, request);
            }

            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update application.");
        }
    }

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <h2>Edit Application</h2>
                <form onSubmit={handleSubmit} className={styles.modalForm}>                       
                    <div className={styles.formInput}>
                        <label>Company</label>            
                        <input autoFocus value={companyName} onChange={(e) => setCompanyName(e.target.value)} required />                
                    </div> 

                    <div className={styles.formInput}>
                        <label>Position</label>
                        <input value={position} onChange={(e) => setPosition(e.target.value)} required />
                    </div>

                    <div className={styles.formInput}>
                        <label>Status</label>
                        <CustomSelect value={status} onChange={(e) => setStatus(e)} options={[
                            {value: 0, label: "Not Applied", icon: <CircleIcon size={18} />}, 
                            {value: 1, label: "Applied", icon: <PaperPlaneTiltIcon size={18} />},
                            {value: 2, label: "Interviewing", icon: <ChatsIcon size={18} />},
                            {value: 3, label: "Rejected", icon: <XCircleIcon size={18} />},
                            {value: 4, label: "Accepted", icon: <CheckCircleIcon size={18} />},
                            {value: 5, label: "Archived", icon: <ArchiveBoxIcon size={18} />}]} />
                    </div>

                    <div className={styles.formInput}>
                        <label>Applied On</label>
                        <input type="date" value={appliedOn} onChange={(e) => setAppliedOn(e.target.value)} />                        
                    </div>                    

                    <div className={styles.formInput}>
                         <label>Source Url</label>
                        <input type="url" value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} />
                    </div>                   

                    <div className={styles.formInput}>
                        <label>Notes</label>
                        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
                    </div>

                    <div className={createStyles.contactsContainer}>
                        <label>Contacts</label>
                        {contacts.map((c) => (
                            <div key={c._id} className={contactStyles.contactContainer} onClick={() => setDetailId(c._id)}>
                                <div className={contactStyles.contactName}>{c.name}</div>
                                <div className={contactStyles.contactActions}>
                                    <button type="button" onClick={ (e) => {e.stopPropagation(); setEditId(c._id) }} 
                                        className={`${defaultStyles.iconButton} ${defaultStyles.editButton}`}><NotePencilIcon size={30}/></button>
                                    <button type="button" onClick={ (e) => {e.stopPropagation(); setDeleteId(c._id)}} 
                                        className={`${defaultStyles.iconButton} ${defaultStyles.deleteButton}`}><TrashIcon size={30} /></button>
                                </div>                                
                            </div>
                        ))}
                        {contacts.length <= 0 && <div>-</div>}
                        <button type="button" onClick={showAddContactModal} className={`${defaultStyles.defaultButton} ${defaultStyles.contactAddButton}`}><PlusCircleIcon size={25} />Add Contact</button>
                    </div>

                    <div className={styles.modalActions}>
                        <button type="button" onClick={onClose} className={`${defaultStyles.defaultButton} ${defaultStyles.modalCancelButton}`}>Cancel</button>
                        <button type="submit" className={`${defaultStyles.defaultButton} ${defaultStyles.modalConfirmButton}`}>Save</button>
                    </div>
                </form>
                {error && <pre className="error">{error}</pre>}
            </div>

            {loading && <DataLoadingComponent></DataLoadingComponent>}   
            {detailId && <DetailContactModal contact={contacts.find((c) => c._id === detailId)!} onClose={() => setDetailId(null)}></DetailContactModal>}
            {deleteId && <DeleteModal onConfirm={handleDeleteContact} onClose={() => setDeleteId(null)}></DeleteModal>}
            {editId && <EditContactModal contact={contacts.find((c) => c._id === editId)!} onClose={() => setEditId(null)} onSubmit={handleEditContact}></EditContactModal>}
            { showCreateContact && (
                <CreateContactModal onSubmit={handleAddContact} onClose={() => setShowCreateContact(false)} />
            )}
        </div>
    )
}