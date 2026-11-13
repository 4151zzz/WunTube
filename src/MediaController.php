<?php

declare(strict_types=1);

namespace WunTube;

use PDO;
use PDOException;

/**
 * Handles YouTube search, recommendations ("วิดีโอที่คุณอาจจะชอบ"), streaming, metadata, and MP3 downloads.
 */
final class MediaController
{
    /**
     * GET /api/search?q=...
     */
    public function search(): never
    {
        $query = trim((string) ($_GET['q'] ?? ''));
        if ($query === '') {
            Http::json(['error' => 'Missing query parameter "q"'], 400);
        }

        // Prefer pure-PHP InnerTube search (works on shared hosting without yt-dlp)
        $results = YouTubeClient::search($query, 35);
        if ($results !== []) {
            Http::json(['results' => $results]);
        }

        if (!BinaryFinder::isYtDlpAvailable()) {
            Http::json(['results' => []]);
        }

        @set_time_limit(0);

        $ytDlp = BinaryFinder::getYtDlpPath();
        $ffmpegDir = BinaryFinder::getFFmpegPath();

        $args = [
            $ytDlp,
            'ytsearch50:' . $query,
            '--dump-json',
            '--flat-playlist',
            '--no-warnings',
            '--quiet',
        ];
        if ($ffmpegDir !== null) {
            $args[] = '--ffmpeg-location';
            $args[] = $ffmpegDir;
        }

        $res = BinaryFinder::runCommand($args, 120);
        if (!$res['ok'] && trim($res['stdout']) === '') {
            error_log('yt-dlp search error: ' . $res['stderr']);
            Http::json(['error' => 'Search failed', 'details' => trim($res['stderr'])], 500);
        }

        $lines = preg_split('/\r?\n/', trim($res['stdout'])) ?: [];
        $ytDlpResults = [];

        foreach ($lines as $line) {
            $line = trim($line);
            if ($line === '') {
                continue;
            }
            $item = json_decode($line, true);
            if (!is_array($item) || empty($item['id'])) {
                continue;
            }

            $videoId = (string) $item['id'];
            $thumbnail = $item['thumbnail'] ?? null;
            if (!$thumbnail && !empty($item['thumbnails']) && is_array($item['thumbnails'])) {
                $lastThumb = end($item['thumbnails']);
                $thumbnail = is_array($lastThumb) ? ($lastThumb['url'] ?? null) : null;
            }
            if (!$thumbnail) {
                $thumbnail = "https://img.youtube.com/vi/{$videoId}/hqdefault.jpg";
            }

            $ytDlpResults[] = [
                'videoId' => $videoId,
                'title' => (string) ($item['title'] ?? 'Unknown Title'),
                'channel' => (string) ($item['channel'] ?? ($item['uploader'] ?? 'Unknown')),
                'duration' => (string) ($item['duration_string'] ?? Http::formatDuration($item['duration'] ?? null)),
                'thumbnail' => (string) $thumbnail,
                'url' => "https://www.youtube.com/watch?v={$videoId}",
            ];
        }

        Http::json(['results' => $ytDlpResults]);
    }

    /**
     * GET /api/recommendations?videoId=...&seeds=...&exclude=...
     * Returns YouTube-style diverse recommendations ("วิดีโอที่คุณอาจจะชอบ").
     */
    public function recommendations(?PDO $pdo, ?AuthController $auth): never
    {
        $videoId = trim((string) ($_GET['videoId'] ?? ''));
        $excludeRaw = trim((string) ($_GET['exclude'] ?? ''));
        $seedsRaw = trim((string) ($_GET['seeds'] ?? ''));

        $excludeIds = self::parseIdList($excludeRaw);
        $seeds = self::parseIdList($seedsRaw);

        if ($videoId !== '') {
            if (!preg_match('/^[a-zA-Z0-9_-]{1,64}$/', $videoId)) {
                Http::json(['error' => 'Invalid videoId'], 400);
            }
            $tracks = YouTubeClient::getRecommendations($videoId, $excludeIds, 24);
            Http::json([
                'recommendations' => $tracks,
                'source' => 'radio',
                'seedVideoId' => $videoId,
            ]);
        }

        // Enrich seed pool from authenticated play history when available
        $user = $auth?->tryAuthenticate();
        if ($user !== null && $pdo !== null) {
            try {
                $stmt = $pdo->prepare(
                    'SELECT video_id FROM play_history WHERE user_id = ? ORDER BY played_at DESC LIMIT 10'
                );
                $stmt->execute([(string) $user['uid']]);
                $dbSeeds = $stmt->fetchAll(PDO::FETCH_COLUMN);
                if (is_array($dbSeeds)) {
                    foreach ($dbSeeds as $sid) {
                        $seeds[] = (string) $sid;
                    }
                }
            } catch (PDOException) {
                // Non-fatal: continue with client seeds or cold-start discovery
            }
        }

        $feed = YouTubeClient::discover($seeds, $excludeIds, 20);
        Http::json($feed);
    }

    /**
     * GET /api/download?videoId=xxx&title=xxx
     * Streams MP3 directly to the browser.
     */
    public function download(): never
    {
        $videoId = trim((string) ($_GET['videoId'] ?? ''));
        if ($videoId === '') {
            Http::json(['error' => 'Missing videoId'], 400);
        }
        if (!preg_match('/^[a-zA-Z0-9_-]{1,64}$/', $videoId)) {
            Http::json(['error' => 'Invalid videoId'], 400);
        }

        if (!BinaryFinder::isYtDlpAvailable()) {
            Http::json([
                'error' => 'MP3 conversion requires yt-dlp and ffmpeg on the server.',
                'code' => 'YTDLP_UNAVAILABLE',
            ], 503);
        }

        @set_time_limit(0);
        @ignore_user_abort(false);

        $rawTitle = trim((string) ($_GET['title'] ?? $videoId));
        if ($rawTitle === '') {
            $rawTitle = $videoId;
        }

        $safeTitle = preg_replace('/[\\\\\/:*?"<>|]/u', '_', $rawTitle) ?? $videoId;
        $safeTitle = preg_replace('/_+/', '_', $safeTitle) ?? $safeTitle;
        $safeTitle = trim($safeTitle, '_');
        $safeTitle = mb_substr($safeTitle, 0, 100, 'UTF-8');
        if ($safeTitle === '') {
            $safeTitle = $videoId;
        }

        $encodedSafe = rawurlencode($safeTitle);
        $encodedTitle = rawurlencode(mb_substr($rawTitle, 0, 150, 'UTF-8')) . '.mp3';

        $ytDlp = BinaryFinder::getYtDlpPath();
        $ffmpegDir = BinaryFinder::getFFmpegPath();
        $url = "https://www.youtube.com/watch?v={$videoId}";

        $tmpDir = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'wuntube_dl_' . bin2hex(random_bytes(6));
        if (!@mkdir($tmpDir, 0700, true) && !is_dir($tmpDir)) {
            Http::json(['error' => 'Failed to create temporary directory for MP3 conversion'], 500);
        }

        $cleanup = static function () use ($tmpDir): void {
            if (!is_dir($tmpDir)) {
                return;
            }
            foreach (@scandir($tmpDir) ?: [] as $entry) {
                if ($entry === '.' || $entry === '..') {
                    continue;
                }
                @unlink($tmpDir . DIRECTORY_SEPARATOR . $entry);
            }
            @rmdir($tmpDir);
        };
        register_shutdown_function($cleanup);

        $outputTemplate = $tmpDir . DIRECTORY_SEPARATOR . 'track.%(ext)s';
        $args = array_merge([
            $ytDlp,
            $url,
            '-f', 'bestaudio/best',
            '-x',
            '--audio-format', 'mp3',
            '--audio-quality', '192K',
            '--no-playlist',
            '--no-warnings',
            '-o', $outputTemplate,
        ], BinaryFinder::getJsRuntimeArgs());

        if ($ffmpegDir !== null) {
            $args[] = '--ffmpeg-location';
            $args[] = $ffmpegDir;
        }

        $res = BinaryFinder::runCommand($args, 180);

        $targetFile = $tmpDir . DIRECTORY_SEPARATOR . 'track.mp3';
        $mimeType = 'audio/mpeg';
        $ext = 'mp3';

        if (!is_file($targetFile) || filesize($targetFile) === 0) {
            $targetFile = '';
            foreach (@scandir($tmpDir) ?: [] as $entry) {
                if ($entry === '.' || $entry === '..' || str_ends_with($entry, '.part') || str_ends_with($entry, '.ytdl')) {
                    continue;
                }
                $candidate = $tmpDir . DIRECTORY_SEPARATOR . $entry;
                if (is_file($candidate) && filesize($candidate) > 0) {
                    $targetFile = $candidate;
                    $foundExt = strtolower(pathinfo($candidate, PATHINFO_EXTENSION));
                    if ($foundExt === 'm4a') {
                        $mimeType = 'audio/mp4';
                        $ext = 'm4a';
                    } elseif ($foundExt === 'webm' || $foundExt === 'opus') {
                        $mimeType = 'audio/webm';
                        $ext = $foundExt;
                    }
                    break;
                }
            }
        }

        if ($targetFile === '') {
            $details = trim($res['stderr'] !== '' ? $res['stderr'] : $res['stdout']);
            $cleanup();
            error_log('[download] yt-dlp failed: ' . $details);
            Http::json(['error' => 'Download failed', 'details' => $details], 500);
        }

        while (ob_get_level() > 0) {
            ob_end_clean();
        }

        $encodedTitle = rawurlencode(mb_substr($rawTitle, 0, 150, 'UTF-8')) . '.' . $ext;
        $size = (int) filesize($targetFile);

        Http::sendCorsHeaders();
        header('Access-Control-Expose-Headers: Content-Disposition, Content-Length');
        header("Content-Disposition: attachment; filename=\"{$encodedSafe}.{$ext}\"; filename*=UTF-8''{$encodedTitle}");
        header('Content-Type: ' . $mimeType);
        header('Content-Length: ' . $size);
        header('Cache-Control: no-cache');

        $fp = fopen($targetFile, 'rb');
        if ($fp !== false) {
            while (!feof($fp) && !connection_aborted()) {
                echo fread($fp, 65536);
                flush();
            }
            fclose($fp);
        }

        $cleanup();
        exit;
    }

    /**
     * GET /api/stream?videoId=xxx
     * Redirects browser directly to the YouTube CDN audio stream URL.
     */
    public function stream(): never
    {
        $videoId = trim((string) ($_GET['videoId'] ?? ''));
        if ($videoId === '') {
            Http::json(['error' => 'Missing videoId'], 400);
        }
        if (!preg_match('/^[a-zA-Z0-9_-]{1,64}$/', $videoId)) {
            Http::json(['error' => 'Invalid videoId'], 400);
        }

        if (!BinaryFinder::isYtDlpAvailable()) {
            Http::json([
                'error' => 'yt-dlp is not available on this server',
                'code' => 'YTDLP_UNAVAILABLE',
            ], 503);
        }

        @set_time_limit(0);

        $ytDlp = BinaryFinder::getYtDlpPath();
        $args = array_merge([
            $ytDlp,
            "https://www.youtube.com/watch?v={$videoId}",
            '-f', 'bestaudio/best',
            '-g',
            '--no-warnings',
            '--no-playlist',
            '--no-check-formats',
        ], BinaryFinder::getJsRuntimeArgs());

        $res = BinaryFinder::runCommand($args, 60);
        $lines = preg_split('/\r?\n/', trim($res['stdout'])) ?: [];
        $directUrl = trim((string) ($lines[0] ?? ''));

        if (!$res['ok'] || $directUrl === '') {
            error_log('[stream] yt-dlp failed: ' . trim($res['stderr']));
            Http::json(['error' => 'Could not get audio URL', 'details' => trim($res['stderr'])], 500);
        }

        Http::sendCorsHeaders();
        header('Location: ' . $directUrl, true, 302);
        exit;
    }

    /**
     * GET /api/videoinfo?videoId=xxx
     */
    public function videoInfo(): never
    {
        $videoId = trim((string) ($_GET['videoId'] ?? ''));
        if ($videoId === '') {
            Http::json(['error' => 'Missing videoId'], 400);
        }
        if (!preg_match('/^[a-zA-Z0-9_-]{1,64}$/', $videoId)) {
            Http::json(['error' => 'Invalid videoId'], 400);
        }

        if (!BinaryFinder::isYtDlpAvailable()) {
            $info = YouTubeClient::getVideoInfo($videoId);
            if ($info === null) {
                Http::json(['error' => 'Failed to fetch video info'], 500);
            }
            Http::json($info);
        }

        @set_time_limit(0);

        $ytDlp = BinaryFinder::getYtDlpPath();
        $ffmpegDir = BinaryFinder::getFFmpegPath();
        $args = array_merge([
            $ytDlp,
            "https://www.youtube.com/watch?v={$videoId}",
            '--dump-json',
            '--no-warnings',
            '--quiet',
            '--no-playlist',
        ], BinaryFinder::getJsRuntimeArgs());
        if ($ffmpegDir !== null) {
            $args[] = '--ffmpeg-location';
            $args[] = $ffmpegDir;
        }

        $res = BinaryFinder::runCommand($args, 60);
        $info = json_decode(trim($res['stdout']), true);
        if (!is_array($info) || empty($info['id'])) {
            $fallback = YouTubeClient::getVideoInfo($videoId);
            if ($fallback !== null) {
                Http::json($fallback);
            }
            Http::json(['error' => 'Failed to parse video info'], 500);
        }

        $id = (string) $info['id'];
        Http::json([
            'videoId' => $id,
            'title' => (string) ($info['title'] ?? ''),
            'channel' => (string) ($info['channel'] ?? ($info['uploader'] ?? '')),
            'duration' => $info['duration'] ?? null,
            'thumbnail' => (string) ($info['thumbnail'] ?? "https://img.youtube.com/vi/{$id}/hqdefault.jpg"),
        ]);
    }

    /**
     * @return list<string>
     */
    private static function parseIdList(string $raw): array
    {
        if ($raw === '') {
            return [];
        }
        $parts = explode(',', $raw);
        $valid = [];
        foreach ($parts as $part) {
            $id = trim($part);
            if (preg_match('/^[a-zA-Z0-9_-]{11}$/', $id) === 1) {
                $valid[] = $id;
            }
        }
        return array_values(array_unique($valid));
    }
}
