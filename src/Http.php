<?php

declare(strict_types=1);

namespace WunTube;

/**
 * Shared HTTP request, response, CORS, and formatting utilities.
 */
final class Http
{
    public static function sendCorsHeaders(): void
    {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization');
    }

    /**
     * Send a JSON response and terminate request handling.
     *
     * @param array<string, mixed> $data
     */
    public static function json(array $data, int $status = 200): never
    {
        self::sendCorsHeaders();
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    /**
     * Parse JSON request body (falling back to $_POST for form submissions).
     *
     * @return array<string, mixed>
     */
    public static function getJsonBody(): array
    {
        $raw = file_get_contents('php://input');
        if (is_string($raw) && trim($raw) !== '') {
            $decoded = json_decode($raw, true);
            if (is_array($decoded)) {
                return $decoded;
            }
        }
        return $_POST;
    }

    /**
     * Extract Bearer token from Authorization header across Apache/CGI/CLI-server variants.
     */
    public static function getBearerToken(): ?string
    {
        $header = $_SERVER['HTTP_AUTHORIZATION']
            ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION']
            ?? null;

        if ($header === null && function_exists('apache_request_headers')) {
            $headers = apache_request_headers();
            if (is_array($headers)) {
                foreach ($headers as $name => $value) {
                    if (strcasecmp((string) $name, 'Authorization') === 0) {
                        $header = (string) $value;
                        break;
                    }
                }
            }
        }

        if (!is_string($header) || !preg_match('/^\s*Bearer\s+(.+)$/i', $header, $matches)) {
            return null;
        }

        $token = trim($matches[1]);
        return $token === '' ? null : $token;
    }

    /**
     * Format duration in seconds as M:SS (or 'N/A' when missing).
     */
    public static function formatDuration(int|float|null $seconds): string
    {
        if ($seconds === null || $seconds <= 0) {
            return 'N/A';
        }
        $total = (int) round($seconds);
        $minutes = intdiv($total, 60);
        $secs = $total % 60;
        return sprintf('%d:%02d', $minutes, $secs);
    }
}

