import "./ProfilePage.css";
import {  ArrowBigUp,
  ArrowBigDown,
  Bookmark,
  AlertCircle,
  Image,
  X,
  Ban,
  Edit,
  Trash2,
  Search } from "lucide-react";
import pfpImage from "../assets/deault_pfp.png";
import SamplePost from "../assets/samplePost.png";
import { useState, useEffect } from "react";
import { getUser } from "../utils/storage";
export default function ProfilePage({ style, closeProfilePage }) {
  const [image, setImage] = useState(null);
  const [imageURL, setImageURL] = useState(null);
  const [isOpenPage, setOpenPage] = useState('post');
  const [username, setUsername] = useState("");
  const [postCount, setPostCount] = useState("");
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true); 
  const [Achievements, setAchievements] = useState("");
  const [profileImage, setProfileImage] = useState(pfpImage);
  const [uploading, setUploading] = useState(false);
  
  const user = getUser();
  const user_id = user?.id || null;
  
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
        alert("Profile photo updated successfully!");
      } else {
        alert("Failed to update profile photo: " + (data.message || "Unknown error"));
      }
    } catch (err) {
      console.log("Error uploading profile photo:", err);
      alert("Error uploading profile photo");
    } finally {
      setUploading(false);
    }
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


  // Fetch user stats from backend
  useEffect(() => {
    const fetchUserStats = async () => {
      if (!user_id) return;
      
      try {
        const res = await fetch(
          `http://localhost/SociaTech/backend/auth/getUserStats.php?user_id=${user_id}`
        );
        const data = await res.json();
        
        if (data.success) {
          setUsername(data.username || "Unknown User");
          setPostCount(data.post_count || 0); 
          setAchievements(data.Achievements_count || 0);
          setProfileImage(data.profile_image || pfpImage);
        }
      } catch (err) {
        console.log("Error fetching user stats:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserStats();
  }, [user_id]);
  
  // Fetch user's posts
  useEffect(() => {
    const fetchUserPosts = async () => {
      if (!user_id) return;
      
      try {
        const res = await fetch(
          `http://localhost/SociaTech/backend/auth/fetchPost.php?user_id=${user_id}`
        );
        const data = await res.json();
        
        if (data.success) {
          setUserPosts(data.posts || []);
        }
      } catch (err) {
        console.log("Error fetching user posts:", err);
      }
    };
    
    fetchUserPosts();
  }, [user_id]);

  
  const handleImageUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

 

  useEffect(() => {
    if (!image) return;

    const newURL = URL.createObjectURL(image);
    setImageURL(newURL);

    return () => {
      URL.revokeObjectURL(newURL);
    };
  }, [image]);

  return (
    <>
      <div className="profilePage_parent_container" style={{ display: style }}>
        <div className="profilePage_container">
          <div className="header_profile_container">
            <div className="pfp_username_container">
              <img src={profileImage} alt="" className="profilePic" />
              <div className="userName_container">{loading ? "Loading..." : username}</div>
            </div>
            <div className="profilePage_dashboard">
              <div className="dashBoard_container">
                <div>{postCount}</div>
                <div>Post</div>
              </div>
               
              <div className="dashBoard_container">
                <div>0</div>
                <div>Followers</div>
              </div>
               <div className="dashBoard_container">
                <div>0</div>
                <div>Following</div>
              </div>
            </div>
          </div>
          <div className="profilePage_nav_container">
            <button className="profilePage_nav_child" style={isOpenPage=='post'?{backgroundColor:'black',color:'white'}:{backgroundColor:'white',color:'black'}} onClick={()=>setOpenPage('post')}>Post</button>
            <button className="profilePage_nav_child"   style={isOpenPage=='saved'?{backgroundColor:'black',color:'white'}:{backgroundColor:'white',color:'black'}} onClick={()=>setOpenPage('saved')}>Saved</button>
            <button className="profilePage_nav_child" style={isOpenPage=='EditProfile'?{backgroundColor:'black',color:'white'}:{backgroundColor:'white',color:'black'}} onClick={()=>setOpenPage('EditProfile')}>Edit Profile</button>
          </div>
          
          <div className="profilePage_child_container">
            {isOpenPage=='post'&&(<div className="profilePage_post_container">
            {userPosts.length > 0 ? (
                userPosts.map((post) => (
                   <div className="post_card" key={post.post_id} style={{ marginBottom: '1rem' }}>
                                        <div className="post_card_header">
                                          <div className="header_user_container">
                                            <div className="pfp_container">
                                              <img src={post.profile_image || pfpImage} alt="user_pfp" />
                                            </div>
                                            <div className="post_username">{post.username}</div>
                                            <div className="post_date">{timeAgo(post.post_date)}</div>
                                            <div className="post_category">{post.post_category}</div>
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
                                          <button className="post_comment_btn" /*onClick={() => openComments(post)}*/>
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
              ) : (
                <div>No posts yet</div>
              )}
              </div>)}
            {isOpenPage=='saved'&&(<div className="profilePage_savePost_title">Saved Post</div>)}
            <div className="profilePage_achievements_Container">
              <div>Achievements</div>
            </div>
            {isOpenPage=='EditProfile'&&(<div className="profilePage_editProfile_Container">
                <div className="profilePage_childContainer_title">
                  Edit Profile
                </div>
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
                    style={{ display: "none" }}
                    onChange={handleImageUpload}
                  />
                  {imageURL && (
                    <button 
                      className="change_pfp_btn" 
                      onClick={handleSaveProfilePhoto}
                      disabled={uploading}
                      style={{ marginLeft: '1rem' }}
                    >
                      {uploading ? "Saving..." : "Save Photo"}
                    </button>
                  )}
                </div>
                <div className="changeProfile_field_container">
                  <label htmlFor="">Bio</label>
                  <div className="changeProfile_field_childContainer">
                    <input type="text" />|
                    <button className="changeProfile_btn">Change</button>
                  </div>
                </div>
                <div className="changeProfile_field_container">
                  <label htmlFor="">Name</label>
                  <div className="changeProfile_field_childContainer">
                    <input type="text" />|
                    <button className="changeProfile_btn">Change</button>
                  </div>
                </div>
                <div className="changeProfile_field_container">
                  <label htmlFor="">Username</label>
                  <div className="changeProfile_field_childContainer">
                    <input type="text" />|
                    <button className="changeProfile_btn">Change</button>
                  </div>
                </div>
            </div>)}
          </div>
        </div>
        <button className="profilePage_close_btn" onClick={closeProfilePage}>
          <X className="crossSvg" />
        </button>
      </div>
    </>
  );
}
