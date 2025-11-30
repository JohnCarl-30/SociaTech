import {
  CirclePlus,
  Search,
  Bell,
  UserRound,
  Settings,
  HandHelping,
  LogOut,

} from "lucide-react";
import "./PageHeader.css";
import { useCycle } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import CreatePostModal from "./CreatePostModal";
import { useAuth } from "../hooks/useAuth.js";
import logoImage from "../assets/SociaTech_logo_blackbg.png";
import defaultPfp from "../assets/deault_pfp.png";
import { useState, useEffect, useRef } from "react";
import { getUser } from "../utils/storage";

export default function PageHeader({
  isOnSearchBar,
  isOnCreatePost,
  onPostCreated,
  toggleDropDown,
  isDropDownOpen,
  openProfilePage,
  openSetting,
  onNotificationClick,
  openHelpPage,
  userId,
  notifEnabled,
  onSearchResults,
  onUserClick,
  onPostClick,

}) {
  const navigate = useNavigate();

  const [isCreatePostOpen, cycleCreatePostOpen] = useCycle(false, true);
  const { logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);
  const [headerPfp, setHeaderPfp] = useState("");
  const [loading, setLoading] = useState(false);
  const [isActivePage, setIsActivePage] = useState('home');

  const user = getUser();
  const user_id = user?.id || null;

  useEffect(() => {
    const fetchUserStats = async () => {
      if (!user_id) return;

      try {
        const res = await fetch(
          `http://localhost/SociaTech/backend/auth/getUserStats.php?user_id=${user_id}`
        );
        const data = await res.json();

        if (data.success) {
          setHeaderPfp(data.profile_image || "");
        }
      } catch (err) {
        console.log("Error fetching user stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserStats();
  }, [user_id]);



  const handleSignOut = async () => {
    try {
      await logout();

      navigate("/", { state: { fromLogout: true }, replace: true });
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Logout failed. Please try again.");
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      setShowResults(false);
      if (onSearchResults) {
        onSearchResults([]); // Pass null to signal reset
      }
      return;
    }

    try {
      const response = await fetch(
        `http://localhost/SociaTech/backend/auth/searchPosts.php?query=${encodeURIComponent(
          query
        )}`
      );
      const data = await response.json();

      if (data.success) {
        setSearchResults(data.results);
        setShowResults(true);
        if (onSearchResults) {
          onSearchResults(data.results);
        }
      } else {
        toast.error(data.message || "Search failed");
      }
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Failed to search posts");
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    handleSearch(value);
  };

  const handleUsernameClick = (e, result) => {
    e.stopPropagation();
    setShowResults(false);
    setSearchQuery("");
    setSearchResults([]);
    if (onUserClick) {
      onUserClick(result.user_id, result);
    }
  };

  const handlePostClick = (result) => {
    setShowResults(false);
    setSearchQuery("");
    setSearchResults([]);
    if (onSearchResults) {
      onSearchResults([]); // Clear search results in parent
    }

    if (onPostClick) {
      onPostClick(result);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (userId) {
      fetchUnreadCount();

      const interval = setInterval(fetchUnreadCount, 5000);
      return () => clearInterval(interval);
    }
  }, [userId]);

  const fetchUnreadCount = async () => {
    try {
      const res = await fetch(
        `http://localhost/SociaTech/backend/auth/fetchNotifications.php?user_id=${userId}`
      );
      const data = await res.json();

      if (data.success) {
        setUnreadCount(data.unread_count);
      }
    } catch (err) {
      console.error("Error fetching unread count:", err);
    }
  };

  const handlePostCreated = () => {
    if (onPostCreated) {
      onPostCreated();
    }
  };

  return (
    <>
      <div className="page_header">
        <img
          className="page_title_logo"
          src={logoImage}
          alt="socia-tech-logo"
          onClick={() => navigate("/home")}
          style={{ cursor: "pointer" }}
        />

        <div
          className="search_bar_wrapper"
          style={{ display: isOnSearchBar ? "block" : "none" }}
          ref={searchRef}
        >
          <div className="search_bar_container">
            <Search />
            <input
              type="text"
              placeholder="Search posts, users..."
              className="search_bar"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
          {showResults && searchResults.length > 0 && (
            <div className="search_results_dropdown">
              {searchResults.map((result) => (
                <div
                  key={result.post_id}
                  className="search_result_item"
                  onClick={() => handlePostClick(result)}
                >
                  <img
                    src={result.profile_image || defaultPfp}
                    alt={result.username}
                    className="search_result_avatar"
                    onClick={(e) => handleUsernameClick(e, result)}
                    style={{ cursor: "pointer" }}
                  />
                  <div className="search_result_content">
                    <div
                      className="search_result_username"
                      onClick={(e) => handleUsernameClick(e, result)}
                      style={{ cursor: "pointer" }}
                    >
                      @{result.username}
                    </div>
                    <div className="search_result_title">
                      {result.post_title}
                    </div>
                    <div className="search_result_excerpt">
                      {result.post_content?.substring(0, 60)}...
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {showResults && searchResults.length === 0 && searchQuery && (
            <div className="search_results_dropdown">
              <div className="search_no_results">No results found</div>
            </div>
          )}
        </div>

        <div className="side_header_btn">
          <button
            className="createPost_btn"
            style={{ display: isOnCreatePost ? "flex" : "none" }}
            onClick={cycleCreatePostOpen}
          >
            <CirclePlus className="circlePlus_svg" /> Create
          </button>
          <button
            className="notification_btn"
            onClick={onNotificationClick}
            style={{ position: "relative" }}
          >
            <Bell className="bell_svg" />
            {notifEnabled && unreadCount > 0 && (
              <span className="notification_badge">{unreadCount}</span>
            )}
          </button>
          <div className="profile_btn" onClick={toggleDropDown}>
            <img
              src={headerPfp || defaultPfp}
              alt="profile_img"
              className="profile_img"
            />
          </div>
        </div>
      </div>

      <div
        className="dropDown_profile_modal"
        style={{ display: isDropDownOpen ? "flex" : "none" }}
      >
        <button className="dropDown_btn" onClick={openProfilePage}>
          <UserRound />
          View Profile
        </button>

        <button className="dropDown_btn" onClick={openSetting}>
          <Settings />
          Settings
        </button>
        <button className="dropDown_btn" onClick={openHelpPage}>
          <HandHelping />
          Help
        </button>
        <button className="dropDown_btn" onClick={handleSignOut}>
          <LogOut />
          Logout
        </button>
      </div>

      <CreatePostModal
        isOpen={isCreatePostOpen}
        onClose={cycleCreatePostOpen}
        onPostCreated={handlePostCreated}
      />
    </>
  );
}
