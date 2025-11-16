import {CircleAlert} from "lucide-react";
import "./Report.css"
export default function Report({isOpen = true, onClose} ){
    return(<>
        <div className="report_post_parent_modal"  style={isOpen?{display:'flex'}:{display:'none'}}>
            <div className="report_post_modal">
                <div className="report_post_title"><CircleAlert /><div>Report Post</div></div>
                <div className="report_post_subtitle">What's going on?</div>
                <div className="report_post_option_container">
                    
                    <div className="option_container"><input type="checkbox" name="" id=""  className="radio_btn"/>Nudity or Sexual Content</div>
                    <div className="option_container"><input type="checkbox" name="" id=""  className="radio_btn"/>Violence</div>
                    <div className="option_container"><input type="checkbox" name="" id=""  className="radio_btn"/>Bullying Harassment</div>
                    <div className="option_container"><input type="checkbox" name="" id=""  className="radio_btn"/>Suicide or Self-injury</div>
                    <div className="option_container"><input type="checkbox" name="" id=""  className="radio_btn"/>Misinformation</div>
                    <div className="option_container"><input type="checkbox" name="" id=""  className="radio_btn"/>Selling illegal items</div>
                    <div className="option_container"><input type="checkbox" name="" id=""  className="radio_btn"/>Scams or fraud</div>
                    <div className="option_container"><input type="checkbox" name="" id=""  className="radio_btn"/>Copyright or intellectual property</div>
                </div>

                <div className="report_post_actionBtn_container"><button className="report_post_btn" onClick={onClose}>cancel</button><button className="report_post_btn">report</button></div>
            </div>
        </div>
    </>)
}