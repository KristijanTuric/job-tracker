import { useState } from "react";
import type { CreateContactRequest, UpdateContactRequest } from "../../../api/contacts";
import styles from '../../../styles/modal.module.css';

type Props = {
    contact: CreateContactRequest;
    onSubmit: (request: UpdateContactRequest) => Promise<void>;
    onClose: () => void;
};

export function EditContactModal({contact, onSubmit, onClose}: Props) {
    const [name, setName] = useState(contact.name);
    const [email, setEmail] = useState(contact.email ?? "");
    const [phone, setPhone] = useState(contact.phone ?? "");
    const [role, setRole] = useState(contact.role ?? "");
    const [notes, setNotes] = useState(contact.notes ?? "");
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.SubmitEvent) {
        e.preventDefault();
        setError(null);

        try {
            await onSubmit({
                name,
                email: email || null,
                phone: phone || null,
                role: role || null,
                notes: notes || null,
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update contact.");
        }
    }

    return (
        <div className={styles.modalOverlay} onClick={(e) => {
            e.stopPropagation();
            onClose();
            }}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <h2>Edit Contact</h2>
                <form onSubmit={handleSubmit} className={styles.modalForm}>
                    <label>
                        Name
                        <input value={name} onChange={(e) => setName(e.target.value)} required />
                    </label>
                    <label>
                        Email
                        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
                    </label>
                    <label>
                        Phone
                        <input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" />
                    </label>
                    <label>
                        Role
                        <input value={role} onChange={(e) => setRole(e.target.value)} />
                    </label>
                    <label>
                        Notes
                        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
                    </label>
                     <div className={styles.modalActions}>
                        <button type="button" onClick={onClose}>Cancel</button>
                        <button type="submit">Save</button>
                    </div>
                </form>
                {error && <pre className="error">{error}</pre>}
            </div>
        </div>
    );
}