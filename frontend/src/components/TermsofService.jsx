import "./TermsofService.css";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function TermsofService({ isOpen, onClose }) {
  const handleBackdropClick = (e) => {
    if (e.target.classList.contains("terms_parent_container")) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="terms_parent_container"
          onClick={handleBackdropClick}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="terms_main_container"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <div className="terms_header">
              <h1 className="terms_title">Terms of Service – SociaTech</h1>
              <button className="terms_back_button" onClick={onClose}>
                <X className="back_icon" />
              </button>
            </div>

            <div className="terms_content">
              <section className="terms_section">
                <h2 className="terms_section_title">1. Use of the Platform</h2>
                <p className="terms_text">
                  SociaTech provides features such as posting questions, sharing knowledge, voting, 
                  commenting, and participating in learning communities. You agree to use these features 
                  responsibly and only for educational or constructive purposes.
                </p>
                <p className="terms_text">You must not:</p>
                <ul className="terms_list">
                  <li>Post harmful, misleading, or inappropriate content</li>
                  <li>Engage in harassment, threats, or abusive behavior</li>
                  <li>Share NSFW or violent material</li>
                  <li>Post advertisements, or irrelevant content</li>
                  <li>Copy or plagiarize content that you did not create</li>
                  <li>Attempt to hack, exploit, or disrupt platform operations</li>
                </ul>
              </section>

              <section className="terms_section">
                <h2 className="terms_section_title">2. User Content</h2>
                <p className="terms_text">
                  You retain ownership of the content you create. By posting on SociaTech, you grant us 
                  a non-exclusive, royalty-free license to display and distribute your content within the 
                  platform. Content that breaks our rules may be removed, and accounts may be restricted 
                  or suspended.
                </p>
              </section>

              <section className="terms_section">
                <h2 className="terms_section_title">3. Commenting</h2>
                <p className="terms_text">
                  Comments should remain respectful, accurate, and on-topic. Users who consistently 
                  contribute helpful comments while harmful or rule-breaking comments may lead to 
                  moderation actions.
                </p>
              </section>

              <section className="terms_section">
                <h2 className="terms_section_title">4. Reporting System</h2>
                <p className="terms_text">
                  Users may report posts, comments, or profiles that violate our policies. 
                  Reports may include:
                </p>
                <ul className="terms_list">
                  <li>Harassment</li>
                  <li>Inappropriate or NSFW content</li>
                  <li>False information</li>
                  <li>Plagiarism</li>
                  <li>Irrelevant or nonsense posts</li>
                </ul>
                <p className="terms_text">
                  Our moderation team will review reports and take appropriate action.
                </p>
              </section>

              <section className="terms_section">
                <h2 className="terms_section_title">5. Enforcement & Moderation</h2>
                <p className="terms_text">
                  SociaTech reserves the right to remove content or restrict accounts that violate 
                  these Terms. Severe or repeated violations may result in permanent suspension.
                </p>
              </section>

              <section className="terms_section">
                <h2 className="terms_section_title">6. Changes to the Terms</h2>
                <p className="terms_text">
                  We may update these Terms to improve clarity, safety, and platform performance. 
                  Continued use of the platform means you accept the updated Terms.
                </p>
              </section>

              <section className="terms_section">
                <h2 className="terms_section_title">Contact Us</h2>
                <p className="terms_text">
                  If you need help or have concerns about your account, contact support at:
                </p>
                <p className="terms_contact">📧 SociaTech@gmail.com</p>
              </section>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
