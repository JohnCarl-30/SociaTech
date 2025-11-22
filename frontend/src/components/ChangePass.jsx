import {LockKeyhole, X} from "lucide-react";
import "./ChangePass.css";


export default function ChangePass({openChangePass,closeChangePass}){
    

    

    return(<>

        <div className="changePass_parent_container" style={{display: openChangePass? 'flex':'none'}} >
            <div className="changePass_modal">
                <button className="changePass_close_btn" onClick={closeChangePass}><X className="closeSvg"/></button>
                <div className="changePass_modal_title"><LockKeyhole/> Password</div>
                <div className="changePass_requirement">Your Password must be at least 8 characters and should include a combination of numbers, letters and special characters.</div>
                <input type="password"  placeholder="Current Password" className="changePass_fields"/>
                <input type="password"  placeholder="New Password" className="changePass_fields"/>
                <input type="password"  placeholder="Confirm Password" className="changePass_fields"/>
                <div className="forgetPass_container"><a href="" className="forgetPass_link">Forgot Password</a></div>
                <div className="ChangePass_btn_container"><button className="">Change Password</button></div>
            </div>
        </div>

    </>)
}