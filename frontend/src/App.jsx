import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Home from "./pages/Home";
import ForgotPassword from "./pages/ForgotPassword";
import { ToastContainer } from "react-toastify";

function App() {
  return (
    <BrowserRouter>
      <ToastContainer>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/home" element={<Home />} />
          <Route path="*" element={<Navigate to="/" replace />} />
          <Route
            path="/forgot-password"
            element={
              <ForgotPassword
                type={"email"}
                forgetPassType={"email"}
                placeholder={"youremail@gmail.com"}
              />
            }
          />
        </Routes>
      </ToastContainer>
    </BrowserRouter>

    // <ForgotPassword type={'text'} forgetPassType={'username'} placeholder={'doejohn12'}/> eto dapat pag nag try another way
  );
}

export default App;
