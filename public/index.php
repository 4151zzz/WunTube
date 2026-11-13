<?php

declare(strict_types=1);

if (!defined('WUNTUBE_RENDER_VIEW')) {
    require_once dirname(__DIR__) . '/src/App.php';
    WunTube\App::run(false);
    return;
}

/** @var string $basePath */
/** @var string $assetBase */
/** @var string $apiBase */

$e = static fn (string $value): string => htmlspecialchars($value, ENT_QUOTES, 'UTF-8');

$quickTags = [
    ['label' => 'ทั้งหมด', 'query' => ''],
    ['label' => 'ฮิตตอนนี้', 'query' => 'เพลงฮิตตอนนี้'],
    ['label' => 'เพลงไทย', 'query' => 'เพลงไทยใหม่ล่าสุด'],
    ['label' => 'Lo-fi Chill', 'query' => 'Lo-fi Chill'],
    ['label' => 'POP GOLD', 'query' => 'POP GOLD'],
    ['label' => 'เพลงร็อคตลอดกาล', 'query' => 'เพลงร็อคตลอดกาล'],
    ['label' => 'เพลงช้าเศร้า', 'query' => 'เพลงช้าเศร้า'],
    ['label' => 'ออกกำลังกาย', 'query' => 'เพลงออกกำลังกาย'],
    ['label' => 'เพลงสากลฮิต', 'query' => 'Top English Songs'],
];

$cineSlides = [
    [
        'title' => 'เพลงฮิต TikTok',
        'sub' => 'ไวรัลฮิตติดชาร์ต · ฟังต่อเนื่อง',
        'bg' => 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1200&auto=format&fit=crop',
        'thumb' => 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=400&auto=format&fit=crop',
        'alt' => 'TikTok',
        'label' => 'TIKTOK HITS',
        'color' => '',
    ],
    [
        'title' => 'Lo-fi Chill',
        'sub' => 'ผ่อนคลาย ฟังสบาย · ทำงาน / อ่านหนังสือ',
        'bg' => 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1200&auto=format&fit=crop',
        'thumb' => 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=400&auto=format&fit=crop',
        'alt' => 'Lo-Fi',
        'label' => 'LO-FI CHILL',
        'color' => '#ffffff',
    ],
    [
        'title' => 'POP GOLD',
        'sub' => 'รวมเพลงป็อปยอดนิยมตลอดกาล',
        'bg' => 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1200&auto=format&fit=crop',
        'thumb' => 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=400&auto=format&fit=crop',
        'alt' => 'Pop',
        'label' => 'POP HITS',
        'color' => '#ffffff',
    ],
    [
        'title' => 'เพลงร็อคตลอดกาล',
        'sub' => 'รวมร็อคไทย-สากลสุดเดือด',
        'bg' => 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?q=80&w=1200&auto=format&fit=crop',
        'thumb' => 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?q=80&w=400&auto=format&fit=crop',
        'alt' => 'Rock',
        'label' => 'ROCK CLASSICS',
        'color' => '#ffffff',
    ],
    [
        'title' => 'เพลงช้าเศร้า',
        'sub' => 'เพลงช้าซึ้งๆ ฟังเพลินยามค่ำคืน',
        'bg' => 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1200&auto=format&fit=crop',
        'thumb' => 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=400&auto=format&fit=crop',
        'alt' => 'Sad',
        'label' => 'SAD SONGS',
        'color' => '#ffffff',
    ],
    [
        'title' => 'เพลงไทยสากล',
        'sub' => 'เพลงไทยมาแรง คัดพิเศษ',
        'bg' => 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=1200&auto=format&fit=crop',
        'thumb' => 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=400&auto=format&fit=crop',
        'alt' => 'Thai',
        'label' => 'THAI HITS',
        'color' => '#ffffff',
    ],
];
?>
<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
  <meta name="description" content="เล่นเพลงและวิดีโอจาก YouTube พร้อมเล่นต่อเนื่องอัตโนมัติ ไม่มีโฆษณา" />
  <meta name="theme-color" content="#0f0f0f" />
  <meta name="mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
  <title>WunTube</title>
  <link rel="manifest" href="<?= $e($assetBase) ?>/manifest.json" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="<?= $e($assetBase) ?>/style.css" />
  <link rel="icon" href="<?= $e($assetBase) ?>/app-icon.png" type="image/png" />
</head>
<body>

  <!-- ═══ SPLASH SCREEN ═══ -->
  <div id="splashScreen" class="splash-screen">
    <div class="splash-content">
      <div class="splash-yt-mark" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="9 7 18 12 9 17 9 7"/></svg>
      </div>
      <div class="splash-name">Wun<span>Tube</span></div>
      <div class="splash-bar"><div class="splash-fill"></div></div>
    </div>
  </div>

  <!-- Hidden audio element & fallback YouTube player host (for servers without yt-dlp) -->
  <audio id="globalAudio" preload="none"></audio>
  <div id="ytFallbackHost" class="yt-fallback-host" aria-hidden="true"></div>

  <!-- ═══ NOW PLAYING EXPANDED VIEW ═══ -->
  <div id="nowPlayingPanel" class="now-playing-panel hidden">
    <div class="np-bg-blur" id="npBgBlur"></div>
    <div class="np-inner">

      <!-- Left: theater artwork + controls -->
      <div class="np-left">
        <div class="np-artwork-wrap" id="npArtworkWrap">
          <img id="npArtwork" class="np-artwork" src="" alt="thumbnail" />
          <video id="npVideoEl" class="np-video-el hidden" playsinline preload="none" onclick="togglePlayPause()"></video>
          <div class="np-artwork-glow" id="npArtworkGlow"></div>
          <div class="np-viz" id="npViz">
            <span></span><span></span><span></span><span></span><span></span><span></span><span></span>
          </div>
        </div>

        <div class="np-track-info">
          <div class="np-meta-head">
            <div class="np-title-block">
              <div class="np-badge hidden" id="npBgBadge">
                <span class="dot"></span> กำลังเล่น
              </div>
              <h2 id="npTitle" class="np-title">—</h2>
              <p id="npChannel" class="np-channel">—</p>
            </div>
            <div class="np-actions-row">
              <button id="npBtnVideoMode" class="np-action-btn active" type="button" title="สลับโหมดดูวิดีโอ / ฟังเพลงอย่างเดียว">
                <svg viewBox="0 0 24 24" fill="none"><rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" stroke-width="2"/><polygon points="10 9 16 12 10 15 10 9" fill="currentColor"/></svg>
                <span id="npVideoModeText">โหมดวิดีโอ</span>
              </button>
              <button id="npBtnPlaylist" class="np-action-btn" title="เพิ่มใน Playlist">
                <svg viewBox="0 0 24 24" fill="none"><line x1="8" y1="6" x2="21" y2="6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="8" y1="12" x2="21" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="8" y1="18" x2="16" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="3" y1="6" x2="3.01" y2="6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="3" y1="12" x2="3.01" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="3" y1="18" x2="3.01" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                <span>บันทึก</span>
              </button>
              <button id="npBtnDownload" class="np-action-btn" title="ดาวน์โหลด MP3">
                <svg viewBox="0 0 24 24" fill="none"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><polyline points="7 10 12 15 17 10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                <span>MP3</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Progress -->
        <div class="np-progress-area" id="npProgressArea">
          <div class="np-progress-track">
            <div id="npProgressFill" class="np-progress-fill"></div>
            <div id="npProgressThumb" class="np-progress-thumb"></div>
          </div>
          <div class="np-time-row">
            <span id="npTimeCurrent">0:00</span>
            <span id="npTimeDuration">0:00</span>
          </div>
        </div>

        <!-- Controls -->
        <div class="np-controls-bar">
          <div class="np-controls">
            <button id="npBtnLoop" class="np-ctrl np-ctrl-sm" title="เล่นซ้ำ">
              <svg viewBox="0 0 24 24" fill="none"><polyline points="17 1 21 5 17 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M3 11V9a4 4 0 0 1 4-4h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><polyline points="7 23 3 19 7 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M21 13v2a4 4 0 0 1-4 4H3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            </button>
            <button id="npBtnPrev" class="np-ctrl" title="ก่อนหน้า">
              <svg viewBox="0 0 24 24" fill="none"><polygon points="19 20 9 12 19 4 19 20" fill="currentColor"/><line x1="5" y1="19" x2="5" y2="5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            </button>
            <button id="npBtnPlay" class="np-ctrl np-ctrl-play" title="เล่น/หยุด">
              <svg id="npIconPlay" viewBox="0 0 24 24" fill="none"><polygon points="6 4 20 12 6 20 6 4" fill="currentColor"/></svg>
              <svg id="npIconPause" viewBox="0 0 24 24" fill="none" class="hidden"><rect x="6" y="4" width="4" height="16" rx="1" fill="currentColor"/><rect x="14" y="4" width="4" height="16" rx="1" fill="currentColor"/></svg>
              <svg id="npIconLoading" viewBox="0 0 24 24" fill="none" class="hidden spin"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2" stroke-dasharray="28" stroke-dashoffset="10" stroke-linecap="round"/></svg>
            </button>
            <button id="npBtnNext" class="np-ctrl" title="ถัดไป">
              <svg viewBox="0 0 24 24" fill="none"><polygon points="5 4 15 12 5 20 5 4" fill="currentColor"/><line x1="19" y1="5" x2="19" y2="19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            </button>
            <button id="npBtnShuffle" class="np-ctrl np-ctrl-sm" title="สุ่มเพลง">
              <svg viewBox="0 0 24 24" fill="none"><polyline points="16 3 21 3 21 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><line x1="4" y1="20" x2="21" y2="3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><polyline points="21 16 21 21 16 21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><line x1="15" y1="15" x2="21" y2="21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            </button>
          </div>

          <!-- Volume -->
          <div class="np-volume-row">
            <svg class="vol-icon" viewBox="0 0 24 24" fill="none"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor"/></svg>
            <input id="npVolumeSlider" type="range" class="np-volume-slider" min="0" max="100" value="100" />
            <svg class="vol-icon" viewBox="0 0 24 24" fill="none"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          </div>
        </div>
      </div>

      <!-- Right: Queue / Up Next -->
      <div class="np-right">
        <div class="np-right-header">
          <div class="np-tab-bar">
            <button class="np-tab active" id="tabQueue" onclick="switchNpTab('queue')">คิวเพลง</button>
            <button class="np-tab" id="tabRelated" onclick="switchNpTab('related')">✨ ที่คุณอาจจะชอบ</button>
          </div>
          <button id="npBtnAutoplay" class="np-autoplay-btn active" type="button" title="เล่นวิดีโอที่คุณอาจจะชอบอัตโนมัติ">
            <span class="ap-dot"></span>
            <span>เล่นอัตโนมัติ</span>
          </button>
        </div>
        <div id="npQueueList" class="np-queue-list"></div>
        <div id="npRelatedList" class="np-queue-list hidden"></div>
      </div>

      <!-- Close btn -->
      <button id="npCloseBtn" class="np-close-btn" title="ย่อลง">
        <svg viewBox="0 0 24 24" fill="none"><path d="M19 9l-7 7-7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
    </div>
  </div>

  <!-- ═══ PLAYLIST MODAL ═══ -->
  <div id="playlistModal" class="modal-overlay hidden">
    <div class="modal">
      <div class="modal-header">
        <h3 id="modalTitle" class="modal-title">บันทึกลงในเพลย์ลิสต์</h3>
        <button class="modal-close" id="modalCloseBtn">
          <svg viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        </button>
      </div>
      <div class="modal-body">
        <div class="create-playlist-row">
          <input id="newPlaylistName" type="text" class="playlist-name-input" placeholder="ชื่อเพลย์ลิสต์ใหม่..." />
          <button id="createPlaylistBtn" class="create-pl-btn">สร้าง</button>
        </div>
        <div id="playlistPickerList" class="playlist-picker-list"></div>
      </div>
    </div>
  </div>

  <!-- ═══ CREATE PLAYLIST MODAL (from sidebar) ═══ -->
  <div id="createPlaylistModal" class="modal-overlay hidden">
    <div class="modal">
      <div class="modal-header">
        <h3 class="modal-title">สร้างเพลย์ลิสต์ใหม่</h3>
        <button class="modal-close" id="createModalCloseBtn">
          <svg viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        </button>
      </div>
      <div class="modal-body">
        <input id="newPlaylistNameMain" type="text" class="playlist-name-input" placeholder="ชื่อเพลย์ลิสต์ เช่น เพลงโปรด, Chill..." />
        <button id="createPlaylistMainBtn" class="create-pl-btn full-btn">สร้างเพลย์ลิสต์</button>
      </div>
    </div>
  </div>

  <!-- ═══ YOUTUBE STICKY TOP MASTHEAD ═══ -->
  <header class="topbar yt-masthead">
    <div class="masthead-left">
      <button class="menu-btn" id="menuBtn" title="เมนู">
        <svg viewBox="0 0 24 24" fill="none"><line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="3" y1="18" x2="21" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
      </button>
      <a href="#" class="yt-brand" onclick="showView('home', event)">
        <span class="yt-logo-badge" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="9 7 17 12 9 17 9 7"/></svg>
        </span>
        <span class="yt-brand-text">WunTube</span>
        <span class="yt-country">TH</span>
      </a>
    </div>

    <div class="masthead-center">
      <form id="searchForm" class="yt-search-form" autocomplete="off">
        <div class="hero-search-wrap yt-search-wrap">
          <svg class="hero-search-icon yt-search-prefix" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/><path d="m21 21-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          <input type="text" id="searchInput" class="hero-search-input yt-search-input" placeholder="ค้นหาเพลง ศิลปิน หรือวิดีโอ..." autocomplete="off" spellcheck="false" />
          <button type="submit" id="searchBtn" class="hero-search-btn yt-search-btn" title="ค้นหา">
            <svg viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/><path d="m21 21-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          </button>
        </div>
      </form>
    </div>

    <div class="masthead-right">
      <div id="bgPlayBadge" class="bg-badge hidden">
        <span class="bg-dot"></span> กำลังเล่น
      </div>
      <button type="button" id="headerSignInBtn" class="yt-signin-btn" onclick="openAuthModal(event)">
        <svg viewBox="0 0 24 24" fill="none"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="1.9"/><circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="1.9"/></svg>
        <span>เข้าสู่ระบบ</span>
      </button>
      <div class="user-avatar hidden" id="userAvatarBtn" onclick="logout()" title="คลิกเพื่อออกจากระบบ">
        <span id="userAvatarText">U</span>
      </div>
    </div>
  </header>

  <div class="app-layout">

    <!-- ═══ YOUTUBE GUIDE SIDEBAR ═══ -->
    <aside class="sidebar" id="sidebar">
      <div class="sidebar-mobile-top">
        <a href="#" class="yt-brand" onclick="showView('home', event)">
          <span class="yt-logo-badge" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="9 7 17 12 9 17 9 7"/></svg>
          </span>
          <span class="yt-brand-text">WunTube</span>
        </a>
        <button class="sidebar-close-btn" id="sidebarCloseBtn" title="ปิดเมนู">
          <svg viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        </button>
      </div>

      <nav class="sidebar-nav">
        <a href="#" class="nav-item active" id="navHome" onclick="showView('home', event)">
          <svg viewBox="0 0 24 24" fill="none"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" stroke-width="2"/><polyline points="9 22 9 12 15 12 15 22" stroke="currentColor" stroke-width="2"/></svg>
          <span>หน้าแรก</span>
        </a>
        <a href="#" class="nav-item" id="navExplore" onclick="scrollToRecommended(event)">
          <svg viewBox="0 0 24 24" fill="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>
          <span>แนะนำสำหรับคุณ</span>
        </a>
        <a href="#" class="nav-item" id="navQueue" onclick="showView('queue', event)">
          <svg viewBox="0 0 24 24" fill="none"><line x1="8" y1="6" x2="21" y2="6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="8" y1="12" x2="21" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="8" y1="18" x2="21" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="3" y1="6" x2="3.01" y2="6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="3" y1="12" x2="3.01" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="3" y1="18" x2="3.01" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          <span>คิวเพลง <span id="queueCountBadge" class="badge hidden">0</span></span>
        </a>
      </nav>

      <div class="sidebar-divider"></div>

      <div class="sidebar-section-title">
        <span>เพลย์ลิสต์</span>
        <button id="addPlaylistBtn" class="add-pl-btn" title="สร้างเพลย์ลิสต์ใหม่">
          <svg viewBox="0 0 24 24" fill="none"><line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>
        </button>
      </div>
      <div id="playlistSidebarList" class="playlist-sidebar-list"></div>

      <div id="shareBar" class="share-bar hidden">
        <p class="share-title">ลิงก์แชร์</p>
        <div class="share-row">
          <input id="shareUrl" class="share-input" type="text" readonly />
          <button id="copyShareBtn" class="share-copy-btn">คัดลอก</button>
        </div>
        <p id="shareHint" class="share-hint"></p>
      </div>
    </aside>

    <div class="sidebar-overlay" id="sidebarOverlay"></div>

    <!-- ═══ MAIN ═══ -->
    <main class="main-content">

      <!-- ── HOME VIEW ── -->
      <div id="viewHome">

        <!-- Sticky YouTube Category Filter Chips -->
        <div class="yt-chips-bar">
          <div class="quick-tags chips-scroll">
            <?php foreach ($quickTags as $idx => $tag): ?>
            <button
              type="button"
              class="tag yt-chip<?= $idx === 0 ? ' active' : '' ?>"
              data-query="<?= $e($tag['query']) ?>"
              onclick="selectCategoryChip(this, <?= $e(json_encode($tag['query'], JSON_UNESCAPED_UNICODE)) ?>)"
            ><?= $e($tag['label']) ?></button>
            <?php endforeach; ?>
          </div>
        </div>

        <!-- Top Favorites Section (Hidden until logged in) -->
        <section class="curated-section hidden" id="topFavoritesSection">
          <div class="section-header">
            <div>
              <h2 class="section-heading">เพลงโปรดของคุณ</h2>
              <p class="section-subheading">รายการที่คุณเปิดฟังบ่อยที่สุด</p>
            </div>
          </div>
          <div class="curated-grid" id="topFavoritesGrid">
            <!-- Rendered via JS -->
          </div>
        </section>

        <!-- Primary YouTube Feed: Recommended For You -->
        <section class="curated-section" id="recommendedSection">
          <div class="section-header">
            <div>
              <h2 class="section-heading">✨ วิดีโอที่คุณอาจจะชอบ</h2>
              <p class="section-subheading" id="recommendedSubtitle">คัดสรรตามแนวเพลงที่คุณฟัง · เล่นต่อเนื่องหลากหลายศิลปิน</p>
            </div>
            <button type="button" id="refreshRecommendationsBtn" class="refresh-rec-btn" title="สุ่มวิดีโอแนะนำใหม่">
              <svg viewBox="0 0 24 24" fill="none"><polyline points="23 4 23 10 17 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
              <span>รีเฟรช</span>
            </button>
          </div>
          <div class="curated-grid" id="recommendedGrid">
            <div class="queue-empty" style="grid-column: 1 / -1; padding: 36px 0;">กำลังโหลดรายการแนะนำ...</div>
          </div>
        </section>

        <!-- Compact YouTube Spotlight Showcase -->
        <section class="cinematic-hero-section" id="curatedSection">
          <img id="cineBgImg" class="cine-bg" src="<?= $e($cineSlides[0]['bg']) ?>" alt="bg" />
          <div class="cine-overlay"></div>

          <div class="cine-content-wrap">
            <div class="cine-info">
              <div class="cine-eyebrow">FEATURED MIX</div>
              <h2 id="cineTitle" class="cine-title"><?= $e($cineSlides[0]['title']) ?></h2>
              <p id="cineSub" class="cine-sub"><?= $e($cineSlides[0]['sub']) ?></p>
              <button class="cine-play-btn" onclick="quickSearch({textContent: document.getElementById('cineTitle').innerText})">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg> เปิดเพลย์ลิสต์
              </button>
            </div>

            <div class="cine-carousel">
              <?php foreach ($cineSlides as $idx => $slide): ?>
              <div class="cine-thumb<?= $idx === 0 ? ' active' : '' ?>" onclick='setCineSlide(this, <?= $e(json_encode($slide['title'], JSON_UNESCAPED_UNICODE)) ?>, <?= $e(json_encode($slide['sub'], JSON_UNESCAPED_UNICODE)) ?>, <?= $e(json_encode($slide['bg'], JSON_UNESCAPED_SLASHES)) ?>)'>
                <img src="<?= $e($slide['thumb']) ?>" alt="<?= $e($slide['alt']) ?>" />
                <div class="cine-thumb-text"><?= $e($slide['label']) ?></div>
              </div>
              <?php endforeach; ?>
            </div>
          </div>

          <script>
            function setCineSlide(el, title, sub, bgUrl) {
              document.querySelectorAll('.cine-thumb').forEach(t => t.classList.remove('active'));
              if(el) el.classList.add('active');
              const bg = document.getElementById('cineBgImg');
              if(bg) {
                bg.style.opacity = 0;
                setTimeout(() => {
                  bg.src = bgUrl;
                  bg.style.opacity = 0.45;
                }, 250);
              }
              const tEl = document.getElementById('cineTitle');
              const sEl = document.getElementById('cineSub');
              if(tEl) tEl.innerText = title;
              if(sEl) sEl.innerText = sub;
            }

            let cineAutoSlide;
            function startCineAutoSlide() {
              clearInterval(cineAutoSlide);
              cineAutoSlide = setInterval(() => {
                const thumbs = document.querySelectorAll('.cine-thumb');
                if(!thumbs.length) return;
                let activeIdx = 0;
                thumbs.forEach((t, i) => { if(t.classList.contains('active')) activeIdx = i; });
                let nextIdx = (activeIdx + 1) % thumbs.length;
                thumbs[nextIdx].click();
              }, 6000);
            }
            startCineAutoSlide();

            setTimeout(() => {
              const carousel = document.querySelector('.cine-carousel');
              if(carousel) {
                carousel.addEventListener('mouseenter', () => clearInterval(cineAutoSlide));
                carousel.addEventListener('mouseleave', startCineAutoSlide);
              }
            }, 1000);
          </script>
        </section>

      </div>

      <!-- ── SEARCH RESULTS VIEW ── -->
      <div id="viewSearch" class="hidden">
        <div class="search-page-header">
          <button class="search-back-btn" id="searchBackBtn" onclick="showView('home', event)">
            <svg viewBox="0 0 24 24" fill="none"><path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            <span>กลับหน้าแรก</span>
          </button>
          <div class="search-page-form-wrap hidden">
            <form id="searchFormPage" class="search-page-form" autocomplete="off">
              <input type="text" id="searchInputPage" class="sp-input" placeholder="ค้นหาเพลง..." autocomplete="off" spellcheck="false" />
              <button type="submit" class="sp-submit-btn" id="searchBtnPage">ค้นหา</button>
            </form>
          </div>
          <div class="search-results-meta hidden" id="searchResultsMeta">
            <h2 id="resultsTitle" class="sresults-title"></h2>
            <span id="resultsCount" class="results-badge"></span>
          </div>
        </div>

        <div id="searchStatusBar" class="search-status-bar hidden">
          <div class="search-spinner"></div>
          <span id="searchStatusText">กำลังค้นหา...</span>
        </div>

        <div class="search-results-area">
          <div id="resultsGrid" class="results-list"></div>
        </div>
      </div>

      <!-- ── QUEUE VIEW ── -->
      <div id="viewQueue" class="hidden">
        <div class="inner-view-header">
          <h2 class="inner-view-title">คิวเพลง</h2>
          <button id="clearQueueBtn" class="danger-btn">ล้างคิวทั้งหมด</button>
        </div>
        <div class="inner-view-body">
          <div id="queueList" class="queue-list"></div>
          <div id="queueEmpty" class="queue-empty hidden">ยังไม่มีเพลงในคิว — ค้นหาแล้วกด + เพิ่มได้เลย</div>
        </div>
      </div>

      <!-- ── PLAYLIST VIEW ── -->
      <div id="viewPlaylist" class="hidden">
        <div class="pl-page-hero">
          <button class="search-back-btn" onclick="showView('home', event)">
            <svg viewBox="0 0 24 24" fill="none"><path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
          <div class="pl-hero-icon">
            <svg viewBox="0 0 24 24" fill="none"><line x1="8" y1="6" x2="21" y2="6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="8" y1="12" x2="21" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="8" y1="18" x2="16" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          </div>
          <div class="pl-hero-info">
            <h2 id="plViewTitle" class="pl-hero-name">Playlist</h2>
            <p id="plViewCount" class="pl-hero-count">0 เพลง</p>
          </div>
          <div class="pl-hero-btns">
            <button id="playAllBtn" class="play-all-btn">
              <svg viewBox="0 0 24 24" fill="none"><polygon points="5 3 19 12 5 21 5 3" fill="currentColor"/></svg>
              เล่นทั้งหมด
            </button>
            <button id="deletePlBtn" class="delete-pl-btn" title="ลบเพลย์ลิสต์นี้">
              <svg viewBox="0 0 24 24" fill="none"><polyline points="3 6 5 6 21 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M10 11v6M14 11v6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            </button>
          </div>
        </div>
        <div class="inner-view-body">
          <div id="playlistTrackList" class="queue-list"></div>
          <div id="playlistEmpty" class="queue-empty hidden">ยังไม่มีเพลงในเพลย์ลิสต์นี้</div>
        </div>
      </div>

    </main>
  </div>

  <!-- ═══ BOTTOM NAVIGATION (MOBILE) ═══ -->
  <nav id="bottomNav" class="bottom-nav hidden-desktop">
    <a href="#" class="b-nav-item active" id="bNavHome" onclick="showView('home', event)">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
      <span>หน้าแรก</span>
    </a>
    <a href="#" class="b-nav-item" id="bNavSearch" onclick="focusSearch(event)">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35" stroke-linecap="round"/></svg>
      <span>ค้นหา</span>
    </a>
    <a href="#" class="b-nav-item" id="bNavCol" onclick="showView('queue', event)">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6" stroke-linecap="round"/><line x1="8" y1="12" x2="21" y2="12" stroke-linecap="round"/><line x1="8" y1="18" x2="21" y2="18" stroke-linecap="round"/></svg>
      <span>คิว</span>
    </a>
    <a href="#" class="b-nav-item auth-nav-item" id="bNavAuth" onclick="openAuthModal(event)">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
      <span id="bNavLoginText">เข้าสู่ระบบ</span>
    </a>
  </nav>

  <!-- ═══ AUTH MODAL ═══ -->
  <div id="authModal" class="modal-overlay hidden" style="z-index: 700;">
    <div class="modal auth-modal-card">
      <div class="modal-header">
        <h3 id="authModalTitle" class="modal-title">เข้าสู่ระบบ WunTube</h3>
        <button class="modal-close" onclick="closeAuthModal()">
          <svg viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        </button>
      </div>
      <div class="modal-body">
        <form id="authForm" onsubmit="handleAuth(event)">
          <div class="auth-input-group">
            <input type="email" id="authEmail" class="playlist-name-input full-btn" placeholder="อีเมล (เช่น name@gmail.com)" required />
          </div>
          <div class="auth-input-group">
            <input type="password" id="authPassword" class="playlist-name-input full-btn" placeholder="รหัสผ่าน" required />
          </div>
          <div id="authNameGroup" class="auth-input-group hidden">
            <input type="text" id="authName" class="playlist-name-input full-btn" placeholder="ชื่อที่แสดง" />
          </div>
          <button type="submit" id="authSubmitBtn" class="create-pl-btn full-btn">เข้าสู่ระบบ</button>

          <div class="auth-divider">
            <span>หรือ</span>
          </div>

          <button type="button" class="google-auth-btn full-btn" onclick="handleFirebaseGoogleLogin()">
            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M21.35 11.1H12v2.8h5.45c-.25 1.3-1.45 3.8-5.45 3.8-3.3 0-6-2.7-6-6s2.7-6 6-6c1.6 0 3 .6 4.1 1.6l2.1-2.1C16.5 3.6 14.4 2.8 12 2.8 6.9 2.8 2.8 7 2.8 12s4.1 9.2 9.2 9.2c5.3 0 8.8-3.8 8.8-9 0-.6-.1-1.1-.2-1.6z"/></svg>
            เข้าสู่ระบบด้วย Google (Firebase)
          </button>

          <p class="auth-switch-text">
            <span id="authSwitchPrompt">ยังไม่มีบัญชี?</span>
            <a href="#" id="authSwitchBtn" onclick="toggleAuthMode(event)">สมัครสมาชิก</a>
          </p>
        </form>
      </div>
    </div>
  </div>

  <!-- ═══ MINI PLAYER BAR (YOUTUBE MUSIC DARK) ═══ -->
  <div id="playerBar" class="player-bar hidden">
    <div class="player-progress-area" id="progressArea">
      <div class="progress-track">
        <div id="progressFill" class="progress-fill"></div>
      </div>
    </div>
    <div class="player-body" id="playerBodyClick">
      <div class="player-left">
        <div class="player-artwork" id="playerArtwork">
          <img id="playerThumbImg" src="" alt="" />
          <div class="artwork-viz" id="artworkViz">
            <span></span><span></span><span></span><span></span><span></span>
          </div>
        </div>
        <div class="player-info">
          <div id="playerTitle" class="player-title">—</div>
          <div id="playerChannel" class="player-channel">—</div>
        </div>
      </div>
      <div class="player-center">
        <button id="btnPrev" class="ctrl-btn" onclick="event.stopPropagation()" title="ก่อนหน้า">
          <svg viewBox="0 0 24 24" fill="none"><polygon points="19 20 9 12 19 4 19 20" fill="currentColor"/><line x1="5" y1="19" x2="5" y2="5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        </button>
        <button id="btnPlay" class="ctrl-btn ctrl-play" onclick="event.stopPropagation()" title="เล่น/หยุด">
          <svg id="iconPlay" viewBox="0 0 24 24" fill="none"><polygon points="6 4 19 12 6 20 6 4" fill="currentColor"/></svg>
          <svg id="iconPause" viewBox="0 0 24 24" fill="none" class="hidden"><rect x="6" y="4" width="4" height="16" rx="1" fill="currentColor"/><rect x="14" y="4" width="4" height="16" rx="1" fill="currentColor"/></svg>
          <svg id="iconLoading" viewBox="0 0 24 24" fill="none" class="hidden spin"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2" stroke-dasharray="28" stroke-dashoffset="10" stroke-linecap="round"/></svg>
        </button>
        <button id="btnNext" class="ctrl-btn" onclick="event.stopPropagation()" title="ถัดไป">
          <svg viewBox="0 0 24 24" fill="none"><polygon points="5 4 15 12 5 20 5 4" fill="currentColor"/><line x1="19" y1="5" x2="19" y2="19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        </button>
      </div>
      <div class="player-right" onclick="event.stopPropagation()">
        <svg class="vol-icon" viewBox="0 0 24 24" fill="none"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        <input id="volumeSlider" type="range" class="volume-slider" min="0" max="100" value="100" />
      </div>
    </div>
  </div>

  <!-- Toast -->
  <div id="toast" class="toast hidden">
    <div class="toast-icon">▶</div>
    <div class="toast-content">
      <div id="toastTitle" class="toast-title">WunTube</div>
      <div id="toastMsg" class="toast-msg"></div>
    </div>
    <div class="toast-progress"><div class="toast-bar"></div></div>
  </div>

  <!-- Inject PHP runtime paths so API requests work under root or subfolder hosting -->
  <script>
    window.WUNTUBE_CONFIG = <?= json_encode([
        'basePath' => $basePath,
        'apiBase' => $apiBase,
        'assetBase' => $assetBase,
    ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) ?>;
  </script>
  <!-- Firebase JS SDK (only loaded when properly configured) -->
  <script src="<?= $e($assetBase) ?>/app.js"></script>
</body>
</html>
