import { LockKeyhole, X } from "lucide-react";
import "./ChangePass.css";
import { useState } from "react";

export default function ChangePass({
  openChangePass,
  closeChangePass,
  userId,
}) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validatePassword = (password) => {
    // At least 8 characters, contains number, letter, and special character
    const minLength = password.length >= 8;
    const hasNumber = /\d/.test(password);
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return minLength && hasNumber && hasLetter && hasSpecial;
  };

  const handleChangePassword = async () => {
    // Reset messages
    setError("");
    setSuccess("");

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (!validatePassword(newPassword)) {
      setError(
        "Password must be at least 8 characters and include numbers, letters, and special characters"
      );
      return;
    }

    if (currentPassword === newPassword) {
      setError("New password must be different from current password");
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("user_id", userId);
      formData.append("current_password", currentPassword);
      formData.append("new_password", newPassword);

      const response = await fetch(
        "http://localhost/SociaTech/backend/auth/changePassword.php",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (data.success) {
        setSuccess("Password changed successfully!");
        // Clear fields
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");

        // Close modal after 2 seconds
        setTimeout(() => {
          closeChangePass();
          setSuccess("");
        }, 2000);
      } else {
        setError(data.message || "Failed to change password");
      }
    } catch (err) {
      console.error("Error changing password:", err);
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError("");
    setSuccess("");
    closeChangePass();
  };

  return (
    <>
      <div
        className="changePass_parent_container"
        style={{ display: openChangePass ? "flex" : "none" }}
      >
        <div className="changePass_modal">
          <button className="changePass_close_btn" onClick={handleClose}>
            <X className="closeSvg" />
          </button>
          <div className="changePass_modal_title">
            <LockKeyhole /> Password
          </div>
          <div className="changePass_requirement">
            Your Password must be at least 8 characters and should include a
            combination of numbers, letters and special characters.
          </div>

          {error && (
            <div
              style={{
                color: "red",
                padding: "10px",
                backgroundColor: "#fee",
                borderRadius: "5px",
                marginBottom: "10px",
                fontSize: "14px",
              }}
            >
              {error}
            </div>
          )}

          {success && (
            <div
              style={{
                color: "green",
                padding: "10px",
                backgroundColor: "#efe",
                borderRadius: "5px",
                marginBottom: "10px",
                fontSize: "14px",
              }}
            >
              {success}
            </div>
          )}

          <input
            type="password"
            placeholder="Current Password"
            className="changePass_fields"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            disabled={isLoading}
          />
          <input
            type="password"
            placeholder="New Password"
            className="changePass_fields"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={isLoading}
          />
          <input
            type="password"
            placeholder="Confirm Password"
            className="changePass_fields"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isLoading}
          />

          <div className="ChangePass_btn_container">
            <button
              onClick={handleChangePassword}
              disabled={isLoading}
              style={{
                opacity: isLoading ? 0.6 : 1,
                cursor: isLoading ? "not-allowed" : "pointer",
              }}
            >
              {isLoading ? "Changing..." : "Change Password"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
