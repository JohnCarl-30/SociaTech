import {
  CirclePlus,
  Search,
  Bell,
  UserRound,
  Settings,
  HandHelping,
  LogOut,
  FolderOpen,
} from "lucide-react";
import "./PageHeader.css";
import { useCycle } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useState, useEffect, useRef } from "react";
import CreatePostModal from "./CreatePostModal";
import { useAuth } from "../hooks/useAuth.js";
import logoImage from "../assets/SociaTech_logo_blackbg.png";
import defaultPfp from "../assets/deault_pfp.png";

export default function PageHeader({
  isOnSearchBar,
  isOnCreatePost,
  onPostCreated,
  toggleDropDown,
  isDropDownOpen,
  openProfilePage,
  openSetting,
  openNotificationBar,
  closeNotificationBar,
  openDraftPage,
  openHelpPage,
  onSearchResults

}) {
  const navigate = useNavigate();

  const [isCreatePostOpen, cycleCreatePostOpen] = useCycle(false, true);
  const { logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);

  const handleSignOut = async () => {
    try {
      await logout();

      navigate("/", { state: { fromLogout: true }, replace: true });
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Logout failed. Please try again.");
    }
  };

  const handlePostCreated = () => {
    if (onPostCreated) {
      onPostCreated();
    }
  };

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    try {
      const response = await fetch(
        `http://localhost/SociaTech/backend/auth/searchPosts.php?query=${encodeURIComponent(query)}`
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

  const handleResultClick = (post) => {
    setShowResults(false);
    setSearchQuery("");
    if (onSearchResults) {
      onSearchResults([post]);
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
                  onClick={() => handleResultClick(result)}
                >
                  <img
                    src={result.profile_image || defaultPfp}
                    alt={result.username}
                    className="search_result_avatar"
                  />
                  <div className="search_result_content">
                    <div className="search_result_username">@{result.username}</div>
                    <div className="search_result_title">{result.post_title}</div>
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
          <button className="notification_btn" onClick={closeNotificationBar}>
            <Bell className="bell_svg" />
          </button>




          <div className="notification_container" style={{ display: openNotificationBar ? "flex" : "none" }}>
                <div className="notification_header_title">Notification</div>
                <div className="notification_child_container">No notifications</div>
          </div>




          <div className="profile_btn" onClick={toggleDropDown}>
            <img src={defaultPfp} alt="default_pfp" className="profile_img" />
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
        <button className="dropDown_btn" onClick={openDraftPage}>
          <FolderOpen />
          Drafts
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
