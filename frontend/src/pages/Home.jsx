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
} from "lucide-react";
import "./Home.css";
import { useCycle } from "framer-motion";
import { useEffect, useState } from "react";
import moreBtn from "../assets/moreBtn.png";
import { getUser } from "../utils/storage";
import pfpImage from "../assets/deault_pfp.png";
import { useRef } from "react";

export default function Homepage() {
  const [posts, setPosts] = useState([]);
  const [openMore, setOpenMore] = useState(null);
  const [upTally, setUpTally] = useState({});
  const [downTally, setDownTally] = useState({});
  const [voteState, setVoteState] = useState({});
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const textareaRef = useRef(null);
  const [isProfilePageOpen, setIsProfilePageOpen] = useState(false);
  const [isDropDownOpen, setIsDropDownOpen] = useState(false);

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
  const closeProfilePage = () => setIsProfilePageOpen(false);

  const handleInput = () => {
    const textarea = textareaRef.current;
    textarea.style.height = "auto"; // reset height
    textarea.style.height = textarea.scrollHeight + "px"; // adjust to content
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

  const ToggleMoreMenu = (post_id) => {
    setOpenMore((prev) => (prev === post_id ? null : post_id));
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
    setUpTally((prev) => ({
      ...prev,
      [postId]: (prev[postId] ?? 0) + upDelta,
    }));
    setDownTally((prev) => ({
      ...prev,
      [postId]: (prev[postId] ?? 0) + downDelta,
    }));

    let voteTypeToBackend =
      newVoteType === "up" ? 1 : newVoteType === "down" ? 0 : null;

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

      const text = await res.text();
      let data;
      try {
        data = text
          ? JSON.parse(text)
          : { success: false, message: "Empty response" };
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
  };

  const closeReport = () => {
    setIsReportOpen(false);
    // Don't reset selectedPost here kung may open na comment modal
    if (!isCommentModalOpen) {
      setSelectedPost(null);
    }
    // Close the dropdown menu when closing report
    setOpenMore(null);
  };

  const openComments = (post) => {
    setSelectedPost(post);
    setIsCommentModalOpen(true);
    setOpenMore(null);
  };

  const closeComments = () => {
    setSelectedPost(null);
    setIsCommentModalOpen(false);
    setIsReportOpen(false);
    setOpenMore(null);
  };

  // Filter posts based on selected category
  const filteredPosts =
    selectedCategory === "All"
      ? posts
      : posts.filter((post) => post.post_category === selectedCategory);

  return (
    <div className="home_container">
      <PageHeader
        isOnCreatePost={true}
        isOnSearchBar={true}
        onPostCreated={fetchPost}
        isDropDownOpen={isDropDownOpen}
        toggleDropDown={toggleDropDown}
        openProfilePage={openProfilePage}
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
                      <div className="post_date">{post.post_date}</div>
                      <div className="post_category">{post.post_category}</div>
                    </div>
                    <div className="more_menu_container">
                      <div
                        className="more_btn"
                        onClick={() => ToggleMoreMenu(post.post_id)}
                      >
                        <img src={moreBtn} alt="" className="more" />
                      </div>
                      {openMore === post.post_id && (
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
                        <div className="post_date">
                          {selectedPost.post_date}
                        </div>
                        <div className="post_category">
                          {selectedPost.post_category}
                        </div>
                      </div>
                      <div className="more_menu_container">
                        <div
                          className="more_btn"
                          onClick={() => ToggleMoreMenu(selectedPost.post_id)}
                        >
                          <img src={moreBtn} alt="" className="more" />
                        </div>
                        {openMore === selectedPost.post_id && (
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
                        className={`up_vote_btn ${
                          voteState[selectedPost.post_id] === "up"
                            ? "voted"
                            : ""
                        }`}
                        onClick={() =>
                          handleToggleVote(user_id, selectedPost.post_id, "up")
                        }
                      >
                        <ArrowBigUp />
                        {upTally[selectedPost.post_id]}
                      </button>
                      <button
                        className={`down_vote_btn ${
                          voteState[selectedPost.post_id] === "down"
                            ? "voted"
                            : ""
                        }`}
                        onClick={() =>
                          handleToggleVote(
                            user_id,
                            selectedPost.post_id,
                            "down"
                          )
                        }
                      >
                        <ArrowBigDown />
                        {downTally[selectedPost.post_id]}
                      </button>
                    </div>

                    {/* Comment Section */}
                    <div className="comment_section_container">
                      {/* TODO: Map comments here */}
                    </div>
                  </div>
                  <div className="comment_textarea_container">
                    <textarea
                      placeholder="Write a comment..."
                      onInput={(e) => {
                        e.target.style.height = "auto"; // reset
                        e.target.style.height = e.target.scrollHeight + "px"; // adjust
                      }}
                    ></textarea>
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
                      />

                      <button
                        onClick={closeComments}
                        className="comment_action_btn"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={closeComments}
                        className="comment_action_btn"
                      >
                        Comment
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Report Modal */}
            <Report
              isOpen={isReportOpen}
              onClose={closeReport}
              post={selectedPost}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
