import { useState, useEffect } from "react";
import { X, Image as ImageIcon } from "lucide-react";
import "./EditDraftModal.css";

export default function EditDraftModal({ draft, onClose, onSave, user }) {
    const [formData, setFormData] = useState({
        post_category: "",
        post_title: "",
        post_content: "",
        post_image: null
    });
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);


    useEffect(() => {
        if (draft) {
            setFormData({
                post_category: draft.post_category || "",
                post_title: draft.post_title || "",
                post_content: draft.post_content || "",
                post_image: null
            });

            if (draft.post_image) {
                setImagePreview(`http://localhost/Sociatech/backend/${draft.post_image}`);
            }

        }
    }, [draft]);


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                setError('Please select an image file');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                setError('Image size must be less than 5MB');
                return;
            }

            setFormData(prev => ({
                ...prev,
                post_image: file
            }));

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
            setError(null);
        }
    };

    const handleRemoveImage = () => {
        setFormData(prev => ({
            ...prev,
            post_image: null
        }));
        setImagePreview(draft.post_image ? `http://localhost/Sociatech/backend/${draft.post_image}` : null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!formData.post_category || !formData.post_title) {
            setError('Please fill in category and title');
            return;
        }

        if (!user?.id) {
            setError('User not authenticated');
            return;
        }

        setLoading(true);

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('draft_id', draft.id);
            formDataToSend.append('user_id', user.id);
            formDataToSend.append('post_category', formData.post_category);
            formDataToSend.append('post_title', formData.post_title);
            formDataToSend.append('post_content', formData.post_content);

            if (formData.post_image) {
                formDataToSend.append('post_image', formData.post_image);
            }

            const response = await fetch('http://localhost/Sociatech/backend/auth/editDraft.php', {
                method: 'POST',
                credentials: 'include',
                body: formDataToSend
            });

            const data = await response.json();

            if (data.success) {
                alert('Draft updated successfully!');
                onSave();
                onClose();
            } else {
                setError(data.error || 'Failed to update draft');
            }
        } catch (error) {
            console.error('Error updating draft:', error);
            setError('Something went wrong while updating draft');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="edit_draft_overlay" onClick={onClose}>
            <div className="edit_draft_modal" onClick={(e) => e.stopPropagation()}>
                <div className="edit_draft_header">
                    <h2>Edit Draft</h2>
                    <button className="edit_draft_close" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                {error && (
                    <div className="edit_draft_error">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="edit_draft_form">
                    <div className="edit_draft_field">
                        <label htmlFor="post_category">Category *</label>
                        <select
                            id="post_category"
                            name="post_category"
                            value={formData.post_category}
                            onChange={handleInputChange}
                            required
                        >
                            <option value="">Select a category</option>
                            <option value="Cyber Security">Cyber Security</option>
                            <option value="Web Development">Web Development</option>
                            <option value="Mobile Development">Mobile Development</option>
                            <option value="Data Science">Data Science</option>
                            <option value="AI & Machine Learning">AI & Machine Learning</option>
                            <option value="DevOps">DevOps</option>
                            <option value="Cloud Computing">Cloud Computing</option>
                            <option value="Programming">Programming</option>
                            <option value="Technology News">Technology News</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div className="edit_draft_field">
                        <label htmlFor="post_title">Title *</label>
                        <input
                            type="text"
                            id="post_title"
                            name="post_title"
                            value={formData.post_title}
                            onChange={handleInputChange}
                            placeholder="Enter post title"
                            required
                        />
                    </div>

                    <div className="edit_draft_field">
                        <label htmlFor="post_content">Content</label>
                        <textarea
                            id="post_content"
                            name="post_content"
                            value={formData.post_content}
                            onChange={handleInputChange}
                            placeholder="Write your content here..."
                            rows="6"
                        />
                    </div>

                    <div className="edit_draft_field">
                        <label>Image</label>
                        <div className="edit_draft_image_upload">
                            <input
                                type="file"
                                id="post_image"
                                accept="image/*"
                                onChange={handleImageChange}
                                style={{ display: 'none' }}
                            />
                            <label htmlFor="post_image" className="edit_draft_image_label">
                                <ImageIcon size={20} />
                                {formData.post_image ? 'Change Image' : 'Upload Image'}
                            </label>

                            {imagePreview && (
                                <div className="edit_draft_image_preview">
                                    <img src={imagePreview} alt="Preview" />
                                    <button
                                        type="button"
                                        className="edit_draft_remove_image"
                                        onClick={handleRemoveImage}
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="edit_draft_actions">
                        <button
                            type="button"
                            className="edit_draft_cancel"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="edit_draft_save"
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}