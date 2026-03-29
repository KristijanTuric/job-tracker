import styles from '../../styles/modal.module.css';
import defaultStyles from '../../styles/defaults.module.css';

type Props = {
    onConfirm: () => void;
    onClose: () => void;
};

export function DeleteModal({ onConfirm, onClose }: Props) {
    return (
        <div className={styles.modalOverlay} onClick={(e) => {
            e.stopPropagation();
            onClose();
            }}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <h2>Are you sure?</h2>
                <div className={styles.modalActions}>
                    <button type="button" onClick={onConfirm} className={`${defaultStyles.modalCancelButton} ${defaultStyles.defaultButton}`}>Delete</button>
                    <button type="button" onClick={onClose} className={`${defaultStyles.contactAddButton} ${defaultStyles.defaultButton}`}>No</button>
                </div>
            </div>
        </div>
    )
}