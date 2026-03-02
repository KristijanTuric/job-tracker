import '../styles/modal.css';

type Props = {
    onConfirm: () => Promise<void>;
    onClose: () => void;
};

export function DeleteApplicationModal({ onConfirm, onClose }: Props) {

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2>Are you sure?</h2>
                <div className="modal-actions">
                    <button type="button" onClick={onConfirm}>Yes</button>
                    <button type="button" onClick={onClose}>No</button>
                </div>
            </div>
        </div>
    )
}