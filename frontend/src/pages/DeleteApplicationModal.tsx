import { useState } from "react";
import '../styles/modal.css';

type Props = {
    onConfirm: () => Promise<void>;
    onClose: () => void;
};

export function DeleteApplicationModal({ onConfirm, onClose }: Props) {
    const [error, setError] = useState<string | null>(null);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2>Are you sure?</h2>
                <div className="modal-actions">
                    <button type="button" onClick={onConfirm}>Yes</button>
                    <button type="button" onClick={onClose}>No</button>
                </div>

                {error && <pre className="error">{error}</pre>}
            </div>
        </div>
    )
}