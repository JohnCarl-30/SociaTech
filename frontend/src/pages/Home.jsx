import Nav from "../components/Nav.jsx";
import Report from "../components/Report.jsx";
import CategorySlider from "../components/CategorySlider.jsx";
import PageHeader from "../components/PageHeader.jsx";
import ProfilePage from "../components/ProfilePage.jsx";
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
import "./Home.css";
import { useCycle } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import moreBtn from "../assets/moreBtn.png";
import { getUser } from "../utils/storage.js";
import pfpImage from "../assets/deault_pfp.png";

import Settings from "../components/Settings.jsx";
import TrippleDots from "../assets/moreBtn.png";
import HelpPage from "../components/HelpPage.jsx";

import NotificationPanel from "../components/NotificationPanel.jsx";

import {
  notifyPostComment,
  notifyPostUpvote,
  notifyCommentUpvote,
} from "../services/notificationHelper.js";

export default function Homepage() {
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const [notifEnabled, setNotifEnabled] = useState(false);
  const [posts, setPosts] = useState([]);
  const [openMorePost, setOpenMorePost] = useState(null); // para sa post card
  const [openMoreModalPost, setOpenMoreModalPost] = useState(null); // para sa post sa comment modal
  const [openMoreComment, setOpenMoreComment] = useState(null);
  const [upTally, setUpTally] = useState({});
  const [downTally, setDownTally] = useState({});
  const [voteState, setVoteState] = useState({});
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const textareaRef = useRef(null);
  const [isProfilePageOpen, setIsProfilePageOpen] = useState(false);
  const [isSettingOpen, setIsSettingOpen] = useState(false);
  const [isDropDownOpen, setIsDropDownOpen] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [commentImage, setCommentImage] = useState(null);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isNotificationBarOpen, cycleNotificationBarOpen] = useCycle(
    false,
    true
  );
  const [isOtherUserProfileOpen, setIsOtherUserProfileOpen] = useState(false);
  const [openOtherUserMoreContainer, cycleOpenOtherUserMoreContainer] =
    useCycle(false, true);
  const [commentUpTally, setCommentUpTally] = useState({});
  const [commentDownTally, setCommentDownTally] = useState({});
  const [commentVoteState, setCommentVoteState] = useState({});
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState("");
  const [commentSortOption, setCommentSortOption] = useState("newest");
  const [deletedComment, setDeletedComment] = useState(null);
  const [undoTimer, setUndoTimer] = useState(null);
  const [isEditPostModalOpen, setIsEditPostModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [editPostTitle, setEditPostTitle] = useState("");
  const [editPostContent, setEditPostContent] = useState("");
  const [editPostCategory, setEditPostCategory] = useState("");
  const [editPostImage, setEditPostImage] = useState(null);
  const [editPostImagePreview, setEditPostImagePreview] = useState("");
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [openHelpPage, setOpenHelpPage] = useState(false);
  const [highlightedPostId, setHighlightedPostId] = useState(null);
  const postRefs = useRef({});

  const [searchResults, setSearchResults] = useState([]);
  const [selectedOtherUser, setSelectedOtherUser] = useState(null);
  const [otherUserProfile, setOtherUserProfile] = useState(null);
  const [otherUserPosts, setOtherUserPosts] = useState([]);
  const [isLoadingOtherUserData, setIsLoadingOtherUserData] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  // STATES FOR REPORT
  const [reportType, setReportType] = useState(null);
  const [reportedBy, setReportedBy] = useState(null);
  const [reportedUID, setReportedUID] = useState(null);
  const [contentId, setContentId] = useState(null);
  const [savedPostIds, setSavedPostIds] = useState(new Set());
  const [savedPosts, setSavedPosts] = useState([]);

  const clearSearch = () => {
    setSearchResults([]);
  };

  const handleSearchResults = (results) => {
    setSearchResults(results);
  };

  const handleUserClick = async (userId, userData) => {
    setIsLoadingOtherUserData(true);
    setSelectedOtherUser(userData);
    setIsOtherUserProfileOpen(true);
    setOtherUserProfile(null);
    setOtherUserPosts([]);
    clearSearch();

    await Promise.all([
      fetchOtherUserProfile(userId),
      fetchOtherUserPosts(userId),
      fetchFollowStats(userId),
    ]);

    setIsLoadingOtherUserData(false);
  };

  const handlePostClick = async (post) => {
    setSelectedPost(post);
    setIsCommentModalOpen(true);
    setOpenMore(null);
    setComments([]);
    setCommentSortOption("newest");
    await fetchComments(post.post_id, "newest");
  };

  const fetchOtherUserProfile = async (userId) => {
    try {
      const response = await fetch(
        `http://localhost/SociaTech/backend/auth/handleFetchOtherUserProfile.php?user_id=${userId}`
      );
      const data = await response.json();

      if (data.success) {
        setOtherUserProfile(data.otherUserInfo);
      } else {
        console.log("Failed to fetch user profile:", data.message);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };
  // Fetch other user's posts
  const fetchOtherUserPosts = async (userId) => {
    try {
      const response = await fetch(
        `http://localhost/SociaTech/backend/auth/fetchPost.php?user_id=${userId}`
      );
      const data = await response.json();

      if (data.success) {
        setOtherUserPosts(data.posts || []);
      } else {
        console.log("Failed to fetch user posts:", data.message);
      }
    } catch (error) {
      console.error("Error fetching user posts:", error);
    }
  };

  // const fetchFollowData = async (targetUserId) => {
  //   try {
  //     const [followersRes, followingRes] = await Promise.all([
  //       fetch(
  //         `http://localhost/SociaTech/backend/auth/handleOtherUserFollowers.php?user_id=${targetUserId}`
  //       ),
  //       fetch(
  //         `http://localhost/SociaTech/backend/auth/handleOtherUserFollowing.php?user_id=${targetUserId}`
  //       ),
  //     ]);

  //     const followersData = await followersRes.json();
  //     const followingData = await followingRes.json();

  //     if (followersData.success && followersData.followers) {
  //       setFollowerCount(followersData.followers.length);
  //       const following = followersData.followers.some(
  //         (follower) => follower.follower_id == user_id
  //       );
  //       setIsFollowing(following);
  //     }

  //     if (followingData.success && followingData.following) {
  //       setFollowingCount(followingData.following.length);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching follow data:", error);
  //   }
  // };

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
      alert("You must be logged in to follow users");
      return;
    }

    const followedId = selectedOtherUser?.user_id || otherUserProfile?.user_id;

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

      const data = await response.json();

      if (data.success) {
        setIsFollowing(true);
        setFollowerCount(data.follower_count); // Use count from backend
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

    const followedId = selectedOtherUser?.user_id || otherUserProfile?.user_id;

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

      const data = await response.json();

      if (data.success) {
        setIsFollowing(false);
        setFollowerCount(data.follower_count); // Use count from backend
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

    if (
      isOtherUserProfileOpen &&
      (selectedOtherUser?.user_id || otherUserProfile?.user_id)
    ) {
      const targetUserId =
        selectedOtherUser?.user_id || otherUserProfile?.user_id;

      // Refresh counts every 10 seconds
      intervalId = setInterval(() => {
        fetchFollowStats(targetUserId);
      }, 10000); // 10 seconds
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [
    isOtherUserProfileOpen,
    selectedOtherUser?.user_id,
    otherUserProfile?.user_id,
  ]);

  // Alternative: Refresh on window focus (when user comes back to tab)
  useEffect(() => {
    const handleFocus = () => {
      if (
        isOtherUserProfileOpen &&
        (selectedOtherUser?.user_id || otherUserProfile?.user_id)
      ) {
        const targetUserId =
          selectedOtherUser?.user_id || otherUserProfile?.user_id;
        fetchFollowStats(targetUserId);
      }
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [
    isOtherUserProfileOpen,
    selectedOtherUser?.user_id,
    otherUserProfile?.user_id,
  ]);
  const handleUsernameClick = async (userId, userData) => {
    setIsLoadingOtherUserData(true);
    setSelectedOtherUser(userData);
    setIsOtherUserProfileOpen(true);
    setOtherUserProfile(null);
    setOtherUserPosts([]);
    setIsFollowing(false);
    setFollowerCount(0);
    setFollowingCount(0);

    await Promise.all([
      fetchOtherUserProfile(userId),
      fetchOtherUserPosts(userId),
      fetchFollowStats(userId),
    ]);

    setIsLoadingOtherUserData(false);
  };
  const closeOtherUserProfile = () => {
    setIsOtherUserProfileOpen(false);
    clearSearch();
  };
  const filteredPosts = (() => {
    let filtered = posts;

    // First filter by category
    if (selectedCategory !== "All") {
      filtered = filtered.filter(
        (post) => post.post_category === selectedCategory
      );
    }

    // Then filter by search results if there are any
    if (Array.isArray(searchResults) && searchResults.length > 0) {
      const searchPostIds = searchResults.map((r) => r.post_id);
      filtered = filtered.filter((post) =>
        searchPostIds.includes(post.post_id)
      );
    }

    return filtered;
  })();

  const user = getUser();

  const closeAllModals = () => {
    setIsProfilePageOpen(false);
    setIsDropDownOpen(false);
    setIsSettingOpen(false);
    setOpenHelpPage(false);
  };
  const user_id = user?.id || null;

  useEffect(() => {
    const fetchSavedPostIds = async () => {
      if (!user_id || posts.length === 0) return;

      try {
        const postIds = posts.map((p) => p.post_id);

        const res = await fetch(
          "http://localhost/SociaTech/backend/auth/checkSavedPosts.php",
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
      alert("You must be logged in to save posts");
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
        // Update local state
        setSavedPostIds((prev) => {
          const newSet = new Set(prev);
          if (data.action === "saved") {
            newSet.add(postId);
            alert("Post saved successfully!");
          } else {
            newSet.delete(postId);
            alert("Post unsaved successfully!");
          }
          return newSet;
        });

        setOpenMorePost(null); // Close dropdown
        setOpenMoreComment(null); // Close comment modal dropdown if open
      } else {
        alert(data.message || "Failed to save/unsave post");
      }
    } catch (err) {
      console.error("Error saving post:", err);
      alert("An error occurred while saving the post");
    }
  };

  useEffect(() => {
    fetchPost();
  }, []);

  useEffect(() => {
    let pollInterval;

    if (isCommentModalOpen && selectedPost?.post_id) {
      pollInterval = setInterval(() => {
        fetchComments(selectedPost.post_id, commentSortOption);
      }, 5000);
    }

    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [isCommentModalOpen, selectedPost?.post_id, commentSortOption]);

  const handleCommentTextChange = (e) => {
    setCommentText(e.target.value);
  };

  const handleCommentImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCommentImage(file);
    }
  };

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

  const handleNotificationPostClick = async (postId) => {
    setIsNotificationPanelOpen(false);

    const postElement = postRefs.current[postId];
    if (postElement) {
      postElement.scrollIntoView({ behavior: "smooth", block: "center" });
      setHighlightedPostId(postId);
      setTimeout(() => setHighlightedPostId(null), 3000);
    } else {
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
  };

  const toggleDropDown = () => setIsDropDownOpen((prev) => !prev);

  const openProfilePage = () => {
    setIsProfilePageOpen(true);
    setIsDropDownOpen(false); // ⬅ auto-close dropdown
  };
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

  const resetCommentFields = () => {
    setCommentText("");
    setCommentImage(null);
    const fileInput = document.getElementById("commentImageInput");
    if (fileInput) fileInput.value = "";
  };

  const fetchPost = async () => {
    try {
      const res = await fetch(
        "http://localhost/SociaTech/backend/auth/fetchPost.php"
      );
      const data = await res.json();
      if (data.success) {
        setPosts(data.posts);

        const upObj = {};
        const downObj = {};
        const voteObj = {};
        data.posts.forEach((p) => {
          upObj[p.post_id] = p.up_tally_post;
          downObj[p.post_id] = p.down_tally_post;
          voteObj[p.post_id] = null;
        });
        setUpTally(upObj);
        setDownTally(downObj);
        setVoteState(voteObj);
      } else {
        console.log("fetch failed", data.message);
      }
    } catch (err) {
      console.log("Error fetching posts:", err);
    }
  };

  const fetchComments = async (post_id, sortBy = "newest") => {
    try {
      const res = await fetch(
        `http://localhost/SociaTech/backend/auth/fetchComments.php?post_id=${post_id}&sort=${sortBy}`
      );
      const data = await res.json();
      if (data.success && data.comments) {
        setComments(data.comments);
        const upObj = {};
        const downObj = {};
        const voteObj = {};
        data.comments.forEach((c) => {
          upObj[c.comment_id] = c.up_tally_comment || 0;
          downObj[c.comment_id] = c.down_tally_comment || 0;
          voteObj[c.comment_id] = null;
        });
        setCommentUpTally(upObj);
        setCommentDownTally(downObj);
        setCommentVoteState(voteObj);
      } else {
        setComments([]);
      }
    } catch (err) {
      console.log("Error fetching comments:", err);
    }
  };

  const handleCommentSubmit = async () => {
    if (!user_id) {
      alert("You must be logged in to comment.");
      return;
    }

    if (!selectedPost || !selectedPost.post_id) {
      alert("Error: Post information is missing.");
      return;
    }

    if (!commentText.trim() && !commentImage) {
      alert("You must add text or upload an image");
      return;
    }

    setIsSubmittingComment(true);

    const formData = new FormData();
    formData.append("user_id", user_id);
    formData.append("post_id", selectedPost.post_id);
    formData.append("comment_content", commentText || "");

    if (commentImage) {
      formData.append("comment_image", commentImage);
    }
    try {
      const res = await fetch(
        "http://localhost/SociaTech/backend/auth/addComment.php",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();

      if (data.success) {
        await fetchComments(selectedPost.post_id);
        resetCommentFields();
        alert("Comment added successfully!");
      } else {
        alert("Failed to add comment: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      alert("Something went wrong while posting. Please try again.");
    } finally {
      setIsSubmittingComment(false);
    }
  };
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCommentImage(file);
    }
  };

  const toggleMorePost = (post_id) => {
    setOpenMorePost((prev) => (prev === post_id ? null : post_id));
  };

  // For post in comment modal
  const toggleMoreModalPost = (post_id) => {
    setOpenMoreModalPost((prev) => (prev === post_id ? null : post_id));
  };

  // For each comment
  const toggleMoreComment = (comment_id) => {
    setOpenMoreComment((prev) => (prev === comment_id ? null : comment_id));
  };

  const handleCommentVote = async (userId, commentId, type) => {
    if (!user_id) {
      alert("You must be logged in to vote.");
      return;
    }

    const currentVote = commentVoteState[commentId];
    const newVoteType = currentVote === type ? null : type;

    let upDelta = 0;
    let downDelta = 0;
    if (currentVote === "up") upDelta--;
    if (currentVote === "down") downDelta--;
    if (newVoteType === "up") upDelta++;
    if (newVoteType === "down") downDelta++;

    setCommentVoteState((prev) => ({ ...prev, [commentId]: newVoteType }));
    setCommentUpTally((prev) => ({
      ...prev,
      [commentId]: (prev[commentId] ?? 0) + upDelta,
    }));
    setCommentDownTally((prev) => ({
      ...prev,
      [commentId]: (prev[commentId] ?? 0) + downDelta,
    }));

    let voteTypeToBackend =
      newVoteType === "up" ? 1 : newVoteType === "down" ? 0 : null;

    try {
      const res = await fetch(
        "http://localhost/SociaTech/backend/auth/handleCommentVote.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            comment_id: commentId,
            user_id: userId,
            vote_type: voteTypeToBackend,
          }),
        }
      );

      const text = await res.text();
      let data;
      try {
        data = text
          ? JSON.parse(text)
          : { success: false, message: "Empty response" };
      } catch {
        data = { success: false, message: "Invalid JSON" };
      }

      if (!data.success) console.log("Comment vote failed:", data.message);
    } catch (err) {
      console.log("Error sending comment vote:", err);
    }
  };

  const handleReplyToComment = (comment) => {
    setCommentText(`@${comment.username} `);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleEditComment = (comment) => {
    setEditingCommentId(comment.comment_id);
    setEditingCommentText(comment.comment_content || "");
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditingCommentText("");
  };

  const handleSaveEdit = async (commentId) => {
    if (!editingCommentText.trim()) {
      alert("Comment content cannot be empty");
      return;
    }

    try {
      const res = await fetch(
        "http://localhost/SociaTech/backend/auth/editComment.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            comment_id: commentId,
            user_id: user_id,
            comment_content: editingCommentText,
          }),
        }
      );

      const data = await res.json();

      if (data.success) {
        await fetchComments(selectedPost.post_id);
        setEditingCommentId(null);
        setEditingCommentText("");
        alert("Comment updated successfully!");
      } else {
        alert("Failed to update comment: " + (data.message || "Unknown error"));
      }
    } catch (err) {
      console.log("Error updating comment:", err);
      alert("Something went wrong while updating. Please try again.");
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!confirm("Are you sure you want to delete this comment?")) {
      return;
    }

    const commentToDelete = comments.find((c) => c.comment_id === commentId);

    try {
      const res = await fetch(
        "http://localhost/SociaTech/backend/auth/deleteComment.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            comment_id: commentId,
            user_id: user_id,
          }),
        }
      );

      const data = await res.json();

      if (data.success) {
        setDeletedComment({
          ...commentToDelete,
          comment_id: commentId,
          post_id: selectedPost.post_id,
          deletedAt: Date.now(),
        });

        // countdown
        const timer = setTimeout(() => {
          setDeletedComment(null);
        }, 30000);
        setUndoTimer(timer);

        await fetchComments(selectedPost.post_id, commentSortOption);
        alert("Comment deleted! You have 30 seconds to undo.");
      } else {
        alert("Failed to delete comment: " + (data.message || "Unknown error"));
      }
    } catch (err) {
      console.log("Error deleting comment:", err);
      alert("Something went wrong while deleting. Please try again.");
    }
  };

  const handleUndoDelete = async () => {
    if (!deletedComment) return;

    // Clear the undo timer
    if (undoTimer) {
      clearTimeout(undoTimer);
      setUndoTimer(null);
    }

    const formData = new FormData();
    formData.append("user_id", user_id);
    formData.append("post_id", deletedComment.post_id);
    formData.append("comment_content", deletedComment.comment_content || "");

    try {
      const res = await fetch(
        "http://localhost/SociaTech/backend/auth/addComment.php",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();

      if (data.success) {
        await fetchComments(selectedPost.post_id, commentSortOption);
        setDeletedComment(null);
        alert("Comment restored successfully!");
      } else {
        alert("Failed to restore comment: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      alert("Something went wrong while restoring. Please try again.");
    }
  };

  const handleEditPost = (post) => {
    setEditingPost(post);
    setEditPostTitle(post.post_title || "");
    setEditPostContent(post.post_content || "");
    setEditPostCategory(post.post_category || "");
    setEditPostImagePreview(post.post_image || "");
    setEditPostImage(null);
    setIsEditPostModalOpen(true);
    setOpenMore(null);
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
    const fileInput = document.getElementById("editPostImageInput");
    if (fileInput) fileInput.value = "";
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
      const res = await fetch(
        "http://localhost/SociaTech/backend/auth/updatePost.php",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();

      if (data.success) {
        await fetchPost();
        setIsEditPostModalOpen(false);
        setEditingPost(null);
        alert("Post updated successfully!");
      } else {
        alert("Failed to update post: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      alert("Something went wrong while updating. Please try again.");
    }
  };

  const handleDeletePost = (post) => {
    setPostToDelete(post);
    setIsDeleteConfirmOpen(true);
    setOpenMore(null);
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

      const data = await res.json();

      if (data.success) {
        await fetchPost();
        setIsDeleteConfirmOpen(false);
        setPostToDelete(null);
        alert("Post deleted successfully!");
      } else {
        alert("Failed to delete post: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      alert("Something went wrong while deleting. Please try again.");
    }
  };

  const cancelDeletePost = () => {
    setIsDeleteConfirmOpen(false);
    setPostToDelete(null);
  };

  const closeEditPostModal = () => {
    setIsEditPostModalOpen(false);
    setEditingPost(null);
    setEditPostTitle("");
    setEditPostContent("");
    setEditPostCategory("");
    setEditPostImage(null);
    setEditPostImagePreview("");
  };

  const handleToggleVote = async (userId, postId, type) => {
    if (!user_id) {
      alert("You must be logged in to vote.");
      return;
    }

    const currentVote = voteState[postId];
    const newVoteType = currentVote === type ? null : type;

    let upDelta = 0;
    let downDelta = 0;
    if (currentVote === "up") upDelta--;
    if (currentVote === "down") downDelta--;
    if (newVoteType === "up") upDelta++;
    if (newVoteType === "down") downDelta++;

    setVoteState((prev) => ({ ...prev, [postId]: newVoteType }));
    setUpTally((prev) => ({
      ...prev,
      [postId]: (prev[postId] ?? 0) + upDelta,
    }));
    setDownTally((prev) => ({
      ...prev,
      [postId]: (prev[postId] ?? 0) + downDelta,
    }));

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

      const text = await res.text();
      let data;
      try {
        data = text
          ? JSON.parse(text)
          : { success: false, message: "Empty response" };
      } catch {
        data = { success: false, message: "Invalid JSON" };
      }

      if (data.success && newVoteType === "up") {
        // CREATE NOTIFICATION FOR UPVOTE
        const post = posts.find((p) => p.post_id === postId);
        if (post) {
          await notifyPostUpvote(post.user_id, user_id, user.username, postId);
        }
      }

      if (!data.success) console.log("Vote failed:", data.message);
    } catch (err) {
      console.log("Error sending vote:", err);
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

  const openComments = async (post) => {
    setSelectedPost(post);
    setIsCommentModalOpen(true);
    setComments([]);
    setCommentSortOption("newest");
    await fetchComments(post.post_id, "newest");
  };
  const handleSortChange = (e) => {
    const newSort = e.target.value;
    setCommentSortOption(newSort);
    if (selectedPost) {
      fetchComments(selectedPost.post_id, newSort);
    }
  };

  const closeComments = () => {
    setSelectedPost(null);
    setIsCommentModalOpen(false);
    setOpenMoreModalPost(null);
    setOpenMoreComment(null);
    setComments([]);
    resetCommentFields();
  };

  const timeAgo = (dateString) => {
    const now = new Date();
    const past = new Date(dateString);
    const diff = Math.floor((now - past) / 1000); // seconds

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
          onUserClick={handleUserClick}
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
              onPostClick={openComments}
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
            />
            <div className="post_container">
              {filteredPosts.length === 0 ? (
                <p style={{ textAlign: "center" }}>
                  {posts.length === 0
                    ? "Loading posts..."
                    : "No posts found in this category."}
                </p>
              ) : (
                filteredPosts.map((post) => (
                  <div className="post_card" key={post.post_id}>
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
                            handleUsernameClick(post.user_id, post)
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
                        onClick={(e) => {
                          e.stopPropagation();
                          openComments(post);
                        }}
                      >
                        Comment
                      </button>
                      <button
                        className={`up_vote_btn ${
                          voteState[post.post_id] === "up" ? "voted" : ""
                        }`}
                        onClick={() =>
                          handleToggleVote(user_id, post.post_id, "up")
                        }
                      >
                        <ArrowBigUp />
                        {upTally[post.post_id]}
                      </button>

                      <button
                        className={`down_vote_btn ${
                          voteState[post.post_id] === "down" ? "voted" : ""
                        }`}
                        onClick={() =>
                          handleToggleVote(user_id, post.post_id, "down")
                        }
                      >
                        <ArrowBigDown />
                        {downTally[post.post_id]}
                      </button>
                    </div>
                  </div>
                ))
              )}

              {/* Comment Modal */}
              {isCommentModalOpen && selectedPost && (
                <div className="commentModal_backDrop">
                  <div className="commentModal_container">
                    <span style={{ textAlign: "center", width: "100%" }}>
                      {selectedPost.username}'s post
                    </span>

                    <div className="commentModal_post">
                      <div className="commentModal_postHeader">
                        <div className="commentModal_userInfo">
                          <div className="commentModal_pfp">
                            <img
                              src={selectedPost.profile_image || pfpImage}
                              alt="user_pfp"
                            />
                          </div>
                          <div
                            className="commentModal_username"
                            style={{ cursor: "pointer" }}
                            onClick={() =>
                              handleUsernameClick(
                                selectedPost.user_id,
                                selectedPost
                              )
                            }
                          >
                            {selectedPost.username}
                          </div>
                          <div className="commentModal_date">
                            {selectedPost.post_date}
                          </div>
                          <div className="commentModal_category">
                            {selectedPost.post_category}
                          </div>
                        </div>
                        <div className="commentModal_moreMenu">
                          <div
                            className="commentModal_moreBtn"
                            onClick={() =>
                              toggleMoreModalPost(selectedPost.post_id)
                            }
                          >
                            <img
                              src={moreBtn}
                              alt=""
                              className="commentModal_moreIcon"
                            />
                          </div>
                          {openMoreModalPost === selectedPost.post_id && (
                            <div className="commentModal_dropdownMenu">
                              {selectedPost.user_id == user_id && (
                                <>
                                  <div
                                    className="commentModal_dropdownItem"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditPost(selectedPost);
                                    }}
                                  >
                                    <Edit size={18} />
                                    <span>Edit</span>
                                  </div>
                                  <div
                                    className="commentModal_dropdownItem"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeletePost(selectedPost);
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
                                  handleSavePost(selectedPost.post_id);
                                }}
                              >
                                <Bookmark
                                  size={18}
                                  fill={
                                    savedPostIds.has(selectedPost.post_id)
                                      ? "currentColor"
                                      : "none"
                                  }
                                />
                                <span>
                                  {savedPostIds.has(selectedPost.post_id)
                                    ? "Unsave"
                                    : "Save"}
                                </span>
                              </div>
                              {selectedPost.user_id !== user_id && (
                                <div
                                  className="commentModal_dropdownItem"
                                  onClick={(e) => {
                                    e.stopPropagation();

                                    setReportData(
                                      "post",
                                      user_id,
                                      selectedCategory.user_id,
                                      selectedPost.post_id
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

                      <div className="commentModal_title">
                        {selectedPost.post_title}
                      </div>

                      {selectedPost.post_content && (
                        <div className="commentModal_content">
                          {selectedPost.post_content}
                        </div>
                      )}
                      {selectedPost.post_image && (
                        <div className="commentModal_imageContainer">
                          <img src={selectedPost.post_image} alt="post_image" />
                        </div>
                      )}

                      <div className="commentModal_btnRow">
                        <button className="commentModal_commentBtn">
                          Comment
                        </button>
                        <button
                          className={`up_vote_btn ${
                            voteState[selectedPost.post_id] === "up"
                              ? "voted"
                              : ""
                          }`}
                          onClick={() =>
                            handleToggleVote(
                              user_id,
                              selectedPost.post_id,
                              "up"
                            )
                          }
                        >
                          <ArrowBigUp />
                          {upTally[selectedPost.post_id]}
                        </button>
                        <button
                          className={`down_vote_btn ${
                            voteState[selectedPost.post_id] === "down"
                              ? "voted"
                              : ""
                          }`}
                          onClick={() =>
                            handleToggleVote(
                              user_id,
                              selectedPost.post_id,
                              "down"
                            )
                          }
                        >
                          <ArrowBigDown />
                          {downTally[selectedPost.post_id]}
                        </button>
                      </div>
                      {/* Sorting newest, oldest tyaka most upvote plan ko lagyan time pero tyaka na */}

                      {deletedComment && (
                        <div className="undo_delete_banner">
                          <span>Comment deleted</span>
                          <button
                            className="undo_delete_btn"
                            onClick={handleUndoDelete}
                          >
                            Undo
                          </button>
                        </div>
                      )}

                      <div className="commentModal_commentSection">
                        <div className="comment_sort_container">
                          <label
                            htmlFor="comment-sort"
                            className="comment_sort_label"
                          >
                            Sort by:
                          </label>
                          <select
                            id="comment-sort"
                            className="comment_sort_select"
                            value={commentSortOption}
                            onChange={handleSortChange}
                          >
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="most_upvoted">Most Upvoted</option>
                          </select>
                        </div>
                        {!comments || comments.length === 0 ? (
                          <p
                            style={{
                              textAlign: "center",
                              color: "#888",
                              padding: "20px",
                            }}
                          >
                            No comments yet. Be the first to comment!
                          </p>
                        ) : (
                          comments.map((comment, index) => (
                            <div
                              key={comment.comment_id || index}
                              className="commentModal_commentItem"
                            >
                              <div className="commentModal_commentHeader">
                                <div className="commentModal_pfp">
                                  <img
                                    src={comment.profile_image || pfpImage}
                                    alt="commenter_pfp"
                                  />
                                </div>
                                <div
                                  className="commentModal_commentUsername"
                                  style={{ cursor: "pointer" }}
                                  onClick={() =>
                                    handleUsernameClick(
                                      comment.user_id,
                                      comment
                                    )
                                  }
                                ></div>

                                <div className="commentModal_commentDate">
                                  {comment.comment_date
                                    ? new Date(
                                        comment.comment_date
                                      ).toLocaleDateString()
                                    : "Just now"}
                                </div>
                                <div
                                  className="commentModal_moreBtn"
                                  onClick={() =>
                                    toggleMoreComment(comment.comment_id)
                                  }
                                >
                                  <img
                                    src={moreBtn}
                                    alt=""
                                    className="commentModal_moreIcon"
                                  />
                                </div>
                              </div>

                              {editingCommentId === comment.comment_id ? (
                                <div className="comment_edit_container">
                                  <textarea
                                    className="comment_edit_textarea"
                                    value={editingCommentText}
                                    onChange={(e) =>
                                      setEditingCommentText(e.target.value)
                                    }
                                    onInput={(e) => {
                                      e.target.style.height = "auto";
                                      e.target.style.height =
                                        e.target.scrollHeight + "px";
                                    }}
                                  />
                                  <div className="comment_edit_actions">
                                    <button
                                      className="comment_edit_cancel_btn"
                                      onClick={handleCancelEdit}
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      className="comment_edit_save_btn"
                                      onClick={() =>
                                        handleSaveEdit(comment.comment_id)
                                      }
                                    >
                                      Save
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <div className="commentModal_commentText">
                                    {comment.comment_content || ""}
                                    {openMoreComment === comment.comment_id && (
                                      <div className="comment_dropDown_menu">
                                        {comment.user_id == user_id && (
                                          <>
                                            <div
                                              className="dropdown_item"
                                              onClick={() =>
                                                handleEditComment(comment)
                                              }
                                            >
                                              <Edit size={18} />
                                              <span>Edit</span>
                                            </div>
                                            <div
                                              className="dropdown_item"
                                              onClick={() =>
                                                handleDeleteComment(
                                                  comment.comment_id
                                                )
                                              }
                                            >
                                              <Trash2 size={18} />
                                              <span>Delete</span>
                                            </div>
                                          </>
                                        )}
                                        {comment.user_id !== user_id && (
                                          <div
                                            className="dropdown_item"
                                            onClick={(e) => {
                                              e.stopPropagation();

                                              setReportData(
                                                "comment",
                                                user_id,
                                                comment.user_id,
                                                comment.comment_id
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

                                  {comment.comment_image && (
                                    <div className="commentModal_commentImage">
                                      <img
                                        src={comment.comment_image}
                                        alt="comment_attachment"
                                      />
                                    </div>
                                  )}
                                </>
                              )}

                              <div className="commentModal_commentActions">
                                <button
                                  className={`comment_up_vote_btn ${
                                    commentVoteState[comment.comment_id] ===
                                    "up"
                                      ? "voted"
                                      : ""
                                  }`}
                                  onClick={() =>
                                    handleCommentVote(
                                      user_id,
                                      comment.comment_id,
                                      "up"
                                    )
                                  }
                                >
                                  <ArrowBigUp size={18} />
                                  {commentUpTally[comment.comment_id] || 0}
                                </button>

                                <button
                                  className={`comment_down_vote_btn ${
                                    commentVoteState[comment.comment_id] ===
                                    "down"
                                      ? "voted"
                                      : ""
                                  }`}
                                  onClick={() =>
                                    handleCommentVote(
                                      user_id,
                                      comment.comment_id,
                                      "down"
                                    )
                                  }
                                >
                                  <ArrowBigDown size={18} />
                                  {commentDownTally[comment.comment_id] || 0}
                                </button>

                                <button
                                  className="comment_reply_btn"
                                  onClick={() => handleReplyToComment(comment)}
                                >
                                  Reply
                                </button>

                                {(() => {
                                  console.log(
                                    "Comment user_id:",
                                    comment.user_id,
                                    "Current user_id:",
                                    user_id,
                                    "Match:",
                                    comment.user_id == user_id
                                  );
                                  return null;
                                })()}
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      <div className="commentModal_inputContainer">
                        <textarea
                          placeholder="Write a comment..."
                          value={commentText}
                          onChange={handleCommentTextChange}
                          onInput={(e) => {
                            e.target.style.height = "auto";
                            e.target.style.height =
                              e.target.scrollHeight + "px";
                          }}
                        />
                        {commentImage && (
                          <div className="comment_image_preview_container">
                            <img
                              className="comment_image_preview"
                              src={URL.createObjectURL(commentImage)}
                              alt="preview"
                            />
                            <button
                              className="remove_comment_image_btn"
                              onClick={() => resetCommentFields()}
                            >
                              ✖
                            </button>
                          </div>
                        )}
                        <div className="commentModal_actions">
                          <label
                            className="commentModal_uploadBtn"
                            htmlFor="commentImageInput"
                          >
                            <Image className="img_svg" />
                          </label>
                          <input
                            id="commentImageInput"
                            type="file"
                            accept="image/*"
                            style={{ display: "none" }}
                            onChange={handleCommentImageSelect}
                          />
                          <button
                            onClick={closeComments}
                            className="commentModal_actionBtn"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleCommentSubmit}
                            className="commentModal_actionBtn"
                            disabled={isSubmittingComment}
                          >
                            {isSubmittingComment ? "Posting..." : "Comment"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <Report
                isOpen={isReportOpen}
                onClose={closeReport}
                type={reportType}
                reportedBy={reportedBy}
                reportedUID={reportedUID}
                contentId={contentId}
              />
            </div>
          </div>
        </div>
      </div>

      {isEditPostModalOpen && editingPost && (
        <div className="commentModal_backDrop">
          <div className="commentModal_container">
            <span style={{ textAlign: "center", width: "100%" }}>
              Edit Post
            </span>

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
                    .filter((cat) => cat !== "All") // "dman kasama si all lele
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
                    <button
                      className="editPost_removeImageBtn"
                      onClick={handleRemoveEditImage}
                    >
                      <X size={20} />
                    </button>
                  </div>
                )}
                <label
                  htmlFor="editPostImageInput"
                  className="editPost_uploadBtn"
                >
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
                <button
                  onClick={closeEditPostModal}
                  className="editPost_cancelBtn"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdatePost}
                  className="editPost_updateBtn"
                >
                  Update Post
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteConfirmOpen && postToDelete && (
        <div className="commentModal_backDrop">
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
              <button
                onClick={cancelDeletePost}
                className="deleteConfirm_cancelBtn"
              >
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

      <div
        className="otherUserProfile_parent_container"
        style={
          isOtherUserProfileOpen ? { display: "flex" } : { display: "none" }
        }
      >
        <button
          className="otherUserProfile_close_btn"
          onClick={() => closeOtherUserProfile()}
        >
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
                  src={
                    otherUserProfile?.profile_image ||
                    selectedOtherUser?.profile_image ||
                    pfpImage
                  }
                  alt=""
                  className="otherUserPfp"
                />
                <div className="userNameBio_container">
                  <div className="otherUserProfile_username">
                    @
                    {otherUserProfile?.username ||
                      selectedOtherUser?.username ||
                      "Username"}
                  </div>
                  {(otherUserProfile?.full_name ||
                    selectedOtherUser?.full_name) && (
                    <div className="otherUserProfile_fullname">
                      {otherUserProfile?.full_name ||
                        selectedOtherUser?.full_name}
                    </div>
                  )}
                  <div className="otherUserProfile_bio">
                    {otherUserProfile?.bio ||
                      selectedOtherUser?.bio ||
                      "No bio available"}
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
                <div className="otherUserProfile_more_option">
                  <Ban />
                  Block
                </div>
                <div className="otherUserProfile_more_option">
                  <AlertCircle />
                  Report
                </div>
              </div>
            </div>

            <div className="followBtn_container">
              <button
                className="followBtn"
                onClick={isFollowing ? handleUnfollow : handleFollow}
                style={{
                  cursor: "pointer",
                  backgroundColor: isFollowing ? "#6c757d" : "#000",
                  transition: "all 0.2s ease",
                  border: "none",
                  color: "white",
                  padding: "10px 20px",
                  borderRadius: "5px",
                  fontSize: "16px",
                }}
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
    </>
  );
}
