import { useEffect, useCallback } from 'react';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmDialog = ({
    isOpen,
    onClose,
    onConfirm,
    title = 'Confirm Action',
    message = 'Are you sure you want to proceed?',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    isDestructive = false,
    isLoading = false,
}) => {
    // Handle escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen && !isLoading) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, isLoading, onClose]);

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget && !isLoading) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-foreground/60 backdrop-blur-sm animate-modal-overlay"
            onClick={handleOverlayClick}
        >
            <div className="relative w-full max-w-sm mx-4 bg-card rounded-2xl shadow-2xl overflow-hidden animate-modal-content">
                {/* Header */}
                <div className="flex items-center gap-3 px-6 py-4 border-b border-border">
                    <div className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center',
                        isDestructive ? 'bg-destructive/10' : 'bg-primary/10'
                    )}>
                        <AlertTriangle className={cn(
                            'w-5 h-5',
                            isDestructive ? 'text-destructive' : 'text-primary'
                        )} />
                    </div>
                    <h3 className="text-lg font-semibold text-card-foreground">{title}</h3>
                </div>

                {/* Content */}
                <div className="px-6 py-4">
                    <p className="text-muted-foreground">{message}</p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 px-6 py-4 border-t border-border bg-muted/30">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 px-4 py-2.5 text-sm font-medium rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors disabled:opacity-50"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={cn(
                            'flex-1 px-4 py-2.5 text-sm font-medium rounded-xl transition-colors disabled:opacity-50',
                            isDestructive
                                ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                                : 'bg-primary text-primary-foreground hover:bg-primary/90'
                        )}
                    >
                        {isLoading ? 'Please wait...' : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;
