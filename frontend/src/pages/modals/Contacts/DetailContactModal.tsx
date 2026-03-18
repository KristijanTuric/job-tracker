import type { ContactResponse } from "../../../api/contacts";
import styles from '../../../styles/modal.module.css';
import contactStyles from '../../../styles/contacts.module.css';

type Props = {
    contact: ContactResponse;
    onClose: () => void;
};


export function DetailContactModal({ contact, onClose }: Props) {

    return(
        <div className={styles.modalOverlay} onClick={(e) => {
            e.stopPropagation();
            onClose();
            }}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <h2>{contact.name}</h2>

                <div className={contactStyles.contactGrid}>
                    <div className={contactStyles.contactLabel}>Email</div>
                    <div>{contact.email || "-"}</div>

                    <div className={contactStyles.contactLabel}>Phone</div>
                    <div>{contact.phone || "-"}</div>

                    <div className={contactStyles.contactLabel}>Role</div>
                    <div>{contact.role || "-"}</div>

                    <div className={contactStyles.contactLabel}>Notes</div>
                    <div className={contactStyles.contactNotes}>{contact.notes || "-"}</div>
                </div>
                <div className={styles.modalActions}>
                    <button type="button" onClick={onClose}>Close</button>
                </div>
            </div>

        </div>
    );
    
}

