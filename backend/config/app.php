<?php

function trim_app_url(string $value): string
{
    return rtrim($value, '/');
}

function get_request_scheme(): string
{
    if (!empty($_SERVER['HTTP_X_FORWARDED_PROTO'])) {
        return trim(explode(',', $_SERVER['HTTP_X_FORWARDED_PROTO'])[0]);
    }

    if (!empty($_SERVER['REQUEST_SCHEME'])) {
        return $_SERVER['REQUEST_SCHEME'];
    }

    if (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') {
        return 'https';
    }

    return 'http';
}

function get_frontend_url(): string
{
    return trim_app_url(getenv('APP_URL') ?: 'https://socia-tech.vercel.app');
}

function get_backend_url(): string
{
    $configuredUrl = getenv('BACKEND_URL');

    if (!empty($configuredUrl)) {
        return trim_app_url($configuredUrl);
    }

    $host = $_SERVER['HTTP_X_FORWARDED_HOST'] ?? $_SERVER['HTTP_HOST'] ?? null;

    if (!empty($host)) {
        $normalizedHost = trim(explode(',', $host)[0]);

        return get_request_scheme() . '://' . $normalizedHost;
    }

    return 'http://localhost/SociaTech/backend';
}

function build_frontend_url(string $path = '', array $query = []): string
{
    $url = get_frontend_url();

    if ($path !== '') {
        $url .= '/' . ltrim($path, '/');
    }

    if (!empty($query)) {
        $url .= '?' . http_build_query($query);
    }

    return $url;
}

function build_backend_url(string $path = '', array $query = []): string
{
    $url = get_backend_url();

    if ($path !== '') {
        $url .= '/' . ltrim($path, '/');
    }

    if (!empty($query)) {
        $url .= '?' . http_build_query($query);
    }

    return $url;
}

function redirect_to_frontend(string $path, array $query = []): void
{
    header('Location: ' . build_frontend_url($path, $query));
    exit();
}
