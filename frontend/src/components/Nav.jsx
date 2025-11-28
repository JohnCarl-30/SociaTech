import { House, Crown, Brain,ShieldUser,  FolderOpen,  } from "lucide-react";
import "./Nav.css";
import { useLocation, useNavigate } from "react-router-dom";

export default function Nav({closeModals}) {
    const storedUser = localStorage.getItem("userData") || sessionStorage.getItem("userData");
const user = storedUser ? JSON.parse(storedUser) : null;
const isAdmin = user?.role === "admin";

    const navigate = useNavigate();
    const location = useLocation();
   
    const isActive = (path) => {
        return location.pathname === path ? " active" : "";
    };

    return (
        <>
            <div className="nav_panel">
                <div 
                    className={`nav_child nav_child${isActive('/home')}`}
                    onClick={() => {
                        navigate('/home');
                        closeModals();
                        
                        
                    }}
                >
                    <House /> Home
                </div>

              

                <div 
                    className={`nav_child nav_child${isActive('/quiz')}`}
                    onClick={() =>{
                        closeModals;
                        navigate('/quiz');
                        
                    }}
                >
                    <Brain /> Quizes
                </div>
                
                <div 
                    className={`nav_child nav_child${isActive('/draft')}`}
                    onClick={() =>{
                        closeModals;
                        navigate('/draft');
                        
                    }}
                >
                    <FolderOpen /> Draft Page
                </div>
                {isAdmin&&(<div 
                    className={`nav_child nav_child${isActive('/admin')}`}
                    onClick={() => {
                        closeModals;
                        navigate('/admin');
                        
                    }}
                >
                   <ShieldUser /> Admin Panel
                </div>)}
            </div>
        </>
    );
}