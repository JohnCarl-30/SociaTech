<?php

require_once __DIR__ . '/app.php';

require __DIR__ . '/../vendor/autoload.php';
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../');
$dotenv->safeLoad();

if (!function_exists('env_value')) {
    function env_value(string $key, ?string $default = null): ?string {
        $value = getenv($key);

        if ($value === false || $value === null || $value === '') {
            return $_ENV[$key] ?? $default;
        }

        return $value;
    }
}

function format_email_identity(string $email, ?string $name = null): string
{
    $trimmedName = trim((string) $name);

    if ($trimmedName === '') {
        return $email;
    }

    return sprintf('%s <%s>', $trimmedName, $email);
}

function resend_request(array $payload, ?string $idempotencyKey = null): array
{
    $apiKey = env_value('RESEND_API_KEY');

    if (!$apiKey) {
        return [
            'success' => false,
            'message' => 'RESEND_API_KEY is not configured.',
        ];
    }

    $jsonPayload = json_encode($payload);

    if ($jsonPayload === false) {
        return [
            'success' => false,
            'message' => 'Failed to encode the Resend payload.',
        ];
    }

    $headers = [
        'Authorization: Bearer ' . $apiKey,
        'Content-Type: application/json',
    ];

    if ($idempotencyKey) {
        $headers[] = 'Idempotency-Key: ' . $idempotencyKey;
    }

    $responseBody = null;
    $statusCode = 0;

    if (function_exists('curl_init')) {
        $ch = curl_init('https://api.resend.com/emails');
        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => $jsonPayload,
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 15,
        ]);

        $responseBody = curl_exec($ch);

        if ($responseBody === false) {
            $curlError = curl_error($ch);
            curl_close($ch);

            return [
                'success' => false,
                'message' => 'Resend request failed: ' . $curlError,
            ];
        }

        $statusCode = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
        curl_close($ch);
    } else {
        $context = stream_context_create([
            'http' => [
                'method' => 'POST',
                'header' => implode("\r\n", $headers),
                'content' => $jsonPayload,
                'ignore_errors' => true,
                'timeout' => 15,
            ],
        ]);

        $responseBody = @file_get_contents('https://api.resend.com/emails', false, $context);

        if ($responseBody === false) {
            return [
                'success' => false,
                'message' => 'Resend request failed before receiving a response.',
            ];
        }

        $statusLine = $http_response_header[0] ?? '';
        if (preg_match('/\s(\d{3})\s/', $statusLine, $matches)) {
            $statusCode = (int) $matches[1];
        }
    }

    $decoded = json_decode($responseBody, true);
    $message = $decoded['message'] ?? $decoded['name'] ?? 'Unable to send email.';

    if ($statusCode >= 200 && $statusCode < 300) {
        return [
            'success' => true,
            'id' => $decoded['id'] ?? null,
        ];
    }

    return [
        'success' => false,
        'message' => $message,
        'status' => $statusCode,
        'response' => $decoded,
    ];
}

function send_email_with_resend(
    string $recipientEmail,
    string $recipientName,
    string $subject,
    string $html,
    string $text,
    array $tags = [],
    ?string $idempotencyKey = null
): array {
    $fromEmail = env_value('RESEND_FROM_EMAIL');
    $fromName = env_value('RESEND_FROM_NAME', 'SociaTech');
    $replyTo = env_value('RESEND_REPLY_TO', $fromEmail);

    if (!$fromEmail) {
        return [
            'success' => false,
            'message' => 'RESEND_FROM_EMAIL is not configured.',
        ];
    }

    $payload = [
        'from' => format_email_identity($fromEmail, $fromName),
        'to' => [format_email_identity($recipientEmail, $recipientName)],
        'subject' => $subject,
        'html' => $html,
        'text' => $text,
    ];

    if ($replyTo) {
        $payload['reply_to'] = $replyTo;
    }

    if (!empty($tags)) {
        $payload['tags'] = $tags;
    }

    return resend_request($payload, $idempotencyKey);
}

function sendPasswordResetEmail(string $recipientEmail, string $recipientName, string $token): array
{
    $resetLink = build_frontend_url('update-password', ['token' => $token]);

    $html = "
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
                    <p>Hello <strong>{$recipientName}</strong>,</p>
                    <p>We received a request to reset your password for your Sociatech account.</p>
                    <p>Click the button below to reset your password:</p>
                    <div style='text-align: center;'>
                        <a href='{$resetLink}' class='button'>Reset Password</a>
                    </div>
                    <p>Or copy and paste this link into your browser:</p>
                    <p style='word-break: break-all; color: #121218ff;'>{$resetLink}</p>
                    <div class='expiry'>
                        <strong>Important:</strong> This link will expire in 1 hour for security reasons.
                    </div>
                    <p class='warning'>
                        If you didn't request a password reset, please ignore this email or contact support if you have concerns.
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

    $text = "Hello {$recipientName},\n\n"
        . "We received a request to reset your password.\n\n"
        . "Reset your password using this link:\n{$resetLink}\n\n"
        . "This link will expire in 1 hour.\n\n"
        . "If you didn't request this, please ignore this email.\n\n"
        . "Best regards,\nSociatech Team";

    return send_email_with_resend(
        $recipientEmail,
        $recipientName,
        'Password Reset Request - Sociatech',
        $html,
        $text,
        [['name' => 'type', 'value' => 'password-reset']],
        hash('sha256', 'password-reset:' . strtolower($recipientEmail) . ':' . $token)
    );
}

function sendVerificationEmailMessage(string $recipientEmail, string $recipientName, string $verificationUrl): array
{
    $html = "
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <h1>Verify Your Email</h1>
                </div>
                <div class='content'>
                    <p>Hi {$recipientName},</p>
                    <p>Please verify your email address to complete your SociaTech registration.</p>
                    <p style='text-align: center;'>
                        <a href='{$verificationUrl}' class='button'>Verify Email Address</a>
                    </p>
                    <p>Or copy and paste this link into your browser:</p>
                    <p style='word-break: break-all; color: #667eea;'>{$verificationUrl}</p>
                    <p><strong>This link will expire in 1 hour.</strong></p>
                    <p>If you didn't create this account, please ignore this email.</p>
                </div>
                <div class='footer'>
                    <p>&copy; " . date('Y') . " SociaTech. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    ";

    $text = "Hi {$recipientName},\n\n"
        . "Please verify your email address to complete your SociaTech registration.\n\n"
        . "Verify here:\n{$verificationUrl}\n\n"
        . "This link will expire in 1 hour.\n\n"
        . "If you didn't create this account, please ignore this email.";

    return send_email_with_resend(
        $recipientEmail,
        $recipientName,
        'Verify Your Email Address - SociaTech',
        $html,
        $text,
        [['name' => 'type', 'value' => 'email-verification']],
        hash('sha256', 'email-verification:' . strtolower($recipientEmail) . ':' . $verificationUrl)
    );
}
