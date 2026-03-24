import { useState } from "react";
import type { CreateJobApplicationRequest } from "../../api/applications"
import styles from '../../styles/modal.module.css';
import createStyles from '../../styles/createApplication.module.css'
import defaultStyles from '../../styles/defaults.module.css';
import { type CreateContactRequest } from "../../api/contacts";
import { CreateContactModal } from "./Contacts/CreateContactModal";
import { CustomSelect } from "../../components/CustomSelect";
import { PlusCircleIcon, TrashIcon } from "@phosphor-icons/react";

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
    const [showCreateContact, setShowCreateContact] = useState(false);
    const [contacts, setContacts] = useState<CreateContactRequest[]>([]);
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
            }, contacts);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to create application.");
        }
    }

    function showAddContactModal() {
        setShowCreateContact(true);
    }

    async function handleSaveContact(request: CreateContactRequest) {
        setContacts((prev) => [...prev, request]);
        setShowCreateContact(false);
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
                            {value: 0, label: "Not Applied"}, 
                            {value: 1, label: "Applied"},
                            {value: 2, label: "Interviewing"},
                            {value: 3, label: "Rejected"},
                            {value: 4, label: "Accepted"},
                            {value: 5, label: "Archived"}]}></CustomSelect>
                            
                        {/* <select value={status} onChange={(e) => setStatus(Number(e.target.value))}>
                            <option value={0}>Not Applied</option>
                            <option value={1}>Applied</option>
                            <option value={2}>Interviewing</option>
                            <option value={3}>Rejected</option>
                            <option value={4}>Accepted</option>
                            <option value={5}>Archived</option>
                        </select> */}
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
                            <div className={createStyles.contactDisplay}>
                                <div>{c.name}</div>
                                <button className={defaultStyles.iconButton} type="button" onClick={() => setContacts((prev) => prev.filter((cont) => cont.name !== c.name))}><TrashIcon size={28} /></button>
                            </div>
                        ))}
                        <button type="button" onClick={showAddContactModal} className={`${defaultStyles.defaultButton} ${defaultStyles.contactAddButton}`}><PlusCircleIcon size={25} />Add Contact</button>
                    </div>
                    <div className={styles.modalActions}>
                        <button type="button" onClick={onClose} className={`${defaultStyles.defaultButton} ${defaultStyles.modalCancelButton}`}>Cancel</button>
                        <button type="submit" className={`${defaultStyles.defaultButton} ${defaultStyles.modalConfirmButton}`}>Create</button>
                    </div>
                </form>
                {error && <pre className="error">{error}</pre>}
            </div>

            { showCreateContact && (
                <CreateContactModal onSubmit={handleSaveContact} onClose={() => setShowCreateContact(false)} />
            )}
        </div>
    )
}