import DeletePostModal from "./DeletePostModal";
import EditPostModal from "./EditPostModal";
import "../pages/Home.css";
import Report from "./Report";
import ProfilePage from "../components/ProfilePage.jsx";
import { toast } from 'react-toastify';

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


import { useEffect, useState, useRef } from "react";
import moreBtn from "/moreBtn.png";
import { getUser } from "../utils/storage.js";
import pfpImage from "/deault_pfp.png";



import {
  notifyPostComment,
  notifyPostUpvote,
  notifyCommentUpvote,
} from "../services/notificationHelper.js";
import OtherUserProfile from "./OtherUserProfile.jsx";
import BlockConfirmModal from "../components/BlockConfirmModal.jsx";

export default function CommentModal({ openModal, user_id, closeModal, postData, fetchPosts, onDelete, blockedUserIds }) {
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [commentImage, setCommentImage] = useState(null);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isProfilePageOpen, setIsProfilePageOpen] = useState(false);

  const [selectedPost, setSelectedPost] = useState(null);
  const deleteModalRef = useRef();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [savedPostIds, setSavedPostIds] = useState(new Set());
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState("");
  const [reportType, setReportType] = useState(null);
  const [reportedBy, setReportedBy] = useState(null);
  const [reportedUID, setReportedUID] = useState(null);
  const [contentId, setContentId] = useState(null);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [openMoreModalPost, setOpenMoreModalPost] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [isOtherUserProfileOpen, setIsOtherUserProfileOpen] = useState(false);

  const [openMoreComment, setOpenMoreComment] = useState(null);
  const [commentSortOption, setCommentSortOption] = useState("newest");
  const [deletedComment, setDeletedComment] = useState(null);
  const [undoTimer, setUndoTimer] = useState(null);
  const [commentUpTally, setCommentUpTally] = useState({});
  const [commentDownTally, setCommentDownTally] = useState({});
  const [commentVoteState, setCommentVoteState] = useState({});
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [upTally, setUpTally] = useState({});
  const [downTally, setDownTally] = useState({});
  const [voteState, setVoteState] = useState({});
  const [isBlockConfirmOpen, setIsBlockConfirmOpen] = useState(false);

  const [userToBlock, setUserToBlock] = useState(null);
  const user = getUser();
  const username = user?.username || null;
  const textareaRef = useRef(null);

  const refreshPostData = async () => {
    if (!selectedPost?.post_id) return;

    try {
      const res = await fetch(
        `http://localhost/SociaTech/backend/auth/fetchSinglePost.php?post_id=${selectedPost.post_id}`
      );
      const data = await res.json();

      if (data.success && data.post) {
        setSelectedPost(data.post);

        // Use object format
        setUpTally({ [data.post.post_id]: data.post.up_tally_post || 0 });
        setDownTally({ [data.post.post_id]: data.post.down_tally_post || 0 });
      }
    } catch (err) {
      console.error("Error refreshing post data:", err);
    }
  };

  // Update the onCloseModal function to include refresh
  const onCloseModal = async () => {
    // Refresh post data when edit modal closes
    await refreshPostData();

    setEditModalOpen(false);
    setOpenMoreComment(false);
    setOpenMoreModalPost(false);
  };

  useEffect(() => {
    const initializePostData = async () => {
      if (!postData) return;

      setSelectedPost(postData);

      // Initialize tallies
      setUpTally({ [postData.post_id]: postData.up_tally_post || 0 });
      setDownTally({ [postData.post_id]: postData.down_tally_post || 0 });

      // Fetch fresh data from backend to ensure accuracy
      try {
        const res = await fetch(
          `http://localhost/SociaTech/backend/auth/fetchSinglePost.php?post_id=${postData.post_id}`
        );
        const data = await res.json();

        if (data.success && data.post) {
          setSelectedPost(data.post);
          setUpTally({ [data.post.post_id]: data.post.up_tally_post || 0 });
          setDownTally({ [data.post.post_id]: data.post.down_tally_post || 0 });
        }
      } catch (err) {
        console.error("Error fetching post data:", err);
      }

      // Fetch user's vote state
      if (user_id) {
        const userVotes = await fetchUserVotes(user_id);
        setVoteState(userVotes);

        const userCommentVotes = await fetchCommentsUserVotes(user_id);
        setCommentVoteState(userCommentVotes);
      }
    };

    initializePostData();
  }, [postData?.post_id, user_id, isBlockConfirmOpen]);

  const fetchCommentsUserVotes = async (userId) => {
    if (!userId) return {};

    try {
      const res = await fetch(
        `http://localhost/SociaTech/backend/auth/getCommentUserVotes.php?user_id=${userId}`
      );
      const data = await res.json();

      if (data.success) {
        const voteObj = {};
        data.votes.forEach(vote => {
          voteObj[vote.comment_id] = vote.vote_type === 1 ? 'up' : 'down';
        });
        return voteObj;
      }
      return {};
    } catch (err) {
      console.error("Error fetching user votes:", err);
      return {};
    }
  };

  const handleToggleCommentVote = async (userId, commentId, type) => {
    if (!userId) {
      toast.error("You must be logged in to vote.");
      return;
    }

    const currentVote = commentVoteState[commentId];
    const newVoteType = currentVote === type ? null : type;

    // USE || 0 to handle undefined
    const originalUpTally = commentUpTally[commentId] || 0;
    const originalDownTally = commentDownTally[commentId] || 0;
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
    setCommentVoteState((prev) => ({ ...prev, [commentId]: newVoteType }));
    setCommentUpTally((prev) => ({ ...prev, [commentId]: newUpTally }));
    setCommentDownTally((prev) => ({ ...prev, [commentId]: newDownTally }));

    // Prepare vote type for backend (1=up, 0=down, null=remove)
    let voteTypeToBackend = newVoteType === "up" ? 1 : newVoteType === "down" ? 0 : null;

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

      const data = await res.json();

      if (data.success) {
        // Fetch updated tallies from the backend to ensure accuracy
        const commentRes = await fetch(
          `http://localhost/SociaTech/backend/auth/fetchSingleComment.php?comment_id=${commentId}`
        );
        const commentData = await commentRes.json();

        if (commentData.success && commentData.comment) {
          setCommentUpTally((prev) => ({
            ...prev,
            [commentId]: commentData.comment.up_tally_comment,
          }));
          setCommentDownTally((prev) => ({
            ...prev,
            [commentId]: commentData.comment.down_tally_comment,
          }));

          // Update the comment in the comments array too
          setComments((prev) =>
            prev.map(c =>
              c.comment_id === commentId
                ? {
                  ...c,
                  up_tally_comment: commentData.comment.up_tally_comment,
                  down_tally_comment: commentData.comment.down_tally_comment
                }
                : c
            )
          );
        }
      } else {
        // Revert UI changes if backend fails
        setCommentVoteState((prev) => ({ ...prev, [commentId]: originalVoteState }));
        setCommentUpTally((prev) => ({ ...prev, [commentId]: originalUpTally }));
        setCommentDownTally((prev) => ({ ...prev, [commentId]: originalDownTally }));
        toast.error("Failed to vote. Please try again.");
      }
    } catch (err) {
      console.error("Error sending vote:", err);
      // Revert UI changes on error
      setCommentVoteState((prev) => ({ ...prev, [commentId]: originalVoteState }));
      setCommentUpTally((prev) => ({ ...prev, [commentId]: originalUpTally }));
      setCommentDownTally((prev) => ({ ...prev, [commentId]: originalDownTally }));
      toast.error("Error voting. Please check your connection.");
    }
  };

  const fetchUserVotes = async (userId) => {
    if (!userId) return {};

    try {
      const res = await fetch(
        `http://localhost/SociaTech/backend/auth/getUserVotes.php?user_id=${userId}`
      );
      const data = await res.json();

      if (data.success) {
        const voteObj = {};
        data.votes.forEach(vote => {
          voteObj[vote.post_id] = vote.vote_type === 1 ? 'up' : 'down';
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
    let voteTypeToBackend = newVoteType === "up" ? 1 : newVoteType === "down" ? 0 : null;

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
          setSelectedPost((prev) => ({
            ...prev,
            up_tally_post: postData.post.up_tally_post,
            down_tally_post: postData.post.down_tally_post
          }));
        }

        // Create notification for upvote
        if (newVoteType === "up") {
          if (selectedPost && selectedPost.user_id !== userId) {
            await notifyPostUpvote(
              selectedPost.user_id,
              userId,
              username,
              postId
            );
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

  useEffect(() => {
    let pollInterval;

    if (openModal && selectedPost?.post_id) {
      // fetch agad
      fetchComments(selectedPost.post_id, commentSortOption);

      // saka interval
      pollInterval = setInterval(() => {
        fetchComments(selectedPost.post_id, commentSortOption);
      }, 5000);
    }

    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [openModal, selectedPost?.post_id, commentSortOption]);

  const handleCommentImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCommentImage(file);
    }
  };

  const handleSortChange = (e) => {
    setCommentSortOption(e.target.value);
    fetchComments(selectedPost.post_id, e.target.value);
  };

  const handleCommentTextChange = (e) => {
    setCommentText(e.target.value);
  };

  const toggleMoreComment = (commentId) => {
    setOpenMoreComment(prev => prev === commentId ? null : commentId);
  };

  const toggleMoreModalPost = (postId) => {
    setOpenMoreModalPost(prev => prev === postId ? null : postId);
  };

  if (!openModal || !selectedPost) return null;

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
        toast.success("Comment restored successfully!");
      } else {
        toast.error("Failed to restore comment: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      toast.error("Something went wrong while restoring. Please try again.");
    }
  };

  const handleSavePost = async (postId) => {
    if (!user_id) {
      toast.error('You must be logged in to save posts');
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

      const data = await res.json();

      if (data.success) {
        // Update local state
        setSavedPostIds(prev => {
          const newSet = new Set(prev);
          if (data.action === 'saved') {
            newSet.add(postId);
            toast.success('Post saved successfully!');
          } else {
            newSet.delete(postId);
            toast.success('Post unsaved successfully!');
          }
          return newSet;
        });

        setOpenMoreComment(null);
      } else {
        toast.error(data.message || 'Failed to save/unsave post');
      }
    } catch (err) {
      console.error('Error saving post:', err);
      toast.error('An error occurred while saving the post');
    }
  };

  const handleReplyToComment = (comment) => {
    setCommentText(`@${comment.username} `);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleEditButtonClick = (post) => {
    setSelectedPost(post);
    setEditModalOpen(true);
  };

  const handleDeleteClick = (post) => {
    deleteModalRef.current.open(post);
  };

  const setReportData = (type, reportedBy, reportedUID, contentId) => {
    setReportType(type);
    setReportedBy(reportedBy);
    setReportedUID(reportedUID);
    setIsReportOpen(true);
    setContentId(contentId);
  };

  const handleCommentSubmit = async () => {
    if (!user_id) {
      toast.error("You must be logged in to comment.");
      return;
    }

    if (!selectedPost || !selectedPost.post_id) {
      toast.error("Error: Post information is missing.");
      return;
    }

    if (!commentText.trim() && !commentImage) {
      toast.error("You must add text or upload an image");
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
        toast.success("Comment added successfully!");
      } else {
        toast.error("Failed to add comment: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      toast.error("Something went wrong while posting. Please try again.");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const openOtherUserProfile = (userId) => {
    if (userId === user_id) {
      openProfilePage();
    }

    setSelectedUserId(userId);
    setIsOtherUserProfileOpen(true);
  }

  const fetchComments = async (post_id, sortBy = "newest") => {
    try {
      const res = await fetch(
        `http://localhost/SociaTech/backend/auth/fetchComments.php?post_id=${post_id}&sort=${sortBy}`
      );
      const data = await res.json();

      if (data.success && data.comments) {
        const filteredComments = data.comments.filter(
          comment => !blockedUserIds.includes(comment.user_id)
        );

        setComments(filteredComments);

        const upObj = {};
        const downObj = {};

        filteredComments.forEach((c) => {
          upObj[c.comment_id] = c.up_tally_comment || 0;
          downObj[c.comment_id] = c.down_tally_comment || 0;
        });

        setCommentUpTally(upObj);
        setCommentDownTally(downObj);

      } else {
        setComments([]);
      }
    } catch (err) {
      console.error("Error fetching comments:", err);
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
        toast.success("Comment deleted! You have 30 seconds to undo.");
      } else {
        toast.error("Failed to delete comment: " + (data.message || "Unknown error"));
      }
    } catch (err) {
      console.error("Error deleting comment:", err);
      toast.error("Something went wrong while deleting. Please try again.");
    }
  };

  const handleSaveEdit = async (commentId) => {
    if (!editingCommentText.trim()) {
      toast.error("Comment content cannot be empty");
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
        toast.success("Comment updated successfully!");
      } else {
        toast.error("Failed to update comment: " + (data.message || "Unknown error"));
      }
    } catch (err) {
      console.error("Error updating comment:", err);
      toast.error("Something went wrong while updating. Please try again.");
    }
  };

  const resetCommentFields = () => {
    setCommentText("");
    setCommentImage(null);
    const fileInput = document.getElementById("commentImageInput");
    if (fileInput) fileInput.value = "";
  };

  const closeOtherUserProfile = () => {
    setIsOtherUserProfileOpen(false);
  };

  const closeReport = () => setIsReportOpen(false);

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

  const closeProfilePage = () => setIsProfilePageOpen(false);

  const openProfilePage = () => {
    setIsProfilePageOpen(true);
    setIsDropDownOpen(false);
  };

  const handleBlockUser = (userId, username) => {
    setUserToBlock({ userId, username });
    setIsBlockConfirmOpen(true);
    setOpenMoreComment(null);
    setOpenMoreModalPost(null);
  };

  const confirmBlock = async () => {
    if (!user_id || !userToBlock) return;

    try {
      const formData = new FormData();
      formData.append("user_id", user_id);
      formData.append("blocked_user_id", userToBlock.userId);

      const response = await fetch(
        "http://localhost/SociaTech/backend/auth/handleBlockUser.php",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        console.error('HTTP error blocking user:', response.status);
        toast.error("Failed to block user. Server error.");
        return;
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.error("Server returned non-JSON response");
        toast.error("Failed to block user. Invalid server response.");
        return;
      }

      const data = await response.json();

      if (data.success) {
        toast.success("User blocked successfully!");

        setIsBlockConfirmOpen(false);
        setUserToBlock(null);

        fetchPosts();
      } else {
        toast.error(data.message || "Failed to block user");
      }
    } catch (error) {
      console.error("Error blocking user:", error);
      toast.error("An error occurred while blocking the user");
    }
  };


  return (<>
    {openModal && selectedPost && (
      <div className="commentModal_backDrop" onClick={closeModal}>
        <div className="commentModal_container" onClick={(e) => e.stopPropagation()}>
          <div className="commentModal_header">
            <span className="commentModal_headerTitle">
              {selectedPost.username}'s post
            </span>
            <button
              className="commentModal_exitBtn"
              onClick={() => {
                closeModal();
                onCloseModal();
              }}
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>

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
                  onClick={(e) => {
                    e.stopPropagation();
                    openOtherUserProfile(
                      selectedPost.user_id
                    );
                  }
                  }
                >
                  {selectedPost.username}
                </div>
                <div className="commentModal_date">
                  {timeAgo(selectedPost.created_at)}
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
                            handleEditButtonClick(selectedPost);
                          }}
                        >
                          <Edit size={18} />
                          <span>Edit</span>
                        </div>
                        <div
                          className="commentModal_dropdownItem"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(selectedPost);
                          }}
                        >
                          <Trash2 size={18} />
                          <span>Delete</span>
                        </div>
                      </>
                    )}
                    {user_id !== selectedPost.user_id && (<div className="dropdown_item" onClick={(e) => {
                      e.stopPropagation();
                      handleSavePost(selectedPost.post_id);
                    }}>
                      <Bookmark
                        size={18}
                        fill={savedPostIds.has(selectedPost.post_id) ? "currentColor" : "none"}
                      />
                      <span>{savedPostIds.has(selectedPost.post_id) ? "Unsave" : "Save"}</span>
                    </div>)}
                    {selectedPost.user_id !== user_id && (
                      <div
                        className="commentModal_dropdownItem"
                        onClick={(e) => {
                          e.stopPropagation();

                          setReportData(
                            "post",
                            user_id,
                            selectedPost.user_id,
                            selectedPost.post_id
                          );
                        }}
                      >
                        <AlertCircle size={18} />
                        <span>Report</span>
                      </div>
                    )}
                    {selectedPost.user_id !== user_id && (<div
                      className="dropdown_item"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBlockUser(selectedPost.user_id, selectedPost.username);
                      }}
                    >
                      <UserX size={18} />
                      <span>Block User</span>
                    </div>)}
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
                className={voteState[selectedPost.post_id] === 'up' ? 'comment_up_vote_btn active' : 'comment_up_vote_btn'}
                onClick={() => handleToggleVote(user_id, selectedPost.post_id, "up")}
              >
                <ArrowBigUp fill={voteState[selectedPost.post_id] === 'up' ? 'currentColor' : 'none'} />
                {upTally[selectedPost.post_id] ?? selectedPost.up_tally_post}
              </button>

              <button
                className={voteState[selectedPost.post_id] === 'down' ? 'comment_down_vote_btn active' : 'comment_down_vote_btn'}
                onClick={() => handleToggleVote(user_id, selectedPost.post_id, "down")}
              >
                <ArrowBigDown fill={voteState[selectedPost.post_id] === 'down' ? 'currentColor' : 'none'} />
                {downTally[selectedPost.post_id] ?? selectedPost.down_tally_post}
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
                          openOtherUserProfile(
                            comment.user_id
                          )
                        }
                      >{comment.username}</div>

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
                              {comment.user_id !== user_id && (<div
                                className="dropdown_item"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleBlockUser(comment.user_id, comment.username);
                                }}
                              >
                                <UserX size={18} />
                                <span>Block User</span>
                              </div>)}
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
                        className={commentVoteState[comment.comment_id] === 'up' ? 'comment_up_vote_btn active' : 'comment_up_vote_btn'}
                        onClick={() => handleToggleCommentVote(user_id, comment.comment_id, "up")}
                      >
                        <ArrowBigUp fill={commentVoteState[comment.comment_id] === 'up' ? 'currentColor' : 'none'} />
                        {commentUpTally[comment.comment_id] ?? comment.up_tally_comment}
                      </button>

                      <button
                        className={commentVoteState[comment.comment_id] === 'down' ? 'comment_down_vote_btn active' : 'comment_down_vote_btn'}
                        onClick={() => handleToggleCommentVote(user_id, comment.comment_id, "down")}
                      >
                        <ArrowBigDown fill={commentVoteState[comment.comment_id] === 'down' ? 'currentColor' : 'none'} />
                        {commentDownTally[comment.comment_id] ?? comment.down_tally_comment}
                      </button>

                      <button
                        className="comment_reply_btn"
                        onClick={() => handleReplyToComment(comment)}
                      >
                        Reply
                      </button>


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
                  onClick={() => {
                    closeModal();
                    onCloseModal();
                  }}
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

    <DeletePostModal
      ref={deleteModalRef}
      user_id={user_id}
      onDelete={onDelete}
    />
    <EditPostModal
      key={selectedPost?.post_id || 'edit-modal'}
      open={editModalOpen}
      postData={selectedPost}
      fetchPost={async () => {
        // Refresh the post in the comment modal
        await refreshPostData();
        // Also refresh the posts list if fetchPosts is available
        if (fetchPosts) {
          await fetchPosts();
        }
      }}
      user_id={user_id}
      onClose={onCloseModal}
    />

    {/* otherUserModal */}
    <OtherUserProfile openModal={isOtherUserProfileOpen} uid={selectedUserId} closeModal={closeOtherUserProfile} />
    <ProfilePage
      style={isProfilePageOpen ? "flex" : "none"}
      closeProfilePage={closeProfilePage}

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
  </>)
}