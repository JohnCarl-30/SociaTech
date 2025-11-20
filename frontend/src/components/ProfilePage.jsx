import "./ProfilePage.css"
import {X} from "lucide-react";
import pfpImage from '../assets/deault_pfp.png';
import SamplePost from "../assets/samplePost.png"
import { useState,useEffect } from "react";


export default function ProfilePage({style,closeProfilePage}){
    const [image, setImage] = useState(null);
    const [imageURL, setImageURL] = useState(null);
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

   
    return(<>
    <div className="profilePage_parent_container" style={{display:style}}> 
       
        <div className="profilePage_container">
            <div className="header_profile_container">
                <div className="pfp_username_container">
                    <img src={pfpImage} alt="" className="profilePic" />
                    <div className="userName_container">Sample Username</div>
                </div>
                <div className="profilePage_dashboard">
                    <div className="dashBoard_container">
                        <div>0</div>
                        <div>Post</div>
                    </div>
                    <div className="dashBoard_container">
                        <div>0</div>
                        <div>Achievements</div>
                    </div>
                    <div className="dashBoard_container">
                        <div>0</div>
                        <div>Followers</div>
                    </div>
                </div>
            </div>
            <div className="profilePage_nav_container">
                <button className="profilePage_nav_child">Post</button>
                <button className="profilePage_nav_child">Saved</button>
                <button className="profilePage_nav_child">Achievements</button>
                <button className="profilePage_nav_child">Edit Profile</button>
            </div>
            <div className="profilePage_child_container">
                
                <div className="profilePage_post_container">
                    <img src={SamplePost} alt="" className="samplePost"/>
                                  <img src={SamplePost} alt="" className="samplePost2"/>
                                  <img src={SamplePost} alt="" className="samplePost"/>
                                  <img src={SamplePost} alt="" className="samplePost"/>
                                  <img src={SamplePost} alt="" className="samplePost"/>
                </div>
                <div className="profilePage_savePost_Container">
                    <div>Saved Post</div>
                </div>
                <div className="profilePage_achievements_Container">
                    <div>Achievements</div>
                </div>
                <div className="profilePage_editProfile_Container">
                    <div className="profilePage_childContainer_title">Edit Profile</div>
                    <div className="change_pfp_container">
                         <img
                            src={imageURL || pfpImage}
                            alt="User Profile Pic"
                            className="changePfp_img"
                            />

                        
                            <label className="change_pfp_btn" htmlFor="changePfp_field">
                                Change
                                </label>
            <input
              id="changePfp_field"
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleImageUpload}
            />
                    </div>
                    <div className="changeProfile_field_container">
                        <label htmlFor="">Bio</label>
                        <div className="changeProfile_field_childContainer"><input type="text" />|<button className="changeProfile_btn">Change</button></div>
                    </div>
                     <div className="changeProfile_field_container">
                        <label htmlFor="">Name</label>
                        <div  className="changeProfile_field_childContainer"><input type="text" />|<button className="changeProfile_btn">Change</button></div>
                    </div>
                     <div className="changeProfile_field_container">
                        <label htmlFor="">Username</label>
                        <div  className="changeProfile_field_childContainer"><input type="text" />|<button className="changeProfile_btn">Change</button></div>
                    </div>


                </div>
                

            </div>
        </div>
         <button className="profilePage_close_btn" onClick={closeProfilePage}>
    <X className="crossSvg"/>
  </button>
    </div>
    </>)
}