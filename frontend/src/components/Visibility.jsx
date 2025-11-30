import { Eye, X } from "lucide-react";
import "./Visibility.css";
import { useState, useEffect } from "react";

export default function Visibility({ openModal, closeModal, userId }) {
  const [postVisibility, setPostVisibility] = useState("public");
  const [feedPreference, setFeedPreference] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch current visibility settings when modal opens
  useEffect(() => {
    if (openModal && userId) {
      fetchVisibilitySettings();
    }
  }, [openModal, userId]);

  const fetchVisibilitySettings = async () => {
    try {
      const response = await fetch(
        `http://localhost/SociaTech/backend/auth/getVisibilitySettings.php?user_id=${userId}`
      );
      const data = await response.json();

      if (data.success) {
        setPostVisibility(data.settings.post_visibility || "public");
        setFeedPreference(data.settings.feed_preference || "all");
      }
    } catch (err) {
      console.error("Error fetching visibility settings:", err);
    }
  };

  const handleSave = async () => {
    if (!userId) {
      setError("User not logged in");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      formData.append("user_id", userId);
      formData.append("post_visibility", postVisibility);
      formData.append("feed_preference", feedPreference);

      const response = await fetch(
        "http://localhost/SociaTech/backend/auth/updateVisibilitySettings.php",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (data.success) {
        setSuccess("Visibility settings updated successfully!");
        setTimeout(() => {
          closeModal();
          setSuccess("");
        }, 1500);
      } else {
        setError(data.message || "Failed to update settings");
      }
    } catch (err) {
      console.error("Error updating visibility settings:", err);
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setError("");
    setSuccess("");
    closeModal();
  };

  return (
    <>
      <div
        className="visibility_parent_container"
        style={{ display: openModal ? "flex" : "none" }}
      >
        <div className="visibility_modal">
          <button className="visibility_close_container" onClick={handleClose}>
            <X className="closeSvg" />
          </button>
          <div className="vibility_modal_title">
            <Eye />
            Visibility
          </div>
          <div className="visibility_modal_description">
            Change who can see your post and what post you want to see
          </div>

          {error && (
            <div
              style={{
                color: "red",
                padding: "10px",
                backgroundColor: "#fee",
                borderRadius: "5px",
                marginBottom: "10px",
                fontSize: "14px",
              }}
            >
              {error}
            </div>
          )}

          {success && (
            <div
              style={{
                color: "green",
                padding: "10px",
                backgroundColor: "#efe",
                borderRadius: "5px",
                marginBottom: "10px",
                fontSize: "14px",
              }}
            >
              {success}
            </div>
          )}

          <div className="visibility_field_container">
            Who can see your post
            <select
              value={postVisibility}
              onChange={(e) => setPostVisibility(e.target.value)}
              className="visibility_select_field"
              disabled={isLoading}
            >
              <option value="public">Public</option>
              <option value="followers">Followers Only</option>
            </select>
          </div>

          <div className="visibility_field_container">
            What post you want to see
            <select
              value={feedPreference}
              onChange={(e) => setFeedPreference(e.target.value)}
              className="visibility_select_field"
              disabled={isLoading}
            >
              <option value="all">All Posts</option>
              <option value="following">Following Only</option>
            </select>
          </div>

          <div className="visibility_save_btn">
            <button
              onClick={handleSave}
              disabled={isLoading}
              style={{
                opacity: isLoading ? 0.6 : 1,
                cursor: isLoading ? "not-allowed" : "pointer",
              }}
            >
              {isLoading ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
