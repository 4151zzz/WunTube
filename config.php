<?php

declare(strict_types=1);

mb_internal_encoding('UTF-8');

/**
 * Load key=value pairs from a .env file if present without external dependencies.
 *
 * @return array<string, string>
 */
function wuntube_load_env(string $envPath): array
{
    $vars = [];
    if (!is_file($envPath) || !is_readable($envPath)) {
        return $vars;
    }

    $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    if ($lines === false) {
        return $vars;
    }

    foreach ($lines as $line) {
        $trimmed = trim($line);
        if ($trimmed === '' || str_starts_with($trimmed, '#') || !str_contains($trimmed, '=')) {
            continue;
        }

        [$key, $val] = explode('=', $trimmed, 2);
        $key = trim($key);
        $val = trim($val);

        if ($key === '') {
            continue;
        }

        $len = strlen($val);
        if ($len >= 2 && (($val[0] === '"' && $val[$len - 1] === '"') || ($val[0] === "'" && $val[$len - 1] === "'"))) {
            $val = substr($val, 1, -1);
        }

        $vars[$key] = $val;
    }

    return $vars;
}

$envVars = wuntube_load_env(__DIR__ . '/.env');

$envGet = static function (string $key, ?string $default = null) use ($envVars): ?string {
    $val = getenv($key);
    if ($val !== false && $val !== '') {
        return (string) $val;
    }
    if (isset($_ENV[$key]) && $_ENV[$key] !== '') {
        return (string) $_ENV[$key];
    }
    return $envVars[$key] ?? $default;
};

return [
    'root_dir' => __DIR__,
    'public_dir' => __DIR__ . '/public',
    'storage_dir' => __DIR__ . '/storage',
    'db_path' => __DIR__ . '/users.db',
    'firebase_service_account_path' => __DIR__ . '/firebase-service-account.json',
    'tunnel_state_path' => __DIR__ . '/storage/tunnel.json',
    'jwt_secret' => (string) $envGet('JWT_SECRET', 'wuntube-super-secret-key'),
    'port' => (int) ($envGet('PORT', '3000') ?: 3000),
];

