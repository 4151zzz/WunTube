const express = require('express');
const cors = require('cors');
const path = require('path');
const { execFile, spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const admin = require('firebase-admin');

const JWT_SECRET = process.env.JWT_SECRET || 'wuntube-super-secret-key';

let useFirebaseMock = true;
const serviceAccountPath = path.join(__dirname, 'firebase-service-account.json');
if (fs.existsSync(serviceAccountPath)) {
  try {
    const serviceAccount = require(serviceAccountPath);
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    useFirebaseMock = false;
    console.log('Firebase Admin SDK initialized successfully.');
  } catch (err) {
    console.error('Failed to initialize Firebase Admin:', err);
  }
} else {
  console.log('firebase-service-account.json not found. Using Mock Firebase mode.');
}

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';
let publicUrl = null;
let tunnelPassword = null;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ────────────────────────────────────────────────────────────
// Database Setup (SQLite)
// ────────────────────────────────────────────────────────────
const dbPath = path.join(__dirname, 'users.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error('Error opening database', err.message);
  else {
    db.serialize(() => {
      db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE,
        password TEXT,
        name TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);
      db.run(`CREATE TABLE IF NOT EXISTS play_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT,
        video_id TEXT,
        title TEXT,
        channel TEXT,
        played_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);
    });
  }
});

// ────────────────────────────────────────────────────────────
// Helper: find yt-dlp binary (resolves WinGet install path)
// ────────────────────────────────────────────────────────────
function getYtDlpPath() {
  // Try WinGet packages directory first (common after winget install in same session)
  const wingetBase = path.join(os.homedir(), 'AppData', 'Local', 'Microsoft', 'WinGet', 'Packages');
  try {
    if (fs.existsSync(wingetBase)) {
      const entries = fs.readdirSync(wingetBase);
      for (const entry of entries) {
        if (entry.toLowerCase().includes('yt-dlp')) {
          const candidate = path.join(wingetBase, entry, 'yt-dlp.exe');
          if (fs.existsSync(candidate)) return candidate;
        }
      }
    }
  } catch (e) { /* fallback */ }

  // Fallback candidates
  const fallbacks = [
    path.join(os.homedir(), 'AppData', 'Local', 'Programs', 'yt-dlp', 'yt-dlp.exe'),
    'C:\\Windows\\System32\\yt-dlp.exe',
    'yt-dlp', // via PATH
  ];
  for (const fb of fallbacks) {
    try { if (fb === 'yt-dlp' || fs.existsSync(fb)) return fb; } catch (e) { /* skip */ }
  }
  return 'yt-dlp';
}

// ────────────────────────────────────────────────────────────
// Helper: find ffmpeg binary (resolves WinGet install path)
// ────────────────────────────────────────────────────────────
function getFFmpegPath() {
  const wingetBase = path.join(os.homedir(), 'AppData', 'Local', 'Microsoft', 'WinGet', 'Packages');
  try {
    if (fs.existsSync(wingetBase)) {
      const entries = fs.readdirSync(wingetBase);
      for (const entry of entries) {
        if (entry.toLowerCase().includes('ffmpeg')) {
          // Search recursively for ffmpeg.exe inside bin/
          const binDir = path.join(wingetBase, entry);
          const sub = fs.readdirSync(binDir);
          for (const s of sub) {
            const candidate = path.join(binDir, s, 'bin', 'ffmpeg.exe');
            if (fs.existsSync(candidate)) return path.dirname(candidate);
          }
        }
      }
    }
  } catch (e) { /* fallback */ }
  return null; // let yt-dlp find it via PATH
}

// ────────────────────────────────────────────────────────────
// Auth APIs
// ────────────────────────────────────────────────────────────
app.post('/api/register', (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing email or password' });

  bcrypt.hash(password, 10, (err, hash) => {
    if (err) return res.status(500).json({ error: 'Server error' });
    db.run(`INSERT INTO users (email, password, name) VALUES (?, ?, ?)`, [email, hash, name || email.split('@')[0]], function (err) {
      if (err) {
        if (err.message.includes('UNIQUE')) return res.status(400).json({ error: 'Email already exists' });
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ success: true, message: 'Registered successfully' });
    });
  });
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing email or password' });

  db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, user) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });

    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) return res.status(500).json({ error: 'Server error' });
      if (!isMatch) return res.status(401).json({ error: 'Invalid email or password' });

      const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
      res.json({ success: true, token, user: { id: user.id, email: user.email, name: user.name } });
    });
  });
});

app.get('/api/me', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  if (useFirebaseMock || token === 'mock_firebase_token') {
    return res.json({ user: { uid: 'mock_uid', email: 'mock@gmail.com', name: 'Mock User' } });
  }

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    res.json({ user: { uid: decoded.uid, email: decoded.email, name: decoded.name || decoded.email } });
  } catch (err) {
    jwt.verify(token, JWT_SECRET, (err2, decoded2) => {
      if (err2) return res.status(401).json({ error: 'Invalid token' });
      res.json({ user: { uid: decoded2.id, ...decoded2 } });
    });
  }
});

// Middleware to authenticate
async function authenticate(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  
  if (useFirebaseMock || token === 'mock_firebase_token') {
    req.user = { uid: 'mock_uid', email: 'mock@gmail.com', name: 'Mock User' };
    return next();
  }

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = { uid: decoded.uid, email: decoded.email, name: decoded.name || decoded.email };
    next();
  } catch (err) {
    jwt.verify(token, JWT_SECRET, (err2, decoded2) => {
      if (err2) return res.status(401).json({ error: 'Invalid token' });
      req.user = { uid: decoded2.id, ...decoded2 };
      next();
    });
  }
}

app.post('/api/history', authenticate, (req, res) => {
  const { videoId, title, channel } = req.body;
  if (!videoId) return res.status(400).json({ error: 'Missing videoId' });
  db.run(`INSERT INTO play_history (user_id, video_id, title, channel) VALUES (?, ?, ?, ?)`, 
    [req.user.uid, videoId, title, channel], 
    (err) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json({ success: true });
    }
  );
});

app.get('/api/top-favorites', authenticate, (req, res) => {
  const query = `
    SELECT video_id as videoId, title, channel, COUNT(*) as playCount 
    FROM play_history 
    WHERE user_id = ? 
    GROUP BY video_id 
    ORDER BY playCount DESC, MAX(played_at) DESC 
    LIMIT 20
  `;
  db.all(query, [req.user.uid], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ favorites: rows });
  });
});

// ────────────────────────────────────────────────────────────
// GET /api/search?q=ชื่อเพลง
// ────────────────────────────────────────────────────────────
app.get('/api/search', async (req, res) => {
  const query = req.query.q;
  if (!query) return res.status(400).json({ error: 'Missing query parameter "q"' });

  try {
    const ytDlp = getYtDlpPath();
    const ffmpegDir = getFFmpegPath();
    const args = [
      `ytsearch50:${query}`,
      '--dump-json',
      '--flat-playlist',
      '--no-warnings',
      '--quiet',
      ...(ffmpegDir ? ['--ffmpeg-location', ffmpegDir] : []),
    ];

    let output = '';
    let errorOutput = '';

    const proc = spawn(ytDlp, args);

    proc.stdout.on('data', (data) => { output += data.toString(); });
    proc.stderr.on('data', (data) => { errorOutput += data.toString(); });

    proc.on('close', (code) => {
      if (code !== 0 && !output) {
        console.error('yt-dlp search error:', errorOutput);
        return res.status(500).json({ error: 'Search failed', details: errorOutput });
      }

      const lines = output.trim().split('\n').filter(Boolean);
      const results = [];

      for (const line of lines) {
        try {
          const item = JSON.parse(line);
          results.push({
            videoId: item.id,
            title: item.title || 'Unknown Title',
            channel: item.channel || item.uploader || 'Unknown',
            duration: item.duration_string || formatDuration(item.duration),
            thumbnail: item.thumbnail ||
              (item.thumbnails && item.thumbnails.length
                ? item.thumbnails[item.thumbnails.length - 1].url
                : `https://img.youtube.com/vi/${item.id}/hqdefault.jpg`),
            url: `https://www.youtube.com/watch?v=${item.id}`,
          });
        } catch (e) { /* skip malformed lines */ }
      }

      res.json({ results });
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ────────────────────────────────────────────────────────────
// GET /api/download?videoId=xxx&title=ชื่อเพลง
// Streams MP3 directly to the browser
// ────────────────────────────────────────────────────────────
app.get('/api/download', (req, res) => {
  const { videoId, title } = req.query;
  if (!videoId) return res.status(400).json({ error: 'Missing videoId' });

  // Keep Thai and other characters, only remove invalid filename chars
  const rawTitle = (title || videoId).trim();
  const safeTitle = rawTitle
    .replace(/[\\/:*?"<>|]/g, '_')    // replace invalid filename chars
    .replace(/_+/g, '_')              // collapse multiple underscores
    .replace(/^_+|_+$/g, '')         // trim leading/trailing underscores
    .substring(0, 100) || videoId;

  // Also send UTF-8 encoded filename for browsers that support it
  const encodedTitle = encodeURIComponent(rawTitle.substring(0, 150)) + '.mp3';

  res.setHeader('Content-Disposition',
    `attachment; filename="${encodeURIComponent(safeTitle)}.mp3"; filename*=UTF-8''${encodedTitle}`);
  res.setHeader('Content-Type', 'audio/mpeg');

  const url = `https://www.youtube.com/watch?v=${videoId}`;
  const ytDlp = getYtDlpPath();

  const ffmpegDir = getFFmpegPath();
  console.log(`[download] yt-dlp: ${ytDlp}`);
  console.log(`[download] ffmpeg dir: ${ffmpegDir || 'PATH'}`);

  const args = [
    url,
    '-x',
    '--audio-format', 'mp3',
    '--audio-quality', '192K',
    '-o', '-',
    '--no-warnings',
    '--quiet',
    '--rm-cache-dir',
    '--extractor-args', 'youtube:player_client=android',
    ...(ffmpegDir ? ['--ffmpeg-location', ffmpegDir] : []),
  ];

  const proc = spawn(ytDlp, args);

  proc.stdout.pipe(res);

  proc.stderr.on('data', (data) => {
    console.error('[yt-dlp stderr]', data.toString());
  });

  proc.on('error', (err) => {
    console.error('Failed to start yt-dlp:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'yt-dlp not found. Please install it first.' });
    }
  });

  proc.on('close', (code) => {
    if (code !== 0) console.warn(`yt-dlp exited with code ${code}`);
  });

  req.on('close', () => proc.kill());
});

// ────────────────────────────────────────────────────────────
// GET /api/stream?videoId=xxx
// Returns direct CDN audio URL for the browser to play
// (avoids 403 on server IPs — browser fetches directly from YT CDN)
// ────────────────────────────────────────────────────────────
app.get('/api/stream', async (req, res) => {
  const { videoId } = req.query;
  if (!videoId) return res.status(400).json({ error: 'Missing videoId' });

  const url = `https://www.youtube.com/watch?v=${videoId}`;
  const ytDlp = getYtDlpPath();

  console.log(`[stream] Getting direct URL for: ${videoId}`);

  const args = [
    url,
    '-f', 'bestaudio',
    '-g',                    // print direct URL only, don't download
    '--no-warnings',
    '--no-playlist',
    '--no-check-formats',
  ];

  let directUrl = '';
  let errOutput = '';

  const proc = spawn(ytDlp, args);
  proc.stdout.on('data', d => { directUrl += d.toString(); });
  proc.stderr.on('data', d => { errOutput += d.toString(); });

  proc.on('error', (err) => {
    console.error('[stream] yt-dlp spawn error:', err);
    if (!res.headersSent) res.status(500).json({ error: 'yt-dlp not found' });
  });

  proc.on('close', (code) => {
    directUrl = directUrl.trim();
    if (code !== 0 || !directUrl) {
      console.error('[stream] yt-dlp failed:', errOutput.trim());
      return res.status(500).json({ error: 'Could not get audio URL', details: errOutput.trim() });
    }
    console.log(`[stream] Got direct URL for: ${videoId}`);
    // Redirect browser to the CDN URL directly
    res.redirect(302, directUrl);
  });
});

// ────────────────────────────────────────────────────────────
// GET /api/info?videoId=xxx  — get video metadata quickly
// ────────────────────────────────────────────────────────────
app.get('/api/videoinfo', async (req, res) => {
  const { videoId } = req.query;
  if (!videoId) return res.status(400).json({ error: 'Missing videoId' });

  const ytDlp = getYtDlpPath();
  const ffmpegDir = getFFmpegPath();

  try {
    let output = '';
    const args = [
      `https://www.youtube.com/watch?v=${videoId}`,
      '--dump-json',
      '--no-warnings',
      '--quiet',
      '--no-playlist',
      '--rm-cache-dir',
      '--extractor-args', 'youtube:player_client=android',
      ...(ffmpegDir ? ['--ffmpeg-location', ffmpegDir] : []),
    ];

    const proc = spawn(ytDlp, args);
    proc.stdout.on('data', d => { output += d.toString(); });
    proc.on('close', () => {
      try {
        const info = JSON.parse(output.trim());
        res.json({
          videoId: info.id,
          title: info.title,
          channel: info.channel || info.uploader,
          duration: info.duration,
          thumbnail: info.thumbnail || `https://img.youtube.com/vi/${info.id}/hqdefault.jpg`,
        });
      } catch {
        res.status(500).json({ error: 'Failed to parse video info' });
      }
    });
    proc.on('error', () => res.status(500).json({ error: 'yt-dlp not found' }));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────
function formatDuration(seconds) {
  if (!seconds) return 'N/A';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

// GET /api/info — share URLs for friends
app.get('/api/info', (req, res) => {
  res.json({
    publicUrl,
    tunnelPassword,
    localUrls: getLocalIPs().map((ip) => `http://${ip}:${PORT}`),
    port: PORT,
  });
});

// Serve frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

function getLocalIPs() {
  const nets = os.networkInterfaces();
  const ips = [];
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) ips.push(net.address);
    }
  }
  return ips;
}

async function getPublicIP() {
  const https = require('https');
  return new Promise((resolve) => {
    https.get('https://api.ipify.org', (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve(data.trim() || null));
    }).on('error', () => resolve(null));
  });
}

function getCloudflaredPath() {
  const candidates = [
    'cloudflared',
    path.join(process.env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)', 'cloudflared', 'cloudflared.exe'),
    path.join(process.env.ProgramFiles || 'C:\\Program Files', 'cloudflared', 'cloudflared.exe'),
  ];
  for (const c of candidates) {
    try { if (c === 'cloudflared' || fs.existsSync(c)) return c; } catch (e) { /* skip */ }
  }
  return null;
}

function startCloudflaredTunnel(port) {
  const cloudflared = getCloudflaredPath();
  if (!cloudflared) return Promise.resolve(null);

  return new Promise((resolve) => {
    let resolved = false;
    const proc = spawn(cloudflared, ['tunnel', '--url', `http://127.0.0.1:${port}`], {
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    const handleOutput = (data) => {
      const text = data.toString();
      const match = text.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/i);
      if (match && !resolved) {
        resolved = true;
        publicUrl = match[0];
        tunnelPassword = null;
        console.log(`\n🔗 แชร์ลิงก์นี้ให้เพื่อน: ${publicUrl}\n`);
        resolve(proc);
      }
    };

    proc.stdout.on('data', handleOutput);
    proc.stderr.on('data', handleOutput);

    proc.on('error', () => { if (!resolved) resolve(null); });
    proc.on('close', () => {
      publicUrl = null;
      if (!resolved) resolve(null);
    });

    setTimeout(() => { if (!resolved) resolve(null); }, 45000);
  });
}

async function startLocaltunnel(port, subdomain) {
  try {
    const localtunnel = require('localtunnel');
    tunnelPassword = await getPublicIP();
    const opts = { port };
    if (subdomain) opts.subdomain = subdomain;
    const tunnel = await localtunnel(opts);
    publicUrl = tunnel.url;
    console.log(`\n🔗 แชร์ลิงก์นี้ให้เพื่อน: ${publicUrl}`);
    if (tunnelPassword) {
      console.log(`🔑 ถ้าเพื่อนเจอหน้า password ให้ใส่: ${tunnelPassword}\n`);
    } else {
      console.log('');
    }
    tunnel.on('close', () => {
      publicUrl = null;
      console.log('⚠️  Tunnel หลุด — กำลังเชื่อมต่อใหม่...');
      setTimeout(() => startTunnel(port, subdomain), 3000);
    });
    return tunnel;
  } catch (err) {
    console.warn('⚠️  localtunnel ล้มเหลว:', err.message);
    return null;
  }
}

async function startTunnel(port, subdomain) {
  console.log('🌐 กำลังสร้าง public link...');
  if (!subdomain) {
    const cf = await startCloudflaredTunnel(port);
    if (cf) return cf;
    console.log('↪️  ใช้ localtunnel แทน (อาจไม่เสถียร)...');
  } else {
    console.log(`📌 ระบบกำลังจองชื่อลิงก์ตายตัว: ${subdomain}`);
  }
  return startLocaltunnel(port, subdomain);
}

app.listen(PORT, HOST, async () => {
  console.log(`\n🎵 SoundRip running at http://localhost:${PORT}\n`);

  const ips = getLocalIPs();
  if (ips.length) {
    console.log('📱 เครื่องใน Wi-Fi เดียวกันเปิดได้ที่:');
    ips.forEach((ip) => console.log(`   http://${ip}:${PORT}`));
    console.log('');
  }

  if (process.argv.includes('--share') || process.env.SHARE === '1') {
    const fixedIdx = process.argv.indexOf('--fixed');
    let subdomain = undefined;
    if (fixedIdx !== -1 && process.argv[fixedIdx + 1]) {
      subdomain = process.argv[fixedIdx + 1].toLowerCase().replace(/[^a-z0-9-]/g, '');
    }
    await startTunnel(PORT, subdomain);
  } else {
    console.log('💡 ต้องการลิงก์ส่งให้เพื่อนทางอินเทอร์เน็ต? รัน: npm run share\n');
  }
});
