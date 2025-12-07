import PageHeader from "../components/PageHeader";
import { Users, PanelTop, CircleAlert ,MessageSquare, Search } from "lucide-react";
import Nav from "../components/Nav";
import { useEffect, useState } from "react";
import { useCycle } from "framer-motion";
import ProfilePage from "../components/ProfilePage";
import Settings from "../components/Settings";
import OtherUserProfile from "../components/OtherUserProfile.jsx";
import { getUser } from "../utils/storage.js";
import { ToastContainer, toast } from "react-toastify";

import HelpPage from "../components/HelpPage.jsx";
import './AdminPanel.css';

export default function AdminPanel(){
    const [isDropDownOpen, setIsDropDownOpen] = useState(false);
    const [isNotificationBarOpen,cycleNotificationBarOpen]=useCycle(false,true);
    
    const [isSettingOpen, setIsSettingOpen] = useState(false);
    const [isProfilePageOpen, setIsProfilePageOpen] = useState(false);
    const [openHelpPage,cycleOpenHelpPage] = useCycle(false,true);
    const [reports,setReports] = useState([]);
    const [previewPost, setPreviewPost] = useState([]);
    const [previewComment, setPreviewComment] = useState([]);
    const [postType,setPostType] = useState('post');
    const [totalUsers, setTotalUsers] = useState();
    const [totalPosts, setTotalPosts] = useState();
    const [totalComments, setTotalComments] = useState();
    const [totalReports, setTotalReports] = useState();
    const [isOtherUserProfileOpen, setIsOtherUserProfileOpen] = useState(false);
    const [selectedUserId,setSelectedUserId] = useState('');
    const [viewProfileData, setViewProfileData]= useState({});
    
    

    
    
    const [rowUserActions, setRowUserActions] = useState({});
    const [rowContentActions, setRowContentActions] = useState({});
    
    const [selectedFilterOption,setSelectedFilterOption] =useState('all');
    const [searchTerm, setSearchTerm] = useState("");

    const user = getUser();
  const user_id = user?.id || null;
  const admin_username = user?.username || null;
  


     const closeOtherUserProfile = () => {
    setIsOtherUserProfileOpen(false);
    
  };

    useEffect(()=>{
        fetchReports();
        fetchDashboard();
        setPreviewPost([]);
        setPreviewComment([]);
        setPostType([]);
        
    },[]);


    const handleViewProfile =(userId)=>{
        if(userId === user_id){
            openProfilePage();
            return;
        }
        setIsOtherUserProfileOpen(true);
        setSelectedUserId(userId);
    }




  const closeProfilePage = () => setIsProfilePageOpen(false);
    const fetchDashboard= async() => {
        try{
            const res = await fetch('http://localhost/SociaTech/backend/auth/adminDashboard.php', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await res.json();
            if(data.success){
                setTotalUsers(data.total_users);
                setTotalPosts(data.total_posts);
                setTotalComments(data.total_comments);
                setTotalReports(data.total_reports);
            }
            else {
                console.log("fetch failed", data.message);
            }
        }catch(err){
            console.log("Error fetching posts:", err);
        }
    }

    const handleUserActionChange = (reportId, value) => {
        setRowUserActions(prev => ({
            ...prev,
            [reportId]: value
        }));
    };

    const handleContentActionChange = (reportId, value) => {
        setRowContentActions(prev => ({
            ...prev,
            [reportId]: value
        }));
    };

    

    const handleExecute = async (reportId,reportedUID,contentId,type,reason) => {
        const userAction = rowUserActions[reportId] || 'no_action';
        const contentAction = rowContentActions[reportId] || 'no_action';
        console.log(contentAction);
        const formData = new FormData();
        formData.append('userAction',userAction);
        formData.append('contentAction',contentAction);
        formData.append('reportId', reportId);
        formData.append('reportedUID',reportedUID);
        formData.append('contentId',contentId);
        formData.append('admin',admin_username);
        formData.append('type',type);
        formData.append('reason',reason);

        try{
      const res = await fetch('http://localhost/SociaTech/backend/auth/handleReportAction.php',{
        method:'POST',
        credentials:'include',
        body: formData,

      });
      const data = await res.json();

      if(data.success){
        toast.success(data.message);
      }

    }catch(err){
         console.error("Error creating post:", err);
      toast.error("Something went wrong while reporting. Please try again.");
    }
        




       
    };

    const filteredReports = reports.filter((report) => {
        const id = String(report.report_id || '').toLowerCase();
        const reportedBy = String(report.reported_by || '').toLowerCase();
        const reportedUid = String(report.reported_uid || '').toLowerCase();
        const reason = String(report.report_reason || '').toLowerCase();

        const matchesSearch =
            id.includes(searchTerm.toLowerCase()) ||
            reportedBy.includes(searchTerm.toLowerCase()) ||
            reportedUid.includes(searchTerm.toLowerCase()) ||
            reason.includes(searchTerm.toLowerCase());

        const matchesStatus =
            selectedFilterOption === "all" || report.status === selectedFilterOption;

        return matchesSearch && matchesStatus;
    });


    const openProfilePage = () => {
    setIsProfilePageOpen(true);
    setIsDropDownOpen(false); 
  };

   
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

    const fetchReports =async()=>{
        try{
            const res = await fetch('http://localhost/SociaTech/backend/auth/fetchReports.php', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await res.json();
            if(data.success){
                setReports(data.reports);
            }
            else {
                console.log("fetch failed", data.message);
            }
        }catch(err){
            console.log("Error fetching posts:", err);
        }
    }

    const fetchComment=async(contentId)=>{
        
        if(!contentId){
            toast.error('Preview Failed! Missing contentId');
        }
         const formData = new FormData();
         formData.append('contentId',contentId);
        try{
            const res = await fetch('http://localhost/SociaTech/backend/auth/fetchPreviewComment.php',{
                method:'POST',
                credentials: 'include',
                body: formData,
            });

             const data = await res.json();
                    if(data.success){
                        setPreviewComment(data.comment);
                        
                        
                    }else{
                        toast.error(data.message);
                    }
         }  catch(err){
            console.error("Error fetching comments comment:", err);
            toast.error("Something went wrong. Please try again.");
         }  
    }
    const fetchPost=async(contentId)=>{
        if(!contentId){
            toast.error('Preview Failed! Missing contentId');
        }
        const formData = new FormData();
        formData.append('contentId',contentId);
        try{
            const res = await fetch('http://localhost/SociaTech/backend/auth/fetchPreviewPost.php',{
                method:'POST',
                credentials: 'include',
                body: formData,
            });

        const data = await res.json();

      if (data.success) {
    if (data.post && data.post.length > 0) {
      
        if (data.post[0].post_content) {
            setPreviewPost(data.post);
            setPostType('post');
        } else if (data.post[0].post_image) {
            setPreviewPost(data.post);
            setPostType('image');
        }
    } else {
        toast.error("No content found! Post already deleted!");
    }
}


        }catch(err){
         console.error("Error creating post:", err);
      toast.error("Something went wrong. Please try again.");
        }
    }


    return(<>
        <div className="adminPanel_parent_container">
            <PageHeader
                isOnCreatePost={false}
                isOnSearchBar={false}
                isDropDownOpen={isDropDownOpen}
                toggleDropDown={toggleDropDown}
                openSetting={openSetting}
                openNotificationBar={isNotificationBarOpen}
                closeNotificationBar={()=>cycleNotificationBarOpen()}
             openProfilePage={openProfilePage}
                openHelpPage={handleOpenHelpPage}
            />
           
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

            <div className="adminPanel_child_container">
                <Nav currentPage="admin" />
                <div className="adminPanel_body">
                    <div className="adminPanel_title">Admin Panel</div>
                    

                     <div className="adminPanel_dashboard_container">
                                <div className="adminPanel_dashboard">
                                    <div className="dashboard_data_container">
                                        <div className="dashboard_data_title">Number of Users</div>
                                        <div className="dashboard_data">{totalUsers}</div>  
                                    </div>
                                    <Users />
                                </div>

                                <div className="adminPanel_dashboard">

                                    <div className="dashboard_data_container">

                                        <div className="dashboard_data_title">Number of Posts</div>

                                        <div className="dashboard_data">{totalPosts}</div>

                                    </div>

                                    <PanelTop/>

                                </div>

                                <div className="adminPanel_dashboard">

                                    <div className="dashboard_data_container">

                                        <div className="dashboard_data_title">Number of Comments</div>

                                        <div className="dashboard_data">{totalComments}</div>

                                    </div>

                                    <MessageSquare />

                                </div>

                                <div className="adminPanel_dashboard">

                                    <div className="dashboard_data_container">

                                        <div className="dashboard_data_title">Number of Reports</div>

                                        <div className="dashboard_data">{totalReports}</div>

                                    </div>

                                    <CircleAlert/>

                                </div>

                            </div>
                    
                    <div className="adminPanel_filter_container">
                        <div className="filterTab_container">
                            <div className="filterTab_btn" style={selectedFilterOption === 'all'? {backgroundColor:'whitesmoke',color:"black"}:{backgroundColor:'black',color:"white"}} onClick={()=>setSelectedFilterOption('all')}>All</div>
                            <div className="filterTab_btn" style={selectedFilterOption === 'pending'? {backgroundColor:'whitesmoke',color:"black"}:{backgroundColor:'black',color:"white"}} onClick={()=>setSelectedFilterOption('pending')}>Pending</div>
                            <div className="filterTab_btn"style={selectedFilterOption === 'resolved'? {backgroundColor:'whitesmoke',color:"black"}:{backgroundColor:'black',color:"white"}} onClick={()=>setSelectedFilterOption('resolved')}>Resolved</div>
                        </div>
                        <div className="filterTab_searchBar"><Search/><input type="text" className="filterTab_searchField" placeholder="Search" onChange={(e) => setSearchTerm(e.target.value)}/></div>
                    </div>
                    
                    <div className="adminPanel_reportTable_container">
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
                                    <th>Execute</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredReports.map((report)=>(
                                    <tr key={report.report_id}>
                                        <td>{report.report_id}</td>
                                        <td>{report.report_date}</td>
                                        <td><span className="">UID: {report.reported_by}</span></td>
                                        <td><span className="reportTable_viewUser" onClick={()=>handleViewProfile(report.reported_uid)}>UID: {report.reported_uid}</span></td>
                                        <td>{Array.isArray(report.report_reason)
                                            ? report.report_reason.map(reason => reason.replace(/\"/g, '').trim()).join(', ')
                                            : String(report.report_reason).replace(/[[\]"]/g, '').trim().split(',').join(', ')
                                        }</td>
                                        <td>
                                            {report.type === 'N/A' 
                                                ? 'N/A' 
                                                : report.type === 'post' 
                                                ? <span className="reportTable_viewContent"onClick={()=>{
                                                    fetchPost(report.content_id);
                                                    setPreviewComment([]);
                                                    setPostType('post');
                                                }}>View post</span> 
                                                : <span className="reportTable_viewContent" onClick={()=>{
                                                    fetchComment(report.content_id);
                                                    console.log(report.content_id);
                                                    setPreviewPost([]);
                                                    setPostType('comment');
                                                }}>View comment</span>
                                            }
                                        </td>
                                        <td className="reportTable_status" style={report.status === 'resolved'? {color:'green'}:{color:'red'}}>{report.status}</td>
                                        
                                        <td>
                                            <select 
                                                value={rowUserActions[report.report_id] || 'no_action'}
                                                onChange={(e) => handleUserActionChange(report.report_id, e.target.value)} 
                                                className="reportTable_select"
                                            >
                                                <option value="no_action">User Action</option>
                                                <option value="suspend">Suspend User</option>
                                                <option value="ban">Ban User</option>
                                            </select>
                                            {report.type !== 'N/A' &&(<select 
                                                value={rowContentActions[report.report_id] || 'no_action'}
                                                onChange={(e) => handleContentActionChange(report.report_id, e.target.value)} 
                                                className="reportTable_select"
                                            >
                                                <option value="no_action">Content Action</option>
                                                {report.type === 'comment' &&(<option value="delete_comment">Delete Comment</option>)}
                                                {report.type === 'post' &&(<option value="delete_post">Delete Post</option>)}
                                            </select>)}
                                        </td>

                                        <td>
                                            <button 
                                                onClick={() => handleExecute(report.report_id,report.reported_uid,report.content_id, postType, report.report_reason )}
                                                className="reportTable_execute_btn" 
                                            >
                                                Execute
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
        {previewComment.length > 0 && (
                        <div 
                            className="previewComment_modal" 
                            onClick={() => setPreviewComment([])}>
                            {previewComment.map((comment, index) => (
                            <div
                                key={index}
                                className="previewComment_comment"
                                onClick={(e) => e.stopPropagation()}>

                                <div className="previewComment_commentContent"> {comment.comment_content}</div> 
                                {comment.comment_image && (
                                <img src={comment.comment_image} alt="" className="previewComment_imgContainer"/>
                                )}
                            </div>
                            ))}
                        </div>
                        )}

                    {previewPost.length > 0 && (
                    <div className="previewPost_modal" onClick={()=>setPreviewPost([])} >
                        {previewPost.map((post) => (
                            
                             postType === 'post'
                            ? 
                            <div className="previewPost_content" onClick={(e) => e.stopPropagation()} key={post.post_id || index}>
                                <div className="previewPost_title">{post.post_title}</div>
                                <div>{post.post_content}</div>
                            </div>
                            : <div className="previewPost_imgContainer"  onClick={(e) => e.stopPropagation()}  key={post.post_id || index}>
                                 <div className="previewPost_title">{post.post_title}</div>
                                <img src={post.post_image} alt="" /></div>
                        ))}
                    </div>
                    )}

                    <OtherUserProfile openModal={isOtherUserProfileOpen} uid={selectedUserId} closeModal={closeOtherUserProfile}/>
    </>);
}