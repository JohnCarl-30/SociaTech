import { ChevronLeft, ChevronRight } from 'lucide-react';
import './CategorySlider.css'
import { useRef } from 'react';
export default function CategorySlider(){
    

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
    </>)
}