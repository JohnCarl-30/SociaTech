import "./SignUp.css";
import TermsofService from "../components/TermsofService.jsx";
import PrivacyPolicies from "../components/PrivacyPolicies.jsx";
import { Eye, EyeOff } from "lucide-react";
import { useCycle } from "framer-motion";
import { toast } from "react-toastify";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signUpWithEmail, googleAuth } from "../services/auth";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "./../config/firebase.js";
import systemLogo from "../assets/SociaTech_logo_whitebg.png";
import googleLogo from "../assets/google.svg";
import { useAuth } from "../hooks/useAuth";
import { sendVerificationEmail } from "../services/auth";

export default function SignUp() {
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPass, cycleShowPass] = useCycle(false, true);
  const [showCPass, cycleShowCPass] = useCycle(false, true);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [checkbox, setCheckbox] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false); // New state for Terms modal
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false); // New state for Privacy modal

  const navigate = useNavigate();

  // Password validation
  const validatePasswordRules = (password) => {
    return {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      specialChar: /[!@#$%^&*(),.?":{}|<>_-]/.test(password),
    };
  };

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

  const handleCheckbox = () => {
    setCheckbox(!checkbox);
  };

  const validateInputs = () => {
    const errors = [];

    // Validate full name
    if (!formData.fullName || formData.fullName.trim().length < 1) {
      errors.push("Full name is required.");
    }

    // Validate username (optional but if provided must be valid)
    if (formData.username && formData.username.trim().length > 0) {
      if (formData.username.trim().length < 3) {
        errors.push("Username must be at least 3 characters long.");
      }
      if (!/^[a-zA-Z0-9_]+$/.test(formData.username.trim())) {
        errors.push(
          "Username can only contain letters, numbers, and underscores."
        );
      }
    }

    // Validate email
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.push("Please enter a valid email address.");
    }

    // Validate password with rules
    if (!formData.password) {
      errors.push("Password is required.");
    } else if (!isPasswordValid(formData.password)) {
      errors.push(
        "Password must be at least 8 characters with uppercase, number, and special character."
      );
    }

    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      errors.push("Passwords do not match.");
    }

    // Validate terms acceptance
    if (!checkbox) {
      errors.push("You must accept the terms of service and privacy policy.");
    }

    if (errors.length > 0) {
      toast.error(
        <div>
          <strong>Please fix the following:</strong>
          <ul style={{ marginTop: "8px", paddingLeft: "20px" }}>
            {errors.map((error, idx) => (
              <li key={idx}>{error}</li>
            ))}
          </ul>
        </div>,
        { autoClose: 5000 }
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!checkbox) {
      toast.error("You must accept the terms of service and privacy policy.");
      return;
    }
    if (!validateInputs()) return;

    setLoading(true);

    const email = formData.email.trim();
    const password = formData.password;
    const name = formData.fullName.trim();
    const usernameInput = formData.username.trim();
    const username = usernameInput || email.split("@")[0];

    try {
      const signupData = await signUpWithEmail(email, password, name, username);

      await sendVerificationEmail(signupData.email || email);
      toast.success(
        "Account created! Please check your email to verify your account.",
        {
          position: "top-center",
          autoClose: 3000,
        }
      );
    } catch (err) {
      console.error("Sign up error:", err);

      if (
        err.code === "auth/email-already-in-use" ||
        err.message?.includes("Email already exists")
      ) {
        toast.error(
          "This email is already registered. Please sign in instead."
        );
      } else if (err.message?.includes("Username already exists")) {
        toast.error(
          "This username is already taken. Please choose another one."
        );
      } else if (err.code === "auth/weak-password") {
        toast.error("Password is too weak. Please use a stronger password.");
      } else if (err.code === "auth/invalid-email") {
        toast.error("Invalid email address.");
      } else if (err.message?.includes("Incomplete data")) {
        toast.error("Please fill in all required fields.");
      } else {
        toast.error(
          err.message || "Failed to create account. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle Google signup
  const handleGoogleSignUp = async () => {
    if (!checkbox) {
      toast.warning("You must accept the terms and policies to proceed.");
      return;
    }

    setGoogleLoading(true);

    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: "select_account",
    });

    try {
      const result = await signInWithPopup(auth, provider);
      console.log("Google sign in successful:", result.user);

      const backendResponse = await googleAuth(result.user);

      const userData = {
        id: backendResponse.user.user_id,
        email: backendResponse.user.email,
        displayName: backendResponse.user.fullname,
        photoURL: backendResponse.user.profile_image,
        providerId: "google.com",
      };

      localStorage.setItem("userData", JSON.stringify(userData));
      localStorage.setItem("rememberMe", "true");
      login(userData, true);
      navigate("/home", { replace: true });
    } catch (err) {
      console.error("Google sign up error:", err);

      if (err.code === "auth/popup-closed-by-user") {
        toast.info("Sign up cancelled.");
      } else if (err.code === "auth/popup-blocked") {
        toast.error("Popup was blocked. Please allow popups for this site.");
      } else {
        toast.error(
          err.message || "Failed to sign up with Google. Please try again."
        );
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !loading && !googleLoading && checkbox) {
      handleSubmit();
    }
  };

  const handleTermsClick = (e) => {
    e.preventDefault();
    setIsTermsOpen(true);
  };

  const handleTermsClose = () => {
    setIsTermsOpen(false);
  };

  const handlePrivacyClick = (e) => {
    e.preventDefault();
    setIsPrivacyOpen(true);
  };

  const handlePrivacyClose = () => {
    setIsPrivacyOpen(false);
  };

  return (
    <>
      <div className="system_logo_container">
        <img src={systemLogo} alt="SociaTech Logo" className="system_logo" />
      </div>
      <div className="signUp_parent_container">
        <div className="main_container">
          <div className="signUp_title">Sign Up</div>
          <div className="field_container">
            <div className="field">
              <label htmlFor="fullName" className="field_labels">
                Full name <span style={{ color: "red" }}>*</span>
              </label>
              <input
                type="text"
                name="fullName"
                id="fullName"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                disabled={loading || googleLoading}
              />
            </div>

            <div className="field">
              <label htmlFor="username" className="field_labels">
                Username
              </label>
              <input
                type="text"
                name="username"
                id="username"
                placeholder="doejohn12"
                value={formData.username}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                disabled={loading || googleLoading}
              />
            </div>

            <div className="field">
              <label htmlFor="email" className="field_labels">
                Email <span style={{ color: "red" }}>*</span>
              </label>
              <input
                type="email"
                name="email"
                id="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                disabled={loading || googleLoading}
                autoComplete="email"
              />
            </div>

            <div className="field">
              <label htmlFor="password" className="field_labels">
                Password <span style={{ color: "red" }}>*</span>
              </label>
              <div className="passWrap">
                <input
                  className="passWrap_child"
                  type={showPass ? "text" : "password"}
                  name="password"
                  id="password"
                  placeholder="********"
                  value={formData.password}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  style={{ borderColor: getPasswordBorderColor() }}
                  disabled={loading || googleLoading}
                  autoComplete="new-password"
                />
                <button
                  className="eye_btn"
                  type="button"
                  onClick={() => cycleShowPass()}
                  disabled={loading || googleLoading}
                  aria-label="Toggle password visibility"
                >
                  {showPass ? (
                    <Eye className="eyeSvg" />
                  ) : (
                    <EyeOff className="eyeSvg" />
                  )}
                </button>
                <div className="tooltip">
                  <ul>
                    <li>At least eight (8) characters long</li>
                    <li>At least one uppercase letter (A–Z)</li>
                    <li>At least one number (0–9)</li>
                    <li>At least one special character</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="field">
              <label htmlFor="confirmPassword" className="field_labels">
                Confirm password <span style={{ color: "red" }}>*</span>
              </label>
              <div className="passWrap">
                <input
                  className="passWrap_child"
                  type={showCPass ? "text" : "password"}
                  name="confirmPassword"
                  id="confirmPassword"
                  placeholder="********"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  style={{ borderColor: getConfirmPasswordBorderColor() }}
                  disabled={loading || googleLoading}
                  autoComplete="new-password"
                />
                <button
                  className="eye_btn"
                  type="button"
                  onClick={() => cycleShowCPass()}
                  disabled={loading || googleLoading}
                  aria-label="Toggle confirm password visibility"
                >
                  {showCPass ? (
                    <Eye className="eyeSvg" />
                  ) : (
                    <EyeOff className="eyeSvg" />
                  )}
                </button>
              </div>
            </div>

            <div className="term_checkbox_container">
              <input
                type="checkbox"
                className="term_checkbox"
                id="term_checkbox"
                checked={checkbox}
                onChange={handleCheckbox}
                disabled={loading || googleLoading}
              />
              <label htmlFor="term_checkbox" className="term_checkbox_text">
                I agree to the{" "}
                <span className="term_link" onClick={handleTermsClick}>
                  Terms of Service
                </span>{" "}
                and{" "}
                <span className="privacy_link" onClick={handlePrivacyClick}>Privacy Policies</span> of
                SociaTech
              </label>
            </div>

            <button
              className="signUp_btn signUpBtn"
              type="button"
              onClick={handleSubmit}
              disabled={loading || googleLoading}
            >
              {loading ? "Signing Up..." : "Sign Up"}
            </button>

            <div className="or_container">
              <span className="or">or</span>
            </div>

            <button
              className="signUp_btn google_signUp_btn"
              type="button"
              onClick={handleGoogleSignUp}
              disabled={loading || googleLoading}
            >
              <img src={googleLogo} alt="Google Logo" className="google_logo" />
              {googleLoading ? "Signing up..." : "Sign up with Google"}
            </button>

            <div className="signIn_text">
              Already have an account?{" "}
              <span onClick={() => navigate("/")} className="signIn_link">
                Sign In
              </span>
            </div>
          </div>
        </div>
      </div>

      <TermsofService isOpen={isTermsOpen} onClose={handleTermsClose} />
      <PrivacyPolicies isOpen={isPrivacyOpen} onClose={handlePrivacyClose} />
    </>
  );
}