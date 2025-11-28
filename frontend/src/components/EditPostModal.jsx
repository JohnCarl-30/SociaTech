import { useState, useEffect } from "react";
import { X, Image } from "lucide-react";
import "../pages/Home.css";

export default function EditPostModal({ open, postData, fetchPost, user_id }) {
  const postCategories = [
    "All",
    "Artificial Intelligence",
    "Cyber Security",
    "Networking",
    "Cloud Engineering",
    "Software Development",
    "Dev Ops",
    "Machine Learning",
    "Virtual Reality",
    "Augmented Reality",
  ];

  const [isVisible, setIsVisible] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [editPostTitle, setEditPostTitle] = useState("");
  const [editPostContent, setEditPostContent] = useState("");
  const [editPostCategory, setEditPostCategory] = useState("");
  const [editPostImage, setEditPostImage] = useState(null);
  const [editPostImagePreview, setEditPostImagePreview] = useState("");

  // Open modal whenever parent sends a postData
  useEffect(() => {
    if (open && postData) {
      setEditingPost(postData);
      setEditPostTitle(postData.post_title || "");
      setEditPostContent(postData.post_content || "");
      setEditPostCategory(postData.post_category || "");
      setEditPostImagePreview(postData.post_image || "");
      setEditPostImage(null);
      setIsVisible(true);
    }
  }, [open, postData]);

  const closeModal = () => {
    setIsVisible(false);
    setEditingPost(null);
    setEditPostTitle("");
    setEditPostContent("");
    setEditPostCategory("");
    setEditPostImage(null);
    setEditPostImagePreview("");
  };

  const handleEditPostImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditPostImage(file);
      setEditPostImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveEditImage = () => {
    setEditPostImage(null);
    setEditPostImagePreview("");
  };

  const handleUpdatePost = async () => {
    if (!editPostTitle.trim()) {
      alert("Post title is required");
      return;
    }

    const formData = new FormData();
    formData.append("post_id", editingPost.post_id);
    formData.append("user_id", user_id);
    formData.append("post_title", editPostTitle);
    formData.append("post_content", editPostContent);
    formData.append("post_category", editPostCategory);

    if (editPostImage) {
      formData.append("post_image", editPostImage);
    } else if (!editPostImagePreview) {
      formData.append("remove_image", "true");
    }

    try {
      const res = await fetch("http://localhost/SociaTech/backend/auth/updatePost.php", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        await fetchPost();
        closeModal();
        alert("Post updated successfully!");
      } else {
        alert("Failed to update post: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      alert("Something went wrong while updating. Please try again.");
    }
  };

  if (!isVisible) return null; // Don't render if not visible

  return (
    <div className="commentModal_backDrop">
      <div className="commentModal_container">
        <span style={{ textAlign: "center", width: "100%" }}>Edit Post</span>

        <div className="editPost_modalContent">
          <div className="editPost_formGroup">
            <label htmlFor="editPostCategory">Category</label>
            <select
              id="editPostCategory"
              value={editPostCategory}
              onChange={(e) => setEditPostCategory(e.target.value)}
              className="editPost_select"
            >
              <option value="">Select Category</option>
              {postCategories
                .filter((cat) => cat !== "All") // exclude "All" in dropdown
                .map((cat, index) => (
                  <option key={index} value={cat}>
                    {cat}
                  </option>
                ))}
            </select>
          </div>

          <div className="editPost_formGroup">
            <label htmlFor="editPostTitle">Title *</label>
            <input
              id="editPostTitle"
              type="text"
              value={editPostTitle}
              onChange={(e) => setEditPostTitle(e.target.value)}
              className="editPost_input"
              placeholder="Enter post title"
            />
          </div>

          <div className="editPost_formGroup">
            <label htmlFor="editPostContent">Content</label>
            <textarea
              id="editPostContent"
              value={editPostContent}
              onChange={(e) => setEditPostContent(e.target.value)}
              className="editPost_textarea"
              placeholder="What's on your mind?"
              rows={4}
            />
          </div>

          <div className="editPost_formGroup">
            <label>Post Image</label>
            {editPostImagePreview && (
              <div className="editPost_imagePreview">
                <img src={editPostImagePreview} alt="preview" />
                <button className="editPost_removeImageBtn" onClick={handleRemoveEditImage}>
                  <X size={20} />
                </button>
              </div>
            )}
            <label htmlFor="editPostImageInput" className="editPost_uploadBtn">
              <Image size={20} />
              {editPostImagePreview ? "Change Image" : "Add Image"}
            </label>
            <input
              id="editPostImageInput"
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleEditPostImageSelect}
            />
          </div>

          <div className="editPost_actions">
            <button onClick={closeModal} className="editPost_cancelBtn">
              Cancel
            </button>
            <button onClick={handleUpdatePost} className="editPost_updateBtn">
              Update Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
