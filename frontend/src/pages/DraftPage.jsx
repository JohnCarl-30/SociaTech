import {Search} from "lucide-react";
import "./DraftPage.css";
import PageHeader from '../components/PageHeader';
import ProfilePage from '../components/ProfilePage';
import HelpPage from '../components/HelpPage';
import Settings from '../components/Settings';
import Nav from '../components/Nav';
import { useState } from "react";
import { useCycle } from "framer-motion";
export default function DraftPage(){
     const [isDropDownOpen, setIsDropDownOpen] = useState(false);
    const [isNotificationBarOpen,cycleNotificationBarOpen]=useCycle(false,true);
  const [isProfilePageOpen, setIsProfilePageOpen] = useState(false);
    const [isSettingOpen, setIsSettingOpen] = useState(false);
    const [openHelpPage,cycleOpenHelpPage] = useCycle(false,true);


  const openProfilePage = () => {
    setIsProfilePageOpen(true);
    setIsDropDownOpen(false); 
  };
  const closeProfilePage = () => setIsProfilePageOpen(false);
    const openSetting = () => {
        setIsSettingOpen(true);
        setIsDropDownOpen(false);
    };
   
    const closeSetting=()=> setIsSettingOpen(false);

    const toggleDropDown = () => setIsDropDownOpen((prev) => !prev);


    const handleOpenHelpPage = ()=>{
        cycleOpenHelpPage();
        setIsDropDownOpen(false);
    }
    return(<>
        <div className="draftPage_parent_container" >
           <PageHeader
                                   isOnCreatePost={false}
                                   isOnSearchBar={false}
                                   // onPostCreated={fetchPost}
                                   isDropDownOpen={isDropDownOpen}
                                   toggleDropDown={toggleDropDown}
                                   openProfilePage={openProfilePage}
                                   openSetting={openSetting}
                                   openNotificationBar={isNotificationBarOpen}
                                   closeNotificationBar={()=>cycleNotificationBarOpen()}
                                   
                                 />
                                  <ProfilePage
                       style={isProfilePageOpen ? "flex" : "none"}
                       closeProfilePage={closeProfilePage}
                     />
            
          
            <HelpPage openPage={openHelpPage} closePage={cycleOpenHelpPage}/>
            <Settings style={isSettingOpen ? 'flex' : 'none'} closeSetting={closeSetting}/>
            <div className="draftPage_child_container">
                 <Nav currentPage="admin" />
                <div className="draftPage_body">
                    <div className="draftPage_title">Drafts</div>
                    <div className="drafts_container">
                    </div>
                
                </div>
                
            </div>
          
        
        
        </div>


    </>)
}