import { Image, X } from "lucide-react";
import "./CreatePostModal.css";
import { useState, useEffect } from "react";
import { createPost, saveDraft } from "../services/auth";
import { getUser } from "../utils/storage";

export default function CreatePostModal({ isOpen, onClose, onPostCreated }) {
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [image, setImage] = useState(null);
  const [isImage, setIsImage] = useState(false);
  const [postVisibility, setPostVisibility] = useState("public");
  const [userDefaultVisibility, setUserDefaultVisibility] = useState("public");
  const user = getUser();

  const user_id = user?.id || null;

  // Fetch user's default visibility setting when modal opens
  useEffect(() => {
    if (isOpen && user_id) {
      fetchUserVisibility();
    }
  }, [isOpen, user_id]);

  const fetchUserVisibility = async () => {
    try {
      const response = await fetch(
        `http://localhost/SociaTech/backend/auth/getVisibilitySettings.php?user_id=${user_id}`
      );
      const data = await response.json();

      if (data.success && data.settings.post_visibility) {
        const defaultVis = data.settings.post_visibility;
        setUserDefaultVisibility(defaultVis);
        setPostVisibility(defaultVis); // Set as default for new post
      }
    } catch (err) {
      console.error("Error fetching user visibility:", err);
    }
  };

  const resetFields = () => {
    setCategory("");
    setTitle("");
    setBody("");
    setImage(null);
    setPostVisibility(userDefaultVisibility); // Reset to user's default
  };

  const handleBodyChange = (e) => {
    setBody(e.target.value);
    if (e.target.value.length > 0) {
      setImage(null);
      setIsImage(false);
    }
  };

  const handleImageUpload = (e) => {
    setImage(e.target.files[0]);
    setBody("");
    setIsImage(true);
  };

  const handlePost = async () => {
    if (!user_id) {
      alert("You must be logged in to create a post.");
      return;
    }
    if (!category || !title) {
      alert("Category and title are required.");
      return;
    }
    if (!image && !body) {
      alert("Body or image is required.");
      return;
    }

    const formData = new FormData();
    formData.append("user_id", user_id);
    formData.append("post_category", category);
    formData.append("post_title", title);
    formData.append("post_content", body || "");
    formData.append("post_visibility", postVisibility); // Add visibility

    if (user?.username) formData.append("username", user.username);
    if (image) formData.append("post_image", image);

    try {
      const data = await createPost(formData);
      if (data.success) {
        alert("Post created successfully!");
        resetFields();
        setIsImage(false);
        onClose();
        if (onPostCreated) onPostCreated();
      } else {
        alert("Failed to create post: " + data.error);
      }
    } catch (err) {
      console.error("Error creating post:", err);
      alert("Something went wrong while posting.");
    }
  };

  const handleSaveDraft = async () => {
    if (!user_id) {
      alert("You must be logged in to save a draft.");
      return;
    }
    if (!category || !title) {
      alert("Category and title are required to save a draft.");
      return;
    }

    const formData = new FormData();
    formData.append("user_id", user_id);
    formData.append("post_category", category);
    formData.append("post_title", title);
    formData.append("post_content", body || "");
    formData.append("post_visibility", postVisibility); // Add visibility to draft
    if (image) formData.append("post_image", image);

    try {
      const response = await saveDraft(formData);
      if (response.success) {
        alert("Draft saved successfully!");
        resetFields();
        setIsImage(false);
        onClose();
      } else {
        alert("Failed to save draft: " + response.error);
      }
    } catch (error) {
      console.error("Error saving draft:", error);
      alert("Something went wrong while saving the draft.");
    }
  };

  return (
    <div
      className="createPost_parent_modal"
      style={isOpen ? { display: "flex" } : { display: "none" }}
    >
      <div className="createPost_container_modal">
        <div className="createPost_modal_title">Create Post</div>

        <select
          className="category_dropDown"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="" disabled>
            Category
          </option>
          <option value="Artificial Intelligence">
            Artificial Intelligence
          </option>
          <option value="Cyber Security">Cyber Security</option>
          <option value="Networking">Networking</option>
          <option value="Cloud Engineering">Cloud Engineering</option>
          <option value="Software Development">Software Development</option>
          <option value="Dev Ops">Dev Ops</option>
          <option value="Machine Learning">Machine Learning</option>
          <option value="Virtual Reality">Virtual Reality</option>
          <option value="Augmented Reality">Augmented Reality</option>
        </select>

        <div className="canSee_post">
          <select
            className="category_dropDown"
            value={postVisibility}
            onChange={(e) => setPostVisibility(e.target.value)}
          >
            <option value="" disabled>
              Who can see this post?
            </option>
            <option value="public">Public</option>
            <option value="followers">Followers Only</option>
          </select>
        </div>

        <div className="create_title_field">
          <label className="create_field_label">Title</label>
          <input
            type="text"
            value={title}
            className="create_field"
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="create_body_field">
          <label className="create_field_label">Body</label>
          {!isImage && (
            <textarea
              type="text"
              value={body}
              className="create_textarea"
              onChange={handleBodyChange}
            />
          )}
          {image && (
            <div
              className="content_img"
              style={isImage ? { display: "block" } : { display: "none" }}
            >
              <img src={URL.createObjectURL(image)} alt="contentImg" />
              <button
                className="removePic_btn"
                onClick={() => {
                  setImage(null);
                  setIsImage(false);
                }}
              >
                <X className="crossSvg" />
              </button>
            </div>
          )}
        </div>

        <div className="create_footer_modal">
          <label className="upload_img_btn" htmlFor="hiddenFileInput">
            <Image className="img_svg" />
          </label>
          <input
            id="hiddenFileInput"
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleImageUpload}
          />

          <div className="cancelPost_btn_container">
            <button
              className="cancelPost_btn save_draft_btn"
              onClick={handleSaveDraft}
            >
              Save Draft
            </button>

            <button className="cancelPost_btn post_btn" onClick={handlePost}>
              Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
