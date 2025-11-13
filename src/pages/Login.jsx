import { useCycle } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { useState } from "react";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { auth } from "./../config/firebase.js";
import "react-toastify/dist/ReactToastify.css";
import "./Login.css";

export default function Login() {
  const [showPass, cycleShowPass] = useCycle(false, true);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailSignIn = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      console.log("User:", userCredential.user);
      toast.success("Login successfully!", {
        position: "top-right",
        autoClose: 3000, // milliseconds
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
      });

      navigate("/home");
    } catch (error) {
      console.error("Login error:", error);

      // Handle specific error codes
      switch (error.code) {
        case "auth/invalid-email":
          toast.error("Invalid email address");
          break;
        case "auth/too-many-requests":
          toast.error(
            "Too many unsuccessful login attempts. Please try again later."
          );
          break;

        case "auth/user-disabled":
          toast.error("This account has been disabled");
          break;
        case "auth/user-not-found":
          toast.error("No account found with this email");
          break;
        case "auth/wrong-password":
          toast.error("Incorrect password");
          break;
        case "auth/invalid-credential":
          toast.error("Invalid email or password");
          break;
        default:
          toast.error("Login failed. Please try again");
      }
    } finally {
      setLoading(false);
    }
  };

  // Google Sign In
  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    setLoading(true);

    provider.setCustomParameters({
      prompt: "select_account",
    });

    try {
      const result = await signInWithPopup(auth, provider);
      console.log("Google sign-in result:", result);
      toast.success("Login successfully!", {
        position: "top-right",
        autoClose: 3000, // milliseconds
      });
      setTimeout(() => navigate("/home"), 1500);
    } catch (error) {
      console.error("Google sign in error:", error);

      switch (error.code) {
        case "auth/popup-closed-by-user":
          toast.info("Sign in cancelled");
          break;
        case "auth/popup-blocked":
          toast.error("Popup was blocked. Please allow popups for this site");
          break;
        default:
          toast.error("Google sign in failed. Please try again");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
       <div className="system_logo_container"><img src="src\assets\SociaTech_logo_whitebg.png" alt="system_logo" className="system_logo"/></div>

      <div className="login_parent_container">
        <div className="signIn_container">
        
          <div className="signIn_title">Sign In</div>
          <form onSubmit={handleEmailSignIn} className="input_container">
            <div className="input_childContainer">
              <label htmlFor="user_signIn_email">Email</label>
              <input
                type="email"
                name="user_signIn_email"
                id="user_signIn_email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="input_childContainer">
              <label htmlFor="user_signIn_pass">Password</label>
              <div className="password_wrapper">
                <input
                  type={showPass ? "text" : "password"}
                  name="user_signIn_pass"
                  id="user_signIn_pass"
                  className="password_wrapper_child"
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="showPass_btn"
                  onClick={() => cycleShowPass()}
                  disabled={loading}
                >
                  {showPass ? (
                    <Eye className="eye_logo" />
                  ) : (
                    <EyeOff className="eye_logo" />
                  )}
                </button>
              </div>
            </div>
            <a href="/forgot-password" className="forgetPass_link">
              Forgot your password?
            </a>
            <div className="rememberMe_container">
              <input type="checkbox" name="remember_me" id="remember_me" />
              <label htmlFor="remember_me">Remember me</label>
            </div>
            <button type="submit" className="signIn_btn" disabled={loading}>
              {loading ? "Signing In..." : "Sign In"}
            </button>
            <div className="createAcc_link">
              Don't have an account?{" "}
              <a href="/signup" className="signUp_link">
                Sign Up
              </a>
            </div>
            <div className="seperator">
              <span className="or_text">or</span>
            </div>
            <button
              type="button"
              className="signIn_btn google_signIn_btn"
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              <img
                src="src/assets/google.svg"
                alt="google_logo"
                className="google_logo"
              />
              Sign in with Google
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
