import React, { useState } from "react";
import "./ResetPassword.css";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCycle } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { resetPassword } from "../services/auth";
import { ToastContainer, toast } from "react-toastify";

export default function PasswordResetForm() {
  const [showPass, cycleShowPass] = useCycle(false, true);
  const [showCPass, cycleShowCPass] = useCycle(false, true);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const validatePasswordRules = (password) => {
    return {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      specialChar: /[!@#$%^&*(),.?":{}|<>_-]/.test(password),
    };
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!token) {
      toast.error(
        "Invalid or missing token. Please try the password reset process again."
      );
      return;
    }

    if (!isPasswordValid(formData.password)) {
      toast.error(
        "Password must be at least 8 characters and contain uppercase, number, and special character"
      );
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    resetPassword(formData.password, formData.confirmPassword, token)
      .then(() => {
        toast.success("Password has been successfully reset. Please log in.");
        navigate("/login");
      })
      .catch((error) => {
        toast.error(`Error: ${error.message}`);
      });
  };

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const isPasswordValid = (password) => {
    const rules = validatePasswordRules(password);
    return Object.values(rules).every(Boolean);
  };

  const getPasswordBorderColor = () => {
    if (!formData.password) return "black";
    return isPasswordValid(formData.password) ? "green" : "red";
  };

  const getConfirmPasswordBorderColor = () => {
    if (!formData.confirmPassword) return "black";
    return formData.password === formData.confirmPassword ? "green" : "red";
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <>
      <div className="system_logo_container">
        <img
          src="/SociaTech_logo_whitebg.png"
          alt="system_logo"
          className="system_logo"
          onClick={() => navigate("/")}
          style={{ cursor: "pointer" }}
        />
      </div>

      <div className="resetPass_parent_container">
        <div className="resetPass_container">
          <div className="resetPass_title">Create new password</div>
          <div className="resetPass_subtitle">
            Please enter your new password below
          </div>
          <div className="resetPass_parent_fieldContainer">
            <div className="resetPass_field_container">
              <label className="resetPass_field_label">New Password</label>
              <div className="resetPass_field_wrapper">
                <input
                  type={showPass ? "text" : "password"}
                  className="resetPass_input_field"
                  value={formData.password}
                  name="password"
                  onChange={handleInputChange}
                  placeholder="**********"
                  style={{ borderColor: getPasswordBorderColor() }}
                />
                <button
                  className="resetPass_eye_button"
                  onClick={() => cycleShowPass()}
                  type="button"
                >
                  {showPass ? (
                    <Eye className="eyeSvg" />
                  ) : (
                    <EyeOff className="eyeSvg" />
                  )}
                </button>
              </div>
            </div>

            <div className="resetPass_field_container">
              <label className="resetPass_field_label">Confirm Password</label>
              <div className="input-wrapper">
                <input
                  type={showCPass ? "text" : "password"}
                  className="resetPass_input_field"
                  value={formData.confirmPassword}
                  name="confirmPassword"
                  placeholder="**********"
                  style={{ borderColor: getConfirmPasswordBorderColor() }}
                  onChange={handleInputChange}
                />
                <button
                  className="resetPass_eye_button"
                  onClick={() => cycleShowCPass()}
                  type="button"
                >
                  {showCPass ? (
                    <Eye className="eyeSvg" />
                  ) : (
                    <EyeOff className="eyeSvg" />
                  )}
                </button>
              </div>
            </div>
          </div>
          <div className="changePass_btn_container">
            <button className="changePass_btn" onClick={handleSubmit}>
              Change Password
            </button>
            <a href="/login" className="login_link">
              Back to log in
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
