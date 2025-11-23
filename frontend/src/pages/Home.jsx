import Nav from "../components/Nav";
import Report from "../components/Report";
import CategorySlider from "../components/CategorySlider";
import PageHeader from "../components/PageHeader";
import ProfilePage from "../components/ProfilePage";
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
import { useEffect, useState,useRef } from "react";
import moreBtn from "../assets/moreBtn.png";
import { getUser } from "../utils/storage";
import pfpImage from "../assets/deault_pfp.png";

import Settings from "../components/Settings.jsx";
import TrippleDots from "../assets/moreBtn.png"
import DraftPage from "../components/DraftPage.jsx";
import HelpPage from "../components/HelpPage.jsx";
import AdminPanel from "./AdminPanel.jsx";

export default function Homepage() {
  const [posts, setPosts] = useState([]);
  const [openMore, setOpenMore] = useState(null);
    const [openMorePost, setOpenMorePost] = useState(null);
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
  const [isNotificationBarOpen,cycleNotificationBarOpen]=useCycle(false,true);
  const [isOtherUserProfileOpen,setIsOtherUserProfileOpen]=useState(false);
  const [openOtherUserMoreContainer,cycleOpenOtherUserMoreContainer]=useCycle(false,true);
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
  const [openDraftPage, cycleOpenDraftPage] = useCycle(false,true);
  const [openHelpPage,cycleOpenHelpPage] = useCycle(false,true)

  

  const user = getUser();
  const user_id = user?.id || null;

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



  const toggleDropDown = () => setIsDropDownOpen((prev) => !prev);

  const openProfilePage = () => {
    setIsProfilePageOpen(true);
    setIsDropDownOpen(false); // ⬅ auto-close dropdown
  };
  const openSetting = () => {
    setIsSettingOpen(true);
    setIsDropDownOpen(false); // ⬅ auto-close dropdown
  };
  const handleOpenDraftPage = ()=>{
    cycleOpenDraftPage();
    setIsDropDownOpen(false);
  }
  const handleOpenHelpPage = ()=>{
    cycleOpenHelpPage();
    setIsDropDownOpen(false);
  }
  const closeProfilePage = () => setIsProfilePageOpen(false);
  const closeSetting=()=> setIsSettingOpen(false);

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
      if (data.success&& data.comments) {
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

   const ToggleMoreMenu = (post_id) => {
    setOpenMore((prev) => (prev === post_id ? null : post_id));
  };
  const toggleMorePost = (post_id) => {
    setOpenMorePost((prev) => (prev === post_id ? null : post_id));
    setOpenMoreComment(null);
  };
  const toggleMoreComment = (post_id) => {
    setOpenMoreComment((prev) => (prev === post_id ? null : post_id));
    setOpenMorePost(null); 
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
    setCommentUpTally((prev) => ({ ...prev, [commentId]: (prev[commentId] ?? 0) + upDelta }));
    setCommentDownTally((prev) => ({ ...prev, [commentId]: (prev[commentId] ?? 0) + downDelta }));

    let voteTypeToBackend = newVoteType === "up" ? 1 : newVoteType === "down" ? 0 : null;

    try {
      const res = await fetch("http://localhost/SociaTech/backend/auth/handleCommentVote.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          comment_id: commentId,
          user_id: userId,
          vote_type: voteTypeToBackend,
        }),
      });

      const text = await res.text();
      let data;
      try {
        data = text ? JSON.parse(text) : { success: false, message: "Empty response" };
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
      const res = await fetch("http://localhost/SociaTech/backend/auth/editComment.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          comment_id: commentId,
          user_id: user_id,
          comment_content: editingCommentText,
        }),
      });

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

    const commentToDelete = comments.find(c => c.comment_id === commentId);

    try {
      const res = await fetch("http://localhost/SociaTech/backend/auth/deleteComment.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          comment_id: commentId,
          user_id: user_id,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setDeletedComment({
          ...commentToDelete,
          comment_id: commentId,
          post_id: selectedPost.post_id,
          deletedAt: Date.now()
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
      const res = await fetch("http://localhost/SociaTech/backend/auth/updatePost.php", {
        method: "POST",
        body: formData,
      });

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
      const res = await fetch("http://localhost/SociaTech/backend/auth/deletePost.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          post_id: postToDelete.post_id,
          user_id: user_id,
        }),
      });

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
    setUpTally((prev) => ({ ...prev, [postId]: (prev[postId] ?? 0) + upDelta }));
    setDownTally((prev) => ({ ...prev, [postId]: (prev[postId] ?? 0) + downDelta }));

    let voteTypeToBackend = newVoteType === "up" ? 1 : newVoteType === "down" ? 0 : null;

    try {
      const res = await fetch("http://localhost/SociaTech/backend/auth/handleVote.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post_id: postId, user_id: userId, vote_type: voteTypeToBackend }),
      });

      const text = await res.text();
      let data;
      try {
        data = text ? JSON.parse(text) : { success: false, message: "Empty response" };
      } catch {
        data = { success: false, message: "Invalid JSON" };
      }

      if (!data.success) console.log("Vote failed:", data.message);
    } catch (err) {
      console.log("Error sending vote:", err);
    }
  };

  const openReport = (post) => {
    setSelectedPost(post);
    setIsReportOpen(true);
    setOpenMorePost(null);
    setOpenMoreComment(null);
  };

  const closeReport = () => {
    setIsReportOpen(false);
    // Don't reset selectedPost here kung may open na comment modal
    if (!isCommentModalOpen) {
      setSelectedPost(null);
    }
    // Close the dropdown menu when closing report
    setOpenMorePost(null);
    setOpenMoreComment(null);;
  };

  const openComments = async(post) => {
    setSelectedPost(post);
    setIsCommentModalOpen(true);
    setOpenMore(null);
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
    setIsReportOpen(false);
    setOpenMorePost(null);
    setOpenMoreComment(null);
    setComments([]);
    resetCommentFields();
  };



  // Filter posts based on selected category
  const filteredPosts =
    selectedCategory === "All"
      ? posts
      : posts.filter((post) => post.post_category === selectedCategory);

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
        openNotificationBar={isNotificationBarOpen}
        closeNotificationBar={()=>cycleNotificationBarOpen()}
        openDraftPage={handleOpenDraftPage}
        openHelpPage={handleOpenHelpPage}
        
      />
      <div className="page_body">
        <Nav currentPage="home" />
        <div className="home_main_container">
          <CategorySlider
            onCategoryChange={setSelectedCategory}
            selectedCategory={selectedCategory}
          />
          <ProfilePage
            style={isProfilePageOpen ? "flex" : "none"}
            closeProfilePage={closeProfilePage}
          />
           <DraftPage isDraftPageOn={openDraftPage} closeDraftPage={cycleOpenDraftPage}/>

            <HelpPage openPage={openHelpPage} closePage={cycleOpenHelpPage}/>
          <Settings style={isSettingOpen ? 'flex' : 'none'}
          closeSetting={closeSetting}/>
          <div className="post_container">
            {filteredPosts.length === 0 ? (
              <p>
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
                        <img src={pfpImage} alt="user_pfp" />
                      </div>
                      <div className="post_username">{post.username}</div>
                      <div className="post_date">{timeAgo(post.post_date)}</div>
                      <div className="post_category">{post.post_category}</div>
                    </div>
                    <div className="more_menu_container">
                      <div
                        className="more_btn"
                        onClick={() => toggleMorePost(post.post_id)}
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
                          <div className="dropdown_item">
                            <Bookmark size={18} />
                            <span>Save</span>
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
                    <div className="post_card_content">{post.post_content}</div>
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
                                     <img src={pfpImage} alt="user_pfp" />
                                   </div>
                                  <div className="commentModal_username">{selectedPost.username}</div>
                                  <div className="commentModal_date">{selectedPost.post_date}</div>
                                  <div className="commentModal_category">{selectedPost.post_category}</div>
                                 </div>
                                 <div className="commentModal_moreMenu">
                                   <div
                                     className="commentModal_moreBtn"
                                     onClick={() => toggleMoreComment(selectedPost.post_id)}
                                   >
                                     <img src={moreBtn} alt="" className="commentModal_moreIcon" />
                                   </div>
                                   {openMoreComment === selectedPost.post_id && (
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
                              <div className="commentModal_dropdownItem">
                                         <Bookmark size={18} />
                                         <span>Save</span>
                                       </div>
                                       <div
                                         className="commentModal_dropdownItem"
                                         onClick={(e) => {
                                           e.stopPropagation();
                                           openReport(selectedPost);
                                         }}
                                       >
                                         <AlertCircle size={18} />
                                         <span>Report</span>
                                       </div>
                                     </div>
                                   )}
                                 </div>
                               </div>
           
                                <div className="commentModal_title">{selectedPost.post_title}</div>

                      {selectedPost.post_content && <div className="commentModal_content">{selectedPost.post_content}</div>}
                               {selectedPost.post_image && (
                                 <div className="commentModal_imageContainer">
                                   <img src={selectedPost.post_image} alt="post_image" />
                                 </div>
                               )}
           
                               <div className="commentModal_btnRow">
                                 <button className="commentModal_commentBtn">Comment</button>
                                 <button
                                   className={`up_vote_btn ${voteState[selectedPost.post_id] === "up" ? "voted" : ""
                                     }`}
                                   onClick={() =>
                                     handleToggleVote(user_id, selectedPost.post_id, "up")
                                   }
                                 >
                                   <ArrowBigUp />
                                   {upTally[selectedPost.post_id]}
                                 </button>
                                 <button
                                   className={`down_vote_btn ${voteState[selectedPost.post_id] === "down"
                                       ? "voted"
                                       : ""
                                     }`}
                                   onClick={() =>
                                     handleToggleVote(user_id, selectedPost.post_id, "down")
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
                        <label htmlFor="comment-sort" className="comment_sort_label">Sort by:</label>
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
                                  <p style={{ textAlign: "center", color: "#888", padding: "20px" }}>
                                    No comments yet. Be the first to comment!
                                  </p>
                                ) : (comments.map((comment, index) => (
                                     <div key={comment.comment_id || index} className="commentModal_commentItem">
                                      
                                      <div className="commentModal_commentHeader">
                                <div className="commentModal_pfp">
                                  <img src={comment.profile_image || pfpImage} alt="commenter_pfp" />
                                </div>
                                <div className="commentModal_commentUsername">
                                  {comment.username || "Anonymous"}
                                </div>

                                <div className="commentModal_commentDate">
                                  {comment.comment_date
                                    ? new Date(comment.comment_date).toLocaleDateString()
                                    : "Just now"}
                                </div>
                              </div>
                                {editingCommentId === comment.comment_id ? (
                                <div className="comment_edit_container">
                                  <textarea
                                    className="comment_edit_textarea"
                                    value={editingCommentText}
                                    onChange={(e) => setEditingCommentText(e.target.value)}
                                    onInput={(e) => {
                                      e.target.style.height = "auto";
                                      e.target.style.height = e.target.scrollHeight + "px";
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
                                      onClick={() => handleSaveEdit(comment.comment_id)}
                                    >
                                      Save
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <div className="commentModal_commentText">
                                    {comment.comment_content || ""}
                                  </div>

                                  {comment.comment_image && (
                                    <div className="commentModal_commentImage">
                                      <img src={comment.comment_image} alt="comment_attachment" />
                                    </div>
                                  )}
                                </>
                              )}

                              <div className="commentModal_commentActions">
                                <button
                                  className={`comment_up_vote_btn ${commentVoteState[comment.comment_id] === "up" ? "voted" : ""}`}
                                  onClick={() => handleCommentVote(user_id, comment.comment_id, "up")}
                                >
                                  <ArrowBigUp size={18} />
                                  {commentUpTally[comment.comment_id] || 0}
                                </button>

                                <button
                                  className={`comment_down_vote_btn ${commentVoteState[comment.comment_id] === "down" ? "voted" : ""}`}
                                  onClick={() => handleCommentVote(user_id, comment.comment_id, "down")}
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
                                  console.log('Comment user_id:', comment.user_id, 'Current user_id:', user_id, 'Match:', comment.user_id == user_id);
                                  return null;
                                })()}

                                {comment.user_id == user_id && (
                                  <>
                                    <button
                                      className="comment_edit_btn"
                                      onClick={() => handleEditComment(comment)}
                                    >
                                      <Edit size={18} />
                                      Edit
                                    </button>

                                    <button
                                      className="comment_delete_btn"
                                      onClick={() => handleDeleteComment(comment.comment_id)}
                                    >
                                      <Trash2 size={18} />
                                      Delete
                                    </button>
                                  </>
                                )}
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
                                     e.target.style.height = e.target.scrollHeight + "px";
                                   }}
                                 />
                                 {commentImage && (<div className="comment_image_preview_container">
                        
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
                                post={selectedPost}
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
                <label htmlFor="editPostImageInput" className="editPost_uploadBtn">
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
              Are you sure you want to delete this post? This action cannot be undone.
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
        </div> )}

                      
                      <div className="otherUserProfile_parent_container" style={isOtherUserProfileOpen?{display:'flex'}:{display:'none'}}>
                          <button className="otherUserProfile_close_btn" onClick={()=>setIsOtherUserProfileOpen(false)}><X className="crossSvg"/></button>
                          <div className="otherUserProfile_header_container">
                                <div className="otherUserProfile_detail_container">
                                  <img src={pfpImage} alt=""  className="otherUserPfp"/>
                                  <div className="userNameBio_container">
                                    <div className="otherUserProfile_username">Username</div>
                                    <div className="otherUserProfile_bio">bio</div>
                                  </div>
                                </div>
                                <div className="otherUserProfile_stats_container">
                                    <div className="otherUserProfile_stats_childContainer">
                                        <div>0</div>
                                        <div>Posts</div>
                                    </div>
                                    <div className="otherUserProfile_stats_childContainer">
                                        <div>0</div>
                                        <div>Following</div>
                                    </div>
                                    <div className="otherUserProfile_stats_childContainer">
                                        <div>0</div>
                                        <div>Followers</div>
                                    </div>
                            </div>
                            <button className="otherUserProfile_more_btn"onClick={()=>cycleOpenOtherUserMoreContainer()} ><img src={TrippleDots} alt="" /></button>
                            <div className="otherUserProfile_more_container" style={openOtherUserMoreContainer?{display:'flex'}:{display:'none'}}>
                              <div className="otherUserProfile_more_option"><Ban/>Block</div>
                              <div className="otherUserProfile_more_option"><AlertCircle/>Report</div>
                            </div>
                          </div>
                          <div className="followBtn_container">
                            <div className="followBtn">Follow</div>
                            
                          </div>
                          <div className="otherUserProfile_parent_postContainer">
                            <div className="otherUserProfile_container_title">
                                Posts
                            </div>
                            <div></div>
                          </div>
                      </div>

                     

                        
  </>);
}
