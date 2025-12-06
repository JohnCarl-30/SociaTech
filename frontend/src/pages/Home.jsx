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
  Image,
  X,
  Ban,
  Edit,
  Trash2,
  UserX,
  Globe,
  Users,
} from "lucide-react";
import "./Home.css";
import { useCycle, motion, AnimatePresence } from "framer-motion";
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
import OtherUserProfile from "../components/OtherUserProfile.jsx";
import BlockConfirmModal from "../components/BlockConfirmModal.jsx";

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


  const [isOtherUserProfileOpen, setIsOtherUserProfileOpen] = useState(false);



  const [commentSortOption, setCommentSortOption] = useState("newest");

  const [openHelpPage, setOpenHelpPage] = useState(false);
  const [highlightedPostId, setHighlightedPostId] = useState(null);
  const postRefs = useRef({});

  const [searchResults, setSearchResults] = useState([]);
  const [selectedOtherUser, setSelectedOtherUser] = useState(null);
  const [otherUserProfile, setOtherUserProfile] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState('');

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
          color: isPublic ? "black" : "black",
          border: `1px solid ${isPublic ? "#90caf9" : "#ffb74d"}`,
        }}
      >
        {isPublic ? <Globe size={12} /> : <Users size={12} />}
        <span>{isPublic ? "Public" : "Followers"}</span>
      </div>
    );
  }

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
        `http://localhost/SociaTech/backend/auth/fetchBlockedUsers.php?user_id=${numericUserId}`
      );

      if (!response.ok) {
        console.error('HTTP error fetching blocked users:', response.status);
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

  const handleUserClick = async (userId, userData) => {
    //if userId is same as the user logedin, open profilepage instead
    if (userId === user_id) {
      openProfilePage();
      clearSearch();
      return;
    }

    setIsLoadingOtherUserData(true);
    setSelectedOtherUser(userData);
    setIsOtherUserProfileOpen(true);
    setSelectedUserId(userId);

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
    openComments(post);
    setOpenMorePost(null);
    setComments([]);
    setCommentSortOption("newest");

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

  const openProfilePage = () => {
    setIsProfilePageOpen(true);
    setIsDropDownOpen(false); // ⬅ auto-close dropdown
  };

  const handleUsernameClick = async (userId, userData) => {

    //if userId is same as the user logedin, open profilepage instead
    if (userId === user_id) {
      openProfilePage();
      return;
    }


    setIsLoadingOtherUserData(true);
    setSelectedOtherUser(userData);
    setIsOtherUserProfileOpen(true);
    setSelectedUserId(userId);
    setOtherUserProfile(null);
    setOtherUserPosts([]);
    setIsFollowing(false);
    setFollowerCount(0);
    setFollowingCount(0);
    setIsCommentModalOpen(false);

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
    filtered = filtered.filter(post => !blockedUserIds.includes(post.user_id));


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
        const postIds = posts.map(p => p.post_id);


        const res = await fetch(
          'http://localhost/SociaTech/backend/auth/checkSavedPosts.php',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user_id: user_id,
              post_ids: postIds
            })
          }
        );

        const data = await res.json();
        if (data.success) {
          setSavedPostIds(new Set(data.saved_post_ids));
        }
      } catch (err) {
        console.error('Error fetching saved posts:', err);
      }
    };

    fetchSavedPostIds();
  }, [posts, user_id]);

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

        setOpenMorePost(null); // Close dropdown
        setOpenMoreComment(null); // Close comment modal dropdown if open
      } else {
        alert(data.message || 'Failed to save/unsave post');
      }
    } catch (err) {
      console.error('Error saving post:', err);
      alert('An error occurred while saving the post');
    }
  };

  useEffect(() => {
    fetchPost();
  }, [closeOtherUserProfile]);





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



  const toggleMorePost = (post_id) => {
    setOpenMorePost((prev) => (prev === post_id ? null : post_id));
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

  // Update the fetchPost function to initialize vote tallies
  const fetchPost = async () => {
    try {
      const res = await fetch(
        `http://localhost/SociaTech/backend/auth/fetchPost.php?current_user_id=${user_id}`
      );
      const data = await res.json();
      if (data.success) {
        setPosts(data.posts);

        // Initialize vote tallies from fetched posts
        const upObj = {};
        const downObj = {};
        data.posts.forEach(post => {
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
          setPosts((prev) =>
            prev.map(p =>
              p.post_id === postId
                ? { ...p, up_tally_post: postData.post.up_tally_post, down_tally_post: postData.post.down_tally_post }
                : p
            )
          );
        }

        // Create notification for upvote
        if (newVoteType === "up") {
          const post = posts.find((p) => p.post_id === postId);
          if (post && post.user_id !== userId) {
            await notifyPostUpvote(post.user_id, userId, user.username, postId);
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
        "http://localhost/SociaTech/backend/auth/handleBlockUser.php",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        alert("Failed to block user. Server error.");
        return;
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        alert("Failed to block user. Invalid server response.");
        return;
      }

      const data = await response.json();

      if (data.success) {
        alert("User blocked successfully!");
        setBlockedUserIds(prev => [...prev, userToBlock.userId]);
        setIsBlockConfirmOpen(false);
        setUserToBlock(null);

        await fetchBlockedUsers();
        fetchPost();
      } else {
        alert(data.message || "Failed to block user");
      }
    } catch (error) {
      console.error("Error blocking user:", error);
      alert("An error occurred while blocking the user");
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
                    className="post_card"
                    key={post.post_id}
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
                            {post.user_id !== user_id && (<div className="dropdown_item" onClick={(e) => {
                              e.stopPropagation();
                              handleSavePost(post.post_id);
                            }}>
                              <Bookmark
                                size={18}
                                fill={savedPostIds.has(post.post_id) ? "currentColor" : "none"}
                              />
                              <span>{savedPostIds.has(post.post_id) ? "Unsave" : "Save"}</span>
                            </div>)}
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
                            {post.user_id !== user_id && (<div
                              className="dropdown_item"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleBlockUser(post.user_id, post.username);
                              }}
                            >
                              <UserX size={18} />
                              <span>Block User</span>
                            </div>)}
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
                        className={voteState[post.post_id] === 'up' ? 'up_vote_btn active' : 'up_vote_btn'}
                        onClick={() => handleToggleVote(user_id, post.post_id, "up")}
                      >
                        <ArrowBigUp fill={voteState[post.post_id] === 'up' ? 'currentColor' : 'none'} />
                        {upTally[post.post_id] ?? post.up_tally_post}
                      </button>

                      <button
                        className={voteState[post.post_id] === 'down' ? 'down_vote_btn active' : 'down_vote_btn'}
                        onClick={() => handleToggleVote(user_id, post.post_id, "down")}
                      >
                        <ArrowBigDown fill={voteState[post.post_id] === 'down' ? 'currentColor' : 'none'} />
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

      <CommentModal openModal={isCommentModalOpen} closeModal={closeComments} user_id={user_id} postData={selectedPost} fetchPosts={() => fetchPost()} onDelete={handlePostDeleted} blockedUserIds={blockedUserIds} />

      <Report
        isOpen={isReportOpen}
        onClose={closeReport}
        type={reportType}
        reportedBy={reportedBy}
        reportedUID={reportedUID}
        contentId={contentId}
      />

      {/* Edit Modal */}
      <EditPostModal open={editModalOpen} postData={selectedPost} user_id={user_id} fetchPost={() => fetchPost()} onClose={() => setEditModalOpen(false)} />


      {/* Delete Confirmation Modal */}
      <DeletePostModal
        ref={deleteModalRef}
        user_id={user_id}
        onDelete={handlePostDeleted}
      />


      {/* otherUserModal */}
      <OtherUserProfile openModal={isOtherUserProfileOpen} uid={selectedUserId} closeModal={closeOtherUserProfile} />

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
