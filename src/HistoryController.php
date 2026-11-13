<?php

declare(strict_types=1);

namespace WunTube;

use PDO;
use PDOException;

/**
 * Handles user playback history recording and top favorites retrieval.
 */
final class HistoryController
{
    public function __construct(
        private readonly PDO $pdo,
        private readonly AuthController $auth
    ) {
    }

    /**
     * POST /api/history
     */
    public function record(): never
    {
        $user = $this->auth->authenticate();
        $body = Http::getJsonBody();

        $videoId = trim((string) ($body['videoId'] ?? ''));
        $title = (string) ($body['title'] ?? '');
        $channel = (string) ($body['channel'] ?? '');

        if ($videoId === '') {
            Http::json(['error' => 'Missing videoId'], 400);
        }

        try {
            $stmt = $this->pdo->prepare(
                'INSERT INTO play_history (user_id, video_id, title, channel) VALUES (?, ?, ?, ?)'
            );
            $stmt->execute([(string) $user['uid'], $videoId, $title, $channel]);
            Http::json(['success' => true]);
        } catch (PDOException) {
            Http::json(['error' => 'Database error'], 500);
        }
    }

    /**
     * GET /api/top-favorites
     */
    public function topFavorites(): never
    {
        $user = $this->auth->authenticate();

        try {
            $stmt = $this->pdo->prepare(
                'SELECT video_id AS videoId, title, channel, COUNT(*) AS playCount
                 FROM play_history
                 WHERE user_id = ?
                 GROUP BY video_id
                 ORDER BY playCount DESC, MAX(played_at) DESC
                 LIMIT 20'
            );
            $stmt->execute([(string) $user['uid']]);
            $rows = $stmt->fetchAll();

            foreach ($rows as &$row) {
                $row['playCount'] = (int) $row['playCount'];
            }
            unset($row);

            Http::json(['favorites' => $rows]);
        } catch (PDOException) {
            Http::json(['error' => 'Database error'], 500);
        }
    }
}

