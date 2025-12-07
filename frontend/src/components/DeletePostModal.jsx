import { useState, forwardRef, useImperativeHandle } from "react";
import { Trash2 } from "lucide-react";
import "../pages/Home.css";
import { ToastContainer, toast } from "react-toastify";

const DeletePostModal = forwardRef(({ user_id, onDelete }, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);

  // Expose open/close methods to parent
  useImperativeHandle(ref, () => ({
    open: (post) => {
      setPostToDelete(post);
      setIsOpen(true);
    },
    close: () => {
      setPostToDelete(null);
      setIsOpen(false);
    },
  }));

  const closeModal = () => {
    setIsOpen(false);
    setPostToDelete(null);
  };

  const confirmDeletePost = async () => {
    if (!postToDelete) return;

    try {
      const res = await fetch(
        "http://localhost/SociaTech/backend/auth/deletePost.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            post_id: postToDelete.post_id,
            user_id: user_id,
          }),
        }
      );

      // Check muna kung HTTP response is OK (status 200-299)
      if (!res.ok) {
        const text = await res.text();
        console.error("HTTP error:", res.status, text);
        alert("Something went wrong. Please try again.");
        return;
      }

      let data;
      try {
        data = await res.json();
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
        alert("Something went wrong. Please try again.");
        return;
      }

      if (data.success) {
        toast.success("Post deleted successfully!");
        onDelete?.(postToDelete.post_id);
        closeModal();
      } else {
        alert("Failed to delete post: " + (data.error || "Unknown error"));
      }

    } catch (err) {
      console.error("Fetch error:", err);
      alert("Something went wrong. Please try again.");
    }
  };


  return (
    <>
      {isOpen && postToDelete && (
        <div className="commentModal_backDrop" style={{ display: "flex" }}>
          <div className="deleteConfirm_modal">
            <div className="deleteConfirm_header">
              <Trash2 size={24} color="#dc2626" />
              <h2>Delete Post</h2>
            </div>
            <p className="deleteConfirm_message">
              Are you sure you want to delete this post? This action cannot be
              undone.
            </p>
            <div className="deleteConfirm_postPreview">
              <strong>{postToDelete.post_title}</strong>
              {postToDelete.post_content && (
                <p>{postToDelete.post_content.substring(0, 100)}...</p>
              )}
            </div>
            <div className="deleteConfirm_actions">
              <button onClick={closeModal} className="deleteConfirm_cancelBtn">
                Cancel
              </button>
              <button
                onClick={confirmDeletePost}
                className="deleteConfirm_deleteBtn"
              >
                Delete Post
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
});

export default DeletePostModal;
