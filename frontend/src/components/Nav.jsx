import { House, Crown, Brain } from "lucide-react";
import "./Nav.css";
import { useLocation, useNavigate } from "react-router-dom";

export default function Nav() {
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
                    onClick={() => navigate("/home")}
                >
                    <House /> Home
                </div>

                <div 
                    className={`nav_child nav_child${isActive('/leaderboard')}`}
                    onClick={() => navigate("/leaderboard")}
                >
                    <Crown /> Leaderboards
                </div>

                <div 
                    className={`nav_child nav_child${isActive('/quiz')}`}
                    onClick={() => navigate("/quiz")}
                >
                    <Brain /> Quizes
                </div>
            </div>
        </>
    );
}
