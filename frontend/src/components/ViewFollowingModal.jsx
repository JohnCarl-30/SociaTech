import React, { useState, useEffect } from 'react';
import './ViewFollowingModal.css';

const ViewFollowingModal = ({
    isOpen,
    onClose,
    following = [],
    onUnfollow,
    currentUserId,
    isLoading = false
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setSearchTerm('');
            setIsClosing(false);
        }
    }, [isOpen]);

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen) {
                handleClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
            setIsClosing(false);
        }, 200);
    };

    const handleOverlayClick = (e) => {
        if (e.target.classList.contains('following-modal-overlay')) {
            handleClose();
        }
    };

    const filteredFollowing = following.filter(user =>
        user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.fullname?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!isOpen && !isClosing) return null;

    return (
        <div
            className={`following-modal-overlay ${isClosing ? 'closing' : ''}`}
            onClick={handleOverlayClick}
        >
            <div className={`following-modal ${isClosing ? 'closing' : ''}`}>
                <div className="following-modal-header">
                    <h2>Following</h2>
                    <button className="following-modal-close" onClick={handleClose}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                <div className="following-modal-search">
                    <input
                        type="text"
                        placeholder="Search"
                        className="following-search-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        disabled={isLoading}
                    />
                </div>

                <div className="following-modal-list">
                    {isLoading ? (
                        <div className="following-loading-state">
                            <div className="following-spinner"></div>
                            <p>Loading following...</p>
                        </div>
                    ) : filteredFollowing.length === 0 ? (
                        <div className="following-empty-state">
                            <p>{searchTerm ? 'No results found' : 'Not following anyone yet'}</p>
                        </div>
                    ) : (
                        filteredFollowing.map((user) => (
                            <div key={user.user_id} className="following-item">
                                <div className="following-info">
                                    <div className="following-avatar">
                                        {user.profile_image ? (
                                            <img src={user.profile_image} alt={user.username} />
                                        ) : (
                                            <div className="following-avatar-placeholder">
                                                {user.username?.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <div className="following-details">
                                        <span className="following-username">{user.username}</span>
                                        <span className="following-name">{user.fullname}</span>
                                    </div>
                                </div>
                                {onUnfollow && (
                                    <button
                                        className="following-unfollow-btn"
                                        onClick={() => onUnfollow(user.user_id)}
                                    >
                                        Following
                                    </button>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default ViewFollowingModal;
