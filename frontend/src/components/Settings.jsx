import { ChevronRight,UserRound,LockKeyhole,Eye,Bell, X} from 'lucide-react';
import "./Settings.css";
import { useState } from 'react';
import ChangePass from "./ChangePass.jsx";
import Visibility from './Visibility.jsx';

export default function Settings({ style, closeSetting,notifEnabled,
  setNotifEnabled, }){
     const [isOn, setIsOn] = useState(false);
     const [openChangePass,setOpenChangePass] = useState(false);
     const [openVisibility,setOpenVisibility] =useState(false)

  function handleToggle() {
    setNotifEnabled(!notifEnabled);
    setIsOn(true);
  }
    return(<>
            <ChangePass openChangePass={openChangePass} closeChangePass={()=> setOpenChangePass(false)}/>
            <Visibility openModal={openVisibility} closeModal={()=>setOpenVisibility(false)}/>
        
            <div className='settings_parent_container' style={{display:style}}>
                <div className='settings_modal_container'>
                    <div className='settings_modal_title'>Settings</div>
                
                    <div className='settings_child_container'>
                        <div className='subSetting_title'>Account Settings</div>
                        <div className='subSetting_container'>
                            <div className='subSetting_child_container'>
                                <UserRound/>
                                Edit Profile
                            </div>
                            <button ><ChevronRight/></button>
                        </div>
                        <div className='subSetting_container'>
                            <div className='subSetting_child_container'>
                                <LockKeyhole/>
                                Change Password
                            </div>
                           <button onClick={()=>setOpenChangePass(true)}><ChevronRight/></button>
                        </div>
                    </div>
                    <div className='settings_child_container'>
                        <div className='subSetting_title'>Privacy Settings</div>
                        <div className='subSetting_container'>
                            <div className='subSetting_child_container'>
                                <Eye/>
                                Visibility Settings
                            </div>
                            <button onClick={()=>setOpenVisibility(true)}><ChevronRight/></button></div>
                        
                
                        </div>
                    <div className='settings_child_container'>
                        <div className='subSetting_title'>Notification Settings</div>
                        <div className='subSetting_container'>
                            <div className='subSetting_child_container'>
                                <Bell/>
                                Turn on/off Notification
                            </div>
                            <div
      onClick={handleToggle}
      style={{
        
        backgroundColor: isOn ? "black" : "#d1d5db", 
      }}
       className='toggleBody'
    >
      <div
         style={{
                    transform: notifEnabled
                      ? "translateX(1.5em)"
                      : "translateX(0)",
                  }}
        className='toggleCircle'
      ></div>
    </div>
                        </div>
                    </div>
                </div>
                <button className='settings_close_btn' onClick={closeSetting}><X className='crossSvg'/>
                </button>
            </div>
    </>)
}