import styles from '../styles/modal.module.css';

type Props = {
    onConfirm: () => Promise<void>;
    onClose: () => void;
};

export function DeleteApplicationModal({ onConfirm, onClose }: Props) {

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <h2>Are you sure?</h2>
                <div className={styles.modalActions}>
                    <button type="button" onClick={onConfirm}>Yes</button>
                    <button type="button" onClick={onClose}>No</button>
                </div>
            </div>
        </div>
    )
}