import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "./ProfilePage.css";
import DeletePostModal from './DeletePostModal';
import EditPostModal from './EditPostModal';
import CommentModal from './CommentModal';
import OtherUserProfile from './OtherUserProfile';
import ViewFollowerModal from './ViewFollowerModal';
import ViewFollowingModal from './ViewFollowingModal';
import Report from "./Report";
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
  Globe,
  Users
} from "lucide-react";
import pfpImage from "/deault_pfp.png";
import moreBtn from "/moreBtn.png";
import { useState, useEffect, useRef } from "react";
import { getUser } from "../utils/storage";

export default function ProfilePage({ style, closeProfilePage, onPostClick, }) {
  const [image, setImage] = useState(null);
  const [imageURL, setImageURL] = useState(null);
  const [isOpenPage, setOpenPage] = useState('post');

  // VisibilityBadge component
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

  // User stats state
  const [username, setUsername] = useState("");
  const [fullname, setFullname] = useState("");
  const [bio, setBio] = useState("");
  const [postCount, setPostCount] = useState("");
  const [savedCount, setSavedCount] = useState(0);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profileImage, setProfileImage] = useState(pfpImage);
  const [uploading, setUploading] = useState(false);
  const [savedPostIds, setSavedPostIds] = useState(new Set());
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedPost, setSelectedPost] = useState(null);
  const [openMoreModalPost, setOpenMoreModalPost] = useState(null);
  const [openMoreComment, setOpenMoreComment] = useState(null);

  //modal opener:
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [isOtherUserProfileOpen, setIsOtherUserProfileOpen] = useState(false);
  const deleteModalRef = useRef();
  const [isReportOpen, setIsReportOpen] = useState(false);

  // Edit Profile states
  const [isEditMode, setIsEditMode] = useState(false);
  const [editFullname, setEditFullname] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [editBio, setEditBio] = useState("");
  const [updating, setUpdating] = useState(false);

  const [reportType, setReportType] = useState(null);
  const [reportedBy, setReportedBy] = useState(null);
  const [reportedUID, setReportedUID] = useState(null);
  const [contentId, setContentId] = useState(null);

  const user = getUser();
  const user_id = user?.id || null;

  const [savedPosts, setSavedPosts] = useState([]);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [openMorePost, setOpenMorePost] = useState(null);

  const [upTally, setUpTally] = useState({});
  const [downTally, setDownTally] = useState({});
  const [voteState, setVoteState] = useState({});

  const [isBlockConfirmOpen, setIsBlockConfirmOpen] = useState(false);
  const [blockedUserIds, setBlockedUserIds] = useState([]);
  const [userToBlock, setUserToBlock] = useState(null);

  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loadingFollowers, setLoadingFollowers] = useState(false);
  const [loadingFollowing, setLoadingFollowing] = useState(false);
  const [followingIds, setFollowingIds] = useState([]);

  // Fetch followers
  const fetchFollowers = async () => {
    if (!user_id) return;
    setLoadingFollowers(true);
    try {
      const res = await fetch(
        `http://localhost/SociaTech/backend/auth/getFollowers.php?user_id=${user_id}`
      );
      const data = await res.json();
      if (data.success) {
        setFollowers(data.followers || []);
        setFollowerCount(data.count || 0);
      }
    } catch (err) {
      console.error("Error fetching followers:", err);
    } finally {
      setLoadingFollowers(false);
    }
  };

  // Fetch following
  const fetchFollowing = async () => {
    if (!user_id) return;
    setLoadingFollowing(true);
    try {
      const res = await fetch(
        `http://localhost/SociaTech/backend/auth/getFollowing.php?user_id=${user_id}`
      );
      const data = await res.json();
      if (data.success) {
        setFollowing(data.following || []);
        setFollowingCount(data.count || 0);
        // Extract following IDs for visibility filtering
        const ids = (data.following || []).map(f => f.user_id);
        setFollowingIds(ids);
      }
    } catch (err) {
      console.error("Error fetching following:", err);
    } finally {
      setLoadingFollowing(false);
    }
  };

  // Remove following handler (from Following modal)
  const handleRemoveFollowing = async (followingId) => {
    if (!user?.id) {
      toast.error('Please log in to remove following');
      return;
    }

    try {
      const res = await fetch('http://localhost/SociaTech/backend/auth/RemoveFollowing.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          user_id: user.id,
          following_id: followingId
        })
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();

      if (data.success) {
        toast.success('Removed from following successfully');
        setFollowing(prev => prev.filter(f => f.user_id !== followingId));
        setFollowingCount(data.following_count);
        // Update followingIds for visibility filtering
        setFollowingIds(prev => prev.filter(id => id !== followingId));
      } else {
        toast.error(data.message || 'Failed to remove from following');
      }
    } catch (error) {
      console.error('Error removing following:', error);
      fetchFollowing();
      toast.error('An error occurred. Refreshing...');
    }
  };

  // Remove follower handler
  const handleRemoveFollower = async (followerId) => {
    if (!user_id) return;
    try {
      const res = await fetch(
        'http://localhost/SociaTech/backend/auth/removeFollower.php',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            user_id: user_id,
            follower_id: followerId
          }),
        }
      );
      const data = await res.json();
      if (data.success) {
        setFollowers(prev => prev.filter(f => f.user_id !== followerId));
        setFollowerCount(data.follower_count);
        toast.success('Follower removed successfully');
      } else {
        toast.error(data.message || 'Failed to remove follower');
      }
    } catch (err) {
      console.error("Error removing follower:", err);
      toast.error('Error removing follower');
    }
  };

  // Unfollow handler
  const handleUnfollow = async (followedId) => {
    if (!user?.id) {
      toast.error('Please log in to unfollow users');
      return;
    }

    try {
      const res = await fetch('http://localhost/SociaTech/backend/auth/unfollow.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          user_id: user.id,
          followed_id: followedId
        })
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();

      if (data.success) {
        toast.success('Unfollowed successfully');
        setFollowing(prev => prev.filter(f => f.user_id !== followedId));
        setFollowingCount(prev => prev - 1);
      } else {
        toast.error(data.message || 'Failed to unfollow');
      }
    } catch (error) {
      console.error('Error unfollowing:', error);
      fetchFollowing();
      toast.error('An error occurred. Refreshing...');
    }
  };

  // Open followers modal and fetch data
  const openFollowersModal = () => {
    setShowFollowersModal(true);
    fetchFollowers();
  };

  // Open following modal and fetch data
  const openFollowingModal = () => {
    setShowFollowingModal(true);
    fetchFollowing();
  };

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
          const blockedIds = data.blocked_users.map(u => parseInt(u.user_id));
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
    fetchFollowing(); // Fetch following on mount
  }, []);

  // Fetch user's posts
  useEffect(() => {
    fetchUserPosts();
  }, [user_id, style, isCommentModalOpen]);

  const fetchUserPosts = async () => {
    if (!user_id) return;

    try {
      const res = await fetch(
        `http://localhost/SociaTech/backend/auth/fetchPost.php?user_id=${user_id}`
      );
      const data = await res.json();

      if (data.success) {
        setUserPosts(data.posts || []);

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
      }
    } catch (err) {
      console.error("Error fetching user posts:", err);
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
          setUserPosts((prev) =>
            prev.map(p =>
              p.post_id === postId
                ? { ...p, up_tally_post: postData.post.up_tally_post, down_tally_post: postData.post.down_tally_post }
                : p
            )
          );
        }

        // Create notification for upvote
        if (newVoteType === "up") {
          const post = userPosts.find((p) => p.post_id === postId);
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
      console.error("Error fetching user stats:", err);
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

  // Function to fetch saved posts
  const fetchSavedPosts = async () => {
    if (!user_id) return;

    setLoadingSaved(true);
    try {
      const res = await fetch(
        `http://localhost/SociaTech/backend/auth/getsavedPosts.php?user_id=${user_id}`
      );
      const data = await res.json();

      if (data.success) {
        const filteredSavedPosts = data.posts.filter(
          post => !blockedUserIds.includes(post.user_id)
        );

        setSavedPosts(filteredSavedPosts || []);
        setSavedCount(filteredSavedPosts?.length || 0);

        if (data.success && data.posts) {
          setUpTally((prev) => ({
            ...prev,
            [data.posts.post_id]: data.posts.up_tally_post,
          }));
          setDownTally((prev) => ({
            ...prev,
            [data.posts.post_id]: data.posts.down_tally_post,
          }));
        }
      } else {
        setSavedPosts([]);
        setSavedCount(0);
      }
    } catch (err) {
      console.error("Error fetching saved posts:", err);
      setSavedPosts([]);
      setSavedCount(0);
    } finally {
      setLoadingSaved(false);
    }
  };

  // Fetch saved posts count on mount and when "Saved" tab is opened
  useEffect(() => {
    if (isOpenPage === "saved") {
      fetchSavedPosts();
      fetchSavedPostIds();
    } else if (user_id && savedCount === 0) {
      fetch(`http://localhost/SociaTech/backend/auth/getsavedPosts.php?user_id=${user_id}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setSavedCount(data.posts?.length || 0);
          }
        })
        .catch(err => console.error("Error fetching saved count:", err));
    }
  }, [isOpenPage, user_id, isOtherUserProfileOpen]);

  // Fetch saved post IDs to track which posts are saved
  const fetchSavedPostIds = async () => {
    if (!user_id) return;

    try {
      const res = await fetch(
        `http://localhost/SociaTech/backend/auth/getsavedPosts.php?user_id=${user_id}`
      );
      const data = await res.json();

      if (data.success && data.posts) {
        const postIds = new Set(data.posts.map(post => post.post_id));
        setSavedPostIds(postIds);
      }
    } catch (err) {
      console.error("Error fetching saved post IDs:", err);
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
        toast.success("Profile photo updated successfully!");
      } else {
        toast.error("Failed to update profile photo: " + (data.message || "Unknown error"));
      }
    } catch (err) {
      console.error("Error uploading profile photo:", err);
      toast.error("Error uploading profile photo");
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

        if (data.success) {
          setUsername(data.user.username || "Unknown User");
          setFullname(data.user.fullname || "");
          setBio(data.user.bio || "");
          setProfileImage(data.user.profile_image || pfpImage);
        }
      } catch (err) {
        console.error("Error fetching user profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [user_id]);

  // Fetch post count
  useEffect(() => {
    const fetchPostCount = async () => {
      if (!user_id) return;

      try {
        const res = await fetch(
          `http://localhost/SociaTech/backend/auth/getUserStats.php?user_id=${user_id}`
        );
        const data = await res.json();

        if (data.success) {
          setPostCount(data.post_count || 0)
          setFollowerCount(data.follower_count || 0);
          setFollowingCount(data.following_count || 0);
        }
      } catch (err) {
        console.error("Error fetching post count:", err);
      }
    };

    fetchPostCount();
  }, [user_id, style]);

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
        setFullname(data.user.fullname);
        setUsername(data.user.username);
        setBio(data.user.bio);
        setIsEditMode(false);
        toast.success("Profile updated successfully!");
      } else {
        toast.error("Failed to update profile: " + (data.message || "Unknown error"));
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      toast.error("Error updating profile");
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
      toast.error("You must be logged in to save posts");
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
        const newSavedPostIds = new Set(savedPostIds);
        if (data.action === "saved") {
          newSavedPostIds.add(postId);
          toast.success("Post saved!");
        } else {
          newSavedPostIds.delete(postId);
          toast.success("Post unsaved!");
          if (isOpenPage === "saved") {
            fetchSavedPosts();
          }
        }
        setSavedPostIds(newSavedPostIds);
      } else {
        toast.error(data.message || "Failed to save post");
      }
    } catch (error) {
      console.error("Error saving post:", error);
      toast.error("An error occurred while saving the post");
    } finally {
      setOpenMorePost(null);
    }
  };

  const openOtherUserProfile = (userId) => {
    setSelectedUserId(userId);
    setIsOtherUserProfileOpen(true);
  }

  const closeOtherUserProfile = () => {
    setIsOtherUserProfileOpen(false);
  };

  const openComments = async (post) => {
    setSelectedPost(post);
    setIsCommentModalOpen(true);
  };

  const handlePostDeleted = (deletedPostId) => {
    setUserPosts((prev) => prev.filter((post) => post.post_id !== deletedPostId));
    setIsCommentModalOpen(false);
  };

  const handleDeleteClick = (post) => {
    deleteModalRef.current.open(post);
  };

  const handleEditButtonClick = (post) => {
    setSelectedPost(post);
    setEditModalOpen(true);
  };

  const closeComments = () => {
    setSelectedPost(null);
    setIsCommentModalOpen(false);
    setOpenMoreModalPost(null);
    setOpenMoreComment(null);
  };

  const closeReport = () => {
    setIsReportOpen(false);
  };

  // REPORT HANDLER
  const setReportData = (type, reportedBy, reportedUID, contentId) => {
    setReportType(type);
    setReportedBy(reportedBy);
    setReportedUID(reportedUID);
    setIsReportOpen(true);
    setContentId(contentId);
  };

  // Filter posts based on visibility
  const getVisiblePosts = (posts) => {
    return posts.filter(post => {
      // Always show public posts
      if (post.post_visibility === 'public' || !post.post_visibility) {
        return true;
      }

      // For 'following' visibility, check if user follows the post author
      if (post.post_visibility === 'following') {
        // User's own posts are always visible
        if (post.user_id === user_id) {
          return true;
        }
        // Check if user follows this post's author
        return followingIds.includes(post.user_id);
      }

      return false;
    });
  };

  const visibleUserPosts = getVisiblePosts(userPosts);
  const visibleSavedPosts = getVisiblePosts(savedPosts);

  return (
    <>
      <div className="profilePage_parent_container" style={{ display: style }}>
        <div className="profilePage_container">
          <div className="header_profile_container">
            <div className="pfp_username_container">
              <img src={profileImage} alt="" className="profilePic" />
              <div className="user_info_container">
                <div className="userName_container">{loading ? "Loading..." : username}</div>
                {fullname && <div className="user_fullname">{fullname}</div>}
                {bio && <div className="user_bio">{bio}</div>}
              </div>
            </div>
            <div className="profilePage_dashboard">
              <div className="dashBoard_container">
                <div>{postCount}</div>
                <div>Post</div>
              </div>
              <div className="dashBoard_container" onClick={openFollowersModal} style={{ cursor: 'pointer' }}>
                <div>{followerCount}</div>
                <div>Followers</div>
              </div>
              <div className="dashBoard_container" onClick={openFollowingModal} style={{ cursor: 'pointer' }}>
                <div>{followingCount}</div>
                <div>Following</div>
              </div>

            </div>
          </div>
          <div className="profilePage_nav_container">
            <button className={`profilePage_nav_child ${isOpenPage == 'post' ? 'nav_btn_active' : ''}`} onClick={() => setOpenPage('post')}>Post</button>
            <button className={`profilePage_nav_child ${isOpenPage == 'saved' ? 'nav_btn_active' : ''}`} onClick={() => setOpenPage('saved')}>Saved</button>

            <button className={`profilePage_nav_child ${isOpenPage == 'EditProfile' ? 'nav_btn_active' : ''}`} onClick={() => { setOpenPage('EditProfile'); setIsEditMode(false); }}>Edit Profile</button>
          </div>
          <div className="profilePage_child_container">
            {/* Posts Tab */}
            {isOpenPage === 'post' && (
              <div className="profilePage_post_container">
                {visibleUserPosts.length > 0 ? (
                  visibleUserPosts.map((post) => (
                    <div
                      className="post_card post_card_spacing"
                      key={post.post_id}
                      onClick={() => openComments(post)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="post_card_header">
                        <div className="header_user_container">
                          <div className="pfp_container">
                            <img src={post.profile_image || pfpImage} alt="user_pfp" />
                          </div>
                          <div className="post_username">{post.username}</div>
                          <div className="post_date">{timeAgo(post.post_date)}</div>
                          <div className="post_category">{post.post_category}</div>
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
                              {post.user_id !== user_id && (<div
                                className="dropdown_item"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSavePost(post.post_id);
                                }}
                              >
                                <Bookmark
                                  size={18}
                                  fill={savedPostIds.has(post.post_id) ? "currentColor" : "none"}
                                />
                                <span>{savedPostIds.has(post.post_id) ? "Unsave" : "Save"}</span>
                              </div>)}
                              {post.user_id !== user_id && (<div
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
                              </div>)}
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
                          onClick={(e) => {
                            e.stopPropagation();
                            openComments(post);
                          }}
                        >
                          Comment
                        </button>
                        <button
                          className={voteState[post.post_id] === 'up' ? 'up_vote_btn active' : 'up_vote_btn'}
                          onClick={(e) => { e.stopPropagation(); handleToggleVote(user_id, post.post_id, "up"); }}
                        >
                          <ArrowBigUp fill={voteState[post.post_id] === 'up' ? 'currentColor' : 'none'} />
                          {upTally[post.post_id] ?? post.up_tally_post}
                        </button>

                        <button
                          className={voteState[post.post_id] === 'down' ? 'down_vote_btn active' : 'down_vote_btn'}
                          onClick={(e) => { e.stopPropagation(); handleToggleVote(user_id, post.post_id, "down"); }}
                        >
                          <ArrowBigDown fill={voteState[post.post_id] === 'down' ? 'currentColor' : 'none'} />
                          {downTally[post.post_id] ?? post.down_tally_post}
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
            {isOpenPage === 'saved' && (
              <div className="profilePage_post_container">
                <div className="savePost_header">
                  <div className="profilePage_savePost_title">Saved Posts</div>
                </div>

                {loadingSaved ? (
                  <p>Loading saved posts...</p>
                ) : visibleSavedPosts.length === 0 ? (
                  <p>No saved posts yet.</p>
                ) : (
                  visibleSavedPosts.map((post) => (
                    <div
                      className="post_card post_card_spacing"
                      key={post.post_id}
                      onClick={() => onPostClick && onPostClick(post)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="post_card_header">
                        <div className="header_user_container">
                          <div className="pfp_container">
                            <img src={post.profile_image || pfpImage} alt="user_pfp" />
                          </div>
                          <div className="post_username" onClick={(e) => { e.stopPropagation(); openOtherUserProfile(post.user_id); }}>{post.username}</div>
                          <div className="post_date">{timeAgo(post.post_date)}</div>
                          <div className="post_category">{post.post_category}</div>
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
                              <div
                                className="dropdown_item"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSavePost(post.post_id);
                                }}
                              >
                                <Bookmark
                                  size={18}
                                  fill={savedPostIds.has(post.post_id) ? "currentColor" : "none"}
                                />
                                <span>{savedPostIds.has(post.post_id) ? "Unsave" : "Save"}</span>
                              </div>
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
                          onClick={(e) => {
                            e.stopPropagation();
                            openComments(post);
                          }}
                        >
                          Comment
                        </button>
                        <button
                          className={voteState[post.post_id] === 'up' ? 'up_vote_btn active' : 'up_vote_btn'}
                          onClick={(e) => { e.stopPropagation(); handleToggleVote(user_id, post.post_id, "up"); }}
                        >
                          <ArrowBigUp fill={voteState[post.post_id] === 'up' ? 'currentColor' : 'none'} />
                          {upTally[post.post_id] ?? post.up_tally_post}
                        </button>

                        <button
                          className={voteState[post.post_id] === 'down' ? 'down_vote_btn active' : 'down_vote_btn'}
                          onClick={(e) => { e.stopPropagation(); handleToggleVote(user_id, post.post_id, "down"); }}
                        >
                          <ArrowBigDown fill={voteState[post.post_id] === 'down' ? 'currentColor' : 'none'} />
                          {downTally[post.post_id] ?? post.down_tally_post}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}



            {/* Edit Profile Tab */}
            {isOpenPage === 'EditProfile' && (
              <div className="profilePage_editProfile_Container">
                <div className="profilePage_childContainer_title edit_profile_title_row">
                  <span>Edit Profile</span>
                  {!isEditMode && (
                    <button
                      className="edit_mode_btn"
                      onClick={handleEditClick}
                    >
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
                          <label className="profile_field_label">Full Name</label>
                          <div className="profile_field_value">
                            {fullname || "Not set"}
                          </div>
                        </div>

                        <div>
                          <label className="profile_field_label">Username</label>
                          <div className="profile_field_value">
                            @{username}
                          </div>
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
                      <label htmlFor="fullname" className="edit_form_label">Full Name</label>
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
                      <label htmlFor="username" className="edit_form_label">Username</label>
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
                      <label htmlFor="bio" className="edit_form_label">Bio</label>
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

      {/* Comment Modal */}
      <CommentModal openModal={isCommentModalOpen} closeModal={closeComments} user_id={user_id} postData={selectedPost} fetchPosts={() => fetchUserPosts()} onDelete={handlePostDeleted} />

      <Report
        isOpen={isReportOpen}
        onClose={closeReport}
        type={reportType}
        reportedBy={reportedBy}
        reportedUID={reportedUID}
        contentId={contentId}
      />

      {/* Edit Modal */}
      <EditPostModal open={editModalOpen} postData={selectedPost} user_id={user_id} fetchPost={() => fetchUserPosts()} onClose={() => setEditModalOpen(false)} />

      {/* Delete Confirmation Modal */}
      <DeletePostModal
        ref={deleteModalRef}
        user_id={user_id}
        onDelete={handlePostDeleted}
      />

      {/* Other User Modal */}
      <OtherUserProfile openModal={isOtherUserProfileOpen} uid={selectedUserId} closeModal={closeOtherUserProfile} />

      {/* Follower Modal */}
      <ViewFollowerModal
        isOpen={showFollowersModal}
        onClose={() => setShowFollowersModal(false)}
        followers={followers}
        onRemoveFollower={handleRemoveFollower}
        currentUserId={user_id}
      />

      {/* Following Modal */}
      <ViewFollowingModal
        isOpen={showFollowingModal}
        onClose={() => setShowFollowingModal(false)}
        following={following}
        onUnfollow={handleRemoveFollowing}
        currentUserId={user_id}
      />


    </>
  );
}