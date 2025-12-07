import React, { useState, useEffect } from 'react';
import './ViewFollowerModal.css';

const ViewFollowerModal = ({
    isOpen,
    onClose,
    followers = [],
    onRemoveFollower,
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
        if (e.target.classList.contains('follower-modal-overlay')) {
            handleClose();
        }
    };

    const filteredFollowers = followers.filter(follower =>
        follower.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        follower.fullname?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!isOpen && !isClosing) return null;

    return (
        <div
            className={`follower-modal-overlay ${isClosing ? 'closing' : ''}`}
            onClick={handleOverlayClick}
        >
            <div className={`follower-modal ${isClosing ? 'closing' : ''}`}>
                <div className="follower-modal-header">
                    <h2>Followers</h2>
                    <button className="follower-modal-close" onClick={handleClose}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                <div className="follower-modal-search">
                    <input
                        type="text"
                        placeholder="Search"
                        className="follower-search-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        disabled={isLoading}
                    />
                </div>

                <div className="follower-modal-list">
                    {isLoading ? (
                        <div className="follower-loading-state">
                            <div className="follower-spinner"></div>
                            <p>Loading followers...</p>
                        </div>
                    ) : filteredFollowers.length === 0 ? (
                        <div className="follower-empty-state">
                            <p>{searchTerm ? 'No results found' : 'No followers yet'}</p>
                        </div>
                    ) : (
                        filteredFollowers.map((follower) => (
                            <div key={follower.user_id} className="follower-item">
                                <div className="follower-info">
                                    <div className="follower-avatar">
                                        {follower.profile_image ? (
                                            <img src={follower.profile_image} alt={follower.username} />
                                        ) : (
                                            <div className="follower-avatar-placeholder">
                                                {follower.username?.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <div className="follower-details">
                                        <span className="follower-username">{follower.username}</span>
                                        <span className="follower-name">{follower.fullname}</span>
                                    </div>
                                </div>
                                {onRemoveFollower && (
                                    <button
                                        className="follower-remove-btn"
                                        onClick={() => onRemoveFollower(follower.user_id)}
                                    >
                                        Remove
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

export default ViewFollowerModal;
