import "./SignUp.css"
import { Eye } from 'lucide-react';
import { EyeOff } from 'lucide-react';
import { useCycle } from "framer-motion";


export default function SignUp(){
    const [showPass, cycleShowPass] = useCycle(false,true);
    const [showCPass, cycleShowCPass] = useCycle(false,true);
    return(<>
        <div className="main_container">
            <div className="system_title">SociaTech</div>
            <div className="signUp_title">Sign Up</div>
            <div className="field_container">
                <div className="field">
                    <label htmlFor="user_fullname" className="field_labels">Full name</label>
                    <input type="text" name="user_fullname" id="user_fullname" placeholder="John Doe" />
                </div>
                <div className="field">
                    <label htmlFor="user_email" className="field_labels">Email</label>
                    <input type="text" name="user_email" id="user_email" placeholder="your@email.com" />
                </div>
                <div className="field">
                    <label htmlFor="user_pass" className="field_labels">Password</label>
                    <div className="passWrap">
                        <input className="passWrap_child" type={showPass? 'type':'password'} name="user_fullname" id="user_pass" placeholder="********" />
                        <button         className="eye_btn"
                                    type="button"
                        
                                    onClick={() => cycleShowPass()}
                                >
                                    {showPass ? <Eye className="eyeSvg"/> : <EyeOff className="eyeSvg"/>}
                                </button>
                    </div>
                </div>
                <div className="field">
                    <label htmlFor="user_cpass">Confirm password</label>
                    <div className="passWrap">
                        <input className="passWrap_child" type={showCPass? 'type':'password'} name="user_cpass" id="user_cpass" placeholder="********" />
                        <button className="eye_btn"
                                    type="button"
                        
                                    onClick={() => cycleShowCPass()}
                                >
                                    {showCPass ? <Eye className="eyeSvg"/> : <EyeOff className="eyeSvg"/>}
                                </button>
                    </div>
                </div>

                <button className="signUp_btn signUpBtn">Sign Up</button>
                <div className="or_container"><span className="or">or</span></div>
                <button className="signUp_btn google_signUp_btn"><img src="src\assets\google.svg" alt="googleLogo" className="google_logo" /> Sign up with Google</button>

                <div className="signIn_text">Already have an account? <a href="" className="signIn_link">Sign In</a></div>
            </div>


        </div>
    </>)
}