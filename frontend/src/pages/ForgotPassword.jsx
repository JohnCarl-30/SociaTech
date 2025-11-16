import "./ForgotPassword.css";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword({
  forgetPassType,
  toggleForgetPassType,
}) {
  const navigate = useNavigate();
  const isEmail = forgetPassType === "email";
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
        <form className="forgetPass_main_container">
          <div className="container_title">Forgot Password</div>
          <div className="childText1">
            No worries, we've got your back. Just let us know where we should
            send your password reset link.
          </div>
          <div
            className="forgetPass_child_container"
            onSubmit={(e) => e.preventDefault()}
          >
            <label htmlFor="" className="field_label">
              Enter your {forgetPassType}
            </label>
            <input
              type={isEmail ? "email" : "text"}
              placeholder={isEmail ? "youremail@gmail.com" : "doejohn12"}
              className="forgetPass_field"
            />
            <div className="validationText">sample text</div>
          </div>
          <button className="forgetPass_btn">Find your account</button>
          <div className="tryText_container">
            Forgot your {forgetPassType}?
            <a
              href=""
              className="try_text"
              onClick={(e) => {
                e.preventDefault();
                toggleForgetPassType();
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
