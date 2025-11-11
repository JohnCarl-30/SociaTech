import Input from "../components/Input"
import Button from "../components/Button"
import { useCycle } from "framer-motion";
import "./Login.css"
import { Eye } from 'lucide-react';
import { EyeOff } from 'lucide-react';
import { useState } from "react";
export default function Login(){
    const [showPass, cycleShowPass] = useCycle(false,true);
    return(
        <>
            <div className="signIn_container">
                
                <div className="signIn_title">Sign In</div>
                <div className="input_container">
                    <div className="input_childContainer">
                        <label htmlFor="user_email" className="signIn_labels">Email</label>
                        <Input type={'email'} name={'user_email'} id={'user_email'} placeholder={'your@email.com'} className="signIn_input" />
                    </div>

            
                        
                        <div className="input_childContainer password_wrapper">
                            <label htmlFor="user_pass" className="signIn_labels">Password</label>
                            <Input
                                type={showPass ? "text" : "password"}
                                name="user_pass"
                                id="user_pass"
                                placeholder="••••••"
                                className="signIn_input"
                            />
                            <button
                                type="button"
                                className="showPass_btn"
                                onClick={() => cycleShowPass()}
                            >
                                {showPass ? <Eye /> : <EyeOff />}
                            </button>
                         </div>
                    
                </div>
                   <a href="" className="forgetPass_link">Forgot your password?</a>
                
                <div className="rememberMe_container"><Input type={'checkbox'} name={'remember_me'} id='remember_me'/><label htmlFor="remember_me">Remember me</label></div>

                <Button btnName={'Sign In'} type={'submit'}  className={'signIn_btn'}/>

                <div className="createAcc_link">Don't have an account? <a href="" className="signUp_link">Sign Up</a></div>
                <div className="seperator"><span className="or_text">or</span></div>
                <button type="submit" className={'signIn_btn google_signIn'}><img src="src\assets\google.svg" alt="google_logo" className="google_logo" /> Sign in with Google</button>
                

            </div>
        </>
    )
}