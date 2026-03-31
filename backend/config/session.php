<?php

require_once __DIR__ . '/app.php';

function start_sociatech_session(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }

    $isSecure = get_request_scheme() === 'https';

    ini_set('session.use_only_cookies', '1');
    ini_set('session.use_strict_mode', '1');

    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'secure' => $isSecure,
        'httponly' => true,
        'samesite' => $isSecure ? 'None' : 'Lax',
    ]);

    session_start();
}
