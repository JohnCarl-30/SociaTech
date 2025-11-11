

import { useCycle } from "framer-motion";
import "./Login.css"
import { Eye } from 'lucide-react';
import { EyeOff } from 'lucide-react';

export default function Login(){
    const [showPass, cycleShowPass] = useCycle(false,true);
    return(
        <>
            <div className="signIn_container">
                <div className="system_title">SociaTech</div>
                <div className="signIn_title">Sign In</div>
                <div className="input_container">
                    <div className="input_childContainer">
                        <label htmlFor="user_signIn_email" >Email</label>
                        <input type={'email'} name={'user_signIn_email'} id={'user_signIn_email'} placeholder={'your@email.com'}  />
                    </div>

            
                        
                        <div className="input_childContainer">
                            <label htmlFor="user_signIn_pass" >Password</label>
                            <div className="password_wrapper">
                                <input type={showPass? 'text':'password'} name="user_signIn_pass" id="user_signIn_pass"  className="password_wrapper_child" placeholder="********"/>
                                <button
                                    type="button"
                                    className="showPass_btn"
                                    onClick={() => cycleShowPass()}
                                >
                                    {showPass ? <Eye  className="eye_logo"/> : <EyeOff  className="eye_logo"/>}
                                </button>
                            </div>
                         </div>

                         <a href="" className="forgetPass_link">Forgot your password?</a>
                
                <div className="rememberMe_container"><input type="checkbox" name="remember_me" id="remember_me" /><label htmlFor="remember_me">Remember me</label></div>

                <button className="signIn_btn">Sign In</button>

                <div className="createAcc_link">Don't have an account? <a href="" className="signUp_link">Sign Up</a></div>

                <div className="seperator"><span className="or_text">or</span></div>

                <button  className="signIn_btn google_signIn_btn"><img src="src\assets\google.svg" alt="google_logo" className="google_logo" /> Sign in with Google</button>
                     
               </div>
                  
                

            </div>
        </>
    )
}