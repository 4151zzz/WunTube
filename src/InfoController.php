<?php

declare(strict_types=1);

namespace WunTube;

/**
 * Provides local LAN IP URLs and optional tunnel sharing info.
 */
final class InfoController
{
    /**
     * GET /api/info
     */
    public function info(int $defaultPort, string $tunnelStatePath, string $basePath): never
    {
        $port = (int) ($_SERVER['SERVER_PORT'] ?? $defaultPort);
        if ($port <= 0) {
            $port = $defaultPort;
        }

        $publicUrl = null;
        $tunnelPassword = null;

        if (is_file($tunnelStatePath)) {
            $state = json_decode((string) file_get_contents($tunnelStatePath), true);
            if (is_array($state) && !empty($state['publicUrl'])) {
                $publicUrl = (string) $state['publicUrl'];
                $tunnelPassword = $state['tunnelPassword'] ?? null;
            }
        }

        $portSuffix = ($port === 80 || $port === 443) ? '' : ':' . $port;
        $pathSuffix = $basePath !== '' ? $basePath : '';

        $localUrls = array_map(
            static fn (string $ip): string => "http://{$ip}{$portSuffix}{$pathSuffix}",
            self::getLocalIPs()
        );

        Http::json([
            'publicUrl' => $publicUrl,
            'tunnelPassword' => $tunnelPassword,
            'localUrls' => $localUrls,
            'port' => $port,
            'hasYtDlp' => BinaryFinder::isYtDlpAvailable(),
        ]);
    }

    /**
     * Return non-loopback local IPv4 addresses on active network interfaces.
     *
     * @return list<string>
     */
    public static function getLocalIPs(): array
    {
        $ips = [];

        if (function_exists('net_get_interfaces')) {
            $interfaces = @net_get_interfaces();
            if (is_array($interfaces)) {
                foreach ($interfaces as $iface) {
                    if (empty($iface['up']) || empty($iface['unicast']) || !is_array($iface['unicast'])) {
                        continue;
                    }
                    foreach ($iface['unicast'] as $entry) {
                        $addr = (string) ($entry['address'] ?? '');
                        if (self::isLanIPv4($addr)) {
                            $ips[] = $addr;
                        }
                    }
                }
            }
        }

        if ($ips === []) {
            $host = gethostname();
            if (is_string($host) && $host !== '') {
                $resolved = @gethostbynamel($host);
                if (is_array($resolved)) {
                    foreach ($resolved as $addr) {
                        if (self::isLanIPv4((string) $addr)) {
                            $ips[] = (string) $addr;
                        }
                    }
                }
            }
        }

        return array_values(array_unique($ips));
    }

    private static function isLanIPv4(string $ip): bool
    {
        if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4) === false) {
            return false;
        }
        return $ip !== '127.0.0.1' && !str_starts_with($ip, '169.254.');
    }
}

