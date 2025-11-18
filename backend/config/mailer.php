<?php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require __DIR__ . '/../vendor/autoload.php';
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../');
$dotenv->load();

function sendPasswordResetEmail($recipientEmail, $recipientName, $token) {
    $mail = new PHPMailer(true);

    try {
        // Server settings
        $mail->isSMTP();
        $mail->Host       = $_ENV['SMTP_HOST'];
        $mail->SMTPAuth   = true;
        $mail->Username   = $_ENV['SMTP_EMAIL'];
        $mail->Password   = $_ENV['SMTP_PASS'];
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = $_ENV['SMTP_PORT'];
     
        $mail->setFrom('sociatech@gmail.com', 'Sociatech');
        $mail->addAddress($recipientEmail, $recipientName);
        $mail->addReplyTo('no-reply@sociatech.com', 'No Reply');

        $mail->isHTML(true);
        $mail->Subject = 'Password Reset Request - Sociatech';
       
        $resetLink = "http://localhost:5173/update-password?token=" . urlencode($token);
        
        $mail->Body = "
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                    .content { background-color: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
                    .button { display: inline-block; padding: 12px 30px; background-color: #121218ff; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
                    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
                    .warning { color: #dc2626; font-size: 14px; margin-top: 20px; }
                    .expiry { background-color: #fef3c7; padding: 10px; border-left: 4px solid #f59e0b; margin: 15px 0; }
                </style>
            </head>
            <body>
                <div class='container'>
                    <div class='header'>
                        <h1>Password Reset Request</h1>
                    </div>
                    <div class='content'>
                        <p>Hello <strong>$recipientName</strong>,</p>
                        <p>We received a request to reset your password for your Sociatech account.</p>
                        <p>Click the button below to reset your password:</p>
                        <div style='text-align: center;'>
                            <a href='$resetLink' class='button'>Reset Password</a>
                        </div>
                        <p>Or copy and paste this link into your browser:</p>
                        <p style='word-break: break-all; color: #121218ff;'>$resetLink</p>
                        <div class='expiry'>
                            <strong>⏰ Important:</strong> This link will expire in 1 hour for security reasons.
                        </div>
                        <p class='warning'>
                            ⚠️ If you didn't request a password reset, please ignore this email or contact support if you have concerns.
                        </p>
                        <p style='font-size: 12px; color: #6b7280; margin-top: 20px;'>
                            For security, this link can only be used once. After resetting your password, this link will no longer work.
                        </p>
                    </div>
                    <div class='footer'>
                        <p>&copy; " . date('Y') . " Sociatech. All rights reserved.</p>
                        <p>This is an automated message, please do not reply to this email.</p>
                    </div>
                </div>
            </body>
            </html>
        ";

        $mail->AltBody = "Hello $recipientName,\n\n"
                       . "We received a request to reset your password.\n\n"
                       . "Reset your password using this link:\n$resetLink\n\n"
                       . "⏰ This link will expire in 1 hour.\n\n"
                       . "If you didn't request this, please ignore this email.\n\n"
                       . "Best regards,\nSociatech Team";

        $mail->send();
        return ['success' => true, 'message' => 'Password reset email sent successfully'];
    } catch (Exception $e) {
        error_log("Mailer Error: {$mail->ErrorInfo}");
        return ['success' => false, 'message' => 'Failed to send email. Please try again later.'];
    }
}