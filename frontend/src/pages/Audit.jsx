import PageHeader from "../components/PageHeader";
import { Users, PanelTop, CircleAlert ,MessageSquare, Search } from "lucide-react";
import Nav from "../components/Nav";
import { useEffect, useState } from "react";
import { useCycle } from "framer-motion";
import ProfilePage from "../components/ProfilePage";
import Settings from "../components/Settings";

import { getUser } from "../utils/storage.js";

import HelpPage from "../components/HelpPage.jsx";
import './Audit.css';


export default function Audit(){

    const [isDropDownOpen, setIsDropDownOpen] = useState(false);
   
    
    const [isSettingOpen, setIsSettingOpen] = useState(false);
    const [isProfilePageOpen, setIsProfilePageOpen] = useState(false);
    const [openHelpPage,cycleOpenHelpPage] = useCycle(false,true);
    const [audits,setAudits] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");


 useEffect(()=>{
        
   fetchAudit();
   
        
    },[]);



     const fetchAudit =async()=>{
        try{
            const res = await fetch('http://localhost/SociaTech/backend/auth/fetchAudits.php', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await res.json();
            if(data.success){
                const auditsData = Array.isArray(data.audits) ? data.audits : [data.audits];
                setAudits(auditsData);
            }
            else {
                console.log("fetch failed", data.message);
            }
        }catch(err){
            console.log("Error fetching posts:", err);
        }
    }

    const filteredAudits = audits.filter((audit) => {
        const id = String(audit.audit_id || '').toLowerCase();
        const adminName = String(audit.admin_username || '').toLowerCase();
        const actionType = String(audit.action || '').toLowerCase();
        const reason = String(audit.action_reason || '').toLowerCase();
        const affectedUid = String(audit.affected_user || '').toLowerCase();

        const matchesSearch =
            id.includes(searchTerm.toLowerCase()) ||
            adminName.includes(searchTerm.toLowerCase()) ||
            actionType.includes(searchTerm.toLowerCase()) ||
            reason.includes(searchTerm.toLowerCase()) ||
            affectedUid.includes(searchTerm.toLowerCase()); 

       

        return matchesSearch;
    });
      const user = getUser();
  const user_id = user?.id || null;

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
    const openProfilePage = () => {
    setIsProfilePageOpen(true);
    setIsDropDownOpen(false); 
  };

 const closeProfilePage = () => setIsProfilePageOpen(false);

    return(<>
     <div className="auditPage_parent_container">
            <PageHeader
                isOnCreatePost={false}
                isOnSearchBar={false}
                isDropDownOpen={isDropDownOpen}
                toggleDropDown={toggleDropDown}
                openSetting={openSetting}
              
                
             openProfilePage={openProfilePage}
                openHelpPage={handleOpenHelpPage}
            />
           
         
                                 <ProfilePage
                      style={isProfilePageOpen ? "flex" : "none"}
                      closeProfilePage={closeProfilePage}
                    />
            <HelpPage openPage={openHelpPage} closePage={cycleOpenHelpPage}/>
            <Settings style={isSettingOpen ? 'flex' : 'none'} closeSetting={closeSetting}/>

            <div className="auditPage_child_container">
                <Nav currentPage="audit" />
                <div className="auditPage_body">
                    <div className="auditPage_title">Audit Log</div>
                    
                    <div className="auditPage_auditTable_container">
                        <div className="auditTable_title"><span>Action logs</span><div className="filterTab_searchBar"><Search/><input type="text" className="filterTab_searchField" placeholder="Search" onChange={(e) => setSearchTerm(e.target.value)}/></div></div>
                        <table className="auditTable">
                            <thead>
                                <tr>
                                    <th>Log Id</th>
                                    <th>Date of Action</th>
                                    <th>Action made by</th>
                                    <th>Action</th>
                                    <th>Type of content</th>
                                    <th>Affected User</th>
                                    <th>Reason</th>
                                </tr>
                            </thead>
                            <tbody>
                              
                                    {filteredAudits.map((audit)=>(<tr key={audit.audit_id}>
                                        <td>{audit.audit_id}</td>
                                        <td>{audit.timestamp}</td>
                                        <td>{audit.admin_username}</td>
                                        <td>{audit.action}</td>
                                        <td>{audit.type}</td>
                                        <td>UID: {audit.affected_user}</td>
                                        <td>{Array.isArray(audit.action_reason)
                                            ? audit.action_reason.map(reason => reason.replace(/\"/g, '').trim()).join(', ')
                                            : String(audit.action_reason).replace(/[[\]"]/g, '').trim().split(',').join(', ')
                                        }</td>
                                    </tr>))}
                                
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
        

                  
    </>)
}