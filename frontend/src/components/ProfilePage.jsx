import "./ProfilePage.css";

import {
  ArrowBigUp,
  ArrowBigDown,
  Bookmark,
  AlertCircle,
  Image,
  X,
  Ban,
  Edit,
  Trash2,
  Search,
  Eye,
} from "lucide-react";
import pfpImage from "../assets/deault_pfp.png";
import SamplePost from "../assets/samplePost.png";
import moreBtn from "../assets/moreBtn.png";
import { useState, useEffect } from "react";
import { getUser } from "../utils/storage";

export default function ProfilePage({ style, closeProfilePage, onPostClick }) {
  const [image, setImage] = useState(null);
  const [imageURL, setImageURL] = useState(null);
  const [isOpenPage, setOpenPage] = useState("post");

  // User stats state
  const [username, setUsername] = useState("");
  const [fullname, setFullname] = useState("");
  const [bio, setBio] = useState("");
  const [postCount, setPostCount] = useState("");
  const [savedCount, setSavedCount] = useState(0);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [Achievements, setAchievements] = useState("");
  const [profileImage, setProfileImage] = useState(pfpImage);
  const [uploading, setUploading] = useState(false);
  const [savedPostIds, setSavedPostIds] = useState(new Set());
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  // Edit Profile states
  const [isEditMode, setIsEditMode] = useState(false);
  const [editFullname, setEditFullname] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [editBio, setEditBio] = useState("");
  const [updating, setUpdating] = useState(false);

  const user = getUser();
  const user_id = user?.id || null;

  const [savedPosts, setSavedPosts] = useState([]);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [openMorePost, setOpenMorePost] = useState(null);

  const refreshUserStats = async () => {
    if (!user_id) return;

    try {
      const res = await fetch(
        `http://localhost/SociaTech/backend/auth/getUserStats.php?user_id=${user_id}`
      );
      const data = await res.json();

      if (data.success) {
        setPostCount(data.post_count || 0);
        setFollowerCount(data.follower_count || 0);
        setFollowingCount(data.following_count || 0);
      }
    } catch (err) {
      console.log("Error fetching user stats:", err);
    }
  };

  useEffect(() => {
    refreshUserStats();
  }, [user_id]);

  useEffect(() => {
    if (style === "flex") {
      refreshUserStats();
    }
  }, [style]);

  useEffect(() => {
    let intervalId;

    if (style === "flex") {
      intervalId = setInterval(() => {
        refreshUserStats();
      }, 15000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [style, user_id]);

  useEffect(() => {
    const handleFocus = () => {
      if (style === "flex") {
        refreshUserStats();
      }
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [style, user_id]);

  useEffect(() => {
    if (window.refreshProfileStats) {
      window.refreshProfileStats = refreshUserStats;
    }
  }, [user_id]);

  const fetchSavedPosts = async () => {
    if (!user_id) return;

    setLoadingSaved(true);
    try {
      const res = await fetch(
        `http://localhost/SociaTech/backend/auth/getsavedPosts.php?user_id=${user_id}`
      );
      const data = await res.json();

      if (data.success) {
        setSavedPosts(data.posts || []);
        setSavedCount(data.posts?.length || 0);
      } else {
        setSavedPosts([]);
        setSavedCount(0);
      }
    } catch (err) {
      console.log("Error fetching saved posts:", err);
      setSavedPosts([]);
      setSavedCount(0);
    } finally {
      setLoadingSaved(false);
    }
  };

  useEffect(() => {
    if (isOpenPage === "saved") {
      fetchSavedPosts();
      fetchSavedPostIds();
    } else if (user_id && savedCount === 0) {
      fetch(
        `http://localhost/SociaTech/backend/auth/getsavedPosts.php?user_id=${user_id}`
      )
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setSavedCount(data.posts?.length || 0);
          }
        })
        .catch((err) => console.log("Error fetching saved count:", err));
    }
  }, [isOpenPage, user_id]);

  // Fetch saved post IDs to track which posts are saved
  const fetchSavedPostIds = async () => {
    if (!user_id) return;

    try {
      const res = await fetch(
        `http://localhost/SociaTech/backend/auth/getsavedPosts.php?user_id=${user_id}`
      );
      const data = await res.json();

      if (data.success && data.posts) {
        const postIds = new Set(data.posts.map((post) => post.post_id));
        setSavedPostIds(postIds);
      }
    } catch (err) {
      console.log("Error fetching saved post IDs:", err);
    }
  };

  // Fetch saved post IDs on component mount
  useEffect(() => {
    if (user_id) {
      fetchSavedPostIds();
    }
  }, [user_id]);

  const handleImageUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleSaveProfilePhoto = async () => {
    if (!image || !user_id) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("profile_image", image);
    formData.append("user_id", user_id);

    try {
      const res = await fetch(
        "http://localhost/SociaTech/backend/auth/updateProfileImage.php",
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await res.json();

      if (data.success) {
        setProfileImage(data.profile_image);
        setImage(null);
        setImageURL(null);
        alert("Profile photo updated successfully!");
      } else {
        alert(
          "Failed to update profile photo: " + (data.message || "Unknown error")
        );
      }
    } catch (err) {
      console.log("Error uploading profile photo:", err);
      alert("Error uploading profile photo");
    } finally {
      setUploading(false);
    }
  };

  const timeAgo = (dateString) => {
    const now = new Date();
    const past = new Date(dateString);
    const diff = Math.floor((now - past) / 1000);

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

  // Fetch user profile data (includes fullname and bio)
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user_id) return;

      try {
        const res = await fetch(
          `http://localhost/SociaTech/backend/auth/getUserProfile.php?user_id=${user_id}`
        );
        const data = await res.json();
        console.log("Fetched Data:", data);

        if (data.success) {
          setUsername(data.user.username || "Unknown User");
          setFullname(data.user.fullname || "");
          setBio(data.user.bio || "");
          setProfileImage(data.user.profile_image || pfpImage);
        }
      } catch (err) {
        console.log("Error fetching user profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [user_id]);

  useEffect(() => {
    const fetchUserStats = async () => {
      if (!user_id) return;

      try {
        const res = await fetch(
          `http://localhost/SociaTech/backend/auth/getUserStats.php?user_id=${user_id}`
        );
        const data = await res.json();

        if (data.success) {
          setPostCount(data.post_count || 0);
          setFollowerCount(data.follower_count || 0);
          setFollowingCount(data.following_count || 0);
        }
      } catch (err) {
        console.log("Error fetching user stats:", err);
      }
    };

    fetchUserStats();
  }, [user_id]);

  // Fetch user's posts
  useEffect(() => {
    const fetchUserPosts = async () => {
      if (!user_id) return;

      try {
        const res = await fetch(
          `http://localhost/SociaTech/backend/auth/fetchPost.php?user_id=${user_id}`
        );
        const data = await res.json();

        if (data.success) {
          setUserPosts(data.posts || []);
        }
      } catch (err) {
        console.log("Error fetching user posts:", err);
      }
    };

    fetchUserPosts();
  }, [user_id]);

  useEffect(() => {
    if (!image) return;

    const newURL = URL.createObjectURL(image);
    setImageURL(newURL);

    return () => {
      URL.revokeObjectURL(newURL);
    };
  }, [image]);

  // Handle Edit Profile
  const handleEditClick = () => {
    setEditFullname(fullname);
    setEditUsername(username);
    setEditBio(bio);
    setIsEditMode(true);
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditFullname("");
    setEditUsername("");
    setEditBio("");
  };

  const handleUpdateProfile = async () => {
    if (!user_id) return;

    setUpdating(true);

    try {
      const res = await fetch(
        "http://localhost/SociaTech/backend/auth/updateUserProfile.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: user_id,
            fullname: editFullname,
            username: editUsername,
            bio: editBio,
          }),
        }
      );

      const data = await res.json();

      if (data.success) {
        // Update local state
        setFullname(data.user.fullname);
        setUsername(data.user.username);
        setBio(data.user.bio);
        setIsEditMode(false);
        alert("Profile updated successfully!");
      } else {
        alert("Failed to update profile: " + (data.message || "Unknown error"));
      }
    } catch (err) {
      console.log("Error updating profile:", err);
      alert("Error updating profile");
    } finally {
      setUpdating(false);
    }
  };

  // Toggle dropdown for specific post
  const toggleMorePost = (postId) => {
    setOpenMorePost(openMorePost === postId ? null : postId);
  };

  // Handle save/unsave post
  const handleSavePost = async (postId) => {
    if (!user_id) {
      alert("You must be logged in to save posts");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("user_id", user_id);
      formData.append("post_id", postId);

      const response = await fetch(
        "http://localhost/SociaTech/backend/auth/handleSavedPost.php",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (data.success) {
        // Update savedPostIds
        const newSavedPostIds = new Set(savedPostIds);
        if (data.action === "saved") {
          newSavedPostIds.add(postId);
          alert("Post saved!");
        } else {
          newSavedPostIds.delete(postId);
          alert("Post unsaved!");
          // Refresh saved posts if we're on saved tab
          if (isOpenPage === "saved") {
            fetchSavedPosts();
          }
        }
        setSavedPostIds(newSavedPostIds);
      } else {
        alert(data.message || "Failed to save post");
      }
    } catch (error) {
      console.error("Error saving post:", error);
      alert("An error occurred while saving the post");
    } finally {
      setOpenMorePost(null);
    }
  };

  // Placeholder functions for edit, delete, and report
  const handleEditPost = (post) => {
    // Implement edit functionality as needed
    alert("Edit functionality coming soon");
    setOpenMorePost(null);
  };

  const handleDeletePost = (post) => {
    // Implement delete functionality as needed
    alert("Delete functionality coming soon");
    setOpenMorePost(null);
  };

  const openReport = (post) => {
    // Implement report functionality as needed
    alert("Report functionality coming soon");
    setOpenMorePost(null);
  };

  return (
    <>
      <div className="profilePage_parent_container" style={{ display: style }}>
        <div className="profilePage_container">
          <div className="header_profile_container">
            <div className="pfp_username_container">
              <img src={profileImage} alt="" className="profilePic" />
              <div className="user_info_container">
                <div className="userName_container">
                  {loading ? "Loading..." : username}
                </div>
                {fullname && <div className="user_fullname">{fullname}</div>}
                {bio && <div className="user_bio">{bio}</div>}
              </div>
            </div>
            <div className="profilePage_dashboard">
              <div className="dashBoard_container">
                <div>{postCount}</div>
                <div>Post</div>
              </div>
              <div className="dashBoard_container">
                <div>{followerCount}</div>
                <div>Followers</div>
              </div>
              <div className="dashBoard_container">
                <div>{followingCount}</div>
                <div>Following</div>
              </div>
            </div>
          </div>
          <div className="profilePage_nav_container">
            <button
              className={`profilePage_nav_child ${
                isOpenPage == "post" ? "nav_btn_active" : ""
              }`}
              onClick={() => setOpenPage("post")}
            >
              Post
            </button>
            <button
              className={`profilePage_nav_child ${
                isOpenPage == "saved" ? "nav_btn_active" : ""
              }`}
              onClick={() => setOpenPage("saved")}
            >
              Saved
            </button>

            <button
              className={`profilePage_nav_child ${
                isOpenPage == "EditProfile" ? "nav_btn_active" : ""
              }`}
              onClick={() => {
                setOpenPage("EditProfile");
                setIsEditMode(false);
              }}
            >
              Edit Profile
            </button>
          </div>
          <div className="profilePage_child_container">
            {/* Posts Tab */}
            {isOpenPage === "post" && (
              <div className="profilePage_post_container">
                {userPosts.length > 0 ? (
                  userPosts.map((post) => (
                    <div
                      className="post_card post_card_spacing"
                      key={post.post_id}
                      onClick={() => onPostClick && onPostClick(post)}
                      style={{ cursor: "pointer" }}
                    >
                      <div className="post_card_header">
                        <div className="header_user_container">
                          <div className="pfp_container">
                            <img
                              src={post.profile_image || pfpImage}
                              alt="user_pfp"
                            />
                          </div>
                          <div className="post_username">{post.username}</div>
                          <div className="post_date">
                            {timeAgo(post.post_date)}
                          </div>
                          <div className="post_category">
                            {post.post_category}
                          </div>
                        </div>
                        <div className="more_menu_container">
                          <div
                            className="more_btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleMorePost(post.post_id);
                            }}
                          >
                            <img src={moreBtn} alt="" className="more" />
                          </div>
                          {openMorePost === post.post_id && (
                            <div className="dropdown_menu">
                              {post.user_id == user_id && (
                                <>
                                  <div
                                    className="dropdown_item"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditPost(post);
                                    }}
                                  >
                                    <Edit size={18} />
                                    <span>Edit</span>
                                  </div>
                                  <div
                                    className="dropdown_item"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeletePost(post);
                                    }}
                                  >
                                    <Trash2 size={18} />
                                    <span>Delete</span>
                                  </div>
                                </>
                              )}
                              <div
                                className="dropdown_item"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSavePost(post.post_id);
                                }}
                              >
                                <Bookmark
                                  size={18}
                                  fill={
                                    savedPostIds.has(post.post_id)
                                      ? "currentColor"
                                      : "none"
                                  }
                                />
                                <span>
                                  {savedPostIds.has(post.post_id)
                                    ? "Unsave"
                                    : "Save"}
                                </span>
                              </div>
                              <div
                                className="dropdown_item"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openReport(post);
                                }}
                              >
                                <AlertCircle size={18} />
                                <span>Report</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="post_card_title">{post.post_title}</div>
                      {post.post_content && (
                        <div className="post_card_content">
                          {post.post_content}
                        </div>
                      )}
                      {post.post_image && (
                        <div className="post_card_img">
                          <img src={post.post_image} alt="post_image" />
                        </div>
                      )}

                      <div className="postCard_btn_containers">
                        <button
                          className="post_comment_btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            onPostClick && onPostClick(post);
                          }}
                        >
                          Comment
                        </button>
                        <button
                          className="up_vote_btn"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ArrowBigUp />
                          {post.up_tally_post || 0}
                        </button>
                        <button
                          className="down_vote_btn"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ArrowBigDown />
                          {post.down_tally_post || 0}
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div>No posts yet</div>
                )}
              </div>
            )}

            {/* Saved Posts Tab */}
            {isOpenPage === "saved" && (
              <div className="profilePage_post_container">
                <div className="savePost_header">
                  <div className="profilePage_savePost_title">Saved Posts</div>
                </div>

                {loadingSaved ? (
                  <p>Loading saved posts...</p>
                ) : savedPosts.length === 0 ? (
                  <p>No saved posts yet.</p>
                ) : (
                  savedPosts.map((post) => (
                    <div
                      className="post_card post_card_spacing"
                      key={post.post_id}
                      onClick={() => onPostClick && onPostClick(post)}
                      style={{ cursor: "pointer" }}
                    >
                      <div className="post_card_header">
                        <div className="header_user_container">
                          <div className="pfp_container">
                            <img
                              src={post.profile_image || pfpImage}
                              alt="user_pfp"
                            />
                          </div>
                          <div className="post_username">{post.username}</div>
                          <div className="post_date">
                            {timeAgo(post.post_date)}
                          </div>
                          <div className="post_category">
                            {post.post_category}
                          </div>
                        </div>
                        <div className="more_menu_container">
                          <div
                            className="more_btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleMorePost(post.post_id);
                            }}
                          >
                            <img src={moreBtn} alt="" className="more" />
                          </div>
                          {openMorePost === post.post_id && (
                            <div className="dropdown_menu">
                              {post.user_id == user_id && (
                                <>
                                  <div
                                    className="dropdown_item"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditPost(post);
                                    }}
                                  >
                                    <Edit size={18} />
                                    <span>Edit</span>
                                  </div>
                                  <div
                                    className="dropdown_item"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeletePost(post);
                                    }}
                                  >
                                    <Trash2 size={18} />
                                    <span>Delete</span>
                                  </div>
                                </>
                              )}
                              <div
                                className="dropdown_item"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSavePost(post.post_id);
                                }}
                              >
                                <Bookmark
                                  size={18}
                                  fill={
                                    savedPostIds.has(post.post_id)
                                      ? "currentColor"
                                      : "none"
                                  }
                                />
                                <span>
                                  {savedPostIds.has(post.post_id)
                                    ? "Unsave"
                                    : "Save"}
                                </span>
                              </div>
                              <div
                                className="dropdown_item"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openReport(post);
                                }}
                              >
                                <AlertCircle size={18} />
                                <span>Report</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="post_card_title">{post.post_title}</div>
                      {post.post_content && (
                        <div className="post_card_content">
                          {post.post_content}
                        </div>
                      )}
                      {post.post_image && (
                        <div className="post_card_img">
                          <img src={post.post_image} alt="post_image" />
                        </div>
                      )}

                      <div className="postCard_btn_containers">
                        <button
                          className="post_comment_btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            onPostClick && onPostClick(post);
                          }}
                        >
                          Comment
                        </button>
                        <button
                          className="up_vote_btn"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ArrowBigUp />
                          {post.up_tally_post || 0}
                        </button>
                        <button
                          className="down_vote_btn"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ArrowBigDown />
                          {post.down_tally_post || 0}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Achievements Tab */}
            {isOpenPage === "achievements" && (
              <div className="profilePage_achievements_Container">
                <div>Achievements</div>
              </div>
            )}

            {/* Edit Profile Tab */}
            {isOpenPage === "EditProfile" && (
              <div className="profilePage_editProfile_Container">
                <div className="profilePage_childContainer_title edit_profile_title_row">
                  <span>Edit Profile</span>
                  {!isEditMode && (
                    <button className="edit_mode_btn" onClick={handleEditClick}>
                      <Edit size={16} />
                      Edit
                    </button>
                  )}
                </div>

                {/* Profile Photo Section */}
                <div className="change_pfp_container">
                  <img
                    src={imageURL || profileImage}
                    alt="User Profile Pic"
                    className="changePfp_img"
                  />

                  <label className="change_pfp_btn" htmlFor="changePfp_field">
                    {imageURL ? "Choose Different" : "Change Photo"}
                  </label>
                  <input
                    id="changePfp_field"
                    type="file"
                    accept="image/*"
                    className="hidden_file_input"
                    onChange={handleImageUpload}
                  />
                  {imageURL && (
                    <button
                      className="save_photo_btn"
                      onClick={handleSaveProfilePhoto}
                      disabled={uploading}
                    >
                      <span>{uploading ? "Saving..." : "Save Photo"}</span>
                    </button>
                  )}
                </div>

                {/* Preview Mode */}
                {!isEditMode && (
                  <div className="profile_preview_wrapper">
                    <div className="profile_preview_container">
                      <h3 className="profile_preview_title">Profile Preview</h3>

                      <div className="profile_preview_fields">
                        <div>
                          <label className="profile_field_label">
                            Full Name
                          </label>
                          <div className="profile_field_value">
                            {fullname || "Not set"}
                          </div>
                        </div>

                        <div>
                          <label className="profile_field_label">
                            Username
                          </label>
                          <div className="profile_field_value">@{username}</div>
                        </div>

                        <div>
                          <label className="profile_field_label">Bio</label>
                          <div className="profile_field_value">
                            {bio || "No bio added yet"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Edit Mode */}
                {isEditMode && (
                  <div className="edit_form_wrapper">
                    <div className="changeProfile_field_container">
                      <label htmlFor="fullname" className="edit_form_label">
                        Full Name
                      </label>
                      <input
                        id="fullname"
                        type="text"
                        value={editFullname}
                        onChange={(e) => setEditFullname(e.target.value)}
                        placeholder="Enter your full name"
                        className="edit_form_input"
                      />
                    </div>

                    <div className="changeProfile_field_container">
                      <label htmlFor="username" className="edit_form_label">
                        Username
                      </label>
                      <input
                        id="username"
                        type="text"
                        value={editUsername}
                        onChange={(e) => setEditUsername(e.target.value)}
                        placeholder="Enter your username"
                        className="edit_form_input"
                      />
                    </div>

                    <div className="changeProfile_field_container">
                      <label htmlFor="bio" className="edit_form_label">
                        Bio
                      </label>
                      <textarea
                        id="bio"
                        value={editBio}
                        onChange={(e) => setEditBio(e.target.value)}
                        placeholder="Tell us about yourself..."
                        rows="4"
                        className="edit_form_textarea"
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="edit_action_buttons">
                      <button
                        onClick={handleUpdateProfile}
                        disabled={updating}
                        className="update_profile_btn"
                      >
                        {updating ? "Updating..." : "Update Profile"}
                      </button>

                      <button
                        onClick={handleCancelEdit}
                        disabled={updating}
                        className="cancel_edit_btn"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <button className="profilePage_close_btn" onClick={closeProfilePage}>
          <X className="crossSvg" />
        </button>
      </div>
    </>
  );
}
