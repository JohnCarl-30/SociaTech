import "./SignUp.css";
import { Eye, EyeOff } from "lucide-react";
import { useCycle } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signUpWithEmail } from "../services/auth";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { googleAuth } from "../services/auth";
import { auth } from "./../config/firebase.js";

export default function SignUp() {
  const [showPass, cycleShowPass] = useCycle(false, true);
  const [showCPass, cycleShowCPass] = useCycle(false, true);
  const [isValid, setValid] = useState("");
  const [isMatch, setMatch] = useState("");
  const [pass, setPass] = useState("");

  const [border_color, setBoarder_color] = useState("black");
  const [bg_color, setBg_color] = useState("black");

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();

  const validatePasswordRules = (password) => {
    const lengthRule = password.length >= 8;
    const uppercaseRule = /[A-Z]/.test(password);
    const numberRule = /[0-9]/.test(password);
    const specialCharRule = /[!@#$%^&*(),.?":{}|<>_-]/.test(password);

    return lengthRule && uppercaseRule && numberRule && specialCharRule;
  };

  const handlePassValidation = (password) => {
    if (validatePasswordRules(password)) {
      setValid(true);
      setBg_color("green");
    } else {
      setValid(false);
      setBg_color("red");
    }
  };

  const handlePassMatch = (password, confirmPass) => {
    if (password === confirmPass) {
      setMatch(true);
      setBoarder_color("green");
    } else {
      setMatch(false);
      setBoarder_color("red");
    }
  };

  const validateInputs = () => {
    const email = document.getElementById("user_email");
    const password = document.getElementById("user_pass");
    const cpassword = document.getElementById("user_cpass");
    const name = document.getElementById("user_fullname");
    let isValid = true;

    if (!name.value || name.value.trim().length < 1) {
      toast.error("Name is required.");
      isValid = false;
    }

    if (!email.value || !/\S+@\S+\.\S+/.test(email.value)) {
      toast.error("Please enter a valid email address.");
      isValid = false;
    }

    if (!password.value || password.value.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      isValid = false;
    }

    if (password.value !== cpassword.value) {
      toast.error("Passwords do not match.");
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateInputs()) return;

    setLoading(true);

    const email = document.getElementById("user_email").value;
    const password = document.getElementById("user_pass").value;
    const fullname = document.getElementById("user_fullname").value;
    const username = document.getElementById("user_userName").value;

    try {
      // Call PHP backend
      await signUpWithEmail(email, password, fullname, username);

      toast.success("Account created successfully!", {
        position: "top-right",
        autoClose: 2000,
      });

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      console.error("Sign up error:", err);

      // Handle error codes from PHP
      if (err.code === "auth/email-already-in-use") {
        toast.error(
          "This email is already registered. Please sign in instead."
        );
      } else if (err.code === "auth/weak-password") {
        toast.error("Password is too weak. Please use a stronger password.");
      } else if (err.code === "auth/invalid-email") {
        toast.error("Invalid email address.");
      } else {
        toast.error(
          err.message || "Failed to create account. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setGoogleLoading(true);

    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: "select_account",
    });

    try {
      const result = await signInWithPopup(auth, provider);
      console.log("Google sign in successful:", result.user);
      toast.success("Signed up with Google successfully!");
      await googleAuth(result.user);
      navigate("/home");
    } catch (err) {
      console.error("Google sign up error:", err);
      toast.error(
        err.message || "Failed to sign up with Google. Please try again."
      );
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="system_logo_container">
        <img
          src="src\assets\SociaTech_logo_whitebg.png"
          alt="system_logo"
          className="system_logo"
        />
      </div>
      <div className="main_container">
        <div className="signUp_title">Sign Up</div>
        <div className="field_container">
          <div className="field">
            <label htmlFor="user_fullname" className="field_labels">
              Full name
            </label>
            <input
              type="text"
              name="user_fullname"
              id="user_fullname"
              placeholder="John Doe"
            />
          </div>
          <div className="field">
            <label htmlFor="user_userName" className="field_labels">
              Username
            </label>
            <input
              type="text"
              name="user_userName"
              id="user_userName"
              placeholder="doejohn12"
            />
          </div>
          <div className="field">
            <label htmlFor="user_email" className="field_labels">
              Email
            </label>
            <input
              type="text"
              name="user_email"
              id="user_email"
              placeholder="your@email.com"
            />
          </div>
          <div className="field">
            <label htmlFor="user_pass" className="field_labels">
              Password
            </label>
            <div className="passWrap">
              <input
                className="passWrap_child"
                type={showPass ? "text" : "password"}
                name="user_pass"
                id="user_pass"
                placeholder="********"
                onChange={(e) => {
                  setPass(e.target.value);
                  handlePassValidation(e.target.value);
                }}
                style={
                  isValid
                    ? { borderColor: bg_color }
                    : { borderColor: bg_color }
                }
              />

              <button
                className="eye_btn"
                type="button"
                onClick={() => cycleShowPass()}
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
            <label htmlFor="user_cpass" className="field_labels">
              Confirm password
            </label>
            <div className="passWrap">
              <input
                className="passWrap_child"
                type={showCPass ? "text" : "password"}
                name="user_cpass"
                id="user_cpass"
                placeholder="********"
                onChange={(e) => {
                  handlePassMatch(pass, e.target.value);
                  console.log(isMatch);
                }}
                style={{ borderColor: border_color }}
              />
              <button
                className="eye_btn"
                type="button"
                onClick={() => cycleShowCPass()}
              >
                {showCPass ? (
                  <Eye className="eyeSvg" />
                ) : (
                  <EyeOff className="eyeSvg" />
                )}
              </button>
            </div>
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
            <img
              src="/src/assets/google.svg"
              alt="googleLogo"
              className="google_logo"
            />
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
    </>
  );
}
