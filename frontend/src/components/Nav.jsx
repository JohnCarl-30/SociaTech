
import {  House,Crown,Brain } from 'lucide-react';
import "./Nav.css"
import { useState } from 'react';


export default function Nav({currentPage}){
    const [pageName, setPageName] = useState(' home'); //temporary only since wala pang router applied, papalitan pa later

    const isActive = (activePage) =>{
        return activePage === pageName ? ' active':'';
    };

    console.log(pageName);
   


  

    return(<>
        <div className="nav_panel">
                    <div className={`nav_child nav_child${isActive(' home')}`} onClick={()=>{
                       setPageName(' home');

                    }}><House/> Home</div>
                    <div className={`nav_child nav_child${isActive(' leaderBoard')}`}onClick={()=>{
                       setPageName(' leaderBoard');

                    }}><Crown /> Leaderboards</div>
                    <div className={`nav_child nav_child${isActive(' quizes')}`}onClick={()=>{
                       setPageName(' quizes');

                    }}><Brain />Quizes</div>
        </div>
    </>)
}