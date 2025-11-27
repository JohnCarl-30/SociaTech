import "./PrivacyPolicies.css";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function PrivacyPolicies({ isOpen, onClose }) {
  const handleBackdropClick = (e) => {
    if (e.target.classList.contains("privacy_parent_container")) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="privacy_parent_container"
          onClick={handleBackdropClick}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="privacy_container"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
        <div className="privacy_header">
          <h2 className="privacy_title">Privacy Policies</h2>
          <button className="privacy_close_btn" onClick={onClose} aria-label="Close">
            <X className="close_icon" />
          </button>
        </div>

        <div className="privacy_content">
          <section className="privacy_section">
            <h3>1. Information We Collect</h3>
            <p>
              We collect information you provide directly to us when you create an account, 
              including your name, email address, username, and any other information you choose 
              to provide. We also automatically collect certain information about your device 
              when you use our services.
            </p>
          </section>

          <section className="privacy_section">
            <h3>2. How We Use Your Information</h3>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Provide, maintain, and improve our services</li>
              <li>Send you technical notices and support messages</li>
              <li>Respond to your comments and questions</li>
              <li>Monitor and analyze trends, usage, and activities</li>
              <li>Detect, prevent, and address technical issues</li>
            </ul>
          </section>

          <section className="privacy_section">
            <h3>3. Information Sharing and Disclosure</h3>
            <p>
              We do not share your personal information with third parties except as described 
              in this policy. We may share information in the following circumstances:
            </p>
            <ul>
              <li>With your consent or at your direction</li>
              <li>With service providers who perform services on our behalf</li>
              <li>To comply with legal obligations</li>
              <li>To protect the rights and safety of our users and the public</li>
            </ul>
          </section>

          <section className="privacy_section">
            <h3>4. Data Security</h3>
            <p>
              We take reasonable measures to help protect your personal information from loss, 
              theft, misuse, unauthorized access, disclosure, alteration, and destruction. 
              However, no internet or email transmission is ever fully secure or error-free.
            </p>
          </section>

          <section className="privacy_section">
            <h3>5. Your Rights and Choices</h3>
            <p>You have the right to:</p>
            <ul>
              <li>Access and update your account information</li>
              <li>Request deletion of your personal information</li>
              <li>Opt out of receiving promotional communications</li>
              <li>Control cookies through your browser settings</li>
            </ul>
          </section>

          <section className="privacy_section">
            <h3>6. Cookies and Tracking Technologies</h3>
            <p>
              We use cookies and similar tracking technologies to collect information about your 
              browsing activities. You can control cookies through your browser settings, but 
              disabling cookies may affect your ability to use certain features of our services.
            </p>
          </section>

          <section className="privacy_section">
            <h3>7. Data Retention</h3>
            <p>
              We retain your personal information for as long as necessary to provide our services, 
              comply with legal obligations, resolve disputes, and enforce our agreements. When we 
              no longer need your information, we will securely delete or anonymize it.
            </p>
          </section>

          <section className="privacy_section">
            <h3>8. Children's Privacy</h3>
            <p>
              Our services are not intended for users under the age of 13. We do not knowingly 
              collect personal information from children under 13. If we learn that we have 
              collected such information, we will take steps to delete it.
            </p>
          </section>

          <section className="privacy_section">
            <h3>9. International Data Transfers</h3>
            <p>
              Your information may be transferred to and processed in countries other than your 
              country of residence. We ensure that such transfers comply with applicable data 
              protection laws and implement appropriate safeguards.
            </p>
          </section>

          <section className="privacy_section">
            <h3>10. Changes to This Privacy Policy</h3>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any 
              changes by posting the new Privacy Policy on this page and updating the "Last 
              Updated" date. Your continued use of our services after any changes indicates 
              your acceptance of the updated policy.
            </p>
          </section>

          <section className="privacy_section">
            <h3>11. Contact Us</h3>
            <p>
              If you have any questions about this Privacy Policy or our privacy practices, 
              please contact us at:
            </p>
            <p>
              Email: privacy@sociatech.com<br />
              Address: SociaTech Privacy Team, 123 Tech Street, San Francisco, CA 94105
            </p>
          </section>

          <div className="privacy_footer">
            <p><strong>Last Updated:</strong> November 27, 2025</p>
          </div>
        </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
