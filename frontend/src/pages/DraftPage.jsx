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
  
    const [isSettingOpen, setIsSettingOpen] = useState(false);
    const [openHelpPage,cycleOpenHelpPage] = useCycle(false,true);


  
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
                isDropDownOpen={isDropDownOpen}
                toggleDropDown={toggleDropDown}
               
                openSetting={openSetting}
                openNotificationBar={isNotificationBarOpen}
                closeNotificationBar={()=>cycleNotificationBarOpen()}
                isActive={'draft'}
               
                openHelpPage={handleOpenHelpPage}
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