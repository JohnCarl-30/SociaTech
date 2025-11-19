import { useState, useEffect } from "react";
import { AuthContext } from "./AuthContext.jsx";
import { signOut as authSignOut } from "../services/auth";
import { toast } from "react-toastify";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const localUser = localStorage.getItem("userData");
    const sessionUser = sessionStorage.getItem("userData");

    const storedUser = localUser || sessionUser;
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Error parsing stored user data:", error);
        localStorage.removeItem("userData");
        sessionStorage.removeItem("userData");
      }
    }
    setLoading(false);
  }, []);

  const login = (userData, remember_me = false) => {
    const userDataString = JSON.stringify(userData);

    if (remember_me) {
      localStorage.setItem("userData", userDataString);
      localStorage.setItem("rememberMe", "true");
      sessionStorage.removeItem("userData");
    } else {
      sessionStorage.setItem("userData", userDataString);
      localStorage.removeItem("userData");
      localStorage.removeItem("rememberMe"); // ✅ Fixed: use removeItem instead of setItem with 1 arg
    }
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
      localStorage.removeItem("user");
      localStorage.removeItem("authToken");
      localStorage.removeItem("rememberMe");
      localStorage.removeItem("savedEmail");
      sessionStorage.removeItem("userData");
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("authToken");
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
