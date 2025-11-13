import { Image } from "lucide-react"
import "./CreatePostModal.css"

export default function CreatePostModal({isOpen, onClose}){
    return(<>
    <div className="createPost_parent_modal" style={isOpen?{display:'flex'}:{display:'none'}} >
        <div className="createPost_container_modal">
          <div className="createPost_modal_title">Create Post</div>
          <select name="" id="" className="category_dropDown">
            <option value="" disabled selected>Category</option>
                          <option value="">Artificial Intelligence</option>
                          <option value="">Cyber Security</option>
                          <option value="">Networking</option>
                          <option value="">Cloud Engineering</option>
                          <option value="">Software Development</option>
                          <option value="">Dev Ops</option>
                          <option value="">Machine Learning</option>
                          <option value="">Virtual Reality</option>
                          <option value="">Augmented Reality</option>
          </select>
          <div className="create_title_field">
            <label htmlFor="" className="create_field_label">Title</label>
            <input type="text" className="create_field" />
          </div>
          <div className="create_body_field">
            <label htmlFor="" className="create_field_label">Body</label>
            <textarea type="text"  className="create_textarea"/>
          </div>
          <div className="create_footer_modal">
            <button className="upload_img_btn"><Image className="img_svg"/></button>
            <div className="cancelPost_btn_container">
              <button className="cancelPost_btn" onClick={onClose}>Cancel</button>
              <button className="cancelPost_btn">Post</button>
            </div>
          </div>
        </div>

      </div> </>
      
    )
}