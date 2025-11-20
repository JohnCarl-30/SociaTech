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
import CreatePostModal from "./CreatePostModal";
import { useAuth } from "../hooks/useAuth.js";

import logoImage from "../assets/SociaTech_logo_blackbg.png";
import defaultPfp from "../assets/deault_pfp.png";
import { useEffect } from "react";

export default function PageHeader({  isOnSearchBar, 
  isOnCreatePost, 
  openProfilePage,
  toggleDropDown,
  isDropDownOpen}) {
  const navigate = useNavigate();
  
  const [isCreatePostOpen, cycleCreatePostOpen] = useCycle(false,true);
  const { logout } = useAuth();



  const handleSignOut = async () => {
    try {
      await logout();

      navigate("/", { state: { fromLogout: true }, replace: true });
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Logout failed. Please try again.");
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
          className="search_bar_container"
          style={{ display: isOnSearchBar ? "flex" : "none" }}
        >
          <Search />
          <input type="text" placeholder="Search" className="search_bar" />
        </div>

        <div className="side_header_btn">
          <button
            className="createPost_btn"
            style={{ display: isOnCreatePost ? "flex" : "none" }}
            onClick={cycleCreatePostOpen}
          >
            <CirclePlus className="circlePlus_svg" /> Create
          </button>
          <button className="notification_btn">
            <Bell className="bell_svg" />
          </button>
          <div className="profile_btn" onClick={toggleDropDown}>
            <img src={defaultPfp} alt="default_pfp" className="profile_img" />
          </div>
        </div>
      </div>

       <div className="dropDown_profile_modal" style={{ display: isDropDownOpen ? 'flex' : 'none' }}>
        <button className="dropDown_btn" onClick={openProfilePage}>
          <UserRound />
          View Profile
        </button>
        <button className="dropDown_btn">
          <FolderOpen />
          Drafts
        </button>
        <button className="dropDown_btn">
          <Settings />
          Settings
        </button>
        <button className="dropDown_btn">
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
      />
    </>
  );
}
