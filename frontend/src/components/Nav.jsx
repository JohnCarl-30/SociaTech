
import { useState } from "react";
import { House, Brain, ShieldCheck, FolderOpen, BookOpenText, ChevronLeft, ChevronRight } from "lucide-react";
import "./Nav.css";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function Nav({ closeModals }) {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const storedUser = localStorage.getItem("userData") || sessionStorage.getItem("userData");
    const user = storedUser ? JSON.parse(storedUser) : null;
    const isAdmin = user?.role === "admin";

    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path) => {
        return location.pathname === path ? " active" : "";
    };

    const navItems = [
        { path: '/home', icon: House, label: 'Home' },
        { path: '/quiz', icon: Brain, label: 'Quizzes' },
        { path: '/draft', icon: FolderOpen, label: 'Draft Page' },
    ];

    const adminItems = isAdmin ? [
        { path: '/admin', icon: ShieldCheck, label: 'Admin Panel' },
        { path: '/audit', icon: BookOpenText, label: 'Audit Log' },
    ] : [];

    const handleNavigate = (path) => {
        // closeModals(); nasisira yung pag renavigate pag naka on toh
        navigate(path);
    };

    return (
        <motion.div
            className={`nav_panel ${isCollapsed ? 'collapsed' : ''}`}
            initial={{ x: -280 }}
            animate={{
                x: 0,
                width: isCollapsed ? '4.5rem' : '15rem'
            }}
            transition={{
                type: "spring",
                stiffness: 300,
                damping: 30
            }}
        >

            <motion.button
                className="nav_toggle"
                onClick={() => setIsCollapsed(!isCollapsed)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
            >
                {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </motion.button>


            <div className="nav_items">
                {navItems.map((item, index) => {
                    const Icon = item.icon;
                    return (
                        <motion.div
                            key={item.path}
                            className={`nav_child${isActive(item.path)}`}
                            onClick={() => handleNavigate(item.path)}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ scale: 1.02, x: 4 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Icon size={20} />
                            <AnimatePresence>
                                {!isCollapsed && (
                                    <motion.span
                                        initial={{ opacity: 0, width: 0 }}
                                        animate={{ opacity: 1, width: "auto" }}
                                        exit={{ opacity: 0, width: 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        {item.label}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    );
                })}
            </div>

            {adminItems.length > 0 && (
                <div className="nav_admin_section">
                    <AnimatePresence>
                        {!isCollapsed && (
                            <motion.div
                                className="nav_section_label"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                            >
                                ADMIN
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {adminItems.map((item, index) => {
                        const Icon = item.icon;
                        return (
                            <motion.div
                                key={item.path}
                                className={`nav_child${isActive(item.path)}`}
                                onClick={() => handleNavigate(item.path)}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: (navItems.length + index) * 0.1 }}
                                whileHover={{ scale: 1.02, x: 4 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Icon size={20} />
                                <AnimatePresence>
                                    {!isCollapsed && (
                                        <motion.span
                                            initial={{ opacity: 0, width: 0 }}
                                            animate={{ opacity: 1, width: "auto" }}
                                            exit={{ opacity: 0, width: 0 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            {item.label}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })}
                </div>
            )}
            <motion.div
                className="nav_accent"
                animate={{
                    scaleX: isCollapsed ? 0.5 : 1,
                }}
                transition={{ duration: 0.3 }}
            />
        </motion.div>
    );
}
