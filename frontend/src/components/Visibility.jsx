import{Eye,X}from'lucide-react';
import './Visibility.css';


export default function Visibility({openModal, closeModal}){
    return(<>
    <div className='visibility_parent_container'style={{display: openModal? 'flex':'none'}} >
        <div className='visibility_modal'>
            <button className='visibility_close_container' onClick={closeModal}><X className='closeSvg'/></button>
            <div className='vibility_modal_title'><Eye/>Visibility</div>
            <div className='visibility_modal_description'>Change who can see your post and what post you want to see</div>
            <div className='visibility_field_container'>
                Who can see your post
                <select name="" id="" className='visibility_select_field'>
                    <option value="">Public</option>
                    <option value="">Followers</option>
                </select>
            </div>
            <div className='visibility_field_container'>
                What post you want to see
                <select name="" id="" className='visibility_select_field'>
                    <option value="">Public</option>
                    <option value="">Followers</option>
                </select>
            </div>
            <div className='visibility_save_btn'><button>Save</button></div>

        </div>
    </div>
    </>)
}