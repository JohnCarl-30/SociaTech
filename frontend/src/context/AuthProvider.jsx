import { useState, useEffect } from "react";
import { AuthContext } from "./AuthContext.jsx";
import { signOut as authSignOut } from "../services/auth";
import { toast } from "react-toastify";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("userData");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Error parsing stored user data:", error);
        localStorage.removeItem("userData");
      }
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    localStorage.setItem("userData", JSON.stringify(userData));
    setUser(userData);
    toast.success("Login successful!", {
      position: "top-center",
      autoClose: 1500,
    });
  };

  const logout = async () => {
    try {
      await authSignOut();
    } catch (error) {
      console.error("Error during sign out:", error);
    } finally {
      localStorage.removeItem("userData");
      setUser(null);
      toast.success("Logout successful!", {
        position: "top-center",
        autoClose: 1500,
      });
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
