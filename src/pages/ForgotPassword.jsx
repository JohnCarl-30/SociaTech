// src/pages/ForgotPassword.jsx
import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../config/firebase";
import { div } from "framer-motion/client";
import "./ForgotPassword.css"

export default function ForgotPassword({forgetPassType, placeholder, type}) {


 

  return (
    <>
    <div className="system_logo_container"><img src="src\assets\SociaTech_logo_whitebg.png" alt="system_logo" className="system_logo"/></div>
      
      <div className="parent_container">
        <form className="forgetPass_main_container">
          <div className="container_title">Forgot Password</div>
          <div className="childText1">
            No worries, we've got your back. Just let us know where we should send your password reset link.
          </div>
          <div className="forgetPass_child_container">
          <label htmlFor="" className="field_label">Enter your {forgetPassType}</label>
              <input type={type} placeholder={placeholder} className="forgetPass_field"/>
              <div className="validationText">sample text</div>
          </div>
          <button className="forgetPass_btn">Find your account</button>
          <div className="tryText_container">Forgot your {forgetPassType}? <a href="" className="try_text">Try another way</a></div>
        </form>
      </div>
    </>
    
  );
}
