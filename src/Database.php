<?php

declare(strict_types=1);

namespace WunTube;

use PDO;

/**
 * SQLite database connection factory and schema initializer.
 */
final class Database
{
    private static ?PDO $connection = null;

    /**
     * Get or initialize the shared SQLite PDO connection.
     */
    public static function getConnection(string $dbPath): PDO
    {
        if (self::$connection !== null) {
            return self::$connection;
        }

        $pdo = new PDO('sqlite:' . $dbPath, null, null, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]);

        // Avoid SQLITE_BUSY under concurrent requests on Apache/XAMPP
        $pdo->exec('PRAGMA busy_timeout = 5000;');
        if (!is_file($dbPath) || is_writable($dbPath)) {
            self::ensureSchema($pdo);
        }

        self::$connection = $pdo;
        return self::$connection;
    }

    /**
     * Create required tables if they do not already exist.
     */
    private static function ensureSchema(PDO $pdo): void
    {
        $pdo->exec(
            'CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE,
                password TEXT,
                name TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )'
        );

        $pdo->exec(
            'CREATE TABLE IF NOT EXISTS play_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT,
                video_id TEXT,
                title TEXT,
                channel TEXT,
                played_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )'
        );
    }
}

