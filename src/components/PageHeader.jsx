import {
  CirclePlus,
  Search,
  Bell,
  UserRound,
  Settings,
  HandHelping,
  LogOut,
  FolderOpen,
  Image,
} from "lucide-react";
import "./PageHeader.css";
import { useCycle } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { signOut } from "../services/auth";
import { toast } from "react-hot-toast";
import CreatePostModal from "./CreatePostModal";
export default function PageHeader({ isOnSearchBar, isOnCreatePost }) {
  const navigate = useNavigate();
  const [isDropDownModalOpen, cycleDrownDownModalOpen] = useCycle(false, true);
  const [isCreatePostOpen, cycleCreatePostOpen] = useCycle(false,true);

  const open = (isOpen) => {
    return isOpen;
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Logout successful!", {
        position: "top-center",
        autoClose: 2000,
      });

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      console.log("Error signing out:", error);
      toast.error("Failed to logout. Please try again.");
    }
  };
  return (
    <>
      <div className="page_header">
        <img
          className="page_title_logo"
          src="src\assets\SociaTech_logo_blackbg.png"
          alt="socia-tech-logo"
          onClick={() => navigate("/home")}
          onFocus={true}
        />

        <div
          className="search_bar_container"
          style={
            open(isOnSearchBar) ? { display: "flex" } : { display: "none" }
          }
        >
          <Search />
          <input type="text" placeholder="Search" className="search_bar" />
        </div>

        <div className="side_header_btn">
          <button
            className="createPost_btn"
            style={
              open(isOnCreatePost) ? { display: "flex" } : { display: "none" }
            }
            onClick={()=>{
              cycleCreatePostOpen();
            }}
          >
            <CirclePlus className="circlePlus_svg" /> Create
          </button>
          <button className="notification_btn">
            <Bell className="bell_svg" />
          </button>
          <div
            className="profile_btn"
            onClick={() => {
              cycleDrownDownModalOpen();
            }}
          >
            <img
              src="src\assets\deault_pfp.png"
              alt="default_pfp"
              className="profile_img"
            />
          </div>
        </div>
      </div>

      <div
        className="dropDown_profile_modal"
        style={isDropDownModalOpen ? { display: "flex" } : { display: "none" }}
      >
        <button className="dropDown_btn">
          {" "}
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
        <button className="dropDown_btn" onClick={() => handleSignOut()}>
          <LogOut />
          Logout
        </button>
      </div>

          <div className="createPost_parent_modal" style={isCreatePostOpen?{display:'flex'}:{display:'none'}}>
        <div className="createPost_container_modal">
          <div className="createPost_modal_title">Create Post</div>
          <select name="" id="" className="category_dropDown">
            <option value="" disabled selected>Category</option>
                          <option value="">Artificial Intelligence</option>
                          <option value="">Cyber Security</option>
                          <option value="">Networking</option>
                          <option value="">Cloud Engineering</option>
                          <option value="">Software Development</option>
                          <option value="">Dev Ops</option>
                          <option value="">Machine Learning</option>
                          <option value="">Virtual Reality</option>
                          <option value="">Augmented Reality</option>
          </select>
          <div className="create_title_field">
            <label htmlFor="" className="create_field_label">Title</label>
            <input type="text" className="create_field" />
          </div>
          <div className="create_body_field">
            <label htmlFor="" className="create_field_label">Body</label>
            <textarea type="text"  className="create_textarea"/>
          </div>
          <div className="create_footer_modal">
            <button className="upload_img_btn"><Image className="img_svg"/></button>
            <div className="cancelPost_btn_container">
              <button className="cancelPost_btn" onClick={()=>{cycleCreatePostOpen()}}>Cancel</button>
              <button className="cancelPost_btn">Post</button>
            </div>
          </div>
        </div>

      </div> 
      
    </>
  );
}
