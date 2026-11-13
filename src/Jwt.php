<?php

declare(strict_types=1);

namespace WunTube;

/**
 * Pure-PHP JWT signer/verifier (HS256) and Firebase ID token verifier (RS256).
 */
final class Jwt
{
    private const FIREBASE_CERTS_URL = 'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com';

    public static function base64UrlEncode(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    public static function base64UrlDecode(string $data): string
    {
        $remainder = strlen($data) % 4;
        if ($remainder > 0) {
            $data .= str_repeat('=', 4 - $remainder);
        }
        $decoded = base64_decode(strtr($data, '-_', '+/'), true);
        return $decoded === false ? '' : $decoded;
    }

    /**
     * Sign an HS256 JWT with expiration.
     *
     * @param array<string, mixed> $payload
     */
    public static function signHs256(array $payload, string $secret, int $ttlSeconds = 604800): string
    {
        $now = time();
        $claims = array_merge($payload, [
            'iat' => $now,
            'exp' => $now + $ttlSeconds,
        ]);

        $headerB64 = self::base64UrlEncode(json_encode(['typ' => 'JWT', 'alg' => 'HS256'], JSON_THROW_ON_ERROR));
        $payloadB64 = self::base64UrlEncode(json_encode($claims, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR));
        $signingInput = $headerB64 . '.' . $payloadB64;
        $signature = hash_hmac('sha256', $signingInput, $secret, true);

        return $signingInput . '.' . self::base64UrlEncode($signature);
    }

    /**
     * Verify an HS256 JWT and return its payload claims or null if invalid/expired.
     *
     * @return array<string, mixed>|null
     */
    public static function verifyHs256(string $token, string $secret): ?array
    {
        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            return null;
        }

        [$headerB64, $payloadB64, $sigB64] = $parts;
        $header = json_decode(self::base64UrlDecode($headerB64), true);
        $payload = json_decode(self::base64UrlDecode($payloadB64), true);
        $signature = self::base64UrlDecode($sigB64);

        if (!is_array($header) || !is_array($payload) || $signature === '') {
            return null;
        }

        if (($header['alg'] ?? '') !== 'HS256') {
            return null;
        }

        $expectedSig = hash_hmac('sha256', $headerB64 . '.' . $payloadB64, $secret, true);
        if (!hash_equals($expectedSig, $signature)) {
            return null;
        }

        if (isset($payload['exp']) && (int) $payload['exp'] < time()) {
            return null;
        }

        return $payload;
    }

    /**
     * Verify a Firebase RS256 ID token against Google's public x509 certificates.
     *
     * @return array<string, mixed>|null
     */
    public static function verifyFirebaseIdToken(string $token, string $projectId): ?array
    {
        if ($projectId === '' || !function_exists('openssl_verify')) {
            return null;
        }

        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            return null;
        }

        [$headerB64, $payloadB64, $sigB64] = $parts;
        $header = json_decode(self::base64UrlDecode($headerB64), true);
        $payload = json_decode(self::base64UrlDecode($payloadB64), true);
        $signature = self::base64UrlDecode($sigB64);

        if (!is_array($header) || !is_array($payload) || $signature === '') {
            return null;
        }

        if (($header['alg'] ?? '') !== 'RS256' || empty($header['kid'])) {
            return null;
        }

        $now = time();
        $expectedIssuer = 'https://securetoken.google.com/' . $projectId;

        if (($payload['aud'] ?? '') !== $projectId) {
            return null;
        }
        if (($payload['iss'] ?? '') !== $expectedIssuer) {
            return null;
        }
        if (empty($payload['sub']) || !is_string($payload['sub'])) {
            return null;
        }
        if (empty($payload['exp']) || (int) $payload['exp'] <= $now) {
            return null;
        }
        if (isset($payload['iat']) && (int) $payload['iat'] > $now + 300) {
            return null;
        }

        $certs = self::fetchFirebaseCerts();
        $kid = (string) $header['kid'];
        if (!isset($certs[$kid])) {
            return null;
        }

        $pubKey = openssl_pkey_get_public($certs[$kid]);
        if ($pubKey === false) {
            return null;
        }

        $verified = openssl_verify($headerB64 . '.' . $payloadB64, $signature, $pubKey, OPENSSL_ALGO_SHA256);
        return $verified === 1 ? $payload : null;
    }

    /**
     * Fetch and briefly cache Google's Firebase securetoken public certificates.
     *
     * @return array<string, string>
     */
    private static function fetchFirebaseCerts(): array
    {
        $cachePath = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'wuntube_firebase_certs.json';
        if (is_file($cachePath)) {
            $cached = json_decode((string) file_get_contents($cachePath), true);
            if (is_array($cached) && ($cached['expires_at'] ?? 0) > time() && is_array($cached['certs'] ?? null)) {
                return $cached['certs'];
            }
        }

        $certs = HttpClient::getJson(self::FIREBASE_CERTS_URL, [], 5);
        if (!is_array($certs)) {
            return [];
        }

        @file_put_contents($cachePath, json_encode([
            'expires_at' => time() + 3600,
            'certs' => $certs,
        ]));

        return $certs;
    }
}

