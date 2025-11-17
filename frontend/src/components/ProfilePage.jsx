import "./ProfilePage.css"
import pfpImage from '../assets/deault_pfp.png';
import SamplePost from "../assets/samplePost.png"
export default function ProfilePage(){
    return(<>
    <div className="profilePage_parent_container">
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
            <div className="profilePage_post_container">
                <img src={SamplePost} alt="" className="samplePost"/>
                              <img src={SamplePost} alt="" className="samplePost2"/>
                              <img src={SamplePost} alt="" className="samplePost"/>
                              <img src={SamplePost} alt="" className="samplePost"/>
                              <img src={SamplePost} alt="" className="samplePost"/>
            </div>
        </div>
    </div>
    </>)
}