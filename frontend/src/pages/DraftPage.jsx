import "./DraftPage.css";
import PageHeader from '../components/PageHeader';
import ProfilePage from '../components/ProfilePage';
import HelpPage from '../components/HelpPage';
import Settings from '../components/Settings';
import Nav from '../components/Nav';
import EditDraftModal from '../components/EditDraftModal';
import defaultPfp from '../assets/deault_pfp.png';
import { useState, useEffect } from "react";
import { useCycle } from "framer-motion";
import { getCurrentUser } from '../services/auth';

export default function DraftPage() {
  const [isDropDownOpen, setIsDropDownOpen] = useState(false);
  const [isNotificationBarOpen, cycleNotificationBarOpen] = useCycle(false, true);
  const [isProfilePageOpen, setIsProfilePageOpen] = useState(false);
  const [isSettingOpen, setIsSettingOpen] = useState(false);
  const [openHelpPage, cycleOpenHelpPage] = useCycle(false, true);
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingDraft, setEditingDraft] = useState(null);

  useEffect(() => {
    const currentUser = getCurrentUser();

    if (currentUser?.id && !currentUser.username) {
      fetchUserDetails(currentUser);
    } else {
      setUser(currentUser);
    }
  }, []);

  const fetchUserDetails = async (currentUser) => {
    if (!currentUser?.id) {
      setUser(currentUser);
      return;
    }

    try {
      const response = await fetch('http://localhost/Sociatech/backend/auth/getUserDetails.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ user_id: currentUser.id })
      });

      const data = await response.json();

      if (data.success) {
        setUser({
          ...currentUser,
          username: data.username,
          profile_image: data.profile_image
        });
      } else {
        setUser(currentUser);
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      setUser(currentUser);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchDrafts();
    } else {
      setLoading(false);
      if (user !== null) {
        setError('Please log in to view your drafts');
      }
    }
  }, [user]);

  const fetchDrafts = async () => {
    setLoading(true);
    setError(null);

    if (!user?.id) {
      setError('User not authenticated');
      setDrafts([]);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost/Sociatech/backend/auth/getDraft.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ user_id: user.id })
      });

      const contentType = response.headers.get('content-type');

      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error('Server returned non-JSON response: ' + text.substring(0, 100));
      }

      const data = await response.json();

      if (data.success) {
        setDrafts(data.drafts || []);
      } else {
        setError(data.error || 'Failed to fetch drafts');
        setDrafts([]);
      }
    } catch (error) {
      console.error('Error fetching drafts:', error);
      setError('Failed to load drafts: ' + error.message);
      setDrafts([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePublishDraft = async (draftId) => {
    if (!user?.id) {
      alert('Please log in to publish drafts');
      return;
    }

    if (!window.confirm('Are you sure you want to publish this draft?')) {
      return;
    }

    try {
      const response = await fetch('http://localhost/Sociatech/backend/auth/publishDraft.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          draft_id: draftId,
          user_id: user.id
        })
      });

      const data = await response.json();

      if (data.success) {
        alert('Draft published successfully!');
        fetchDrafts();
      } else {
        alert('Failed to publish draft: ' + data.error);
      }
    } catch (error) {
      console.error('Error publishing draft:', error);
      alert('Something went wrong while publishing draft.');
    }
  };

  const handleEditDraft = (draft) => {
    setEditingDraft(draft);
    setIsEditModalOpen(true);
  };

  const handleEditComplete = () => {
    setIsEditModalOpen(false);
    setEditingDraft(null);
    fetchDrafts();
  };

  const handleDeleteDraft = async (draftId) => {
    if (!user?.id) {
      alert('Please log in to delete drafts');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this draft?')) {
      return;
    }

    try {
      const response = await fetch('http://localhost/Sociatech/backend/auth/deleteDraft.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          draft_id: draftId,
          user_id: user.id
        })
      });

      const data = await response.json();

      if (data.success) {
        alert('Draft deleted successfully!');
        fetchDrafts();
      } else {
        alert('Failed to delete draft: ' + data.error);
      }
    } catch (error) {
      console.error('Error deleting draft:', error);
      alert('Something went wrong while deleting draft.');
    }
  };

  const closeModals = () => {
    setIsDropDownOpen(false);
    setIsProfilePageOpen(false);
    setIsSettingOpen(false);
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    return `http://localhost/Sociatech/backend/${imagePath}`;
  };

  const getProfileImage = (draft) => {
    const profileImg = draft.profile_image || user?.profile_image;
    if (profileImg) {
      return getImageUrl(profileImg);
    }
    return defaultPfp;
  };

  return (
    <div className="draftPage_parent_container">
      <PageHeader
        setIsDropDownOpen={setIsDropDownOpen}
        isDropDownOpen={isDropDownOpen}
        cycleNotificationBarOpen={cycleNotificationBarOpen}
        isNotificationBarOpen={isNotificationBarOpen}
        setIsProfilePageOpen={setIsProfilePageOpen}
        setIsSettingOpen={setIsSettingOpen}
      />
      <div className="draftPage_child_container">
        <Nav closeModals={closeModals} />
        <div className="draftPage_body">
          <div className="draftPage_header">
            <h1 className="draftPage_title">Drafts</h1>
          </div>

          {loading ? (
            <div className="drafts_loading">Loading drafts...</div>
          ) : error ? (
            <div className="drafts_error">
              <p>{error}</p>
              <button onClick={fetchDrafts}>Retry</button>
            </div>
          ) : drafts.length === 0 ? (
            <div className="drafts_empty">
              <p>No draft posts yet.</p>
            </div>
          ) : (
            <div className="drafts_container">
              {drafts.map((draft) => (
                <div key={draft.id} className="draft_card">
                  <div className="draft_card_header">
                    <div className="draft_user_info">
                      <div className="draft_avatar">
                        {(draft.profile_image || user?.profile_image) ? (
                          <img
                            src={getProfileImage(draft)}
                            alt="Profile"
                          />
                        ) : (
                          (draft.username || user?.username)?.[0]?.toUpperCase() || 'U'
                        )}
                      </div>
                      <div className="draft_meta">
                        <span className="draft_username">
                          {draft.username ? `@${draft.username}` :
                            user?.username ? `@${user.username}` :
                              user?.email ? user.email.split('@')[0] : 'user'}
                        </span>
                      </div>
                      <span className="draft_category">{draft.post_category}</span>
                    </div>
                  </div>

                  <h2 className="draft_title">{draft.post_title}</h2>

                  {draft.post_content && (
                    <p className="draft_content_preview">
                      {draft.post_content.substring(0, 150)}
                      {draft.post_content.length > 150 ? '...' : ''}
                    </p>
                  )}

                  {draft.post_image && (
                    <div className="draft_image_preview">
                      <img
                        src={getImageUrl(draft.post_image)}
                        alt="Draft preview"
                      />
                    </div>
                  )}

                  <div className="draft_card_actions">
                    <button
                      className="draft_action_btn draft_publish_btn"
                      onClick={() => handlePublishDraft(draft.id)}
                    >
                      Post
                    </button>
                    <button
                      className="draft_action_btn draft_edit_btn"
                      onClick={() => handleEditDraft(draft)}
                    >
                      Edit
                    </button>
                    <button
                      className="draft_action_btn draft_delete_btn"
                      onClick={() => handleDeleteDraft(draft.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {isProfilePageOpen && (
        <ProfilePage setIsProfilePageOpen={setIsProfilePageOpen} />
      )}
      {isSettingOpen && <Settings setIsSettingOpen={setIsSettingOpen} />}
      {openHelpPage && <HelpPage cycleOpenHelpPage={cycleOpenHelpPage} />}

      {isEditModalOpen && editingDraft && (
        <EditDraftModal
          draft={editingDraft}
          user={user}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingDraft(null);
          }}
          onSave={handleEditComplete}
        />
      )}
    </div>
  );
}