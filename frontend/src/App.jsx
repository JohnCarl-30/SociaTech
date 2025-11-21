import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Home from "./pages/Home";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useState } from "react";
import { useAuth } from "./hooks/useAuth";

function App() {
  const [forgetPassType, setForgetPassType] = useState("email");

  const { user, loading } = useAuth();

  function toggleForgetPassType() {
    setForgetPassType((prevType) =>
      prevType === "email" ? "username" : "email"
    );
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <ToastContainer position="top-center" autoClose={2000} theme="light" />
      <Routes>
        <Route path="/" element={!user ? <Login /> : <Navigate to="/home" />} />
        <Route
          path="/signup"
          element={!user ? <SignUp /> : <Navigate to="/home" />}
        />
        <Route
          path="/forgot-password"
          element={
            !user ? (
              <ForgotPassword
                forgetPassType={forgetPassType}
                toggleForgetPassType={toggleForgetPassType}
              />
            ) : (
              <Navigate to="/home" />
            )
          }
        />
        <Route
          path="/login"
          element={!user ? <Login /> : <Navigate to="/home" />}
        />

        <Route path="/home" element={user ? <Home /> : <Navigate to="/" />} />
        <Route
          path="/update-password"
          element={!user ? <ResetPassword /> : <Navigate to="/home" />}
        />

        <Route
          path="*"
          element={<Navigate to={user ? "/home" : "/"} replace />}
        />
      </Routes>
    </>
  );
}

export default App;
