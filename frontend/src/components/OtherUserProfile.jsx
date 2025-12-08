import { useEffect, useState } from "react";
import { useCycle } from "framer-motion";
import CommentModal from "./CommentModal";
import EditPostModal from "./EditPostModal";
import DeletePostModal from "./DeletePostModal";
import ViewFollowerModal from "./ViewFollowerModal";
import ViewFollowingModal from "./ViewFollowingModal";
import Report from "./Report";
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
  UserX,
} from "lucide-react";
import TrippleDots from "/moreBtn.png";
import pfpImage from "/deault_pfp.png";
import moreBtn from "/moreBtn.png";

import { toast } from "react-toastify";

import {
  notifyPostComment,
  notifyPostUpvote,
  notifyCommentUpvote,
} from "../services/notificationHelper.js";
import "../pages/Home.css";
import BlockConfirmModal from "./BlockConfirmModal";

export default function OtherUserProfile({ openModal, uid, closeModal }) {
  const [otherUserProfile, setOtherUserProfile] = useState([]);
  const [otherUserPosts, setOtherUserPosts] = useState([]);
  const [openOtherUserMoreContainer, cycleOpenOtherUserMoreContainer] =
    useCycle(false, true);
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
  const [upTally, setUpTally] = useState({});
  const [downTally, setDownTally] = useState({});
  const [voteState, setVoteState] = useState({});

  // STATES FOR BLOCKING
  const [isBlockConfirmOpen, setIsBlockConfirmOpen] = useState(false);
  const [blockedUserIds, setBlockedUserIds] = useState([]);
  const [userToBlock, setUserToBlock] = useState(null);

  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);

  const user = getUser();
  const user_id = user?.id || null;

  useEffect(() => {
    const fetchBlockedUsers = async () => {
      if (!user_id) return;

      const numericUserId = parseInt(user_id);
      if (isNaN(numericUserId)) {
        console.error("Invalid user_id format:", user_id);
        return;
      }

      try {
        const response = await fetch(
          `http://localhost/SociaTech/backend/auth/fetchBlockedUsers.php?user_id=${numericUserId}`
        );

        if (!response.ok) {
          console.error("HTTP error fetching blocked users:", response.status);
          setBlockedUserIds([]);
          return;
        }

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          const text = await response.text();
          console.error("Server returned non-JSON response:", text);
          setBlockedUserIds([]);
          return;
        }

        const data = await response.json();

        if (data.success && Array.isArray(data.blocked_users)) {
          const blockedIds = data.blocked_users.map((u) => parseInt(u.user_id));
          setBlockedUserIds(blockedIds);
        } else {
          console.error("Failed to fetch blocked users:", data.message);
          setBlockedUserIds([]);
        }
      } catch (error) {
        console.error("Error fetching blocked users:", error);
        setBlockedUserIds([]);
      }
    };
    fetchBlockedUsers();
  }, [user_id]);

  const fetchUserVotes = async (userId) => {
    if (!userId) return {};

    try {
      const res = await fetch(
        `http://localhost/SociaTech/backend/auth/getUserVotes.php?user_id=${userId}`
      );
      const data = await res.json();

      if (data.success) {
        const voteObj = {};
        data.votes.forEach((vote) => {
          voteObj[vote.post_id] = vote.vote_type === 1 ? "up" : "down";
        });
        return voteObj;
      }
      return {};
    } catch (err) {
      console.error("Error fetching user votes:", err);
      return {};
    }
  };

  const handleToggleVote = async (userId, postId, type) => {
    if (!userId) {
      toast.error("You must be logged in to vote.");
      return;
    }

    const currentVote = voteState[postId];
    const newVoteType = currentVote === type ? null : type;

    // Store original values for rollback
    const originalUpTally = upTally[postId];
    const originalDownTally = downTally[postId];
    const originalVoteState = currentVote;

    // Calculate what the new tallies should be
    let newUpTally = originalUpTally;
    let newDownTally = originalDownTally;

    // Remove old vote effect
    if (currentVote === "up") {
      newUpTally = newUpTally - 1;
    } else if (currentVote === "down") {
      newDownTally = newDownTally - 1;
    }

    // Add new vote effect
    if (newVoteType === "up") {
      newUpTally = newUpTally + 1;
    } else if (newVoteType === "down") {
      newDownTally = newDownTally + 1;
    }

    // Optimistic UI update
    setVoteState((prev) => ({ ...prev, [postId]: newVoteType }));
    setUpTally((prev) => ({ ...prev, [postId]: newUpTally }));
    setDownTally((prev) => ({ ...prev, [postId]: newDownTally }));

    // Prepare vote type for backend (1=up, 0=down, null=remove)
    let voteTypeToBackend =
      newVoteType === "up" ? 1 : newVoteType === "down" ? 0 : null;

    try {
      const res = await fetch(
        "http://localhost/SociaTech/backend/auth/handleVote.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            post_id: postId,
            user_id: userId,
            vote_type: voteTypeToBackend,
          }),
        }
      );

      const data = await res.json();

      if (data.success) {
        // Fetch updated tallies from the backend to ensure accuracy
        const postRes = await fetch(
          `http://localhost/SociaTech/backend/auth/fetchSinglePost.php?post_id=${postId}`
        );
        const postData = await postRes.json();

        if (postData.success && postData.post) {
          setUpTally((prev) => ({
            ...prev,
            [postId]: postData.post.up_tally_post,
          }));
          setDownTally((prev) => ({
            ...prev,
            [postId]: postData.post.down_tally_post,
          }));

          // Update the post in the posts array too
          setOtherUserPosts((prev) =>
            prev.map((p) =>
              p.post_id === postId
                ? {
                    ...p,
                    up_tally_post: postData.post.up_tally_post,
                    down_tally_post: postData.post.down_tally_post,
                  }
                : p
            )
          );
        }

        // Create notification for upvote
        if (newVoteType === "up") {
          const post = otherUserPosts.find((p) => p.post_id === postId);
          if (post && post.user_id !== userId) {
            await notifyPostUpvote(post.user_id, userId, user.username, postId);
          }
        }
      } else {
        // Revert UI changes if backend fails
        setVoteState((prev) => ({ ...prev, [postId]: originalVoteState }));
        setUpTally((prev) => ({ ...prev, [postId]: originalUpTally }));
        setDownTally((prev) => ({ ...prev, [postId]: originalDownTally }));
        toast.error("Failed to vote. Please try again.");
      }
    } catch (err) {
      console.error("Error sending vote:", err);
      // Revert UI changes on error
      setVoteState((prev) => ({ ...prev, [postId]: originalVoteState }));
      setUpTally((prev) => ({ ...prev, [postId]: originalUpTally }));
      setDownTally((prev) => ({ ...prev, [postId]: originalDownTally }));
      toast.error("Error voting. Please check your connection.");
    }
  };

  const toggleMorePost = (post_id) => {
    setOpenMorePost((prev) => (prev === post_id ? null : post_id));
  };

  useEffect(() => {
    const handleUserClick = async (userId) => {
      setIsLoadingOtherUserData(true);
      setOtherUserProfile(null);
      setOtherUserPosts([]);

      await Promise.all([
        fetchOtherUserProfile(userId),
        fetchOtherUserPosts(userId),
        fetchFollowStats(userId),
      ]);

      setIsLoadingOtherUserData(false);
    };

    handleUserClick(uid);
  }, [uid, openModal, isCommentModalOpen]);

  const openComments = async (post) => {
    setSelectedPost(post);
    setIsCommentModalOpen(true);
  };

  const closeComments = () => {
    setSelectedPost(null);
    setIsCommentModalOpen(false);
  };

  const handlePostDeleted = (deletedPostId) => {
    setOtherUserPosts((prev) =>
      prev.filter((post) => post.post_id !== deletedPostId)
    );
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
      toast.error("You must be logged in to save posts");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("user_id", user_id);
      formData.append("post_id", postId);

      const res = await fetch(
        "http://localhost/SociaTech/backend/auth/handleSavedPost.php",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();

      if (data.success) {
        setSavedPostIds((prev) => {
          const newSet = new Set(prev);
          if (data.action === "saved") {
            newSet.add(postId);
            toast.success("Post saved successfully!");
          } else {
            newSet.delete(postId);
            toast.success("Post unsaved successfully!");
          }
          return newSet;
        });
      } else {
        toast.error(data.message || "Failed to save/unsave post");
      }
    } catch (err) {
      console.error("Error saving post:", err);
      toast.error("An error occurred while saving the post");
    }
  };

  const fetchOtherUserPosts = async (userId) => {
    try {
      const response = await fetch(
        `http://localhost/SociaTech/backend/auth/fetchPost.php?user_id=${userId}`
      );
      const data = await response.json();

      if (data.success) {
        setOtherUserPosts(data.posts || []);
        const upObj = {};
        const downObj = {};
        data.posts.forEach((post) => {
          upObj[post.post_id] = post.up_tally_post || 0;
          downObj[post.post_id] = post.down_tally_post || 0;
        });
        setUpTally(upObj);
        setDownTally(downObj);

        // Fetch user's vote state and wait for it to complete
        if (user_id) {
          const userVotes = await fetchUserVotes(user_id);
          setVoteState(userVotes);
        }
      }
    } catch (error) {
      console.error("Error fetching user posts:", error);
    }
  };

  const fetchOtherUserProfile = async (userId) => {
    try {
      const response = await fetch(
        `http://localhost/SociaTech/backend/auth/handleFetchOtherUserProfile.php?user_id=${userId}`
      );
      const data = await response.json();

      if (data.success) {
        setOtherUserProfile(data.otherUserInfo);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  const fetchFollowStats = async (targetUserId) => {
    try {
      const response = await fetch(
        `http://localhost/SociaTech/backend/auth/getUserStats.php?user_id=${targetUserId}&current_user_id=${user_id}`
      );
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
      toast.error("You must be logged in to follow users");
      return;
    }

    const followedId = otherUserProfile?.user_id;

    if (!followedId) {
      toast.error("Unable to follow this user");
      return;
    }

    if (followedId == user_id) {
      toast.error("You cannot follow yourself");
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

      const data = await response.json();

      if (data.success) {
        setIsFollowing(true);
        setFollowerCount(data.follower_count);
        await fetchFollowStats(followedId);
        toast.success("Followed successfully!");
      } else {
        toast.error(data.message || "Failed to follow user");
      }
    } catch (error) {
      console.error("Error following user:", error);
      toast.error("An error occurred while following");
    }
  };

  const handleUnfollow = async () => {
    if (!user_id) {
      toast.error("You must be logged in to unfollow users");
      return;
    }

    const followedId = otherUserProfile?.user_id;

    if (!followedId) {
      toast.error("Unable to unfollow this user");
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

      const data = await response.json();

      if (data.success) {
        setIsFollowing(false);
        setFollowerCount(data.follower_count);
        await fetchFollowStats(followedId);
        toast.success("Unfollowed successfully!");
      } else {
        toast.error(data.message || "Failed to unfollow user");
      }
    } catch (error) {
      console.error("Error unfollowing user:", error);
      toast.error("An error occurred while unfollowing");
    }
  };

  useEffect(() => {
    let intervalId;

    if (openModal && otherUserProfile?.user_id) {
      const targetUserId = otherUserProfile?.user_id;

      // Refresh counts every 10 seconds
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

  const handleBlockUser = (userId, username) => {
    setUserToBlock({ userId, username });
    setIsBlockConfirmOpen(true);
    setOpenMorePost(null);
  };

  const confirmBlock = async () => {
    if (!user_id || !otherUserProfile?.user_id) {
      toast.error("Unable to block user");
      return;
    }

    try {
      const params = new URLSearchParams();
      params.append("user_id", user_id);
      params.append("blocked_user_id", otherUserProfile.user_id);

      const response = await fetch(
        "http://localhost/SociaTech/backend/auth/handleBlockUser.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: params.toString(),
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success("User blocked successfully!");
        setIsBlockConfirmOpen(false);
        closeModal();
      } else {
        toast.error(data.message || "Failed to block user");
      }
    } catch (error) {
      console.error("Error blocking user:", error);
      toast.error("An error occurred: " + error.message);
    }
  };

  // Fetch OTHER user's followers
  const fetchOtherUserFollowers = async (targetUserId) => {
    if (!targetUserId) return;
    try {
      const res = await fetch(
        `http://localhost/SociaTech/backend/auth/getFollowers.php?user_id=${targetUserId}`
      );
      const data = await res.json();
      if (data.success) {
        setFollowers(data.followers || []);
      }
    } catch (err) {
      console.error("Error fetching followers:", err);
    }
  };

  // Fetch OTHER user's following
  const fetchOtherUserFollowing = async (targetUserId) => {
    if (!targetUserId) return;
    try {
      const res = await fetch(
        `http://localhost/SociaTech/backend/auth/getFollowing.php?user_id=${targetUserId}`
      );
      const data = await res.json();
      if (data.success) {
        setFollowing(data.following || []);
      }
    } catch (err) {
      console.error("Error fetching following:", err);
    }
  };

  // Modal openers
  const openFollowersModal = () => {
    setShowFollowersModal(true);
    fetchOtherUserFollowers(otherUserProfile?.user_id);
  };

  const openFollowingModal = () => {
    setShowFollowingModal(true);
    fetchOtherUserFollowing(otherUserProfile?.user_id);
  };

  return (
    <>
      <div
        className="otherUserProfile_parent_container"
        style={openModal ? { display: "flex" } : { display: "none" }}
      >
        <button className="otherUserProfile_close_btn" onClick={closeModal}>
          <X className="crossSvg" />
        </button>

        {isLoadingOtherUserData ? (
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
                <div
                  className="otherUserProfile_stats_childContainer"
                  onClick={openFollowingModal}
                  style={{ cursor: "pointer" }}
                >
                  <div>{followingCount}</div>
                  <div>Following</div>
                </div>
                <div
                  className="otherUserProfile_stats_childContainer"
                  onClick={openFollowersModal}
                  style={{ cursor: "pointer" }}
                >
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
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBlockUser(
                      otherUserProfile.user_id,
                      otherUserProfile.username
                    );
                  }}
                >
                  <Ban />
                  Block
                </div>
                <div
                  className="otherUserProfile_more_option"
                  onClick={() =>
                    setReportData(
                      "N/A",
                      user_id,
                      otherUserProfile.user_id,
                      "N/A"
                    )
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
                              {post.user_id !== user_id && (
                                <div
                                  className="dropdown_item"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleBlockUser(
                                      post.user_id,
                                      post.username
                                    );
                                  }}
                                >
                                  <UserX size={18} />
                                  <span>Block User</span>
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
                        <button
                          className={
                            voteState[post.post_id] === "up"
                              ? "up_vote_btn active"
                              : "up_vote_btn"
                          }
                          onClick={() =>
                            handleToggleVote(user_id, post.post_id, "up")
                          }
                        >
                          <ArrowBigUp
                            fill={
                              voteState[post.post_id] === "up"
                                ? "currentColor"
                                : "none"
                            }
                          />
                          {upTally[post.post_id] ?? post.up_tally_post}
                        </button>

                        <button
                          className={
                            voteState[post.post_id] === "down"
                              ? "down_vote_btn active"
                              : "down_vote_btn"
                          }
                          onClick={() =>
                            handleToggleVote(user_id, post.post_id, "down")
                          }
                        >
                          <ArrowBigDown
                            fill={
                              voteState[post.post_id] === "down"
                                ? "currentColor"
                                : "none"
                            }
                          />
                          {downTally[post.post_id] ?? post.down_tally_post}
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
        fetchPosts={() => fetchOtherUserPosts()}
        onDelete={handlePostDeleted}
        blockedUserIds={blockedUserIds}
      />

      <Report
        isOpen={isReportOpen}
        onClose={closeReport}
        type={reportType}
        reportedBy={reportedBy}
        reportedUID={reportedUID}
        contentId={contentId}
      />

      <BlockConfirmModal
        isOpen={isBlockConfirmOpen}
        onConfirm={confirmBlock}
        onCancel={() => {
          setIsBlockConfirmOpen(false);
          setUserToBlock(null);
        }}
        username={userToBlock?.username}
      />

      {/* Follower Modal - View Only (no remove button) */}
      <ViewFollowerModal
        isOpen={showFollowersModal}
        onClose={() => setShowFollowersModal(false)}
        followers={followers}
        currentUserId={user_id}
      />

      {/* Following Modal - View Only (no unfollow button) */}
      <ViewFollowingModal
        isOpen={showFollowingModal}
        onClose={() => setShowFollowingModal(false)}
        following={following}
        currentUserId={user_id}
      />
    </>
  );
}
