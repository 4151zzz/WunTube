<?php

declare(strict_types=1);

/**
 * CLI runner to start WunTube PHP server with optional Cloudflare Tunnel sharing (`php share.php`).
 */

if (PHP_SAPI !== 'cli') {
    http_response_code(403);
    exit('CLI only');
}

require_once __DIR__ . '/src/BinaryFinder.php';
require_once __DIR__ . '/src/InfoController.php';

use WunTube\BinaryFinder;
use WunTube\InfoController;

$config = require __DIR__ . '/config.php';
$port = (int) $config['port'];
$storageDir = (string) $config['storage_dir'];
$tunnelStatePath = (string) $config['tunnel_state_path'];

if (!is_dir($storageDir)) {
    @mkdir($storageDir, 0775, true);
}
@unlink($tunnelStatePath);

echo "\n🎵 WunTube (PHP) running at http://localhost:{$port}\n\n";

$ips = InfoController::getLocalIPs();
if ($ips !== []) {
    echo "📱 เครื่องใน Wi-Fi เดียวกันเปิดได้ที่:\n";
    foreach ($ips as $ip) {
        echo "   http://{$ip}:{$port}\n";
    }
    echo "\n";
}

$phpCmd = [PHP_BINARY, '-S', "0.0.0.0:{$port}", '-t', __DIR__ . '/public', __DIR__ . '/router.php'];
$phpProc = proc_open($phpCmd, [0 => STDIN, 1 => STDOUT, 2 => STDERR], $phpPipes);
if (!is_resource($phpProc)) {
    fwrite(STDERR, "❌ ไม่สามารถเริ่ม PHP server ได้\n");
    exit(1);
}

$cloudflared = BinaryFinder::getCloudflaredPath();
$cfProc = null;
$cfPipes = [];

if ($cloudflared !== null) {
    echo "🌐 กำลังสร้าง public link ด้วย cloudflared...\n";
    $cfProc = @proc_open(
        [$cloudflared, 'tunnel', '--url', "http://127.0.0.1:{$port}"],
        [0 => ['pipe', 'r'], 1 => ['pipe', 'w'], 2 => ['pipe', 'w']],
        $cfPipes
    );
    if (is_resource($cfProc)) {
        fclose($cfPipes[0]);
        stream_set_blocking($cfPipes[1], false);
        stream_set_blocking($cfPipes[2], false);
    }
} else {
    echo "💡 ไม่พบ cloudflared — เปิดใช้งานได้ภายในเครื่องและ Wi-Fi เดียวกัน\n";
    echo "   (ติดตั้ง cloudflared เพื่อสร้างลิงก์แชร์ผ่านอินเทอร์เน็ต)\n\n";
}

$tunnelFound = false;

try {
    while (true) {
        $phpStatus = proc_get_status($phpProc);
        if (!$phpStatus['running']) {
            break;
        }

        if (is_resource($cfProc)) {
            foreach ([$cfPipes[1], $cfPipes[2]] as $stream) {
                if (feof($stream)) {
                    continue;
                }
                $chunk = fread($stream, 8192);
                if (is_string($chunk) && $chunk !== '' && !$tunnelFound) {
                    if (preg_match('/https:\/\/[a-z0-9-]+\.trycloudflare\.com/i', $chunk, $m)) {
                        $tunnelFound = true;
                        $publicUrl = $m[0];
                        file_put_contents($tunnelStatePath, json_encode([
                            'publicUrl' => $publicUrl,
                            'tunnelPassword' => null,
                            'updatedAt' => date('c'),
                        ], JSON_UNESCAPED_SLASHES));
                        echo "\n🔗 แชร์ลิงก์นี้ให้เพื่อน: {$publicUrl}\n\n";
                    }
                }
            }
        }

        usleep(200000);
    }
} finally {
    @unlink($tunnelStatePath);
    if (is_resource($cfProc)) {
        @proc_terminate($cfProc);
        @proc_close($cfProc);
    }
    if (is_resource($phpProc)) {
        @proc_terminate($phpProc);
        @proc_close($phpProc);
    }
}

