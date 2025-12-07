import { useCycle } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { useState, useEffect } from "react";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "./../config/firebase.js";
import "react-toastify/dist/ReactToastify.css";
import "./Login.css";
import {
  signInWithEmail,
  googleAuth,
  verifyEmail,
  sendVerificationEmail,
} from "../services/auth.js";
import { useAuth } from "../hooks/useAuth";

export default function Login() {
  const [showPass, cycleShowPass] = useCycle(false, true);
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const [rememberMe, setRememberMe] = useState(false);
  const [loadingVerify, setLoadingVerify] = useState(false);
  const [showResendLink, setShowResendLink] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    console.log("PARAMS:", params.get("verified"));
    console.log("FULL LOCATION:", location);

    if (token) {
      setLoadingVerify(true);
      verifyEmail(token)
        .then((data) => {
          if (data.success) {
            toast.success("Your email has been verified! You may now log in.");
            navigate("/login", { replace: true });
          } else {
            toast.error(data.message || "Invalid verification link");
          }
        })
        .catch((err) => {
          console.error(err);
          toast.error("Verification failed. Please try again.");
        })
        .finally(() => setLoadingVerify(false));
    }

    if (params.get("verified") === "true") {
      toast.success("Your email has been verified! You may now log in.");

      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1500);
    }
  }, [location, navigate]);

  useEffect(() => {
    const saveRememberMe = localStorage.getItem("rememberMe") === "true";
    setRememberMe(saveRememberMe);

    if (saveRememberMe) {
      const savedEmail = localStorage.getItem("rememberedEmail") || "";
      setEmail(savedEmail);
    }
  }, []);

  const handleResendVerification = async () => {
    if (!unverifiedEmail) {
      toast.error("No email address found");
      return;
    }

    try {
      setLoading(true);
      const data = await sendVerificationEmail(unverifiedEmail);

      if (data.success) {
        toast.success("Verification email sent! Please check your inbox.");
        setShowResendLink(false);
      } else {
        toast.error(data.message || "Failed to send verification email");
      }
    } catch (err) {
      console.error("Resend error:", err);
      toast.error(err.message || "Failed to resend verification email");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      navigate("/home", { replace: true });
    }
  }, [user, navigate]);

  const handleEmailSignIn = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      setShowResendLink(false);
      const response = await signInWithEmail(email, password);

      const userData = {
        id: response.data.user.user_id,
        email: response.data.user.email,
        displayName: response.data.user.fullname,
        photoURL: response.data.user.profile_image,
        role: response.data.user.role,
        username: response.data.user.username,
      };

      if (rememberMe) {
        localStorage.setItem("authToken", response.data.token);
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("rememberedEmail", email);
        localStorage.setItem("rememberMe", "true");
      } else {
        sessionStorage.setItem("authToken", response.data.token);
        sessionStorage.setItem("user", JSON.stringify(userData));
        localStorage.removeItem("rememberedEmail");
        localStorage.setItem("rememberMe", "false");
      }

      login(userData, rememberMe);
      navigate("/home", { replace: true });
    } catch (error) {
      console.error("Email sign in error:", error);

      const errorMessage = error.message || "";
      if (
        errorMessage.includes("verify your email") ||
        errorMessage.includes("email address before logging")
      ) {
        setUnverifiedEmail(email);
        setShowResendLink(true);
        toast.error("Please verify your email address before logging in.", {
          autoClose: 5000,
        });
        return;
      }

      if (errorMessage.includes("Invalid email or password")) {
        toast.error("Invalid email or password");
      } else if (errorMessage.includes("too many")) {
        toast.error(
          "Too many unsuccessful login attempts. Please try again later."
        );
      } else {
        toast.error(errorMessage || "Login failed. Please try again");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });

    try {
      setLoading(true);
      const result = await signInWithPopup(auth, provider);
      const backendResponse = await googleAuth(result.user);

      const userData = {
        id: backendResponse.user.user_id,
        email: backendResponse.user.email,
        displayName: backendResponse.user.fullname,
        photoURL: backendResponse.user.profile_image,
        providerId: "google.com",
      };

      const shouldRemember = backendResponse.rememberMe ?? rememberMe;
      if (shouldRemember) {
        localStorage.setItem("user", JSON.stringify(userData));
      } else {
        sessionStorage.setItem("user", JSON.stringify(userData));
      }

      login(userData, shouldRemember);
      navigate("/home", { replace: true });
    } catch (error) {
      console.error("Google sign in error:", error);
      if (error.code === "auth/popup-closed-by-user") {
        toast.info("Sign in cancelled");
      } else if (error.code === "auth/popup-blocked") {
        toast.error("Popup blocked. Allow popups for this site");
      } else {
        toast.error("Google sign in failed. Please try again");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loadingVerify && (
        <div className="verification-overlay">
          <div className="verification-modal">
            Verifying your email...
          </div>
        </div>
      )}

      <div className="system_logo_container">
        <img
          src="src/assets/SociaTech_logo_whitebg.png"
          alt="system_logo"
          className="system_logo"
        />
      </div>

      <div className="login_parent_container">
        <div className="signIn_container">
          <div className="signIn_title">Sign In</div>

          {showResendLink && (
            <div className="alert-box">
              <p>
                Your email is not verified yet. Please check your inbox for the
                verification link.
              </p>
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={loading}
              >
                Resend verification email
              </button>
            </div>
          )}

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
                disabled={loading || loadingVerify}
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
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading || loadingVerify}
                />
                <button
                  type="button"
                  className="showPass_btn"
                  onClick={() => cycleShowPass()}
                  disabled={loading || loadingVerify}
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
              <input
                type="checkbox"
                name="remember_me"
                id="remember_me"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label htmlFor="remember_me">Remember me</label>
            </div>

            <button
              type="submit"
              className="signIn_btn"
              disabled={loading || loadingVerify}
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>

            <div className="createAcc_link">
              Don't have an account?
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
              disabled={loading || loadingVerify}
            >
              <img
                src="src/assets/google.svg"
                alt="google_logo"
                className="google_logo"
              />
              {loading ? "Signing In..." : "Sign In with Google"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
