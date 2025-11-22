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
  Ban 
} from "lucide-react";
import "./Home.css";
import { useCycle } from "framer-motion";
import { useEffect, useState,useRef } from "react";
import moreBtn from "../assets/moreBtn.png";
import { getUser } from "../utils/storage";
import pfpImage from "../assets/deault_pfp.png";

import Settings from "../components/Settings.jsx";
import TrippleDots from "../assets/moreBtn.png"


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


  

  const user = getUser();
  const user_id = user?.id || null;

  useEffect(() => {
    fetchPost();
  }, []);



  const toggleDropDown = () => setIsDropDownOpen((prev) => !prev);

  const openProfilePage = () => {
    setIsProfilePageOpen(true);
    setIsDropDownOpen(false); // ⬅ auto-close dropdown
  };
  const openSetting = () => {
    setIsSettingOpen(true);
    setIsDropDownOpen(false); // ⬅ auto-close dropdown
  };
  const closeProfilePage = () => setIsProfilePageOpen(false);
  const closeSetting=()=> setIsSettingOpen(false);

  

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

  const fetchComments = async (post_id) => {
    try {
      const res = await fetch(
        "http://localhost/SociaTech/backend/auth/addComment.php"
      );
      const data = await res.json();
      if (data.success) {
        setComments(data.comments);
      } else {
        console.log("Failed to fetch comments:", data.message);
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

    if (!commentText.trim()) {
      alert("Comment cannot be empty.");
      return;
    }

    setIsSubmittingComment(true);

    try {
      console.log("Submitting comment for post:", selectedPost);
      const formData = new FormData();
      formData.append("user_id", user_id);
      formData.append("post_id", selectedPost.post_id);
      formData.append("comment_text", commentText);

      if (commentImage) {
        formData.append("comment_image", commentImage);
      }

      const res = await fetch(
        "http://localhost/SociaTech/backend/auth/fetchComments.php",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();

      if (data.success) {
        setComments([...comments, data.comment]);
        setCommentText("");
        setCommentImage(null);

        const fileInput = document.getElementById("hiddenFileInput");
        if (fileInput) fileInput.value = "";
      } else {
        alert("Failed to add comment: " + data.message);
      }
    } catch (err) {
      console.log("Error submitting comment:", err);
      alert("Error submitting comment.");
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
    setOpenMoreComment(null);
  };
   const toggleMoreComment = (post_id) => {
    setOpenMoreComment((prev) => (prev === post_id ? null : post_id));
    setOpenMorePost(null); // close post list menu
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

  const openComments = (post) => {
    setSelectedPost(post);
    setIsCommentModalOpen(true);
    setOpenMore(null);
    fetchComments(post.post_id);
  };

  const closeComments = () => {
    setSelectedPost(null);
    setIsCommentModalOpen(false);
    setIsReportOpen(false);
    setOpenMorePost(null);
    setOpenMoreComment(null);
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
                         <div className="comment_backDrop">
                           <div className="comment_modal">
                             <span style={{ textAlign: "center", width: "100%" }}>
                               {selectedPost.username}'s post
                             </span>
           
                             <div className="comment_post_card">
                               <div className="post_card_header">
                                 <div className="header_user_container">
                                   <div className="pfp_container">
                                     <img src={pfpImage} alt="user_pfp" />
                                   </div>
                                   <div className="post_username">
                                     {selectedPost.username}
                                   </div>
                                   <div className="post_date">{selectedPost.post_date}</div>
                                   <div className="post_category">
                                     {selectedPost.post_category}
                                   </div>
                                 </div>
                                 <div className="more_menu_container">
                                   <div
                                     className="more_btn"
                                     onClick={() => toggleMoreComment(selectedPost.post_id)}
                                   >
                                     <img src={moreBtn} alt="" className="more" />
                                   </div>
                                   {openMoreComment === selectedPost.post_id && (
                                     <div className="dropdown_menu">
                                       <div className="dropdown_item">
                                         <Bookmark size={18} />
                                         <span>Save</span>
                                       </div>
                                       <div
                                         className="dropdown_item"
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
           
                               <div className="post_card_title">
                                 {selectedPost.post_title}
                               </div>
                               {selectedPost.post_content && (
                                 <div className="post_card_content">
                                   {selectedPost.post_content}
                                 </div>
                               )}
                               {selectedPost.post_image && (
                                 <div className="post_card_img">
                                   <img src={selectedPost.post_image} alt="post_image" />
                                 </div>
                               )}
           
                               <div className="postCard_btn_containers">
                                 <button className="post_comment_btn">Comment</button>
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
           
                               <div className="comment_section_container">
                                 {comments.length === 0 ? (
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
                                   comments.map((comment) => (
                                     <div key={comment.comment_id} className="comment_item">
                                       <div className="comment_header">
                                         <div className="pfp_container">
                                           <img
                                             src={comment.profile_image || pfpImage}
                                             alt="commenter_pfp"
                                           />
                                         </div>
                                         <div className="comment_username">
                                           {comment.username}
                                         </div>
                                         <div className="comment_date">
                                           {new Date(comment.created_at).toLocaleDateString()}
                                         </div>
                                       </div>
                                       <div className="comment_text">
                                         {comment.comment_text}
                                       </div>
                                       {comment.comment_image && (
                                         <div className="comment_image">
                                           <img
                                             src={comment.comment_image}
                                             alt="comment_attachment"
                                           />
                                         </div>
                                       )}
                                     </div>
                                   ))
                                 )}
                               </div>
           
                               <div className="comment_textarea_container">
                                 <textarea
                                   placeholder="Write a comment..."
                                   value={commentText}
                                   onChange={(e) => setCommentText(e.target.value)}
                                   onInput={(e) => {
                                     e.target.style.height = "auto";
                                     e.target.style.height = e.target.scrollHeight + "px";
                                   }}
                                 />
                                 {commentImage && <div>Selected: {commentImage.name}</div>}
                                 <div className="comment_action_container">
                                   <label
                                     className="upload_img_btn"
                                     htmlFor="hiddenFileInput"
                                   >
                                     <Image className="img_svg" />
                                   </label>
                                   <input
                                     id="hiddenFileInput"
                                     type="file"
                                     accept="image/*"
                                     style={{ display: "none" }}
                                     onChange={handleImageSelect}
                                   />
                                   <button
                                     onClick={closeComments}
                                     className="comment_action_btn"
                                   >
                                     Cancel
                                   </button>
                                   <button
                                     onClick={handleCommentSubmit}
                                     className="comment_action_btn"
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
                            <button className="otherUserProfile_more_btn"><img src={TrippleDots} alt="" onClick={()=>cycleOpenOtherUserMoreContainer()} /></button>
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
