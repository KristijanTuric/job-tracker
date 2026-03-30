import type { LocalContact } from "../../../api/contacts";
import styles from '../../../styles/modal.module.css';
import contactStyles from '../../../styles/contacts.module.css';
import defaultStyles from '../../../styles/defaults.module.css';

type Props = {
    contact: LocalContact;
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
                    {contact.email ? (
                         <a className={contactStyles.contactInfo} href={`mailto:${contact.email}`}>{contact.email}</a>
                    ) : (
                        <div className={contactStyles.emptyInfo}>-</div>
                    )}

                    <div className={contactStyles.contactLabel}>Phone</div>
                    {contact.phone ? (
                         <a className={contactStyles.contactInfo} href={`tel:${contact.phone}`}>{contact.phone}</a>
                    ):(
                        <div className={contactStyles.emptyInfo}>-</div>
                    )}
                    
                    <div className={contactStyles.contactLabel}>Role</div>
                    <div className={contactStyles.emptyInfo}>{contact.role || "-"}</div>

                    <div className={contactStyles.contactLabel}>Notes</div>
                    <div className={contactStyles.contactNotes}>{contact.notes || "-"}</div>
                </div>
                <div className={styles.modalActions}>
                    <button type="button" onClick={onClose} className={`${defaultStyles.defaultButton} ${defaultStyles.modalCancelButton}`}>Close</button>
                </div>
            </div>

        </div>
    );
    
}

