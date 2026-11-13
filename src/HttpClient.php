<?php

declare(strict_types=1);

namespace WunTube;

/**
 * Lightweight HTTP client supporting both cURL and PHP stream wrappers for shared hosting compatibility.
 */
final class HttpClient
{
    /**
     * Send an HTTP POST request with a JSON body and return decoded JSON array or null on failure.
     *
     * @param array<string, mixed> $payload
     * @param list<string> $headers
     * @return array<string, mixed>|null
     */
    public static function postJson(string $url, array $payload, array $headers = [], int $timeout = 12): ?array
    {
        $body = json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        if ($body === false) {
            return null;
        }

        $allHeaders = array_merge([
            'Content-Type: application/json',
            'Accept: application/json',
            'Accept-Language: th-TH,th;q=0.9,en;q=0.8',
            'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        ], $headers);

        $raw = self::request('POST', $url, $body, $allHeaders, $timeout);
        if ($raw === null || $raw === '') {
            return null;
        }

        $decoded = json_decode($raw, true);
        return is_array($decoded) ? $decoded : null;
    }

    /**
     * Send an HTTP GET request and return decoded JSON array or null on failure.
     *
     * @param list<string> $headers
     * @return array<string, mixed>|null
     */
    public static function getJson(string $url, array $headers = [], int $timeout = 10): ?array
    {
        $allHeaders = array_merge([
            'Accept: application/json',
            'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        ], $headers);

        $raw = self::request('GET', $url, null, $allHeaders, $timeout);
        if ($raw === null || $raw === '') {
            return null;
        }

        $decoded = json_decode($raw, true);
        return is_array($decoded) ? $decoded : null;
    }

    /**
     * @param list<string> $headers
     */
    private static function request(string $method, string $url, ?string $body, array $headers, int $timeout): ?string
    {
        if (function_exists('curl_init')) {
            $ch = curl_init($url);
            if ($ch === false) {
                return null;
            }
            curl_setopt_array($ch, [
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_FOLLOWLOCATION => true,
                CURLOPT_MAXREDIRS => 5,
                CURLOPT_TIMEOUT => $timeout,
                CURLOPT_CONNECTTIMEOUT => min(5, $timeout),
                CURLOPT_HTTPHEADER => $headers,
                CURLOPT_CUSTOMREQUEST => $method,
                CURLOPT_SSL_VERIFYPEER => true,
                CURLOPT_ENCODING => '',
            ]);
            if ($body !== null) {
                curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
            }
            $result = curl_exec($ch);
            $status = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

            if (!is_string($result) || $status >= 400) {
                return null;
            }
            return $result;
        }

        $httpOpts = [
            'method' => $method,
            'header' => implode("\r\n", $headers),
            'timeout' => $timeout,
            'ignore_errors' => false,
        ];
        if ($body !== null) {
            $httpOpts['content'] = $body;
        }

        $ctx = stream_context_create([
            'http' => $httpOpts,
            'ssl' => ['verify_peer' => true, 'verify_peer_name' => true],
        ]);

        $result = @file_get_contents($url, false, $ctx);
        return is_string($result) ? $result : null;
    }
}

