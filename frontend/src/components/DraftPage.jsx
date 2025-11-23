import {Search, X} from "lucide-react";
import "./DraftPage.css";

export default function DraftPage({isDraftPageOn,closeDraftPage}){
    return(<>
        <div className="draftPage_parent_container" style={{display: isDraftPageOn ? 'flex':'none'}}>
            <div className="draftPage_header">
                <div className="draftPage_title">Drafts</div>
                <div className="searchBar_container_draftPage"><Search/><input type="text"  className="searchBar_field" placeholder="Search"/></div>
            </div>
            <div className="drafts_container">

            </div>
             <button className="draftPage_close_btn" onClick={closeDraftPage}>
          <X className="crossSvg" />
        </button>
        </div>


    </>)
}