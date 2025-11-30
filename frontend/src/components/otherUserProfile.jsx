import { useEffect, useState } from "react";
import { useCycle } from "framer-motion";
import CommentModal from "./commentModal";
import EditPostModal from "./EditPostModal";
import DeletePostModal from "./DeletePostModal";
import Report from "./Report";
import BlockConfirmModal from "./BlockConfirmModal";
import { getUser } from "../utils/storage";
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
} from "lucide-react";
import TrippleDots from "../assets/moreBtn.png";
import pfpImage from "../assets/deault_pfp.png";
import moreBtn from "../assets/moreBtn.png";
import { useRef } from "react";

import '../pages/Home.css';

export default function OtherUserProfile({ openModal, uid, closeModal }) {

  const [otherUserProfile, setOtherUserProfile] = useState([]);
  const [otherUserPosts, setOtherUserPosts] = useState([]);
  const [openOtherUserMoreContainer, cycleOpenOtherUserMoreContainer] = useCycle(false, true);
  const [openMorePost, setOpenMorePost] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isLoadingOtherUserData, setIsLoadingOtherUserData] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [reportType, setReportType] = useState(null);
  const [reportedBy, setReportedBy] = useState(null);
  const [reportedUID, setReportedUID] = useState(null);
  const [contentId, setContentId] = useState(null);
  const [savedPostIds, setSavedPostIds] = useState(new Set());
  const [isBlockConfirmOpen, setIsBlockConfirmOpen] = useState(false);

  const user = getUser();
  const user_id = user?.id || null;

  const toggleMorePost = (post_id) => {
    setOpenMorePost((prev) => (prev === post_id ? null : post_id));
  };

  useEffect(() => {
    const handleUserClick = async (userId) => {
      if (!userId) {
        console.error("No user ID provided");
        return;
      }

      setIsLoadingOtherUserData(true);
      setOtherUserProfile(null);
      setOtherUserPosts([]);

      try {
        await Promise.all([
          fetchOtherUserProfile(userId),
          fetchOtherUserPosts(userId),
          fetchFollowStats(userId),
        ]);
      } catch (error) {
        console.error("Error loading user data:", error);
      } finally {
        setIsLoadingOtherUserData(false);
      }
    };

    if (uid && openModal) {
      handleUserClick(uid);
    }
  }, [uid, openModal]);

  const openComments = async (post) => {
    setSelectedPost(post);
    setIsCommentModalOpen(true);
  };

  const closeComments = () => {
    setSelectedPost(null);
    setIsCommentModalOpen(false);
  };

  const handlePostDeleted = (deletedPostId) => {
    setOtherUserPosts((prev) => prev.filter((post) => post.post_id !== deletedPostId));
    setIsCommentModalOpen(false);
  };

  const closeReport = () => {
    setIsReportOpen(false);
  };

  const setReportData = (type, reportedBy, reportedUID, contentId) => {
    setReportType(type);
    setReportedBy(reportedBy);
    setReportedUID(reportedUID);
    setContentId(contentId);
    setIsReportOpen(true);
  };

  const handleSavePost = async (postId) => {
    if (!user_id) {
      alert('You must be logged in to save posts');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('user_id', user_id);
      formData.append('post_id', postId);

      const res = await fetch(
        'http://localhost/SociaTech/backend/auth/handleSavedPost.php',
        {
          method: 'POST',
          body: formData
        }
      );

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();

      if (data.success) {
        setSavedPostIds(prev => {
          const newSet = new Set(prev);
          if (data.action === 'saved') {
            newSet.add(postId);
            alert('Post saved successfully!');
          } else {
            newSet.delete(postId);
            alert('Post unsaved successfully!');
          }
          return newSet;
        });
      } else {
        alert(data.message || 'Failed to save/unsave post');
      }
    } catch (err) {
      console.error('Error saving post:', err);
      alert('An error occurred while saving the post');
    }
  };

  const fetchOtherUserPosts = async (userId) => {
    if (!userId) {
      console.error("Missing user_id parameter");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost/SociaTech/backend/auth/fetchPost.php?user_id=${userId}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setOtherUserPosts(data.posts || []);
      } else {
        console.error("Failed to fetch user posts:", data.message);
      }
    } catch (error) {
      console.error("Error fetching user posts:", error);
    }
  };

  const fetchOtherUserProfile = async (userId) => {
    if (!userId) {
      console.error("Missing user_id parameter");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost/SociaTech/backend/auth/handleFetchOtherUserProfile.php?user_id=${userId}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setOtherUserProfile(data.otherUserInfo);
      } else {
        console.error("Failed to fetch user profile:", data.message);
        alert(data.message || "Failed to load user profile");
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      alert("Failed to load user profile. Please try again.");
    }
  };

  const fetchFollowStats = async (targetUserId) => {
    if (!targetUserId || !user_id) {
      console.error("Missing required user IDs");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost/SociaTech/backend/auth/getUserStats.php?user_id=${targetUserId}&current_user_id=${user_id}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setFollowerCount(data.follower_count);
        setFollowingCount(data.following_count);
        setIsFollowing(data.is_following);
        return data;
      }
    } catch (error) {
      console.error("Error fetching follow stats:", error);
    }
  };

  const handleFollow = async () => {
    if (!user_id) {
      alert("You must be logged in to follow users");
      return;
    }

    const followedId = otherUserProfile?.user_id;

    if (!followedId) {
      alert("Unable to follow this user");
      return;
    }

    if (followedId == user_id) {
      alert("You cannot follow yourself");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("user_id", user_id);
      formData.append("followed_id", followedId);

      const response = await fetch(
        "http://localhost/SociaTech/backend/auth/handleFollowUser.php",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setIsFollowing(true);
        setFollowerCount(data.follower_count);
        await fetchFollowStats(followedId);
        alert("Followed successfully!");
      } else {
        alert(data.message || "Failed to follow user");
      }
    } catch (error) {
      console.error("Error following user:", error);
      alert("An error occurred while following");
    }
  };

  const handleUnfollow = async () => {
    if (!user_id) {
      alert("You must be logged in to unfollow users");
      return;
    }

    const followedId = otherUserProfile?.user_id;

    if (!followedId) {
      alert("Unable to unfollow this user");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("user_id", user_id);
      formData.append("followed_id", followedId);

      const response = await fetch(
        "http://localhost/SociaTech/backend/auth/handleUnfollowUser.php",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setIsFollowing(false);
        setFollowerCount(data.follower_count);
        await fetchFollowStats(followedId);
        alert("Unfollowed successfully!");
      } else {
        alert(data.message || "Failed to unfollow user");
      }
    } catch (error) {
      console.error("Error unfollowing user:", error);
      alert("An error occurred while unfollowing");
    }
  };

  useEffect(() => {
    let intervalId;

    if (openModal && otherUserProfile?.user_id) {
      const targetUserId = otherUserProfile?.user_id;

      intervalId = setInterval(() => {
        fetchFollowStats(targetUserId);
      }, 10000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [openModal, otherUserProfile?.user_id]);

  useEffect(() => {
    const handleFocus = () => {
      if (openModal && otherUserProfile?.user_id) {
        const targetUserId = otherUserProfile?.user_id;
        fetchFollowStats(targetUserId);
      }
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [openModal, otherUserProfile?.user_id]);

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

  const handleBlockUser = () => {
    setIsBlockConfirmOpen(true);
    cycleOpenOtherUserMoreContainer();
  };

  const confirmBlock = async () => {
    if (!user_id || !otherUserProfile?.user_id) { // For OtherUserProfile
      // if (!user_id || !userToBlock) return; // For Home.jsx
      alert("Unable to block user");
      return;
    }

    try {
      // Use URLSearchParams instead of FormData
      const params = new URLSearchParams();
      params.append("user_id", user_id);
      params.append("blocked_user_id", otherUserProfile.user_id); // For OtherUserProfile
      // params.append("blocked_user_id", userToBlock.userId); // For Home.jsx

      const response = await fetch(
        "http://localhost/SociaTech/backend/auth/handleBlockUser.php",
        {
          method: "POST",
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: params.toString()
        }
      );

      const data = await response.json();
      console.log("Block response:", data); // For debugging

      if (data.success) {
        alert("User blocked successfully!");
        setIsBlockConfirmOpen(false);
        closeModal(); // For OtherUserProfile
        // For Home.jsx: add the other cleanup code
      } else {
        alert(data.message || "Failed to block user");
      }
    } catch (error) {
      console.error("Error blocking user:", error);
      alert("An error occurred: " + error.message);
    }
  };
  return (
    <>
      <BlockConfirmModal
        isOpen={isBlockConfirmOpen}
        onConfirm={confirmBlock}
        onCancel={() => setIsBlockConfirmOpen(false)}
        username={otherUserProfile?.username}
      />
      <div
        className="otherUserProfile_parent_container"
        style={openModal ? { display: "flex" } : { display: "none" }}
      >
        <button className="otherUserProfile_close_btn" onClick={closeModal}>
          <X className="crossSvg" />
        </button>

        {!uid ? (
          <div style={{ padding: "20px", textAlign: "center" }}>
            No user selected
          </div>
        ) : isLoadingOtherUserData ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "300px",
            }}
          >
            <div>Loading user data...</div>
          </div>
        ) : (
          <>
            <div className="otherUserProfile_header_container">
              <div className="otherUserProfile_detail_container">
                <img
                  src={otherUserProfile?.profile_image || pfpImage}
                  alt=""
                  className="otherUserPfp"
                />
                <div className="userNameBio_container">
                  <div className="otherUserProfile_username">
                    @{otherUserProfile?.username || "Username"}
                  </div>
                  {otherUserProfile?.fullname && (
                    <div className="otherUserProfile_fullname">
                      {otherUserProfile?.fullname}
                    </div>
                  )}
                  <div className="otherUserProfile_bio">
                    {otherUserProfile?.bio || "No bio available"}
                  </div>
                </div>
              </div>
              <div className="otherUserProfile_stats_container">
                <div className="otherUserProfile_stats_childContainer">
                  <div>{otherUserPosts.length}</div>
                  <div>Posts</div>
                </div>
                <div className="otherUserProfile_stats_childContainer">
                  <div>{followingCount}</div>
                  <div>Following</div>
                </div>
                <div className="otherUserProfile_stats_childContainer">
                  <div>{followerCount}</div>
                  <div>Followers</div>
                </div>
              </div>
              <button
                className="otherUserProfile_more_btn"
                onClick={() => cycleOpenOtherUserMoreContainer()}
              >
                <img src={TrippleDots} alt="" />
              </button>
              <div
                className="otherUserProfile_more_container"
                style={
                  openOtherUserMoreContainer
                    ? { display: "flex" }
                    : { display: "none" }
                }
              >
                <div
                  className="otherUserProfile_more_option"
                  onClick={handleBlockUser}
                >
                  <Ban />
                  Block
                </div>
                <div
                  className="otherUserProfile_more_option"
                  onClick={() =>
                    setReportData("N/A", user_id, otherUserProfile.user_id, "N/A")
                  }
                >
                  <AlertCircle />
                  Report
                </div>
              </div>
            </div>

            <div className="followBtn_container">
              <button
                className="followBtn"
                onClick={isFollowing ? handleUnfollow : handleFollow}
              >
                {isFollowing ? "Unfollow" : "Follow"}
              </button>
            </div>

            <div className="otherUserProfile_parent_postContainer">
              <div className="otherUserProfile_container_title">Posts</div>
              <div className="otherUserProfile_posts_list">
                {otherUserPosts.length === 0 ? (
                  <p
                    style={{
                      textAlign: "center",
                      padding: "20px",
                      color: "#888",
                    }}
                  >
                    No posts yet
                  </p>
                ) : (
                  otherUserPosts.map((post) => (
                    <div
                      className="post_card"
                      key={post.post_id}
                      style={{ marginBottom: "1rem" }}
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
                                      handleEditButtonClick(post);
                                    }}
                                  >
                                    <Edit size={18} />
                                    <span>Edit</span>
                                  </div>
                                  <div
                                    className="dropdown_item"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteClick(post);
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
                              {post.user_id !== user_id && (
                                <div
                                  className="dropdown_item"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setReportData(
                                      "post",
                                      user_id,
                                      post.user_id,
                                      post.post_id
                                    );
                                  }}
                                >
                                  <AlertCircle size={18} />
                                  <span>Report</span>
                                </div>
                              )}
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
                          onClick={() => openComments(post)}
                        >
                          Comment
                        </button>
                        <button className="up_vote_btn">
                          <ArrowBigUp />
                          {post.up_tally_post || 0}
                        </button>
                        <button className="down_vote_btn">
                          <ArrowBigDown />
                          {post.down_tally_post || 0}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>

      <CommentModal
        openModal={isCommentModalOpen}
        closeModal={closeComments}
        user_id={user_id}
        postData={selectedPost}
        fetchPosts={() => fetchOtherUserPosts(uid)}
        onDelete={handlePostDeleted}
      />

      <Report
        openModal={isReportOpen}
        onClose={closeReport}
        type={reportType}
        reportedBy={reportedBy}
        reportedUID={reportedUID}
        contentId={contentId}
      />
    </>
  );
}