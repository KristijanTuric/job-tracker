import { useRef, useState } from "react";
import type { CreateJobApplicationRequest } from "../../api/applications"
import styles from '../../styles/modal.module.css';
import createStyles from '../../styles/createApplication.module.css'
import defaultStyles from '../../styles/defaults.module.css';
import contactStyles from '../../styles/contacts.module.css';
import { type CreateContactRequest, type LocalContact } from "../../api/contacts";
import { CreateContactModal } from "./Contacts/CreateContactModal";
import { CustomSelect } from "../../components/CustomSelect";
import { ArchiveBoxIcon, ChatsIcon, CheckCircleIcon, CircleIcon, NotePencilIcon, PaperPlaneTiltIcon, PlusCircleIcon, TrashIcon, XCircleIcon } from "@phosphor-icons/react";
import { EditContactModal } from "./Contacts/EditContactModal";
import { DeleteModal } from "./DeleteModal";
import { DetailContactModal } from "./Contacts/DetailContactModal";

type Props = {
    onSubmit: (request: CreateJobApplicationRequest, contacts: CreateContactRequest[]) => Promise<void>;
    onClose: () => void;
};

export function CreateApplicationModal({ onSubmit, onClose }: Props) {
    const [companyName, setCompanyName] = useState("");
    const [position, setPosition] = useState("");
    const [status, setStatus] = useState(0);
    const [appliedOn, setAppliedOn] = useState("");
    const [sourceUrl, setSourceUrl] = useState("");
    const [notes, setNotes] = useState("");

    const [contacts, setContacts] = useState<LocalContact[]>([]);
    const nextId = useRef(1);

    const [showCreateContact, setShowCreateContact] = useState(false);

    const [editId, setEditId] = useState<number | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [detailId, setDetailId] = useState<number | null>(null);
    
    const [error, setError] = useState<string | null>(null);
    
    async function handleSubmit(e: React.SubmitEvent) {
        e.preventDefault();
        setError(null);

        try {
            const cleanContacts = contacts.map(({_id: _, serverId: _s, ...rest}) => rest);
            await onSubmit({
                companyName,
                position,
                status,
                appliedOn: appliedOn || null,
                sourceUrl: sourceUrl || null,
                notes: notes || null,
            }, cleanContacts);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to create application.");
        }
    }

    function handleSaveContact(request: CreateContactRequest) {
        setContacts((prev) => [...prev, { ...request, _id: nextId.current++, serverId: null }]);
        setShowCreateContact(false);
    }

    function handleEditContact(request: CreateContactRequest): void {
        if (!editId) return;
        setContacts((prev) => prev.map((c) => c._id === editId ? {...request, _id: c._id, serverId: null } : c));
        setEditId(null);
    }

    function handleDeleteContact(): void {
        if (!deleteId) return;
        setContacts((prev) => prev.filter((cont) => cont._id !== deleteId));
        setDeleteId(null);
    }

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <h2>New Application</h2>
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
                                    <button className={`${defaultStyles.iconButton} ${defaultStyles.editButton}`} type="button" 
                                        onClick={(e) => {e.stopPropagation(); setEditId(c._id);}}><NotePencilIcon size={30} /></button>
                                    <button className={`${defaultStyles.iconButton} ${defaultStyles.deleteButton}`} type="button" 
                                        onClick={(e) => {e.stopPropagation(); setDeleteId(c._id);}}><TrashIcon size={30} /></button>
                                </div>
                            </div>
                        ))}
                        <button type="button" onClick={() => setShowCreateContact(true)} className={`${defaultStyles.defaultButton} ${defaultStyles.contactAddButton}`}><PlusCircleIcon size={25} />Add Contact</button>
                    </div>
                    <div className={styles.modalActions}>
                        <button type="button" onClick={onClose} className={`${defaultStyles.defaultButton} ${defaultStyles.modalCancelButton}`}>Cancel</button>
                        <button type="submit" className={`${defaultStyles.defaultButton} ${defaultStyles.modalConfirmButton}`}>Create</button>
                    </div>
                </form>
                {error && <pre className="error">{error}</pre>}
            </div>

            { showCreateContact && <CreateContactModal onSubmit={handleSaveContact} onClose={() => setShowCreateContact(false)} /> }
            {detailId && <DetailContactModal contact={contacts.find((c) => c._id === detailId)!} onClose={() => setDetailId(null)}></DetailContactModal>}
            { editId && <EditContactModal contact={contacts.find((c) => c._id == editId)!} onSubmit={handleEditContact} onClose={() => setEditId(null)} /> }
            { deleteId && <DeleteModal onConfirm={handleDeleteContact} onClose={() => setDeleteId(null)}/> }
        </div>
    )
}