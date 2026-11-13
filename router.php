<?php

declare(strict_types=1);

/**
 * Built-in PHP development server router (`php -S 0.0.0.0:3000 -t public router.php`).
 */

$uriPath = (string) (parse_url((string) ($_SERVER['REQUEST_URI'] ?? '/'), PHP_URL_PATH) ?: '/');
$publicRoot = realpath(__DIR__ . '/public');

if ($publicRoot !== false && $uriPath !== '/' && !str_starts_with($uriPath, '/api/')) {
    // Allow serving static assets from public/ whether invoked with `-t public` or from project root
    $relative = str_starts_with($uriPath, '/public/')
        ? substr($uriPath, strlen('/public'))
        : $uriPath;

    $candidate = realpath($publicRoot . $relative);
    if (
        $candidate !== false
        && str_starts_with($candidate, $publicRoot . DIRECTORY_SEPARATOR)
        && is_file($candidate)
        && strtolower(pathinfo($candidate, PATHINFO_EXTENSION)) !== 'php'
    ) {
        $docRoot = realpath((string) ($_SERVER['DOCUMENT_ROOT'] ?? ''));
        if ($docRoot === $publicRoot && $relative === $uriPath) {
            return false;
        }

        $mimeMap = [
            'css' => 'text/css; charset=utf-8',
            'js' => 'application/javascript; charset=utf-8',
            'json' => 'application/json; charset=utf-8',
            'png' => 'image/png',
            'jpg' => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'svg' => 'image/svg+xml',
            'ico' => 'image/x-icon',
            'webp' => 'image/webp',
        ];
        $ext = strtolower(pathinfo($candidate, PATHINFO_EXTENSION));
        header('Content-Type: ' . ($mimeMap[$ext] ?? 'application/octet-stream'));
        header('Content-Length: ' . (string) filesize($candidate));
        readfile($candidate);
        return true;
    }
}

require_once __DIR__ . '/src/App.php';

WunTube\App::run(false);

