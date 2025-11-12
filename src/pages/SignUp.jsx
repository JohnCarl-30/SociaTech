import "./SignUp.css";
import { Eye, EyeOff } from "lucide-react";
import { useCycle } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signUpWithEmail } from "../services/auth";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { updateProfile } from "firebase/auth";
import { auth } from "./../config/firebase.js";
export default function SignUp() {
  const [showPass, cycleShowPass] = useCycle(false, true);
  const [showCPass, cycleShowCPass] = useCycle(false, true);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();

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

    if (!password.value || password.value.length < 6) {
      toast.error("Password must be at least 6 characters long.");
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
    const name = document.getElementById("user_fullname").value;

    try {
      const userCredential = await signUpWithEmail(email, password);
      await updateProfile(userCredential.user, { displayName: name });
      toast.success("Account created successfully!");
      navigate("/login");
    } catch (err) {
      console.error("Sign up error:", err);
      if (err.code === "auth/email-already-in-use") {
        toast.error(
          "This email is already registered. Please sign in instead."
        );
      } else if (err.code === "auth/weak-password") {
        toast.error("Password is too weak. Please use a stronger password.");
      } else if (err.code === "auth/invalid-email") {
        toast.error("Invalid email address.");
      } else {
        toast.error("Failed to create account. Please try again.");
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
      <div className="main_container">
        <div className="system_title">SociaTech</div>
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
