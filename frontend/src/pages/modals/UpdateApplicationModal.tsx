import { useEffect, useState } from "react";
import type { JobApplicationResponse, UpdateJobApplicationRequest } from "../../api/applications"
import styles from '../../styles/modal.module.css';
import createStyles from '../../styles/createApplication.module.css'
import defaultStyles from '../../styles/defaults.module.css';
import contactStyles from '../../styles/contacts.module.css';
import { CustomSelect } from "../../components/CustomSelect";
import { CreateContactModal } from "./Contacts/CreateContactModal";
import { deleteContact, listContacts, updateContact, type ContactResponse, type CreateContactRequest, type UpdateContactRequest } from "../../api/contacts";
import { NotePencilIcon, PlusCircleIcon, TrashIcon } from "@phosphor-icons/react";
import { DataLoadingComponent } from "../../components/DataLoadingComponent";
import { DetailContactModal } from "./Contacts/DetailContactModal";
import { DeleteApplicationModal } from "./DeleteApplicationModal";
import { UpdateContactModal } from "./Contacts/UpdateContactModal";
import { EditContactModal } from "./Contacts/EditContactModal";

type Props = {
    application: JobApplicationResponse;
    onSubmit: (request: UpdateJobApplicationRequest, contacts: CreateContactRequest[]) => Promise<void>;
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
    const [newContacts, setNewContacts] = useState<UpdateContactRequest[]>([]);
    const [contacts, setContacts] = useState<ContactResponse[]>([]);
    const [detailId, setDetailId] = useState<string | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [updateId, setUpdateId] = useState<string | null>(null);
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

    async function handleUpdateContact(request: UpdateContactRequest): Promise<void> {
        if (!updateId) return;
        const updated = await updateContact(application.id, updateId, request);
        setContacts((prev) => prev.map((c) => c.id === updateId ? updated : c));
        setUpdateId(null);
    }
    
    async function handleDeleteContact(): Promise<void> {
        if (!deleteId) return;
        await deleteContact(application.id, deleteId);
        setContacts((prev) => prev.filter((c) => c.id !== deleteId));
        setDeleteId(null);
    }

    async function handleEditContact(request: UpdateContactRequest): Promise<void> {
        if (!editId) return;
        const nextContacts = newContacts.map((c) => {
            if (c.name === request.name) {
                return request;
            }
            else 
            {
                return c;
            }
        });
        setNewContacts(nextContacts);
        
        setEditId(null);
    }

    function showAddContactModal() {
        setShowCreateContact(true);
    }

    async function handleSaveContact(request: CreateContactRequest) {
        setNewContacts((prev) => [...prev, request]);
        setShowCreateContact(false);
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
            }, newContacts);
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
                        <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} required />                
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
                            <div key={c.id} className={contactStyles.contactContainer} onClick={() => setDetailId(c.id)}>
                                <div className={contactStyles.contactName}>{c.name}</div>
                                <div className={contactStyles.contactActions}>
                                    <button type="button" onClick={ (e) => {e.stopPropagation(); setUpdateId(c.id) }} 
                                        className={`${defaultStyles.iconButton} ${defaultStyles.editButton}`}><NotePencilIcon size={30}/></button>
                                    <button type="button" onClick={ (e) => {e.stopPropagation(); setDeleteId(c.id)}} 
                                        className={`${defaultStyles.iconButton} ${defaultStyles.deleteButton}`}><TrashIcon size={30} /></button>
                                </div>                                
                            </div>
                        ))}
                        {newContacts.map((c) => (
                            <div key={c.name} className={contactStyles.contactContainer}>
                                <div className={contactStyles.contactName}>{c.name}</div>
                                 <div className={contactStyles.contactActions}>
                                    <button className={`${defaultStyles.iconButton} ${defaultStyles.editButton}`} type="button" 
                                    onClick={(e) => {e.stopPropagation(); setEditId(c.name)}}><NotePencilIcon size={30} /></button>
                                    <button className={`${defaultStyles.iconButton} ${defaultStyles.deleteButton}`} type="button" 
                                    onClick={() => setNewContacts((prev) => prev.filter((cont) => cont.name !== c.name))}><TrashIcon size={30} /></button>
                                </div>
                            </div>
                        ))}
                        {(contacts.length <= 0 && newContacts.length <= 0) && <div>-</div>}
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
            {detailId && <DetailContactModal contact={contacts.find((c) => c.id === detailId)!} onClose={() => setDetailId(null)}></DetailContactModal>}
            {deleteId && <DeleteApplicationModal onConfirm={handleDeleteContact} onClose={() => setDeleteId(null)}></DeleteApplicationModal>}
            {updateId && <UpdateContactModal contact={contacts.find((c) => c.id === updateId)!} onClose={() => setUpdateId(null)} onSubmit={handleUpdateContact}></UpdateContactModal>}         
            {editId && <EditContactModal contact={newContacts.find((c) => c.name === editId)!} onClose={() => setEditId(null)} onSubmit={handleEditContact}></EditContactModal>}
            { showCreateContact && (
                <CreateContactModal onSubmit={handleSaveContact} onClose={() => setShowCreateContact(false)} />
            )}
        </div>
    )
}