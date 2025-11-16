import React, { useState } from "react";
import "./ResetPassword.css";
import { useCycle } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";

export default function PasswordResetForm() {
  const [showPass, cycleShowPass] = useCycle(false, true);
  const [showCPass, cycleShowCPass] = useCycle(false, true);

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
  };

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const isPasswordValid = (password) => {
    const rules = validatePasswordRules(password);
    return Object.values(rules).every(Boolean);
  };

  // Get password field styling
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
    <div className="container">
      <div className="header">
        <h1 className="logo">Sociatech</h1>
      </div>

      <div className="card">
        <h2 className="title">Create new password</h2>
        <p className="subtitle">Please enter your new password below</p>

        <div className="form-group">
          <label className="label">New Password</label>
          <div className="input-wrapper">
            <input
              type={showPass ? "text" : "password"}
              className="input"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="**********"
              style={{ borderColor: getPasswordBorderColor() }}
            />
            <button
              className="eye-button"
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

          <div className="tooltip">
            <ul>
              <li>At least eight (8) characters long</li>
              <li>At least one uppercase letter (A–Z)</li>
              <li>At least one number (0–9)</li>
              <li>At least one special character</li>
            </ul>
          </div>
        </div>

        <div className="form-group">
          <label className="label">Confirm Password</label>
          <div className="input-wrapper">
            <input
              type={showCPass ? "text" : "password"}
              className="input"
              value={formData.confirmPassword}
              placeholder="**********"
              style={{ borderColor: getConfirmPasswordBorderColor() }}
              onChange={handleInputChange}
            />
            <button
              className="eye-button"
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

        <button className="submit-button" onClick={handleSubmit}>
          Change Password
        </button>

        <a href="/login" className="back-link">
          Back to log in
        </a>
      </div>
    </div>
  );
}
