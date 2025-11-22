import "./ForgotPassword.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { forgotPassword } from "../services/auth";

export default function ForgotPassword({
  forgetPassType,
  toggleForgetPassType,
}) {
  const navigate = useNavigate();
  const isEmail = forgetPassType === "email";

  const [inputValue, setInputValue] = useState("");
  const [validationText, setValidationText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateInput = (value) => {
    if (!value.trim()) {
      return `${isEmail ? "Email" : "Username"} is required`;
    }

    if (isEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return "Please enter a valid email address";
      }
    } else {
      if (value.length < 3) {
        return "Username must be at least 3 characters";
      }
    }

    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const error = validateInput(inputValue);
    if (error) {
      setValidationText(error);
      return;
    }

    setIsLoading(true);
    setValidationText("");

    try {
      const response = await forgotPassword(inputValue);

      if (response.success) {
        setIsSuccess(true);
        setValidationText("");
      }
    } catch (error) {
      setValidationText(
        error.message || "Failed to send reset link. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    // Clear validation text when user starts typing
    if (validationText) {
      setValidationText("");
    }
  };

  if (isSuccess) {
    return (
      <>
        <div className="system_logo_container">
          <img
            src="src\assets\SociaTech_logo_whitebg.png"
            alt="system_logo"
            className="system_logo"
            onClick={() => navigate("/")}
            style={{ cursor: "pointer" }}
          />
        </div>

        <div className="parent_container">
          <div className="forgetPass_main_container">
            <div className="container_title">Check Your Email</div>
            <div
              className="success_icon"
              style={{
                textAlign: "center",
                fontSize: "48px",
                margin: "20px 0",
              }}
            >
              ✅
            </div>
            <div className="childText1">
              If an account exists with <strong>{inputValue}</strong>, we've
              sent a password reset link to your email address. Please check
              your inbox and spam folder.
            </div>
            <div
              className="childText1"
              style={{ marginTop: "20px", fontSize: "14px" }}
            >
              Click the link in the email to reset your password.
            </div>
            <button
              className="forgetPass_btn"
              onClick={() => navigate("/login")}
              style={{ marginTop: "20px" }}
            >
              Back to Login
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="system_logo_container">
        <img
          src="src\assets\SociaTech_logo_whitebg.png"
          alt="system_logo"
          className="system_logo"
          onClick={() => navigate("/")}
          style={{ cursor: "pointer" }}
        />
      </div>

      <div className="parent_container">
        <form className="forgetPass_main_container" onSubmit={handleSubmit}>
          <div className="container_title">Forgot Password</div>
          <div className="childText1">
            No worries, we've got your back. Just let us know where we should
            send your password reset link.
          </div>
          <div className="forgetPass_child_container">
            <label htmlFor="resetInput" className="field_label">
              Enter your {forgetPassType}
            </label>
            <input
              id="resetInput"
              type={isEmail ? "email" : "text"}
              placeholder={isEmail ? "youremail@gmail.com" : "doejohn12"}
              className="forgetPass_field"
              value={inputValue}
              onChange={handleInputChange}
              disabled={isLoading}
              autoComplete={isEmail ? "email" : "username"}
              autoFocus
            />
            {validationText && (
              <div className="validationText" style={{ color: "#dc2626" }}>
                {validationText}
              </div>
            )}
          </div>
          <button
            className="forgetPass_btn"
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            style={{
              opacity: isLoading || !inputValue.trim() ? 0.6 : 1,
              cursor:
                isLoading || !inputValue.trim() ? "not-allowed" : "pointer",
            }}
          >
            {isLoading ? "Sending..." : "Find your account"}
          </button>
          <div className="tryText_container">
            Forgot your {forgetPassType}?
            <a
              href=""
              className="try_text"
              onClick={(e) => {
                e.preventDefault();
                toggleForgetPassType();
                setInputValue("");
                setValidationText("");
              }}
            >
              Try another way
            </a>
          </div>
        </form>
      </div>
    </>
  );
}
