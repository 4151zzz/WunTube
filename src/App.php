<?php

declare(strict_types=1);

namespace WunTube;

require_once __DIR__ . '/Database.php';
require_once __DIR__ . '/HttpClient.php';
require_once __DIR__ . '/YouTubeClient.php';
require_once __DIR__ . '/Jwt.php';
require_once __DIR__ . '/Http.php';
require_once __DIR__ . '/BinaryFinder.php';
require_once __DIR__ . '/AuthController.php';
require_once __DIR__ . '/HistoryController.php';
require_once __DIR__ . '/MediaController.php';
require_once __DIR__ . '/InfoController.php';

/**
 * Main application front controller and HTTP router.
 */
final class App
{
    /**
     * Handle the incoming HTTP request.
     *
     * @param bool $rootEntry True when invoked from root index.php, false from public/index.php or router.php.
     */
    public static function run(bool $rootEntry): void
    {
        $config = require dirname(__DIR__) . '/config.php';
        $ctx = self::resolveContext($rootEntry);
        $routePath = $ctx['routePath'];
        $method = strtoupper((string) ($_SERVER['REQUEST_METHOD'] ?? 'GET'));

        if (str_starts_with($routePath, '/api/')) {
            if ($method === 'OPTIONS') {
                Http::sendCorsHeaders();
                http_response_code(204);
                exit;
            }
            self::dispatchApi($routePath, $method, $config, $ctx['basePath']);
            return;
        }

        self::renderView($config['public_dir'] . '/index.php', $ctx);
    }

    /**
     * @param array<string, mixed> $config
     */
    private static function dispatchApi(string $routePath, string $method, array $config, string $basePath): never
    {
        $firebaseConfig = self::loadFirebaseConfig((string) $config['firebase_service_account_path']);
        $useFirebaseMock = $firebaseConfig['mock'];
        $firebaseProjectId = $firebaseConfig['projectId'];

        $getPdo = static fn (): \PDO => Database::getConnection((string) $config['db_path']);
        $media = new MediaController();
        $info = new InfoController();

        $makeAuth = static fn (): AuthController => new AuthController(
            $getPdo(),
            (string) $config['jwt_secret'],
            $firebaseProjectId,
            $useFirebaseMock
        );

        $tryGetPdo = static function () use ($getPdo): ?\PDO {
            try {
                return $getPdo();
            } catch (\Throwable) {
                return null;
            }
        };

        $tryMakeAuth = static function () use ($tryGetPdo, $config, $firebaseProjectId, $useFirebaseMock): ?AuthController {
            $pdo = $tryGetPdo();
            if ($pdo === null) {
                return null;
            }
            return new AuthController($pdo, (string) $config['jwt_secret'], $firebaseProjectId, $useFirebaseMock);
        };

        match ([$method, $routePath]) {
            ['POST', '/api/register'] => $makeAuth()->register(),
            ['POST', '/api/login'] => $makeAuth()->login(),
            ['GET', '/api/me'] => $makeAuth()->me(),
            ['POST', '/api/history'] => (new HistoryController($getPdo(), $makeAuth()))->record(),
            ['GET', '/api/top-favorites'] => (new HistoryController($getPdo(), $makeAuth()))->topFavorites(),
            ['GET', '/api/search'] => $media->search(),
            ['GET', '/api/recommendations'] => $media->recommendations($tryGetPdo(), $tryMakeAuth()),
            ['GET', '/api/download'] => $media->download(),
            ['GET', '/api/stream'] => $media->stream(),
            ['GET', '/api/videoinfo'] => $media->videoInfo(),
            ['GET', '/api/info'] => $info->info(
                (int) $config['port'],
                (string) $config['tunnel_state_path'],
                $basePath
            ),
            default => Http::json(['error' => 'Not found'], 404),
        };
    }

    /**
     * @param array{basePath: string, assetBase: string, apiBase: string, routePath: string} $ctx
     */
    private static function renderView(string $viewFile, array $ctx): void
    {
        if (!defined('WUNTUBE_RENDER_VIEW')) {
            define('WUNTUBE_RENDER_VIEW', true);
        }

        $basePath = $ctx['basePath'];
        $assetBase = $ctx['assetBase'];
        $apiBase = $ctx['apiBase'];

        header('Content-Type: text/html; charset=utf-8');
        require $viewFile;
    }

    /**
     * Resolve basePath, assetBase, apiBase, and normalized routePath across all deployment modes.
     *
     * @return array{basePath: string, assetBase: string, apiBase: string, routePath: string}
     */
    private static function resolveContext(bool $rootEntry): array
    {
        $uriPath = (string) (parse_url((string) ($_SERVER['REQUEST_URI'] ?? '/'), PHP_URL_PATH) ?: '/');

        if (PHP_SAPI === 'cli-server') {
            $basePath = '';
            $assetBase = '';
            $apiBase = '/api';
            $routePath = $uriPath;
        } else {
            $scriptName = str_replace('\\', '/', (string) ($_SERVER['SCRIPT_NAME'] ?? '/index.php'));
            $scriptDir = rtrim(str_replace('\\', '/', dirname($scriptName)), '/');
            $basePath = ($scriptDir === '' || $scriptDir === '.') ? '' : $scriptDir;

            $assetBase = $rootEntry ? $basePath . '/public' : $basePath;
            $apiBase = $basePath . '/api';

            if ($basePath !== '' && str_starts_with($uriPath, $basePath)) {
                $routePath = substr($uriPath, strlen($basePath)) ?: '/';
            } else {
                $routePath = $uriPath;
            }
        }

        if ($routePath === '/index.php') {
            $routePath = '/';
        } elseif (str_starts_with($routePath, '/index.php/')) {
            $routePath = substr($routePath, strlen('/index.php'));
        }

        if ($routePath === '/' && isset($_GET['route']) && is_string($_GET['route'])) {
            $routePath = '/' . ltrim($_GET['route'], '/');
        }

        return [
            'basePath' => $basePath,
            'assetBase' => $assetBase,
            'apiBase' => $apiBase,
            'routePath' => $routePath,
        ];
    }

    /**
     * @return array{mock: bool, projectId: ?string}
     */
    private static function loadFirebaseConfig(string $serviceAccountPath): array
    {
        if (!is_file($serviceAccountPath) || !is_readable($serviceAccountPath)) {
            return ['mock' => true, 'projectId' => null];
        }

        $decoded = json_decode((string) file_get_contents($serviceAccountPath), true);
        if (!is_array($decoded) || empty($decoded['project_id'])) {
            error_log('Failed to parse firebase-service-account.json; falling back to Mock Firebase mode.');
            return ['mock' => true, 'projectId' => null];
        }

        return ['mock' => false, 'projectId' => (string) $decoded['project_id']];
    }
}
