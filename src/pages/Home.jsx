import { Search } from 'lucide-react';
import { House } from 'lucide-react';
import { CirclePlus } from 'lucide-react';
import { Bell } from 'lucide-react';
import { Crown } from 'lucide-react';
import { Brain } from 'lucide-react';
import { ChevronLeft } from 'lucide-react';
import { ChevronRight } from 'lucide-react';
import { useRef } from 'react';

import "./Home.css"




export default function Homepage(){
    const scrollContainerRef = useRef(null);
    const scrollAmount = 200;
    

    const scrollLeft = () =>{
        if(scrollContainerRef.current){
            scrollContainerRef.current.scrollBy({
                left: -scrollAmount,
                behavior: 'smooth'
            });

        }
    };

    const scrollRight = () =>{
        if(scrollContainerRef.current){
            scrollContainerRef.current.scrollBy({
                left: scrollAmount,
                behavior: 'smooth'
            });

        }
    };

    return(<>
        <div className='home_container'>
            <div className="home_header">
                <img className="home_title_logo" src="src\assets\SociaTech_logo_blackbg.png" alt=""  />
                
                <div className="search_bar_container"><Search /><input type="text" placeholder='Search' className='search_bar'/></div>

                <div className='side_header_btn'>
                    <button className="createPost_btn"><CirclePlus className='circlePlus_svg'/> Create</button>
                    <button className="notification_btn"><Bell className='bell_svg'/></button>
                    <div className="profile_btn"><img src="src\assets\deault_pfp.png" alt="default_pfp" className='profile_img'/></div>
                </div>
            </div>
            <div className="home_body">
                <div className="nav_panel">
                    <div className='nav_child nav_child_home'><House/> Home</div>
                    <div className='nav_child nav_child_leaderBoard'><Crown /> Leaderboards</div>
                    <div className='nav_child nav_child_quizes'><Brain />Quizes</div>
                </div>
                <div className="home_main_container">
                    <div className="category_slider_container" >
                        <button className='arrow_slider_btn' onClick={()=> scrollLeft()}><ChevronLeft /></button>
                        <div className='category_slider' ref={scrollContainerRef}>
                            <div className='category_child'>Artificial Intelligence</div>
                            <div className='category_child'>Cyber Security</div>
                            <div className='category_child'>Networking</div>
                            <div className='category_child'>Cloud Engineering</div>
                            <div className='category_child'>Software Development</div>
                            <div className='category_child'>Dev Ops</div>
                            <div className='category_child'>Machine Learning</div>
                            <div className='category_child'>Virtual Reality</div>
                            <div className='category_child'>Augmented Reality</div>
                        </div>
                        <button className='arrow_slider_btn'onClick={()=> scrollRight()}><ChevronRight /></button>
                    </div>

                    <div className="post_container">

                    </div>
                </div>
            </div>
        </div>
    </>)
}