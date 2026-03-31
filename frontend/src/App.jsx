import { Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Suspense, lazy, useState } from "react";
import { useAuth } from "./hooks/useAuth";

const Login = lazy(() => import("./pages/Login"));
const SignUp = lazy(() => import("./pages/SignUp"));
const Home = lazy(() => import("./pages/Home"));
const Quiz = lazy(() => import("./pages/Quiz"));
const DraftPage = lazy(() => import("./pages/DraftPage.jsx"));
const AdminPanel = lazy(() => import("./pages/AdminPanel"));
const Audit = lazy(() => import("./pages/Audit"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));

function RouteFallback() {
  return <div>Loading...</div>;
}

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
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route
            path="/"
            element={!user ? <Login /> : <Navigate to="/home" />}
          />
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
          <Route path="/quiz" element={user ? <Quiz /> : <Navigate to="/" />} />
          <Route
            path="/draft"
            element={user ? <DraftPage /> : <Navigate to="/" />}
          />
          <Route
            path="/admin"
            element={user ? <AdminPanel /> : <Navigate to="/" />}
          />
          <Route path="/audit" element={user ? <Audit /> : <Navigate to="/" />} />
          <Route
            path="/update-password"
            element={!user ? <ResetPassword /> : <Navigate to="/home" />}
          />
          <Route
            path="*"
            element={<Navigate to={user ? "/home" : "/"} replace />}
          />
        </Routes>
      </Suspense>
    </>
  );
}

export default App;
