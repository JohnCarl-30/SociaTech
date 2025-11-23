import PageHeader from "../components/PageHeader";
import { Users, PanelTop, CircleAlert ,MessageSquare, Search } from "lucide-react";
import Nav from "../components/Nav";
import CategorySlider from "../components/CategorySlider";
import { useEffect, useState,useRef } from "react";
import { useCycle } from "framer-motion";
import ProfilePage from "../components/ProfilePage";
import Settings from "../components/Settings";
import DraftPage from "../components/DraftPage.jsx";
import HelpPage from "../components/HelpPage.jsx";
import './AdminPanel.css';



export default function AdminPanel(){
     const [isDropDownOpen, setIsDropDownOpen] = useState(false);
  const [isNotificationBarOpen,cycleNotificationBarOpen]=useCycle(false,true);
    const [isProfilePageOpen, setIsProfilePageOpen] = useState(false);
  const [isSettingOpen, setIsSettingOpen] = useState(false);
  const [openDraftPage, cycleOpenDraftPage] = useCycle(false,true);
  const [openHelpPage,cycleOpenHelpPage] = useCycle(false,true);

  const openProfilePage = () => {
    setIsProfilePageOpen(true);
    setIsDropDownOpen(false); 
  };
  const openSetting = () => {
    setIsSettingOpen(true);
    setIsDropDownOpen(false);
  };
  const closeProfilePage = () => setIsProfilePageOpen(false);
  const closeSetting=()=> setIsSettingOpen(false);

   const toggleDropDown = () => setIsDropDownOpen((prev) => !prev);

const handleOpenDraftPage = ()=>{
    cycleOpenDraftPage();
    setIsDropDownOpen(false);
  }
  const handleOpenHelpPage = ()=>{
    cycleOpenHelpPage();
    setIsDropDownOpen(false);
  }


    return(<>
            <div className="adminPanel_parent_container">
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
                        openDraftPage={handleOpenDraftPage}
                        openHelpPage={handleOpenHelpPage}
                        
                      />
                       <ProfilePage
                                  style={isProfilePageOpen ? "flex" : "none"}
                                  closeProfilePage={closeProfilePage}
                                />
                                 <DraftPage isDraftPageOn={openDraftPage} closeDraftPage={cycleOpenDraftPage}/>
                      
                                            <HelpPage openPage={openHelpPage} closePage={cycleOpenHelpPage}/>
                                <Settings style={isSettingOpen ? 'flex' : 'none'}
                                closeSetting={closeSetting}/>

                <div className="adminPanel_child_container">
                     <Nav currentPage="admin" />
                     <div className="adminPanel_body">
                            <div className="adminPanel_title">Admin Panel</div>
                            <div
                             className="adminPanel_dashboard_container">
                                <div className="adminPanel_dashboard">
                                    <div className="dashboard_data_container">
                                        <div className="dashboard_data_title">Number of Users</div>
                                        <div className="dashboard_data">0</div>  
                                    </div>
                                    <Users />

                                </div>
                                <div className="adminPanel_dashboard">
                                    <div className="dashboard_data_container">
                                        <div className="dashboard_data_title">Number of Posts</div>
                                        <div className="dashboard_data">0</div>
                                    </div>
                                    <PanelTop/>
                                </div>
                                <div className="adminPanel_dashboard">
                                    <div className="dashboard_data_container">
                                        <div className="dashboard_data_title">Number of Comments</div>
                                        <div className="dashboard_data">0</div>
                                    </div>
                                    <MessageSquare />
                                </div>
                                <div className="adminPanel_dashboard">
                                    <div className="dashboard_data_container">
                                        <div className="dashboard_data_title">Number of Reports</div>
                                        <div className="dashboard_data">0</div>
                                    </div>
                                    <CircleAlert/>
                                </div>
                            </div>
                            <div
                             className="adminPanel_filter_container">
                                <div className="filterTab_container">
                                    <div className="filterTab_btn">All</div>
                                    <div className="filterTab_btn">Pending</div>
                                    <div className="filterTab_btn">Resolved</div>
                                </div>
                                <div className="filterTab_searchBar"><Search/><input type="text" className="filterTab_searchField" placeholder="Search"/></div>

                             </div>
                            <div
                             className="adminPanel_reportTable_container">
                                <div className="reportTable_title">Reports</div>
                                <table className="reportTable">
                                    <thead>
                                        <tr>
                                            <th>Report ID</th>
                                            <th>Date Reported</th>
                                            <th>Reported By</th>
                                            <th>Reported UID</th>
                                            <th>Report Reason</th>
                                            <th>Reported Content</th>
                                            <th>Status</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            
                                           <td>Sample</td>
                                           <td>Sample</td>
                                           <td>Sample</td>
                                           <td>Sample</td>
                                           <td>Sample</td>
                                           <td>Sample</td>
                                           <td>Sample</td>
                                           <td>Sample</td>
                                        </tr>
                                         <tr>
                                            <td>Sample</td>
                                           <td>Sample</td>
                                           <td>Sample</td>
                                           <td>Sample</td>
                                           <td>Sample</td>
                                           <td>Sample</td>
                                           <td>Sample</td>
                                           <td>Sample</td>
                                        </tr>
                                         <tr>
                                            
                                           <td>Sample</td>
                                           <td>Sample</td>
                                           <td>Sample</td>
                                           <td>Sample</td>
                                           <td>Sample</td>
                                           <td>Sample</td>
                                           <td>Sample</td>
                                           <td>Sample</td>
                                        </tr>
                                         <tr>
                                            
                                            <td>Sample</td>
                                           <td>Sample</td>
                                           <td>Sample</td>
                                           <td>Sample</td>
                                           <td>Sample</td>
                                           <td>Sample</td>
                                           <td>Sample</td>
                                           <td>Sample</td>
                                        </tr>
                                    </tbody>
                                </table>

                             </div>

                     </div>
                    
                </div>



            </div>





    </>);
}