import "./DraftPage.css";
import PageHeader from '../components/PageHeader';
import ProfilePage from '../components/ProfilePage';
import HelpPage from '../components/HelpPage';
import Settings from '../components/Settings';
import Nav from '../components/Nav';
import { useState, useEffect } from "react";
import { useCycle } from "framer-motion";
import { getUser } from "../utils/storage.js";
import EditDraftModal from '../components/EditDraftModal';
import defaultPfp from '../assets/deault_pfp.png';
import { ToastContainer, toast } from "react-toastify";
export default function DraftPage() {
  const [isDropDownOpen, setIsDropDownOpen] = useState(false);
  const [isNotificationBarOpen, cycleNotificationBarOpen] = useCycle(false, true);
  const [isProfilePageOpen, setIsProfilePageOpen] = useState(false);
  const [isSettingOpen, setIsSettingOpen] = useState(false);
  const [openHelpPage, cycleOpenHelpPage] = useCycle(false, true);
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingDraft, setEditingDraft] = useState(null);

  // Always check proper key
  const user = getUser();
  const user_id = user?.user_id || user?.id || null;
  const username = user?.username;

  // FETCH DATA ONCE
  useEffect(() => {
    if (!user_id) {
      setLoading(false);
      setError("User not found");
      return;
    }
    fetchDrafts();
  }, [user_id]);

  // API CALL (cleaned)
  const fetchDrafts = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "http://localhost/Sociatech/backend/auth/getDraft.php",
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id }),
        }
      );

      const data = await response.json();

      if (!data.success) throw new Error(data.error || "Failed to fetch");
      setDrafts(data.drafts);
      console.log(data.drafts);
      setError(null);
    } catch (err) {
      setError(err.message);
      setDrafts([]);
    } finally {
      setLoading(false);
    }
  };

  // POST/PUBLISH HANDLER
  const handlePublishDraft = async (draftId) => {
    if (!confirm("Are you sure you want to publish this draft?")) return;

    try {
      const response = await fetch(
        "http://localhost/Sociatech/backend/auth/publishDraft.php",
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ draft_id: draftId, user_id, username }),
        }
      );

      const data = await response.json();
      if (!data.success) throw new Error(data.error);
      toast.error("Draft published successfully!");
      fetchDrafts();
    } catch (err) {
      toast.error("Failed to publish draft: " + err.message);
    }
  };

  // DELETE HANDLER
  const handleDeleteDraft = async (draftId) => {
    if (!confirm("Are you sure you want to delete this draft?")) return;

    try {
      const response = await fetch(
        "http://localhost/Sociatech/backend/auth/deleteDraft.php",
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ draft_id: draftId, user_id }),
        }
      );

      const data = await response.json();
      if (!data.success) throw new Error(data.error);
      toast.success("Draft deleted successfully!");
      fetchDrafts();
    } catch (err) {
      toast.error("Failed to delete draft: " + err.message);
    }
  };

  const closeProfilePage = () => setIsProfilePageOpen(false);
  const toggleDropDown = () => setIsDropDownOpen((prev) => !prev);
  const openProfilePage = () => {
    setIsProfilePageOpen(true);
    setIsDropDownOpen(false); // ⬅ auto-close dropdown
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

  const closeModals = () => {
    setIsDropDownOpen(false);
    setIsProfilePageOpen(false);
    setIsSettingOpen(false);
  };

  const timeAgo = (dateString) => {
    const now = new Date();
    const past = new Date(dateString);
    const diff = Math.floor((now - past) / 1000); // seconds

    const units = [
      { name: "second", seconds: 1 },
      { name: "minute", seconds: 60 },
      { name: "hour", seconds: 3600 },
      { name: "day", seconds: 86400 },
    ];

    for (let i = units.length - 1; i >= 0; i--) {
      const { name, seconds } = units[i];
      if (diff >= seconds) {
        const value = Math.floor(diff / seconds);
        return `${value} ${value === 1 ? name : name + "s"} ago`;
      }
    }

    return "just now";
  };
  // ================== UI START ==================
  return (
    <div className="draftPage_parent_container">
      <PageHeader
        setIsDropDownOpen={setIsDropDownOpen}
        isDropDownOpen={isDropDownOpen}
        toggleDropDown={toggleDropDown}
        openProfilePage={openProfilePage}
        cycleNotificationBarOpen={cycleNotificationBarOpen}
        isNotificationBarOpen={isNotificationBarOpen}
        setIsProfilePageOpen={() => setIsProfilePageOpen(true)}
        setIsSettingOpen={setIsSettingOpen}
      />



      <div className="draftPage_child_container">
        <Nav closeModals={closeModals} />
        <div className="draftPage_body">
          <h1 className="draftPage_title">Drafts</h1>

          {loading ? (
            <p className="drafts_loading">Loading drafts...</p>
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
                          @{draft.username || user.username}
                        </span>
                        <span className="draft_date">
                          {timeAgo(draft.post_date)}
                        </span>
                      </div>

                      <span className="draft_category">{draft.post_category}</span>
                    </div>
                  </div>

                  <h2 className="draft_title">{draft.post_title}</h2>

                  {draft.post_content && (
                    <p className="draft_content_preview">
                      {draft.post_content.slice(0, 150)}
                      {draft.post_content.length > 150 && "..."}
                    </p>
                  )}

                  {draft.post_image && (
                    <div className="draft_image_preview">
                      <img src={`http://localhost/Sociatech/${draft.post_image}`} alt="Draft preview" />
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

      {isProfilePageOpen && <ProfilePage setIsProfilePageOpen={setIsProfilePageOpen} closeProfilePage={closeProfilePage} />}
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
