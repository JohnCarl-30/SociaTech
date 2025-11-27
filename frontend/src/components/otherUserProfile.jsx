import { useState } from "react";
import "../pages/Home.css";

export default function otherUserProfile({openModal, closeModal, userId}){
    const [comments, setComments] = useState([]);
     const [otherUserProfile, setOtherUserProfile] = useState([]);
     const [otherUserPosts, setOtherUserPosts] = useState([]);

    //pang fetch ng 
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

    //pang kuha ng mga userProfile:
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


      const [isLoadingOtherUserData, setIsLoadingOtherUserData] = useState(false);
    return(<>

     <div
        className="otherUserProfile_parent_container"
        style={
          openModal ? { display: "flex" } : { display: "none" }
        }
      >
        <button
          className="otherUserProfile_close_btn"
          onClick={() => closeModal()}
        >
          <X className="crossSvg" />
        </button>

        {isLoadingOtherUserData ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "300px",
            }}
          >
            <div>Loading user data...</div>
          </div>
        ) : (
          <>
            <div className="otherUserProfile_header_container">
              <div className="otherUserProfile_detail_container">
                <img
                  src={
                    otherUserProfile?.profile_image ||
                    selectedOtherUser?.profile_image ||
                    pfpImage
                  }
                  alt=""
                  className="otherUserPfp"
                />
                <div className="userNameBio_container">
                  <div className="otherUserProfile_username">
                    @
                    {otherUserProfile?.username ||
                      selectedOtherUser?.username ||
                      "Username"}
                  </div>
                  {(otherUserProfile?.full_name ||
                    selectedOtherUser?.full_name) && (
                    <div className="otherUserProfile_fullname">
                      {otherUserProfile?.full_name ||
                        selectedOtherUser?.full_name}
                    </div>
                  )}
                  <div className="otherUserProfile_bio">
                    {otherUserProfile?.bio ||
                      selectedOtherUser?.bio ||
                      "No bio available"}
                  </div>
                </div>
              </div>
              <div className="otherUserProfile_stats_container">
                <div className="otherUserProfile_stats_childContainer">
                  <div>{otherUserPosts.length}</div>
                  <div>Posts</div>
                </div>
                <div className="otherUserProfile_stats_childContainer">
                  <div>{followingCount}</div>
                  <div>Following</div>
                </div>
                <div className="otherUserProfile_stats_childContainer">
                  <div>{followerCount}</div>
                  <div>Followers</div>
                </div>
              </div>
              <button
                className="otherUserProfile_more_btn"
                onClick={() => cycleOpenOtherUserMoreContainer()}
              >
                <img src={TrippleDots} alt="" />
              </button>
              <div
                className="otherUserProfile_more_container"
                style={
                  openOtherUserMoreContainer
                    ? { display: "flex" }
                    : { display: "none" }
                }
              >
                <div className="otherUserProfile_more_option">
                  <Ban />
                  Block
                </div>
                <div className="otherUserProfile_more_option">
                  <AlertCircle />
                  Report
                </div>
              </div>
            </div>

            <div className="followBtn_container">
              <div
                className="followBtn"
                style={{
                  cursor: "pointer",
                  backgroundColor: isFollowing ? "#6c757d" : "#000",
                  transition: "all 0.2s ease",
                }}
              >
                {isFollowing ? "Unfollow" : "Follow"}
              </div>
            </div>

            <div className="otherUserProfile_parent_postContainer">
              <div className="otherUserProfile_container_title">Posts</div>
              <div className="otherUserProfile_posts_list">
                {otherUserPosts.length === 0 ? (
                  <p
                    style={{
                      textAlign: "center",
                      padding: "20px",
                      color: "#888",
                    }}
                  >
                    No posts yet
                  </p>
                ) : (
                  otherUserPosts.map((post) => (
                    <div
                      className="post_card"
                      key={post.post_id}
                      style={{ marginBottom: "1rem" }}
                    >
                      <div className="post_card_header">
                        <div className="header_user_container">
                          <div className="pfp_container">
                            <img
                              src={post.profile_image || pfpImage}
                              alt="user_pfp"
                            />
                          </div>
                          <div className="post_username">{post.username}</div>
                          <div className="post_date">
                            {timeAgo(post.post_date)}
                          </div>
                          <div className="post_category">
                            {post.post_category}
                          </div>
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
                          onClick={() => openComments(post)}
                        >
                          Comment
                        </button>
                        <button className="up_vote_btn">
                          <ArrowBigUp />
                          {post.up_tally_post || 0}
                        </button>
                        <button className="down_vote_btn">
                          <ArrowBigDown />
                          {post.down_tally_post || 0}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>
    
    </>)
}