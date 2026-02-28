import { toast } from "react-toastify";

import Nav from "../components/Nav.jsx";
import Report from "../components/Report.jsx";
import CategorySlider from "../components/CategorySlider.jsx";
import PageHeader from "../components/PageHeader.jsx";
import ProfilePage from "../components/ProfilePage.jsx";
import DeletePostModal from "../components/DeletePostModal.jsx";
import EditPostModal from "../components/EditPostModal.jsx";

import CommentModal from "../components/CommentModal.jsx";
import {
  ArrowBigUp,
  ArrowBigDown,
  Bookmark,
  AlertCircle,
  Edit,
  Trash2,
  UserX,
  Globe,
  Users,
} from "lucide-react";
import "./Home.css";
import { motion } from "framer-motion";
import { useEffect, useState, useRef, useMemo } from "react";
import moreBtn from "/moreBtn.png";
import { getUser } from "../utils/storage.js";
import pfpImage from "/deault_pfp.png";

import Settings from "../components/Settings.jsx";
import HelpPage from "../components/HelpPage.jsx";

import NotificationPanel from "../components/NotificationPanel.jsx";

import {
  notifyPostUpvote,
  notifyPostDownvote,
} from "../services/notificationHelper.js";
import OtherUserProfile from "../components/OtherUserProfile.jsx";
import BlockConfirmModal from "../components/BlockConfirmModal.jsx";
import { API_URL } from "../services/auth.js";

function VisibilityBadge({ visibility }) {
  const isPublic = visibility === "public" || !visibility;
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        padding: "3px 8px",
        borderRadius: "12px",
        fontSize: "11px",
        fontWeight: "500",
        backgroundColor: isPublic ? "#e3f2fd" : "#fff3e0",
        color: "black",
        border: `1px solid ${isPublic ? "#90caf9" : "#ffb74d"}`,
      }}
    >
      {isPublic ? <Globe size={12} /> : <Users size={12} />}
      <span>{isPublic ? "Public" : "Followers"}</span>
    </div>
  );
}

function timeAgo(dateString) {
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
}

export default function Homepage() {
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const [notifEnabled, setNotifEnabled] = useState(false);
  const [posts, setPosts] = useState([]);
  const [openMorePost, setOpenMorePost] = useState(null);
  const [upTally, setUpTally] = useState({});
  const [downTally, setDownTally] = useState({});
  const [voteState, setVoteState] = useState({});

  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isProfilePageOpen, setIsProfilePageOpen] = useState(false);
  const [isSettingOpen, setIsSettingOpen] = useState(false);
  const [isDropDownOpen, setIsDropDownOpen] = useState(false);
  const [isOtherUserProfileOpen, setIsOtherUserProfileOpen] = useState(false);

  const [openHelpPage, setOpenHelpPage] = useState(false);
  const [highlightedPostId, setHighlightedPostId] = useState(null);
  const postRefs = useRef({});

  const [searchResults, setSearchResults] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");

  // STATES FOR REPORT
  const [reportType, setReportType] = useState(null);
  const [reportedBy, setReportedBy] = useState(null);
  const [reportedUID, setReportedUID] = useState(null);
  const [contentId, setContentId] = useState(null);
  const [savedPostIds, setSavedPostIds] = useState(new Set());

  //for EditPOST MODAL:
  const [editModalOpen, setEditModalOpen] = useState(false);
  //for delete post modal
  const deleteModalRef = useRef();

  // STATES FOR BLOCKING
  const [blockedUserIds, setBlockedUserIds] = useState([]);
  const [isBlockConfirmOpen, setIsBlockConfirmOpen] = useState(false);
  const [userToBlock, setUserToBlock] = useState(null);

  const user = getUser();
  const user_id = user?.id || null;

  const fetchBlockedUsers = async () => {
    if (!user_id) {
      return;
    }

    const numericUserId = parseInt(user_id);
    if (isNaN(numericUserId)) {
      console.error("Invalid user_id format:", user_id);
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/fetchBlockedUsers.php?user_id=${numericUserId}`
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
        setBlockedUserIds(data.blocked_users.map((u) => u.user_id));
      } else {
        console.error("Failed to fetch blocked users:", data.message);
        setBlockedUserIds([]);
      }
    } catch (error) {
      console.error("Error fetching blocked users:", error);
      setBlockedUserIds([]);
    }
  };

  useEffect(() => {
    if (user_id) {
      fetchBlockedUsers();
    }
  }, [user_id]);

  const handleEditButtonClick = (post) => {
    setSelectedPost(post);
    setEditModalOpen(true);
  };
  const handleDeleteClick = (post) => {
    deleteModalRef.current.open(post); // Open modal for this post
  };

  const clearSearch = () => {
    setSearchResults([]);
  };

  const handleSearchResults = (results) => {
    setSearchResults(results);
  };

  const openOtherUserProfile = (userId) => {
    if (userId === user_id) {
      openProfilePage();
      clearSearch();
      return;
    }
    setIsOtherUserProfileOpen(true);
    setSelectedUserId(userId);
    setIsCommentModalOpen(false);
    clearSearch();
  };

  const handlePostClick = (post) => {
    setSelectedPost(post);
    openComments(post);
    setOpenMorePost(null);
  };

  const openProfilePage = () => {
    setIsProfilePageOpen(true);
    setIsDropDownOpen(false);
  };
  const closeOtherUserProfile = () => {
    setIsOtherUserProfileOpen(false);
    clearSearch();
  };
  const filteredPosts = useMemo(() => {
    let filtered = posts.filter((post) => !blockedUserIds.includes(post.user_id));

    if (selectedCategory !== "All") {
      filtered = filtered.filter((post) => post.post_category === selectedCategory);
    }

    if (Array.isArray(searchResults) && searchResults.length > 0) {
      const searchPostIds = new Set(searchResults.map((r) => r.post_id));
      filtered = filtered.filter((post) => searchPostIds.has(post.post_id));
    }

    return filtered;
  }, [posts, blockedUserIds, selectedCategory, searchResults]);

  const closeAllModals = () => {
    setIsProfilePageOpen(false);
    setIsDropDownOpen(false);
    setIsSettingOpen(false);
    setOpenHelpPage(false);
  };

  useEffect(() => {
    const fetchSavedPostIds = async () => {
      if (!user_id || posts.length === 0) return;

      try {
        const postIds = posts.map((p) => p.post_id);

        const res = await fetch(
          `${API_URL}/checkSavedPosts.php`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              user_id: user_id,
              post_ids: postIds,
            }),
          }
        );

        const data = await res.json();
        if (data.success) {
          setSavedPostIds(new Set(data.saved_post_ids));
        }
      } catch (err) {
        console.error("Error fetching saved posts:", err);
      }
    };

    fetchSavedPostIds();
  }, [posts, user_id]);

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
        `${API_URL}/handleSavedPost.php`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();

      if (data.success) {
        // Update local state
        setSavedPostIds((prev) => {
          const newSet = new Set(prev);
          if (data.action === "saved") {
            newSet.add(postId);
            toast.success("Post saved successfully!");
          } else {
            newSet.delete(postId);
            toast.error("Post unsaved successfully!");
          }
          return newSet;
        });

        setOpenMorePost(null);
      } else {
        toast.error(data.message || "Failed to save/unsave post");
      }
    } catch (err) {
      console.error("Error saving post:", err);
      toast.error("An error occurred while saving the post");
    }
  };

  useEffect(() => {
    fetchPost();
  }, []);

  // Replace your handleNotificationPostClick function in Homepage.jsx with this:

  const handleNotificationPostClick = async (notification) => {
    console.log("Notification clicked:", notification);
    setIsNotificationPanelOpen(false);

    const postId = notification.related_post_id;
    const commentId = notification.related_comment_id;

    // If there's a comment ID, open the comment modal and scroll to comment
    if (commentId && postId) {
      const post = posts.find((p) => p.post_id === postId);
      if (post) {
        setSelectedPost(post);
        setIsCommentModalOpen(true);

        // Wait for CommentModal to fetch and render comments, then scroll
        setTimeout(() => {
          const commentElement = document.getElementById(
            `comment-${commentId}`
          );
          if (commentElement) {
            commentElement.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });

            // Add highlight effect
            commentElement.classList.add("highlighted-comment");
            setTimeout(
              () => commentElement.classList.remove("highlighted-comment"),
              3000
            );
          } else {
            console.warn(`Comment element not found: comment-${commentId}`);
          }
        }, 800); // Increased delay to 800ms
      }
    } else if (postId) {
      // Regular post notification - scroll to post in feed
      const postElement = postRefs.current[postId];
      if (postElement) {
        postElement.scrollIntoView({ behavior: "smooth", block: "center" });
        setHighlightedPostId(postId);
        setTimeout(() => setHighlightedPostId(null), 3000);
      } else {
        // If post not visible, reset category and try again
        setSelectedCategory("All");
        setTimeout(() => {
          const element = postRefs.current[postId];
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
            setHighlightedPostId(postId);
            setTimeout(() => setHighlightedPostId(null), 3000);
          }
        }, 100);
      }
    }
  };

  const toggleDropDown = () => setIsDropDownOpen((prev) => !prev);

  const openSetting = () => {
    setIsSettingOpen(true);
    setIsDropDownOpen(false); // ⬅ auto-close dropdown
  };

  const handleOpenHelpPage = () => {
    setOpenHelpPage(true);
    setIsDropDownOpen(false);
  };
  const closeProfilePage = () => setIsProfilePageOpen(false);
  const closeSetting = () => setIsSettingOpen(false);

  const toggleMorePost = (post_id) => {
    setOpenMorePost((prev) => (prev === post_id ? null : post_id));
  };

  const fetchUserVotes = async (userId) => {
    if (!userId) return {};

    try {
      const res = await fetch(
        `${API_URL}/getUserVotes.php?user_id=${userId}`
      );
      const data = await res.json();

      if (data.success) {
        const voteObj = {};
        data.votes.forEach((vote) => {
          // vote_type: 1 = up, 0 = down
          voteObj[vote.post_id] = vote.vote_type === 1 ? "up" : "down";
        });
        return voteObj;
      }
      return {};
    } catch (err) {
      console.log("Error fetching user votes:", err);
      return {};
    }
  };

  // Update the fetchPost function to initialize vote tallies
  const fetchPost = async () => {
    try {
      const res = await fetch(
        `${API_URL}/fetchPost.php?current_user_id=${user_id}`
      );
      const data = await res.json();
      if (data.success) {
        setPosts(data.posts);

        // Initialize vote tallies from fetched posts
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
      } else {
        console.log("fetch failed", data.message);
      }
    } catch (err) {
      console.log("Error fetching posts:", err);
    }
  };

  // Fixed handleToggleVote function
  const handleToggleVote = async (userId, postId, type) => {
    if (!userId) {
      toast.error("You must be logged in to vote.");
      return;
    }

    const currentVote = voteState[postId];
    const newVoteType = currentVote === type ? null : type;

    const originalUpTally = upTally[postId];
    const originalDownTally = downTally[postId];
    const originalVoteState = currentVote;

    let newUpTally = originalUpTally;
    let newDownTally = originalDownTally;

    if (currentVote === "up") {
      newUpTally = newUpTally - 1;
    } else if (currentVote === "down") {
      newDownTally = newDownTally - 1;
    }

    if (newVoteType === "up") {
      newUpTally = newUpTally + 1;
    } else if (newVoteType === "down") {
      newDownTally = newDownTally + 1;
    }

    setVoteState((prev) => ({ ...prev, [postId]: newVoteType }));
    setUpTally((prev) => ({ ...prev, [postId]: newUpTally }));
    setDownTally((prev) => ({ ...prev, [postId]: newDownTally }));

    let voteTypeToBackend =
      newVoteType === "up" ? 1 : newVoteType === "down" ? 0 : null;

    try {
      const res = await fetch(
        `${API_URL}/handleVote.php`,
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
        const postRes = await fetch(
          `${API_URL}/fetchSinglePost.php?post_id=${postId}`
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

          setPosts((prev) =>
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

        // ✅ Create notifications for both upvote and downvote
        const post = posts.find((p) => p.post_id === postId);
        if (post && post.user_id !== userId) {
          if (newVoteType === "up") {
            await notifyPostUpvote(post.user_id, userId, user.username, postId);
          } else if (newVoteType === "down") {
            await notifyPostDownvote(
              post.user_id,
              userId,
              user.username,
              postId
            );
          }
        }
      } else {
        console.log("Vote failed:", data.message);
        setVoteState((prev) => ({ ...prev, [postId]: originalVoteState }));
        setUpTally((prev) => ({ ...prev, [postId]: originalUpTally }));
        setDownTally((prev) => ({ ...prev, [postId]: originalDownTally }));
        toast.error("Failed to vote. Please try again.");
      }
    } catch (err) {
      console.log("Error sending vote:", err);
      setVoteState((prev) => ({ ...prev, [postId]: originalVoteState }));
      setUpTally((prev) => ({ ...prev, [postId]: originalUpTally }));
      setDownTally((prev) => ({ ...prev, [postId]: originalDownTally }));
      toast.error("Error voting. Please check your connection.");
    }
  };
  // REPORT HANDLER
  const setReportData = (type, reportedBy, reportedUID, contentId) => {
    setReportType(type);
    setReportedBy(reportedBy);
    setReportedUID(reportedUID);
    setIsReportOpen(true);
    setContentId(contentId);
  };

  const closeReport = () => {
    setIsReportOpen(false);
  };

  const openComments = (post) => {
    setSelectedPost(post);
    setIsCommentModalOpen(true);
  };

  const closeComments = () => {
    setSelectedPost(null);
    setIsCommentModalOpen(false);
  };

  const handlePostDeleted = (deletedPostId) => {
    setPosts((prev) => prev.filter((post) => post.post_id !== deletedPostId));
    setIsCommentModalOpen(false);
  };

  const handleBlockUser = (userId, username) => {
    setUserToBlock({ userId, username });
    setIsBlockConfirmOpen(true);
    setOpenMorePost(null);
  };

  const confirmBlock = async () => {
    if (!user_id || !userToBlock) return;

    try {
      const formData = new FormData();
      formData.append("user_id", user_id);
      formData.append("blocked_user_id", userToBlock.userId);

      const response = await fetch(
        `${API_URL}/handleBlockUser.php`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        toast.error("Failed to block user. Server error.");
        return;
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        toast.error("Failed to block user. Invalid server response.");
        return;
      }

      const data = await response.json();

      if (data.success) {
        toast.success("User blocked successfully!");
        setBlockedUserIds((prev) => [...prev, userToBlock.userId]);
        setIsBlockConfirmOpen(false);
        setUserToBlock(null);

        await fetchBlockedUsers();
        fetchPost();
      } else {
        toast.error(data.message || "Failed to block user");
      }
    } catch (error) {
      console.error("Error blocking user:", error);
      toast.error("An error occurred while blocking the user");
    }
  };

  return (
    <>
      <div className="home_container">
        <PageHeader
          isOnCreatePost={true}
          isOnSearchBar={true}
          onPostCreated={fetchPost}
          isDropDownOpen={isDropDownOpen}
          toggleDropDown={toggleDropDown}
          openProfilePage={openProfilePage}
          openSetting={openSetting}
          onNotificationClick={() => setIsNotificationPanelOpen(true)}
          openHelpPage={handleOpenHelpPage}
          userId={user_id}
          notifEnabled={notifEnabled}
          onSearchResults={handleSearchResults}
          onUserClick={openOtherUserProfile}
          onPostClick={handlePostClick}
          onClearSearch={clearSearch}
        />
        <NotificationPanel
          isOpen={isNotificationPanelOpen}
          onClose={() => setIsNotificationPanelOpen(false)}
          userId={user_id}
          onNotificationClick={handleNotificationPostClick}
        />
        <div className="page_body">
          <Nav closeModals={closeAllModals} />
          <div className="home_main_container">
            <CategorySlider
              onCategoryChange={setSelectedCategory}
              selectedCategory={selectedCategory}
            />
            <ProfilePage
              style={isProfilePageOpen ? "flex" : "none"}
              closeProfilePage={closeProfilePage}
            />

            <HelpPage
              openPage={openHelpPage}
              closePage={() => setOpenHelpPage(false)}
            />
            <Settings
              style={isSettingOpen ? "flex" : "none"}
              closeSetting={closeSetting}
              notifEnabled={notifEnabled}
              setNotifEnabled={setNotifEnabled}
              userId={user_id}
            />
            <div className="post_container">
              {filteredPosts.length === 0 ? (
                <p style={{ textAlign: "center" }}>
                  {posts.length === 0
                    ? "Loading posts..."
                    : "No posts found in this category."}
                </p>
              ) : (
                filteredPosts.map((post, index) => (
                  <motion.div
                    className={`post_card ${
                      highlightedPostId === post.post_id
                        ? "highlighted-post"
                        : ""
                    }`}
                    key={post.post_id}
                    ref={(el) => (postRefs.current[post.post_id] = el)} // ← Add this line
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                    whileHover={{ y: -4 }}
                  >
                    <div className="post_card_header">
                      <div className="header_user_container">
                        <div className="pfp_container">
                          <img
                            src={post.profile_image || pfpImage}
                            alt="user_pfp"
                          />
                        </div>
                        <div
                          className="post_username"
                          style={{ cursor: "pointer" }}
                          onClick={() =>
                            openOtherUserProfile(post.user_id)
                          }
                        >
                          {post.username}
                        </div>
                        <div className="post_date">
                          {timeAgo(post.post_date)}
                        </div>
                        <div className="post_category">
                          {post.post_category}
                        </div>
                        <VisibilityBadge visibility={post.post_visibility} />
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
                            {post.user_id !== user_id && (
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
                            )}
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
                                  handleBlockUser(post.user_id, post.username);
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
                        onClick={(e) => {
                          e.stopPropagation();
                          openComments(post);
                        }}
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
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Comment Modal */}

      <CommentModal
        openModal={isCommentModalOpen}
        closeModal={closeComments}
        user_id={user_id}
        postData={selectedPost}
        fetchPosts={() => fetchPost()}
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

      {/* Edit Modal */}
      <EditPostModal
        open={editModalOpen}
        postData={selectedPost}
        user_id={user_id}
        fetchPost={() => fetchPost()}
        onClose={() => setEditModalOpen(false)}
      />

      {/* Delete Confirmation Modal */}
      <DeletePostModal
        ref={deleteModalRef}
        user_id={user_id}
        onDelete={handlePostDeleted}
      />

      {/* otherUserModal */}
      <OtherUserProfile
        openModal={isOtherUserProfileOpen}
        uid={selectedUserId}
        closeModal={closeOtherUserProfile}
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

    </>
  );
}
