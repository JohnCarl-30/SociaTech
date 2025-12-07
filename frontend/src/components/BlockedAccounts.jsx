import { X, UserX } from 'lucide-react';
import "./BlockedAccounts.css";
import { useState, useEffect } from 'react';
import { getUser } from "../utils/storage";
import pfpImage from "../assets/deault_pfp.png";
import { toast } from "react-toastify";

export default function BlockedAccounts({ openModal, closeModal }) {
    const [blockedUsers, setBlockedUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const user = getUser();
    const user_id = user?.id || null;

    useEffect(() => {
        if (openModal && user_id) {
            fetchBlockedUsers();
        }
    }, [openModal, user_id]);

    const fetchBlockedUsers = async () => {
        if (!user_id) {
            console.error("No user_id available");
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(
                `http://localhost/SociaTech/backend/auth/fetchBlockedUsers.php?user_id=${user_id}`
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                const text = await response.text();
                console.error("Server returned non-JSON response:", text);
                throw new Error("Server returned non-JSON response");
            }

            const data = await response.json();

            if (data.success) {
                setBlockedUsers(data.blocked_users || []);
            } else {
                console.error("Failed to fetch blocked users:", data.message);
                setBlockedUsers([]);
            }
        } catch (error) {
            console.error("Error fetching blocked users:", error);
            setBlockedUsers([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUnblockUser = async (blockedUserId) => {
        if (!user_id) {
            toast.error("You must be logged in to unblock users");
            return;
        }

        if (!blockedUserId) {
            toast.error("Invalid user ID");
            return;
        }

        if (!confirm("Are you sure you want to unblock this user?")) {
            return;
        }

        try {
            const params = new URLSearchParams();
            params.append("user_id", user_id);
            params.append("blocked_user_id", blockedUserId);

            const response = await fetch(
                "http://localhost/SociaTech/backend/auth/handleUnblockedUser.php",
                {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: params.toString()
                }
            );

            const data = await response.json();

            if (data.success) {
                toast.success("User unblocked successfully!");
                await fetchBlockedUsers();
            } else {
                toast.error(data.message || "Failed to unblock user");
            }
        } catch (error) {
            console.error("Error unblocking user:", error);
            toast.error("An error occurred: " + error.message);
        }
    };

    return (
        <div
            className='blocked_accounts_parent_container'
            style={{ display: openModal ? 'flex' : 'none' }}
        >
            <div className='blocked_accounts_modal_container'>
                {/* ✅ MOVED CLOSE BUTTON INSIDE MODAL CONTAINER */}
                <button className='blocked_accounts_close_btn' onClick={closeModal}>
                    <X className='crossSvg' />
                </button>

                <div className='blocked_accounts_modal_title'>Blocked Accounts</div>

                <div className='blocked_accounts_content'>
                    {isLoading ? (
                        <div className='blocked_accounts_loading'>Loading...</div>
                    ) : blockedUsers.length === 0 ? (
                        <div className='blocked_accounts_empty'>
                            <UserX size={48} />
                            <p>No blocked accounts</p>
                        </div>
                    ) : (
                        <div className='blocked_users_list'>
                            {blockedUsers.map((user) => (
                                <div key={user.user_id} className='blocked_user_item'>
                                    <div className='blocked_user_info'>
                                        <img
                                            src={user.profile_image || pfpImage}
                                            alt="profile"
                                            className='blocked_user_pfp'
                                        />
                                        <div className='blocked_user_details'>
                                            <div className='blocked_user_username'>@{user.username}</div>
                                            <div className='blocked_user_date'>
                                                Blocked on {new Date(user.blocked_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        className='unblock_btn'
                                        onClick={() => handleUnblockUser(user.user_id)}
                                    >
                                        Unblock
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}