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
  const user = getUser();

  const user_id = user?.id || null;

  const resetFields = () => {
    setCategory("");
    setTitle("");
    setBody("");
    setImage(null);
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

    if (user?.username) {
      formData.append("username", user.username);
    } else if (user?.email) {
      formData.append("username", user.email.split('@')[0]);
    }

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
      className={`createPost_parent_modal ${isOpen ? "modal_open" : ""}`}
      style={isOpen ? { display: "flex" } : { display: "none" }}
      onClick={onClose}
    >
      <div
        className={`createPost_container_modal ${isOpen ? "modal_content_open" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="createPost_modal_header">
          <div className="createPost_modal_title">
            Create Post
          </div>
          <button className="createPost_close_btn" onClick={onClose}>
            <X className="close_svg" />
          </button>
        </div>

        <div className="modal_content_wrapper">
          <div className="form_field_animated">
            <select
              className="category_dropDown"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="" disabled>
                Select Category
              </option>
              <option value="Artificial Intelligence"> Artificial Intelligence</option>
              <option value="Cyber Security">Cyber Security</option>
              <option value="Networking"> Networking</option>
              <option value="Cloud Engineering">Cloud Engineering</option>
              <option value="Software Development">Software Development</option>
              <option value="Dev Ops"> Dev Ops</option>
              <option value="Machine Learning"> Machine Learning</option>
              <option value="Virtual Reality"> Virtual Reality</option>
              <option value="Augmented Reality"> Augmented Reality</option>
            </select>
          </div>

          <div className="create_title_field form_field_animated">
            <label className="create_field_label">Title</label>
            <input
              type="text"
              value={title}
              className="create_field"
              placeholder="What's your post about?"
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="create_body_field form_field_animated">
            <label className="create_field_label">Content</label>
            {!isImage && (
              <textarea
                type="text"
                value={body}
                className="create_textarea"
                placeholder="Share your thoughts..."
                onChange={handleBodyChange}
              />
            )}
            {image && (
              <div
                className={`content_img ${isImage ? "image_visible" : ""}`}
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
        </div>

        <div className="create_footer_modal">
          <label className="upload_img_btn" htmlFor="hiddenFileInput" title="Upload image">
            <Image className="img_svg" />
            <span className="upload_text">Image</span>
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
              <span className="btn_icon"></span>
              Save Draft
            </button>

            <button className="cancelPost_btn post_btn" onClick={handlePost}>
              <span className="btn_icon"></span>
              Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}