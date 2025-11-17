import Nav from "../components/Nav";
import CategorySlider from "../components/CategorySlider";
import PageHeader from "../components/PageHeader";
import { ArrowBigUp,ArrowBigDown } from 'lucide-react';
import "./Home.css";
import { useEffect,useState } from "react";

import pfpImage from '../assets/deault_pfp.png';
export default function Homepage() {
  const [posts,setPosts] = useState([]);
  useEffect(()=>{
    fetchPost()
  },[posts])


  const fetchPost= async()=>{
    try{
      const res = await fetch('http://localhost/SociaTech/backend/auth/fetchPost.php');
      const data = await res.json();
      if(data.success){
        setPosts(data.posts);
      }else{
        console.log('fetch failed', data.message);
      }
    } catch (err) {
      console.log("Error fetching posts:", err);
    }
  };

  return (
    <>
      <div className="home_container">
        <PageHeader isOnCreatePost={true} isOnSearchBar={true} />
        <div className="page_body">
          <Nav currentPage={" home"} />

          <div className="home_main_container">
            <CategorySlider />
            {/* <ProfilePage/> */}
            <div className="post_container">
              {posts.length === 0 ?(
                 <p>Loading posts...</p>
              ):(
                posts.map((post)=>(
                  <div className="post_card" key={post.post_id}>
                    <div className="post_card_header">
                      <div className="header_user_container">
                        <div className="pfp_container"><img src={pfpImage} alt="user_pfp" /></div>
                        <div className="post_username">{post.username}</div>
                        <div className="post_date">{post.post_date}</div>
                        <div className="post_category">{post.post_category}</div>
                      </div>
                      <div className="more_btn">...</div>
                    </div>
                    <div className="post_card_title">{post.post_title}</div>

                    {post.post_content &&(<div className="post_card_content">{post.post_content}</div>)}
                    {post.post_image &&(<div className="post_card_img"><img src={post.post_image} alt="post_image" /></div>)}
                    



                    <div className="postCard_btn_containers">
                      <button className="post_comment_btn">Comment</button>
                      <button className="up_vote_btn"><ArrowBigUp/>{post.up_tally_post}</button>
                      <button className="down_vote_btn"><ArrowBigDown/>{post.down_tally_post}</button>
                    </div>
                    

                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
