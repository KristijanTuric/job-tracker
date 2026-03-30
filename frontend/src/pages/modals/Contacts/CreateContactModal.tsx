import { useState } from 'react';
import type { CreateContactRequest } from '../../../api/contacts';
import styles from '../../../styles/modal.module.css';
import defaultStyles from '../../../styles/defaults.module.css';

type Props = {
    onSubmit: (request: CreateContactRequest) => void;
    onClose: () => void;
};

export function CreateContactModal({ onSubmit, onClose }: Props) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [role, setRole] = useState("");
    const [notes, setNotes] = useState("");
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.SubmitEvent) {
        e.preventDefault();
        setError(null);

        try {
            onSubmit({
                name,
                email: email || null,
                phone: phone || null,
                role: role || null,
                notes: notes || null,
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to create contact.");
        }
    }

    return (
        <div className={styles.modalOverlay} onClick={(e) => {
            e.stopPropagation();
            onClose();
            }}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <h2>New Contact</h2>
                <form onSubmit={handleSubmit} className={styles.modalForm}>
                    <div className={styles.formInput}>
                        <label>Name</label>
                        <input autoFocus value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>

                    <div className={styles.formInput}>
                        <label>Email</label>
                        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
                    </div>

                    <div className={styles.formInput}>
                        <label>Phone</label>
                        <input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" />
                    </div>

                    <div className={styles.formInput}>
                        <label>Role</label>
                        <input value={role} onChange={(e) => setRole(e.target.value)} />
                    </div>

                    <div className={styles.formInput}>
                        <label>Notes</label>
                        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
                    </div>
                    
                     <div className={styles.modalActions}>
                        <button type="button" onClick={onClose} className={`${defaultStyles.defaultButton} ${defaultStyles.modalCancelButton}`}>Cancel</button>
                        <button type="submit" className={`${defaultStyles.defaultButton} ${defaultStyles.modalConfirmButton}`}>Save</button>
                    </div>
                </form>
                {error && <pre className="error">{error}</pre>}
            </div>
        </div>
    );
}