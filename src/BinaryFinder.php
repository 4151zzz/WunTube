<?php

declare(strict_types=1);

namespace WunTube;

/**
 * Locates external binaries (yt-dlp, ffmpeg, deno/node, cloudflared) and safely executes commands.
 */
final class BinaryFinder
{
    private static ?bool $ytDlpAvailableCache = null;

    /**
     * Check whether proc_open is enabled and not blocked by disable_functions.
     */
    public static function canProcOpen(): bool
    {
        if (!function_exists('proc_open')) {
            return false;
        }
        $disabled = (string) ini_get('disable_functions');
        if ($disabled === '') {
            return true;
        }
        $list = array_map('trim', explode(',', strtolower($disabled)));
        return !in_array('proc_open', $list, true);
    }

    /**
     * Detect if yt-dlp can be executed on this server (cached for 60s when found).
     */
    public static function isYtDlpAvailable(): bool
    {
        if (self::$ytDlpAvailableCache !== null) {
            return self::$ytDlpAvailableCache;
        }

        if (!self::canProcOpen()) {
            self::$ytDlpAvailableCache = false;
            return false;
        }

        $path = self::getYtDlpPath();
        if ($path !== 'yt-dlp') {
            self::$ytDlpAvailableCache = is_file($path);
            return self::$ytDlpAvailableCache;
        }

        $cacheFile = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'wuntube_ytdlp_check.json';
        if (is_file($cacheFile)) {
            $cached = json_decode((string) @file_get_contents($cacheFile), true);
            if (is_array($cached) && ($cached['expires_at'] ?? 0) > time()) {
                self::$ytDlpAvailableCache = (bool) ($cached['available'] ?? false);
                return self::$ytDlpAvailableCache;
            }
        }

        $res = self::runCommand([$path, '--version'], 8);
        $available = $res['ok'] && trim($res['stdout']) !== '';
        @file_put_contents($cacheFile, json_encode([
            'expires_at' => time() + ($available ? 60 : 5),
            'available' => $available,
        ]));

        self::$ytDlpAvailableCache = $available;
        return $available;
    }

    /**
     * Resolve yt-dlp executable path (project bin/, WinGet packages/links, common install dirs, or PATH).
     */
    public static function getYtDlpPath(): string
    {
        $projectBin = dirname(__DIR__) . DIRECTORY_SEPARATOR . 'bin' . DIRECTORY_SEPARATOR
            . (DIRECTORY_SEPARATOR === '\\' ? 'yt-dlp.exe' : 'yt-dlp');
        if (is_file($projectBin)) {
            return $projectBin;
        }

        $home = self::getHomeDir();
        if ($home !== null && DIRECTORY_SEPARATOR === '\\') {
            $wingetLink = $home . '\\AppData\\Local\\Microsoft\\WinGet\\Links\\yt-dlp.exe';
            if (is_file($wingetLink)) {
                return $wingetLink;
            }

            $wingetBase = $home . '\\AppData\\Local\\Microsoft\\WinGet\\Packages';
            if (is_dir($wingetBase)) {
                foreach (@scandir($wingetBase) ?: [] as $entry) {
                    if ($entry === '.' || $entry === '..') {
                        continue;
                    }
                    if (stripos($entry, 'yt-dlp') !== false) {
                        $candidate = $wingetBase . '\\' . $entry . '\\yt-dlp.exe';
                        if (is_file($candidate)) {
                            return $candidate;
                        }
                    }
                }
            }
        }

        $fallbacks = DIRECTORY_SEPARATOR === '\\'
            ? array_filter([
                $home ? $home . '\\AppData\\Local\\Programs\\yt-dlp\\yt-dlp.exe' : null,
                'C:\\Windows\\System32\\yt-dlp.exe',
            ])
            : ['/usr/local/bin/yt-dlp', '/usr/bin/yt-dlp'];

        foreach ($fallbacks as $candidate) {
            if (is_file($candidate)) {
                return $candidate;
            }
        }

        return 'yt-dlp';
    }

    /**
     * Resolve directory containing ffmpeg executable (project bin/, WinGet packages, or common dirs).
     */
    public static function getFFmpegPath(): ?string
    {
        $projectBinDir = dirname(__DIR__) . DIRECTORY_SEPARATOR . 'bin';
        $projectFfmpeg = $projectBinDir . DIRECTORY_SEPARATOR
            . (DIRECTORY_SEPARATOR === '\\' ? 'ffmpeg.exe' : 'ffmpeg');
        if (is_file($projectFfmpeg)) {
            return $projectBinDir;
        }

        $home = self::getHomeDir();
        if ($home !== null && DIRECTORY_SEPARATOR === '\\') {
            $wingetLink = $home . '\\AppData\\Local\\Microsoft\\WinGet\\Links\\ffmpeg.exe';
            if (is_file($wingetLink)) {
                return dirname($wingetLink);
            }

            $wingetBase = $home . '\\AppData\\Local\\Microsoft\\WinGet\\Packages';
            if (is_dir($wingetBase)) {
                foreach (@scandir($wingetBase) ?: [] as $entry) {
                    if ($entry === '.' || $entry === '..' || stripos($entry, 'ffmpeg') === false) {
                        continue;
                    }
                    $pkgDir = $wingetBase . '\\' . $entry;
                    if (!is_dir($pkgDir)) {
                        continue;
                    }
                    if (is_file($pkgDir . '\\ffmpeg.exe')) {
                        return $pkgDir;
                    }
                    foreach (@scandir($pkgDir) ?: [] as $sub) {
                        if ($sub === '.' || $sub === '..') {
                            continue;
                        }
                        $candidate = $pkgDir . '\\' . $sub . '\\bin\\ffmpeg.exe';
                        if (is_file($candidate)) {
                            return dirname($candidate);
                        }
                    }
                }
            }

            if (is_file('C:\\ffmpeg\\bin\\ffmpeg.exe')) {
                return 'C:\\ffmpeg\\bin';
            }
        }

        return null;
    }

    /**
     * Locate a JS runtime (Deno or Node) so modern yt-dlp YouTube extraction works cleanly.
     *
     * @return list<string>
     */
    public static function getJsRuntimeArgs(): array
    {
        $home = self::getHomeDir();
        if (DIRECTORY_SEPARATOR === '\\') {
            if ($home !== null) {
                $denoLink = $home . '\\AppData\\Local\\Microsoft\\WinGet\\Links\\deno.exe';
                if (is_file($denoLink)) {
                    return ['--js-runtimes', 'deno:' . $denoLink];
                }
                $wingetBase = $home . '\\AppData\\Local\\Microsoft\\WinGet\\Packages';
                if (is_dir($wingetBase)) {
                    foreach (@scandir($wingetBase) ?: [] as $entry) {
                        if ($entry === '.' || $entry === '..' || stripos($entry, 'Deno') === false) {
                            continue;
                        }
                        $candidate = $wingetBase . '\\' . $entry . '\\deno.exe';
                        if (is_file($candidate)) {
                            return ['--js-runtimes', 'deno:' . $candidate];
                        }
                    }
                }
            }
            foreach (['C:\\Program Files\\nodejs\\node.exe', 'C:\\Program Files (x86)\\nodejs\\node.exe'] as $nodePath) {
                if (is_file($nodePath)) {
                    return ['--js-runtimes', 'node:' . $nodePath];
                }
            }
        } else {
            foreach (['/usr/local/bin/deno', '/usr/bin/deno'] as $denoPath) {
                if (is_file($denoPath)) {
                    return ['--js-runtimes', 'deno:' . $denoPath];
                }
            }
            foreach (['/usr/local/bin/node', '/usr/bin/node'] as $nodePath) {
                if (is_file($nodePath)) {
                    return ['--js-runtimes', 'node:' . $nodePath];
                }
            }
        }

        return [];
    }

    /**
     * Resolve cloudflared executable path if installed.
     */
    public static function getCloudflaredPath(): ?string
    {
        if (DIRECTORY_SEPARATOR === '\\') {
            $candidates = array_filter([
                (getenv('ProgramFiles(x86)') ?: 'C:\\Program Files (x86)') . '\\cloudflared\\cloudflared.exe',
                (getenv('ProgramFiles') ?: 'C:\\Program Files') . '\\cloudflared\\cloudflared.exe',
            ]);
            foreach ($candidates as $c) {
                if (is_file($c)) {
                    return $c;
                }
            }
            $which = @shell_exec('where cloudflared 2>NUL');
            if (is_string($which) && trim($which) !== '') {
                return trim(strtok($which, "\r\n") ?: '');
            }
            return null;
        }

        $which = @shell_exec('which cloudflared 2>/dev/null');
        return (is_string($which) && trim($which) !== '') ? trim($which) : null;
    }

    /**
     * Run an external command with an argument array using temp files to prevent Windows pipe deadlocks.
     *
     * @param list<string> $cmd
     * @return array{ok: bool, code: int, stdout: string, stderr: string}
     */
    public static function runCommand(array $cmd, int $timeoutSeconds = 90): array
    {
        if (!self::canProcOpen()) {
            return ['ok' => false, 'code' => -1, 'stdout' => '', 'stderr' => 'proc_open is disabled on this server'];
        }

        $token = bin2hex(random_bytes(6));
        $outFile = sys_get_temp_dir() . DIRECTORY_SEPARATOR . "wuntube_out_{$token}.tmp";
        $errFile = sys_get_temp_dir() . DIRECTORY_SEPARATOR . "wuntube_err_{$token}.tmp";

        $descriptors = [
            0 => ['pipe', 'r'],
            1 => ['file', $outFile, 'w'],
            2 => ['file', $errFile, 'w'],
        ];

        $proc = @proc_open($cmd, $descriptors, $pipes);
        if (!is_resource($proc)) {
            @unlink($outFile);
            @unlink($errFile);
            return ['ok' => false, 'code' => -1, 'stdout' => '', 'stderr' => 'Failed to start process'];
        }

        fclose($pipes[0]);

        $start = time();
        $timedOut = false;

        while (true) {
            $status = proc_get_status($proc);
            if (!$status['running']) {
                break;
            }
            if ($timeoutSeconds > 0 && (time() - $start) > $timeoutSeconds) {
                $timedOut = true;
                @proc_terminate($proc);
                break;
            }
            usleep(50000);
        }

        $code = proc_close($proc);
        $stdout = is_file($outFile) ? ((string) @file_get_contents($outFile)) : '';
        $stderr = is_file($errFile) ? ((string) @file_get_contents($errFile)) : '';

        @unlink($outFile);
        @unlink($errFile);

        if ($timedOut) {
            $stderr .= "\nProcess timed out";
        }

        return [
            'ok' => !$timedOut && $code === 0,
            'code' => $timedOut ? -1 : $code,
            'stdout' => $stdout,
            'stderr' => $stderr,
        ];
    }

    private static function getHomeDir(): ?string
    {
        $home = getenv('USERPROFILE') ?: getenv('HOME');
        if (is_string($home) && $home !== '') {
            return $home;
        }
        return null;
    }
}
