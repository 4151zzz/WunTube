<?php

declare(strict_types=1);

namespace WunTube;

/**
 * Pure-PHP YouTube InnerTube client for search, radio/related recommendations, and metadata.
 * Works on standard shared hosting without requiring yt-dlp or proc_open.
 */
final class YouTubeClient
{
    private const INNERTUBE_BASE = 'https://www.youtube.com/youtubei/v1/';

    private const CLIENT_CONTEXT = [
        'client' => [
            'clientName' => 'WEB',
            'clientVersion' => '2.20240726.00.00',
            'hl' => 'th',
            'gl' => 'TH',
        ],
    ];

    /**
     * Search YouTube videos directly via InnerTube.
     *
     * @return list<array<string, string>>
     */
    public static function search(string $query, int $limit = 30): array
    {
        $data = self::post('search', ['query' => $query]);
        if ($data === null) {
            return [];
        }

        $sections = $data['contents']['twoColumnSearchResultsRenderer']['primaryContents']['sectionListRenderer']['contents'] ?? [];
        $results = [];
        $seen = [];

        foreach ($sections as $section) {
            $items = $section['itemSectionRenderer']['contents'] ?? [];
            foreach ($items as $item) {
                $track = self::parseTrackItem($item);
                if ($track === null || isset($seen[$track['videoId']])) {
                    continue;
                }
                $seen[$track['videoId']] = true;
                $results[] = $track;
                if (count($results) >= $limit) {
                    return $results;
                }
            }
        }

        return $results;
    }

    /**
     * Fetch YouTube Radio Mix + Related ("วิดีโอที่คุณอาจจะชอบ") for a given videoId,
     * diversified across channels so playback doesn't stick to a single artist.
     *
     * @param list<string> $excludeIds
     * @return list<array<string, string>>
     */
    public static function getRecommendations(string $seedVideoId, array $excludeIds = [], int $limit = 24): array
    {
        if (!self::isValidVideoId($seedVideoId)) {
            return [];
        }

        $data = self::post('next', [
            'videoId' => $seedVideoId,
            'playlistId' => 'RD' . $seedVideoId,
        ]);
        if ($data === null) {
            return [];
        }

        $excluded = array_flip(array_merge([$seedVideoId], $excludeIds));
        $seen = [];
        $radioTracks = [];
        $relatedTracks = [];

        $playlistItems = $data['contents']['twoColumnWatchNextResults']['playlist']['playlist']['contents'] ?? [];
        foreach ($playlistItems as $item) {
            if (!isset($item['playlistPanelVideoRenderer'])) {
                continue;
            }
            $track = self::parseVideoRenderer($item['playlistPanelVideoRenderer']);
            if ($track === null || isset($excluded[$track['videoId']]) || isset($seen[$track['videoId']])) {
                continue;
            }
            $seen[$track['videoId']] = true;
            $radioTracks[] = $track;
        }

        $secondaryItems = $data['contents']['twoColumnWatchNextResults']['secondaryResults']['secondaryResults']['results'] ?? [];
        foreach ($secondaryItems as $item) {
            $track = self::parseTrackItem($item);
            if ($track === null || isset($excluded[$track['videoId']]) || isset($seen[$track['videoId']])) {
                continue;
            }
            $seen[$track['videoId']] = true;
            $relatedTracks[] = $track;
        }

        // Prioritize music radio mix first, then related videos, diversified by channel
        $combined = array_merge(
            self::diversifyByChannel($radioTracks),
            self::diversifyByChannel($relatedTracks)
        );

        return array_slice($combined, 0, $limit);
    }

    /**
     * Build a personalized or discovery "Videos you might like" feed from seed videoIds.
     *
     * @param list<string> $seedVideoIds
     * @param list<string> $excludeIds
     * @return array{recommendations: list<array<string, string>>, source: string, seedVideoId: ?string}
     */
    public static function discover(array $seedVideoIds = [], array $excludeIds = [], int $limit = 20): array
    {
        $validSeeds = array_values(array_unique(array_filter($seedVideoIds, self::isValidVideoId(...))));
        $excluded = array_flip(array_merge($validSeeds, $excludeIds));

        if ($validSeeds !== []) {
            // Blend latest seed and another seed from recent listening history for variety
            $chosenSeeds = [$validSeeds[0]];
            if (count($validSeeds) > 1) {
                $otherPool = array_slice($validSeeds, 1, 5);
                $chosenSeeds[] = $otherPool[array_rand($otherPool)];
            }

            $batches = [];
            foreach ($chosenSeeds as $seed) {
                $batches[] = self::getRecommendations($seed, array_keys($excluded), $limit);
            }

            $merged = [];
            $seen = [];
            $maxLen = max(array_map('count', $batches));
            for ($i = 0; $i < $maxLen; $i++) {
                foreach ($batches as $batch) {
                    if (!isset($batch[$i])) {
                        continue;
                    }
                    $track = $batch[$i];
                    if (isset($seen[$track['videoId']])) {
                        continue;
                    }
                    $seen[$track['videoId']] = true;
                    $merged[] = $track;
                }
            }

            if ($merged !== []) {
                return [
                    'recommendations' => array_slice(self::diversifyByChannel($merged), 0, $limit),
                    'source' => 'personalized',
                    'seedVideoId' => $chosenSeeds[0],
                ];
            }
        }

        // Cold-start discovery queries for new visitors
        $queries = [
            'เพลงไทย ฮิตติดชาร์ต ล่าสุด',
            'เพลงสากล เพราะๆ ยอดนิยม',
            'เพลงอินดี้ ฟังสบาย chill mix',
            'รวมเพลงฮิต TikTok ล่าสุด',
        ];
        $query = $queries[array_rand($queries)];
        $found = self::search($query, $limit + 10);
        $filtered = [];
        foreach ($found as $track) {
            if (!isset($excluded[$track['videoId']])) {
                $filtered[] = $track;
            }
        }

        $diversified = self::diversifyByChannel($filtered);
        shuffle($diversified);

        return [
            'recommendations' => array_slice(self::diversifyByChannel($diversified), 0, $limit),
            'source' => 'discover',
            'seedVideoId' => null,
        ];
    }

    /**
     * Fetch basic video metadata without yt-dlp (via YouTube oEmbed).
     *
     * @return array<string, mixed>|null
     */
    public static function getVideoInfo(string $videoId): ?array
    {
        if (!self::isValidVideoId($videoId)) {
            return null;
        }

        $oembedUrl = 'https://www.youtube.com/oembed?url=' . rawurlencode("https://www.youtube.com/watch?v={$videoId}") . '&format=json';
        $info = HttpClient::getJson($oembedUrl);
        if ($info === null || empty($info['title'])) {
            return null;
        }

        return [
            'videoId' => $videoId,
            'title' => (string) $info['title'],
            'channel' => (string) ($info['author_name'] ?? 'Unknown'),
            'duration' => null,
            'thumbnail' => (string) ($info['thumbnail_url'] ?? "https://img.youtube.com/vi/{$videoId}/hqdefault.jpg"),
        ];
    }

    /**
     * Interleave tracks across channels so consecutive songs do not repeat the same artist/channel.
     *
     * @param list<array<string, string>> $tracks
     * @return list<array<string, string>>
     */
    public static function diversifyByChannel(array $tracks): array
    {
        if (count($tracks) <= 2) {
            return $tracks;
        }

        $buckets = [];
        foreach ($tracks as $track) {
            $chKey = mb_strtolower(trim($track['channel'] ?: 'unknown'), 'UTF-8');
            $buckets[$chKey][] = $track;
        }

        $ordered = [];
        while ($buckets !== []) {
            foreach (array_keys($buckets) as $chKey) {
                $ordered[] = array_shift($buckets[$chKey]);
                if ($buckets[$chKey] === []) {
                    unset($buckets[$chKey]);
                }
            }
        }

        return $ordered;
    }

    /**
     * @param array<string, mixed> $payload
     * @return array<string, mixed>|null
     */
    private static function post(string $endpoint, array $payload): ?array
    {
        return HttpClient::postJson(
            self::INNERTUBE_BASE . $endpoint . '?prettyPrint=false',
            array_merge(['context' => self::CLIENT_CONTEXT], $payload)
        );
    }

    /**
     * @param array<string, mixed> $item
     * @return array<string, string>|null
     */
    private static function parseTrackItem(array $item): ?array
    {
        if (isset($item['videoRenderer'])) {
            return self::parseVideoRenderer($item['videoRenderer']);
        }
        if (isset($item['compactVideoRenderer'])) {
            return self::parseVideoRenderer($item['compactVideoRenderer']);
        }
        if (isset($item['lockupViewModel'])) {
            return self::parseLockupViewModel($item['lockupViewModel']);
        }
        return null;
    }

    /**
     * @param array<string, mixed> $v
     * @return array<string, string>|null
     */
    private static function parseVideoRenderer(array $v): ?array
    {
        $videoId = (string) ($v['videoId'] ?? '');
        if (!self::isValidVideoId($videoId)) {
            return null;
        }

        $title = self::extractRunsText($v['title'] ?? []);
        if ($title === '') {
            return null;
        }

        $channel = self::extractRunsText($v['ownerText'] ?? ($v['longBylineText'] ?? ($v['shortBylineText'] ?? [])));
        $duration = self::extractRunsText($v['lengthText'] ?? []);

        $thumb = '';
        $thumbs = $v['thumbnail']['thumbnails'] ?? [];
        if (is_array($thumbs) && $thumbs !== []) {
            $last = end($thumbs);
            if (is_array($last) && !empty($last['url'])) {
                $thumb = (string) $last['url'];
            }
        }

        return [
            'videoId' => $videoId,
            'title' => $title,
            'channel' => $channel !== '' ? $channel : 'Unknown',
            'duration' => $duration !== '' ? $duration : 'N/A',
            'thumbnail' => $thumb !== '' ? $thumb : "https://img.youtube.com/vi/{$videoId}/hqdefault.jpg",
            'url' => "https://www.youtube.com/watch?v={$videoId}",
        ];
    }

    /**
     * @param array<string, mixed> $lockup
     * @return array<string, string>|null
     */
    private static function parseLockupViewModel(array $lockup): ?array
    {
        $videoId = (string) ($lockup['contentId'] ?? '');
        $contentType = (string) ($lockup['contentType'] ?? '');
        if (!self::isValidVideoId($videoId) || ($contentType !== '' && $contentType !== 'LOCKUP_CONTENT_TYPE_VIDEO')) {
            return null;
        }

        $meta = $lockup['metadata']['lockupMetadataViewModel'] ?? [];
        $title = trim((string) ($meta['title']['content'] ?? ''));
        if ($title === '') {
            return null;
        }

        $rows = $meta['metadata']['contentMetadataViewModel']['metadataRows'] ?? [];
        $channel = trim((string) ($rows[0]['metadataParts'][0]['text']['content'] ?? ''));

        $duration = '';
        $overlays = $lockup['contentImage']['thumbnailViewModel']['overlays'] ?? [];
        foreach ($overlays as $overlay) {
            $badges = $overlay['thumbnailBottomOverlayViewModel']['badges'] ?? [];
            foreach ($badges as $badge) {
                $text = trim((string) ($badge['thumbnailBadgeViewModel']['text'] ?? ''));
                if ($text !== '' && preg_match('/^\d+(:\d{2})+$/', $text)) {
                    $duration = $text;
                    break 2;
                }
            }
        }

        $thumb = '';
        $sources = $lockup['contentImage']['thumbnailViewModel']['image']['sources'] ?? [];
        if (is_array($sources) && $sources !== []) {
            $last = end($sources);
            if (is_array($last) && !empty($last['url'])) {
                $thumb = (string) $last['url'];
            }
        }

        return [
            'videoId' => $videoId,
            'title' => $title,
            'channel' => $channel !== '' ? $channel : 'Unknown',
            'duration' => $duration !== '' ? $duration : 'N/A',
            'thumbnail' => $thumb !== '' ? $thumb : "https://img.youtube.com/vi/{$videoId}/hqdefault.jpg",
            'url' => "https://www.youtube.com/watch?v={$videoId}",
        ];
    }

    /**
     * @param array<string, mixed>|string $node
     */
    private static function extractRunsText(array|string $node): string
    {
        if (is_string($node)) {
            return trim($node);
        }
        if (isset($node['simpleText'])) {
            return trim((string) $node['simpleText']);
        }
        if (isset($node['content'])) {
            return trim((string) $node['content']);
        }
        if (!empty($node['runs']) && is_array($node['runs'])) {
            $parts = [];
            foreach ($node['runs'] as $run) {
                if (is_array($run) && isset($run['text'])) {
                    $parts[] = (string) $run['text'];
                }
            }
            return trim(implode('', $parts));
        }
        return '';
    }

    private static function isValidVideoId(string $videoId): bool
    {
        return preg_match('/^[a-zA-Z0-9_-]{11}$/', $videoId) === 1;
    }
}

