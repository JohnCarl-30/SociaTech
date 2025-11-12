import { CirclePlus,Search,Bell,UserRound,Settings,HandHelping,LogOut } from 'lucide-react';
import "./PageHeader.css"
import { useCycle } from 'framer-motion';




export default function PageHeader(){
      const[isDropDownModalOpen , cycleDrownDownModalOpen] = useCycle(false,true)
    


    return(<>
     <div className="page_header">
                    <img className="page_title_logo" src="src\assets\SociaTech_logo_blackbg.png" alt=""  />
                    
                    <div className="search_bar_container"><Search /><input type="text" placeholder='Search' className='search_bar'/></div>
    
                    <div className='side_header_btn'>
                        <button className="createPost_btn"><CirclePlus className='circlePlus_svg'/> Create</button>
                        <button className="notification_btn"><Bell className='bell_svg'/></button>
                        <div className="profile_btn" onClick={()=>{cycleDrownDownModalOpen()}}><img src="src\assets\deault_pfp.png" alt="default_pfp" className='profile_img'/></div>
                    </div>
                </div>



                <div className='dropDown_profile_modal' style={isDropDownModalOpen ? {display:'flex'}:{display:'none'}}>
                    <button className='dropDown_btn'> <UserRound />View Profile</button>
                    <button className='dropDown_btn'><Settings />Settings</button>
                    <button className='dropDown_btn'><HandHelping />Help</button>
                    <button className='dropDown_btn'><LogOut />Logout</button>
                </div>
    </>)
}