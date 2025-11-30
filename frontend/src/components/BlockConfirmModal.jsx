import "./BlockConfirmModal.css";
import { UserX } from "lucide-react";

export default function BlockConfirmModal({ isOpen, onConfirm, onCancel, username }) {
    if (!isOpen) return null;

    return (
        <div className="block_confirm_backdrop">
            <div className="block_confirm_modal">
                <div className="block_confirm_icon">
                    <UserX size={48} />
                </div>
                <h2 className="block_confirm_title">Block @{username}?</h2>
                <p className="block_confirm_message">
                    They will no longer be able to see your posts or interact with you.
                    You can unblock them anytime from Settings.
                </p>
                <div className="block_confirm_buttons">
                    <button className="block_confirm_no" onClick={onCancel}>
                        Cancel
                    </button>
                    <button className="block_confirm_yes" onClick={onConfirm}>
                        Block
                    </button>
                </div>
            </div>
        </div>
    );
}