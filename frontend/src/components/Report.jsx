import { CircleAlert } from "lucide-react";
import "./Report.css";
import { useState,useEffect } from "react";




export default function Report({ isOpen, onClose, type, reportedBy, reportedUID,contentId }) {
  const [selectedReasons, setSelectedReasons] = useState([]);
  const reportOptions = [
    "Not tech related",
  "Spam content",
  "Nudity or Sexual Content",
  "Violence",
  "Bullying Harassment",
  "Suicide or Self-injury",
  "Misinformation",
  "Selling illegal items",
  "Scams or fraud",
  "Copyright or intellectual property",
];
useEffect(() => {
  if (isOpen) {
    setSelectedReasons([]); // reset every time it opens
  }
}, [isOpen]);




const handleCheckboxChange = (e) => {
  const value = e.target.value;
  
  if (e.target.checked) {
    // add to array
    setSelectedReasons((prev) => [...prev, value]);
  } else {
    // remove from array
    setSelectedReasons((prev) => prev.filter((reason) => reason !== value));
  }
};


  const handleClose = () => {
    setSelectedReasons([]);
    onClose();

  };
  const handleBackdropClick = (e) => {
    if (e.target.className === "report_post_parent_modal") {
      handleClose();
    }
  };

  const handleReport = async()=>{

    if( !reportedBy || !reportedUID){
      alert('Missing report data');
      return
    }
    if(selectedReasons.length === 0){
      alert('Please select at least one reason');
      return;
    }

    const formData = new FormData();
    formData.append('type',type);
    formData.append('reportedBy',reportedBy);
    formData.append('reportedUID',reportedUID);
    formData.append('reportReason',JSON.stringify(selectedReasons));
    formData.append('contentId',contentId);
    try{
      const res = await fetch('http://localhost/SociaTech/backend/auth/addReport.php',{
        method:'POST',
        body: formData,
      });
      const data = await res.json();

      if(data.success){
        alert(data.message);
        onClose();
      }

    }catch(err){
         console.error("Error creating post:", err);
      alert("Something went wrong while reporting. Please try again.");
    }



  }
 

  if (!isOpen) return null;

  return (
    <>
      <div
        className="report_post_parent_modal"
        style={isOpen ? { display: "flex" } : { display: "none" }}
        onClick={handleBackdropClick}
      >
        <div className="report_post_modal">
          <div className="report_post_title">
            <CircleAlert />
            <div>Report Post</div>
          </div>
          <div className="report_post_subtitle">What's going on?</div>
          <div className="report_post_option_container">
            {reportOptions.map((option,index)=>(
               <div className="option_container" key={index}>
                <input
                  type="checkbox"
                  className="radio_btn"
                  value={option}
                  checked={selectedReasons.includes(option)}
                  onChange={handleCheckboxChange}
                />
                {option}
                  
                </div>
            ))}
          </div>
         
          
           

          <div className="report_post_actionBtn_container">
            <button className="report_post_btn" onClick={onClose}>
              cancel
            </button>
            <button className="report_post_btn" onClick={()=>handleReport()}>report</button>
          </div>
        </div>
      </div>
    </>
  );
}
