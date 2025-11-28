
import DeletePostModal from "./DeletePostModal";
import EditPostModal from "./EditPostModal";
import "../pages/Home.css";
import Report from "./Report";
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

import { useCycle } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import moreBtn from "../assets/moreBtn.png";
import { getUser } from "../utils/storage.js";
import pfpImage from "../assets/deault_pfp.png";

import Settings from "../components/Settings.jsx";
import TrippleDots from "../assets/moreBtn.png";
import HelpPage from "../components/HelpPage.jsx";


import {
  notifyPostComment,
  notifyPostUpvote,
  notifyCommentUpvote,
} from "../services/notificationHelper.js";




export default function CommentModal({openModal,user_id,closeModal, postData, fetchPosts, onDelete}){
    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState("");
  const [commentImage, setCommentImage] = useState(null);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  
 
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
  const [voteState, setVoteState] = useState({});;
   const user = getUser();
  const username = user?.username || null;

  useEffect(()=>{
    if(postData){
      console.log(postData);
      setSelectedPost(postData);
      
      setUpTally(postData.up_tally_post);
      setDownTally(postData.down_tally_post);

      // Fetch user's vote state and wait for it to complete
      const fetchVotes = async()=>{
      if (user_id) {
        const userVotes = await fetchUserVotes(user_id);
        setVoteState(userVotes);
      }
    }

    fetchVotes();

    }
  },[postData]);


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
        // vote_type: 1 = up, 0 = down
        voteObj[vote.post_id] = vote.vote_type === 1 ? 'up' : 'down';
      });
      return voteObj;
    }
    return {};
  } catch (err) {
    console.log("Error fetching user votes:", err);
    return {};
  }
};



const handleToggleVote = async (userId, postId, type) => {
  if (!userId) {
    alert("You must be logged in to vote.");
    return;
  }

  const currentVote = voteState[postId];
  
  // Determine new vote type
  // If clicking same button, remove vote. If clicking different button, switch vote.
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
      console.log("Vote failed:", data.message);
      setVoteState((prev) => ({ ...prev, [postId]: originalVoteState }));
      setUpTally((prev) => ({ ...prev, [postId]: originalUpTally }));
      setDownTally((prev) => ({ ...prev, [postId]: originalDownTally }));
      alert("Failed to vote. Please try again.");
    }
  } catch (err) {
    console.log("Error sending vote:", err);
    // Revert UI changes on error
    setVoteState((prev) => ({ ...prev, [postId]: originalVoteState }));
    setUpTally((prev) => ({ ...prev, [postId]: originalUpTally }));
    setDownTally((prev) => ({ ...prev, [postId]: originalDownTally }));
    alert("Error voting. Please check your connection.");
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

 const onCloseModal =()=>{
    setEditModalOpen(false);
   setOpenMoreComment(false);
      setOpenMoreModalPost(false);
  }

   const handleCommentImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCommentImage(file);
    }
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
        alert("Comment restored successfully!");
      } else {
        alert("Failed to restore comment: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      alert("Something went wrong while restoring. Please try again.");
    }
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

      const data = await res.json();

      if (data.success) {
        // Update local state
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

        setOpenMoreComment(null); // Close comment modal dropdown if open
      } else {
        alert(data.message || 'Failed to save/unsave post');
      }
    } catch (err) {
      console.error('Error saving post:', err);
      alert('An error occurred while saving the post');
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

  //  const handlePostDeleted = (deletedPostId) => {
  //   setPosts((prev) => prev.filter((post) => post.post_id !== deletedPostId));
  // };

  const handleDeleteClick = (post) => {
    deleteModalRef.current.open(post); // Open modal for this post
  };

  const setReportData = (type, reportedBy, reportedUID, contentId) => {
    setReportType(type);
    setReportedBy(reportedBy);
    setReportedUID(reportedUID);
    setIsReportOpen(true);
    setContentId(contentId);
  };

  // pang add ng comments

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





 //pang kuha ng mga comments:
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

  // pang edit ng comment

   const handleEditComment = (comment) => {
    setEditingCommentId(comment.comment_id);
    setEditingCommentText(comment.comment_content || "");
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditingCommentText("");
  };

  //pang delete ng comments
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

   const resetCommentFields = () => {
    setCommentText("");
    setCommentImage(null);
    const fileInput = document.getElementById("commentImageInput");
    if (fileInput) fileInput.value = "";
  };

  
  const closeReport = () => setIsReportOpen(false);

    return(<>
  {openModal && selectedPost && (
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
                              <div className="dropdown_item" onClick={(e) => {
                                e.stopPropagation();
                                handleSavePost(selectedPost.post_id);
                              }}>
                              <Bookmark 
                                size={18} 
                                fill={savedPostIds.has(selectedPost.post_id) ? "currentColor" : "none"}
                              />
                              <span>{savedPostIds.has(selectedPost.post_id) ? "Unsave" : "Save"}</span>
                            </div>
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
                                    handleUsernameClick(
                                      comment.user_id,
                                      comment
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
                            onClick={()=>{
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
  open={editModalOpen} 
  postData={postData}
  fetchPost={fetchPosts}
  user_id={user_id}
/>
    </>)
}