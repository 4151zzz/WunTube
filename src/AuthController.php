<?php

declare(strict_types=1);

namespace WunTube;

use PDO;
use PDOException;

/**
 * Handles user registration, login, and bearer token authentication.
 */
final class AuthController
{
    public function __construct(
        private readonly PDO $pdo,
        private readonly string $jwtSecret,
        private readonly ?string $firebaseProjectId,
        private readonly bool $useFirebaseMock
    ) {
    }

    /**
     * POST /api/register
     */
    public function register(): never
    {
        $body = Http::getJsonBody();
        $email = trim((string) ($body['email'] ?? ''));
        $password = (string) ($body['password'] ?? '');
        $name = trim((string) ($body['name'] ?? ''));

        if ($email === '' || $password === '') {
            Http::json(['error' => 'Missing email or password'], 400);
        }

        if ($name === '') {
            $parts = explode('@', $email, 2);
            $name = $parts[0];
        }

        $hash = password_hash($password, PASSWORD_BCRYPT, ['cost' => 10]);

        try {
            $stmt = $this->pdo->prepare('INSERT INTO users (email, password, name) VALUES (?, ?, ?)');
            $stmt->execute([$email, $hash, $name]);
            Http::json(['success' => true, 'message' => 'Registered successfully']);
        } catch (PDOException $e) {
            if (str_contains($e->getMessage(), 'UNIQUE') || $e->getCode() === '23000') {
                Http::json(['error' => 'Email already exists'], 400);
            }
            if (stripos($e->getMessage(), 'readonly') !== false) {
                Http::json(['error' => 'Database is read-only (set write permission on users.db)'], 500);
            }
            Http::json(['error' => 'Database error'], 500);
        }
    }

    /**
     * POST /api/login
     */
    public function login(): never
    {
        $body = Http::getJsonBody();
        $email = trim((string) ($body['email'] ?? ''));
        $password = (string) ($body['password'] ?? '');

        if ($email === '' || $password === '') {
            Http::json(['error' => 'Missing email or password'], 400);
        }

        try {
            $stmt = $this->pdo->prepare('SELECT * FROM users WHERE email = ? LIMIT 1');
            $stmt->execute([$email]);
            $user = $stmt->fetch();
        } catch (PDOException) {
            Http::json(['error' => 'Database error'], 500);
        }

        if (!$user || !password_verify($password, (string) $user['password'])) {
            Http::json(['error' => 'Invalid email or password'], 401);
        }

        $userId = (int) $user['id'];
        $token = Jwt::signHs256([
            'id' => $userId,
            'email' => $user['email'],
            'name' => $user['name'],
        ], $this->jwtSecret);

        Http::json([
            'success' => true,
            'token' => $token,
            'user' => [
                'id' => $userId,
                'email' => $user['email'],
                'name' => $user['name'],
            ],
        ]);
    }

    /**
     * GET /api/me
     */
    public function me(): never
    {
        $user = $this->resolveUser(Http::getBearerToken(), 'No token provided');
        Http::json(['user' => $user]);
    }

    /**
     * Require a valid bearer token and return the authenticated user payload.
     *
     * @return array<string, mixed>
     */
    public function authenticate(): array
    {
        return $this->resolveUser(Http::getBearerToken(), 'Unauthorized');
    }

    /**
     * Attempt to resolve the current user without failing on missing/invalid tokens.
     *
     * @return array<string, mixed>|null
     */
    public function tryAuthenticate(): ?array
    {
        $token = Http::getBearerToken();
        if ($token === null || $token === '') {
            return null;
        }
        return $this->parseUserToken($token);
    }

    /**
     * @return array<string, mixed>
     */
    private function resolveUser(?string $token, string $missingMessage): array
    {
        if ($token === null || $token === '') {
            Http::json(['error' => $missingMessage], 401);
        }

        $user = $this->parseUserToken($token);
        if ($user === null) {
            Http::json(['error' => 'Invalid token'], 401);
        }

        return $user;
    }

    /**
     * @return array<string, mixed>|null
     */
    private function parseUserToken(string $token): ?array
    {
        if ($token === 'mock_firebase_token') {
            return ['uid' => 'mock_uid', 'email' => 'mock@gmail.com', 'name' => 'Mock User'];
        }

        // Verify local HS256 JWT tokens before Firebase fallback so real SQLite users keep distinct uids
        $decodedJwt = Jwt::verifyHs256($token, $this->jwtSecret);
        if ($decodedJwt !== null && isset($decodedJwt['id'])) {
            return array_merge(['uid' => (string) $decodedJwt['id']], $decodedJwt);
        }

        if ($this->useFirebaseMock) {
            return ['uid' => 'mock_uid', 'email' => 'mock@gmail.com', 'name' => 'Mock User'];
        }

        if ($this->firebaseProjectId !== null) {
            $fbClaims = Jwt::verifyFirebaseIdToken($token, $this->firebaseProjectId);
            if ($fbClaims !== null) {
                $email = (string) ($fbClaims['email'] ?? '');
                $name = (string) ($fbClaims['name'] ?? $email);
                return [
                    'uid' => (string) $fbClaims['sub'],
                    'email' => $email,
                    'name' => $name,
                ];
            }
        }

        return null;
    }
}

