import { ChevronRight, UserRound, LockKeyhole, Eye, Bell, UserX, X } from 'lucide-react';
import "./Settings.css";
import { useState } from 'react';
import BlockedAccounts from "./BlockedAccounts";

export default function Settings({ style = {}, closeSetting, notifEnabled, setNotifEnabled }) {
    const [isOn, setIsOn] = useState(false);
    const [openBlockedAccounts, setOpenBlockedAccounts] = useState(false);

    function handleToggle() {
        setNotifEnabled(!notifEnabled);
        setIsOn(true);
    }

    return (
        <>
            <BlockedAccounts openModal={openBlockedAccounts} closeModal={() => setOpenBlockedAccounts(false)} />

            <div className='settings_parent_container' style={style}>
                <div className='settings_modal_container'>
                    <div className='settings_modal_title'>Settings</div>

                    <div className='settings_child_container'>
                        <div className='subSetting_title'>Account Settings</div>

                        <div className='subSetting_container'>
                            <div className='subSetting_child_container'>
                                <UserRound />
                                Edit Profile
                            </div>
                            <button><ChevronRight /></button>
                        </div>

                        <div className='subSetting_container'>
                            <div className='subSetting_child_container'>
                                <LockKeyhole />
                                Change Password
                            </div>
                            <button><ChevronRight /></button>
                        </div>
                    </div>

                    <div className='settings_child_container'>
                        <div className='subSetting_title'>Privacy Settings</div>

                        <div className='subSetting_container'>
                            <div className='subSetting_child_container'>
                                <Eye />
                                Visibility Settings
                            </div>
                            <button><ChevronRight /></button>
                        </div>

                        <div className='subSetting_container'>
                            <div className='subSetting_child_container'>
                                <UserX />
                                Blocked Accounts
                            </div>
                            <button onClick={() => setOpenBlockedAccounts(true)}><ChevronRight /></button>
                        </div>
                    </div>

                    <div className='settings_child_container'>
                        <div className='subSetting_title'>Notification Settings</div>

                        <div className='subSetting_container'>
                            <div className='subSetting_child_container'>
                                <Bell />
                                Turn on/off Notification
                            </div>
                            <div
                                onClick={handleToggle}
                                style={{
                                    backgroundColor: notifEnabled ? "black" : "#d1d5db",
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

                <button className='settings_close_btn' onClick={closeSetting}>
                    <X className='crossSvg' />
                </button>
            </div>
        </>
    );
}