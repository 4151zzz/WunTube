/* ═══════════════════════════════════════════════════════════════════
   WunTube — v2 App Logic
   Now Playing Panel · Playlists · Queue · Autoplay · Media Session
   ═══════════════════════════════════════════════════════════════════ */

const API = (window.WUNTUBE_CONFIG && window.WUNTUBE_CONFIG.apiBase) || '/api';

// ── DOM refs ─────────────────────────────────────────────────────────
const audio           = document.getElementById('globalAudio');
const videoEl         = document.getElementById('npVideoEl');
const ytFallbackHost  = document.getElementById('ytFallbackHost');
const npArtworkWrap   = document.getElementById('npArtworkWrap');
const playerBar       = document.getElementById('playerBar');
const playerBodyClick = document.getElementById('playerBodyClick');
const btnPlay         = document.getElementById('btnPlay');
const btnPrev         = document.getElementById('btnPrev');
const btnNext         = document.getElementById('btnNext');
const iconPlay        = document.getElementById('iconPlay');
const iconPause       = document.getElementById('iconPause');
const iconLoading     = document.getElementById('iconLoading');
const playerTitle     = document.getElementById('playerTitle');
const playerChannel   = document.getElementById('playerChannel');
const playerThumbImg  = document.getElementById('playerThumbImg');
const artworkViz      = document.getElementById('artworkViz');
const progressArea    = document.getElementById('progressArea');
const progressFill    = document.getElementById('progressFill');
const volumeSlider    = document.getElementById('volumeSlider');
const bgPlayBadge     = document.getElementById('bgPlayBadge');

// Now Playing panel
const nowPlayingPanel = document.getElementById('nowPlayingPanel');
const npBgBlur        = document.getElementById('npBgBlur');
const npArtwork       = document.getElementById('npArtwork');
const npArtworkGlow   = document.getElementById('npArtworkGlow');
const npViz           = document.getElementById('npViz');
const npTitle         = document.getElementById('npTitle');
const npChannel       = document.getElementById('npChannel');
const npProgressArea  = document.getElementById('npProgressArea');
const npProgressFill  = document.getElementById('npProgressFill');
const npProgressThumb = document.getElementById('npProgressThumb');
const npTimeCurrent   = document.getElementById('npTimeCurrent');
const npTimeDuration  = document.getElementById('npTimeDuration');
const npBtnPlay       = document.getElementById('npBtnPlay');
const npBtnPrev       = document.getElementById('npBtnPrev');
const npBtnNext       = document.getElementById('npBtnNext');
const npBtnLoop       = document.getElementById('npBtnLoop');
const npBtnShuffle    = document.getElementById('npBtnShuffle');
const npBtnVideoMode  = document.getElementById('npBtnVideoMode');
const npVideoModeText = document.getElementById('npVideoModeText');
const npBtnPlaylist   = document.getElementById('npBtnPlaylist');
const npBtnDownload   = document.getElementById('npBtnDownload');
const npIconPlay      = document.getElementById('npIconPlay');
const npIconPause     = document.getElementById('npIconPause');
const npIconLoading   = document.getElementById('npIconLoading');
const npVolumeSlider  = document.getElementById('npVolumeSlider');
const npQueueList     = document.getElementById('npQueueList');
const npRelatedList   = document.getElementById('npRelatedList');
const npCloseBtn          = document.getElementById('npCloseBtn');
const tabQueue            = document.getElementById('tabQueue');
const tabRelated          = document.getElementById('tabRelated');
const npBtnAutoplay       = document.getElementById('npBtnAutoplay');
const recommendedSection  = document.getElementById('recommendedSection');
const recommendedSubtitle = document.getElementById('recommendedSubtitle');
const recommendedGrid     = document.getElementById('recommendedGrid');
const refreshRecBtn       = document.getElementById('refreshRecommendationsBtn');


// Playlist
const playlistModal       = document.getElementById('playlistModal');
const modalCloseBtn       = document.getElementById('modalCloseBtn');
const newPlaylistName     = document.getElementById('newPlaylistName');
const createPlaylistBtn   = document.getElementById('createPlaylistBtn');
const playlistPickerList  = document.getElementById('playlistPickerList');
const createPlaylistModal = document.getElementById('createPlaylistModal');
const createModalCloseBtn = document.getElementById('createModalCloseBtn');
const newPlaylistNameMain = document.getElementById('newPlaylistNameMain');
const createPlaylistMainBtn = document.getElementById('createPlaylistMainBtn');
const addPlaylistBtn      = document.getElementById('addPlaylistBtn');
const playlistSidebarList = document.getElementById('playlistSidebarList');
const playlistTrackList   = document.getElementById('playlistTrackList');
const playlistEmpty       = document.getElementById('playlistEmpty');
const plViewTitle         = document.getElementById('plViewTitle');
const plViewCount         = document.getElementById('plViewCount');
const playAllBtn          = document.getElementById('playAllBtn');
const deletePlBtn         = document.getElementById('deletePlBtn');

// Other
const searchForm     = document.getElementById('searchForm');
const searchInput    = document.getElementById('searchInput');
const searchBtn      = document.getElementById('searchBtn');
const searchFormPage = document.getElementById('searchFormPage');
const searchInputPage= document.getElementById('searchInputPage');
const searchBtnPage  = document.getElementById('searchBtnPage');
const searchStatusBar= document.getElementById('searchStatusBar');
const searchStatusText= document.getElementById('searchStatusText');
const searchResultsMeta = document.getElementById('searchResultsMeta');
const resultsTitle   = document.getElementById('resultsTitle');
const resultsCount   = document.getElementById('resultsCount');
const resultsGrid    = document.getElementById('resultsGrid');
const clearQueueBtn  = document.getElementById('clearQueueBtn');
const queueList      = document.getElementById('queueList');
const queueEmpty     = document.getElementById('queueEmpty');
const queueBadge     = document.getElementById('queueCountBadge');
const toast          = document.getElementById('toast');
const toastTitle     = document.getElementById('toastTitle');
const toastMsg       = document.getElementById('toastMsg');
const menuBtn        = document.getElementById('menuBtn');
const sidebar        = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');
const sidebarCloseBtn = document.getElementById('sidebarCloseBtn');
const navHome        = document.getElementById('navHome');
const navQueue       = document.getElementById('navQueue');
const shareBar       = document.getElementById('shareBar');
const shareUrlInput  = document.getElementById('shareUrl');
const copyShareBtn   = document.getElementById('copyShareBtn');
const shareHint      = document.getElementById('shareHint');

// Auth & Mobile UI
const splashScreen   = document.getElementById('splashScreen');
const authModal      = document.getElementById('authModal');
const authForm       = document.getElementById('authForm');
const authEmail      = document.getElementById('authEmail');
const authPassword   = document.getElementById('authPassword');
const authNameGroup  = document.getElementById('authNameGroup');
const authName       = document.getElementById('authName');
const authSubmitBtn  = document.getElementById('authSubmitBtn');
const authSwitchPrompt = document.getElementById('authSwitchPrompt');
const authSwitchBtn  = document.getElementById('authSwitchBtn');
const bNavAuth       = document.getElementById('bNavAuth');
const bNavLoginText  = document.getElementById('bNavLoginText');
const headerSignInBtn = document.getElementById('headerSignInBtn');
const userAvatarBtn  = document.getElementById('userAvatarBtn');
const userAvatarText = document.getElementById('userAvatarText');
const bottomNav      = document.getElementById('bottomNav');
const bNavHome       = document.getElementById('bNavHome');
const bNavCol        = document.getElementById('bNavCol');

// ── State ────────────────────────────────────────────────────────────
let currentTrack   = null;
let queue          = [];
let isLoopOn       = false;
let isShuffleOn    = false;
let isVideoMode    = localStorage.getItem('wuntube_video_mode') !== '0';
let isAutoplayRelated = localStorage.getItem('wuntube_autoplay') !== '0';
let isSeeking      = false;
let currentResults = [];
let upNextRecommendations = [];
let homeRecommendations = [];
let recentTracks   = JSON.parse(localStorage.getItem('wuntube_recent_tracks') || '[]');
const playedSessionIds = new Set();
let activeView     = 'home';
let currentPlaylistId = null;
let npActiveTab    = 'queue';
let pendingPlaylistTrack = null;
let toastTimer     = null;
let currentUser    = null;
let isRegisterMode = false;
let serverHasYtDlp = null;
let useYtFallback  = false;
let ytPlayer       = null;
let ytApiPromise   = null;
let ytProgressTimer = null;
let ytPendingTrack = null;
let ytFallbackNotified = false;
let consecutiveAudioErrors = 0;
let recFetchController = null;
let capabilitiesResolve = null;
const capabilitiesPromise = new Promise(resolve => { capabilitiesResolve = resolve; });


// ── Playlists (localStorage) ─────────────────────────────────────────
let playlists = JSON.parse(localStorage.getItem('wuntube_playlists') || '[]');

function savePlaylists() {
  localStorage.setItem('wuntube_playlists', JSON.stringify(playlists));
}

function createPlaylist(name) {
  if (!name.trim()) return null;
  const pl = { id: Date.now().toString(), name: name.trim(), tracks: [] };
  playlists.push(pl);
  savePlaylists();
  renderSidebarPlaylists();
  return pl;
}

function deletePlaylist(id) {
  playlists = playlists.filter(p => p.id !== id);
  savePlaylists();
  renderSidebarPlaylists();
}

function addTrackToPlaylist(playlistId, track) {
  const pl = playlists.find(p => p.id === playlistId);
  if (!pl) return false;
  if (pl.tracks.find(t => t.videoId === track.videoId)) return false;
  pl.tracks.push(track);
  savePlaylists();
  renderSidebarPlaylists();
  return true;
}

function removeTrackFromPlaylist(playlistId, videoId) {
  const pl = playlists.find(p => p.id === playlistId);
  if (!pl) return;
  pl.tracks = pl.tracks.filter(t => t.videoId !== videoId);
  savePlaylists();
}

function renderSidebarPlaylists() {
  playlistSidebarList.innerHTML = '';
  if (!playlists.length) {
    const empty = document.createElement('div');
    empty.className = 'queue-empty';
    empty.style.padding = '16px 12px';
    empty.style.fontSize = '.8rem';
    empty.textContent = 'ยังไม่มี Playlist — กด + เพื่อสร้าง';
    playlistSidebarList.appendChild(empty);
    return;
  }
  playlists.forEach(pl => {
    const item = document.createElement('div');
    item.className = 'pl-sidebar-item' + (currentPlaylistId === pl.id ? ' active' : '');
    item.innerHTML = `
      <div class="pl-sidebar-icon"><svg viewBox="0 0 24 24" fill="none"><line x1="8" y1="6" x2="21" y2="6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="8" y1="12" x2="21" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="8" y1="18" x2="16" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></div>
      <div class="pl-sidebar-name">${esc(pl.name)}</div>
      <div class="pl-sidebar-count">${pl.tracks.length}</div>
    `;
    item.addEventListener('click', () => {
      showView('playlist', null, pl.id);
      closeSidebar();
    });
    playlistSidebarList.appendChild(item);
  });
}

// ── View Management ───────────────────────────────────────────────────
function showView(view, e, playlistId = null) {
  if (e) e.preventDefault();
  activeView = view;
  closeSidebar();

  // Reset nav
  [navHome, navQueue].forEach(n => { if(n) n.classList.remove('active'); });
  const bNavHome = document.getElementById('bNavHome');
  const bNavCol  = document.getElementById('bNavCol');
  const bNavSearch = document.getElementById('bNavSearch');
  [bNavHome, bNavCol, bNavSearch].forEach(n => { if(n) n.classList.remove('active'); });
  document.querySelectorAll('.pl-sidebar-item').forEach(el => el.classList.remove('active'));

  document.getElementById('viewHome').classList.add('hidden');
  document.getElementById('viewQueue').classList.add('hidden');
  document.getElementById('viewPlaylist').classList.add('hidden');
  document.getElementById('viewSearch').classList.add('hidden');

  if (view === 'home') {
    navHome.classList.add('active');
    if(bNavHome) bNavHome.classList.add('active');
    document.getElementById('viewHome').classList.remove('hidden');
  } else if (view === 'search') {
    if(bNavSearch) bNavSearch.classList.add('active');
    document.getElementById('viewSearch').classList.remove('hidden');
  } else if (view === 'queue') {
    navQueue.classList.add('active');
    if(bNavCol) bNavCol.classList.add('active');
    document.getElementById('viewQueue').classList.remove('hidden');
    renderQueueList();
  } else if (view === 'playlist' && playlistId) {
    currentPlaylistId = playlistId;
    if(bNavCol) bNavCol.classList.add('active');
    document.getElementById('viewPlaylist').classList.remove('hidden');
    renderPlaylistView(playlistId);
    renderSidebarPlaylists();
  }
}

function renderPlaylistView(id) {
  const pl = playlists.find(p => p.id === id);
  if (!pl) return;
  plViewTitle.textContent = pl.name;
  plViewCount.textContent = `${pl.tracks.length} เพลง`;
  playlistTrackList.innerHTML = '';

  if (!pl.tracks.length) {
    playlistEmpty.classList.remove('hidden');
    return;
  }
  playlistEmpty.classList.add('hidden');

  pl.tracks.forEach((track, i) => {
    const item = document.createElement('div');
    item.className = 'queue-item' + (currentTrack?.videoId === track.videoId ? ' active' : '');
    item.style.animationDelay = `${i * 0.04}s`;
    item.innerHTML = `
      <span class="queue-num">${i + 1}</span>
      <img class="queue-img" src="${esc(track.thumbnail || `https://img.youtube.com/vi/${track.videoId}/hqdefault.jpg`)}" alt="" loading="lazy"/>
      <div class="queue-info">
        <div class="queue-title">${esc(track.title)}</div>
        <div class="queue-ch">${esc(track.channel || '')}</div>
      </div>
      <button class="queue-remove" title="ลบออกจาก Playlist" onclick="event.stopPropagation();removeFromPl('${esc(id)}','${esc(track.videoId)}')">
        <svg viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
      </button>
    `;
    item.querySelector('.queue-info').addEventListener('click', () => {
      // Load playlist into queue and play this track
      queue = [...pl.tracks];
      updateQueueBadge();
      currentTrack = track;
      loadAndPlay(track);
    });
    playlistTrackList.appendChild(item);
  });
}

function removeFromPl(plId, videoId) {
  removeTrackFromPlaylist(plId, videoId);
  renderPlaylistView(plId);
  plViewCount.textContent = `${playlists.find(p => p.id === plId)?.tracks.length || 0} เพลง`;
  renderSidebarPlaylists();
}

playAllBtn.addEventListener('click', () => {
  const pl = playlists.find(p => p.id === currentPlaylistId);
  if (!pl || !pl.tracks.length) return;
  queue = [...pl.tracks];
  updateQueueBadge();
  if (isShuffleOn) shuffleQueue();
  currentTrack = queue[0];
  loadAndPlay(queue[0]);
});

deletePlBtn.addEventListener('click', () => {
  if (!currentPlaylistId) return;
  if (!confirm('ลบ Playlist นี้?')) return;
  deletePlaylist(currentPlaylistId);
  currentPlaylistId = null;
  showView('home');
});

// ── Playlist Modal ────────────────────────────────────────────────────
function openPlaylistModal(track) {
  pendingPlaylistTrack = track;
  renderPlaylistPicker();
  playlistModal.classList.remove('hidden');
  newPlaylistName.focus();
}

function renderPlaylistPicker() {
  playlistPickerList.innerHTML = '';
  playlists.forEach(pl => {
    const item = document.createElement('div');
    item.className = 'pl-pick-item';
    const alreadyIn = pl.tracks.find(t => t.videoId === pendingPlaylistTrack?.videoId);
    item.innerHTML = `
      <div class="pl-pick-icon"><svg viewBox="0 0 24 24" fill="none"><line x1="8" y1="6" x2="21" y2="6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="8" y1="12" x2="21" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></div>
      <div>
        <div class="pl-pick-name">${esc(pl.name)} ${alreadyIn ? '✓' : ''}</div>
        <div class="pl-pick-count">${pl.tracks.length} เพลง</div>
      </div>
    `;
    if (!alreadyIn) {
      item.addEventListener('click', () => {
        if (addTrackToPlaylist(pl.id, pendingPlaylistTrack)) {
          showBriefToast(`✓ เพิ่มใน "${pl.name}" แล้ว`);
        }
        closePlaylistModal();
      });
    } else {
      item.style.opacity = '.5';
      item.style.cursor = 'default';
    }
    playlistPickerList.appendChild(item);
  });
  if (!playlists.length) {
    playlistPickerList.innerHTML = '<div class="queue-empty" style="padding:12px 0;font-size:.82rem">ยังไม่มี Playlist — สร้างใหม่ด้านบน</div>';
  }
}

function closePlaylistModal() {
  playlistModal.classList.add('hidden');
  newPlaylistName.value = '';
}

modalCloseBtn.addEventListener('click', closePlaylistModal);
playlistModal.addEventListener('click', (e) => { if (e.target === playlistModal) closePlaylistModal(); });

createPlaylistBtn.addEventListener('click', () => {
  const name = newPlaylistName.value.trim();
  if (!name) return;
  const pl = createPlaylist(name);
  if (pl && pendingPlaylistTrack) {
    addTrackToPlaylist(pl.id, pendingPlaylistTrack);
    showBriefToast(`✓ สร้าง "${pl.name}" และเพิ่มเพลงแล้ว`);
  }
  closePlaylistModal();
});

newPlaylistName.addEventListener('keydown', (e) => { if (e.key === 'Enter') createPlaylistBtn.click(); });

// Create playlist from sidebar
addPlaylistBtn.addEventListener('click', () => {
  createPlaylistModal.classList.remove('hidden');
  newPlaylistNameMain.focus();
});
createModalCloseBtn.addEventListener('click', () => { createPlaylistModal.classList.add('hidden'); newPlaylistNameMain.value = ''; });
createPlaylistModal.addEventListener('click', (e) => { if (e.target === createPlaylistModal) { createPlaylistModal.classList.add('hidden'); newPlaylistNameMain.value = ''; } });
createPlaylistMainBtn.addEventListener('click', () => {
  const name = newPlaylistNameMain.value.trim();
  if (!name) return;
  createPlaylist(name);
  showBriefToast(`✓ สร้าง Playlist "${name}" แล้ว`);
  createPlaylistModal.classList.add('hidden');
  newPlaylistNameMain.value = '';
});
newPlaylistNameMain.addEventListener('keydown', (e) => { if (e.key === 'Enter') createPlaylistMainBtn.click(); });

// NP panel playlist/download btn
npBtnPlaylist.addEventListener('click', () => { if (currentTrack) openPlaylistModal(currentTrack); });
npBtnDownload.addEventListener('click', () => { if (currentTrack) downloadTrack(currentTrack.videoId, currentTrack.title); });

// ── Sidebar toggle ────────────────────────────────────────────────────
menuBtn.addEventListener('click', () => {
  if (window.innerWidth > 768) {
    document.body.classList.toggle('guide-collapsed');
  } else if (sidebar.classList.contains('open')) {
    closeSidebar();
  } else {
    openSidebar();
  }
});
sidebarCloseBtn.addEventListener('click', closeSidebar);
sidebarOverlay.addEventListener('click', closeSidebar);
function openSidebar() { sidebar.classList.add('open'); sidebarOverlay.classList.add('open'); }
function closeSidebar() { sidebar.classList.remove('open'); sidebarOverlay.classList.remove('open'); }

function scrollToRecommended(e) {
  if (e) e.preventDefault();
  showView('home');
  closeSidebar();
  setTimeout(() => {
    const el = document.getElementById('recommendedSection');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 60);
}

// ── Search ────────────────────────────────────────────────────────────
searchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const q = searchInput.value.trim();
  if (q) performSearch(q);
});

// Search form on results page
searchFormPage.addEventListener('submit', (e) => {
  e.preventDefault();
  const q = searchInputPage.value.trim();
  if (q) performSearch(q);
});

function selectCategoryChip(el, query) {
  document.querySelectorAll('.yt-chip').forEach(c => c.classList.remove('active'));
  if (el) el.classList.add('active');
  if (!query) {
    if (activeView !== 'home') showView('home');
    fetchHomeRecommendations(true);
    return;
  }
  searchInput.value = query;
  performSearch(query);
}

function quickSearch(el) {
  const text = el.textContent.replace(/^[\p{Emoji}\s]+/u, '').trim();
  searchInput.value = text;
  performSearch(text);
}

async function performSearch(query) {
  // Navigate to search results page immediately
  showView('search');
  searchInputPage.value = query;
  searchInput.value = query;

  // Show loading
  searchStatusBar.classList.remove('hidden');
  searchStatusText.textContent = `กำลังค้นหา "${query}"...`;
  searchResultsMeta.classList.add('hidden');
  resultsGrid.innerHTML = '';
  if(searchBtnPage) searchBtnPage.disabled = true;
  if(searchBtn) searchBtn.disabled = true;

  try {
    const res = await fetch(`${API}/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    currentResults = data.results || [];
    renderResults(query, currentResults);
  } catch (err) {
    searchStatusBar.classList.remove('hidden');
    searchStatusText.textContent = `❌ เกิดข้อผิดพลาด: ${err.message}`;
  } finally {
    if(searchBtnPage) searchBtnPage.disabled = false;
    if(searchBtn) searchBtn.disabled = false;
  }
}

function renderResults(query, results) {
  searchStatusBar.classList.add('hidden');
  resultsGrid.innerHTML = '';
  if (!results.length) {
    searchStatusBar.classList.remove('hidden');
    searchStatusText.textContent = `ไม่พบผลลัพธ์สำหรับ "${query}"`;
    return;
  }
  resultsTitle.textContent = `"${query}"`;
  resultsCount.textContent = `${results.length} รายการ`;
  searchResultsMeta.classList.remove('hidden');
  results.forEach((item, i) => resultsGrid.appendChild(createTrackRow(item, i)));
  if (currentTrack) highlightPlayingCard(currentTrack.videoId);
  if (!upNextRecommendations.length) {
    renderNpRelated(results);
  }
}

const YT_AVATAR_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'];

function getChannelAvatarHtml(channelName) {
  const name = (channelName || 'Y').trim();
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
  }
  const color = YT_AVATAR_COLORS[Math.abs(hash) % YT_AVATAR_COLORS.length];
  const initial = Array.from(name)[0]?.toUpperCase() || 'Y';
  return `<span class="yt-ch-avatar" style="background:${color}" aria-hidden="true">${esc(initial)}</span>`;
}

// ── Track Row (YouTube search result style) ───────────────────────────
function createTrackRow(item, index) {
  const row = document.createElement('div');
  row.className = 'track-row' + (currentTrack?.videoId === item.videoId ? ' playing' : '');
  row.id = `card-${item.videoId}`;
  row.style.animationDelay = `${Math.min(index * 0.03, 0.6)}s`;
  const thumb = item.thumbnail || `https://img.youtube.com/vi/${item.videoId}/hqdefault.jpg`;
  const isPlaying = currentTrack?.videoId === item.videoId;
  const durHtml = (item.duration && item.duration !== 'N/A')
    ? `<span class="track-thumb-dur">${esc(item.duration)}</span>`
    : '';
  row.innerHTML = `
    <span class="track-num">${index + 1}</span>
    <div class="track-eq"><span></span><span></span><span></span></div>
    <div class="track-thumb-wrap">
      <img class="track-thumb" src="${esc(thumb)}" alt=""
           onerror="this.src='https://img.youtube.com/vi/${esc(item.videoId)}/hqdefault.jpg'" loading="lazy"/>
      ${durHtml}
    </div>
    <div class="track-info">
      <div class="track-title" title="${esc(item.title)}">${esc(item.title)}</div>
      <div class="track-channel">
        ${getChannelAvatarHtml(item.channel || 'YouTube')}
        <span>${esc(item.channel || 'YouTube')}</span>
      </div>
    </div>
    ${item.duration ? `<span class="track-duration">${esc(item.duration)}</span>` : ''}
    <div class="track-actions">
      <button class="track-play-btn${isPlaying ? ' active' : ''}" id="playbtn-${esc(item.videoId)}">
        <svg viewBox="0 0 24 24" fill="none"><polygon points="5 3 19 12 5 21 5 3" fill="currentColor"/></svg>
        <span>${isPlaying ? 'กำลังเล่น' : 'เล่น'}</span>
      </button>
      <button class="track-icon-btn btn-add-queue" title="+ คิวเพลง">
        <svg viewBox="0 0 24 24" fill="none"><line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>
      </button>
      <button class="track-icon-btn btn-add-playlist" title="เพิ่มใน Playlist">
        <svg viewBox="0 0 24 24" fill="none"><line x1="8" y1="6" x2="21" y2="6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="8" y1="12" x2="21" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="8" y1="18" x2="16" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
      </button>
      <button class="track-icon-btn btn-download" id="dl-${esc(item.videoId)}" title="ดาวน์โหลด MP3">
        <svg viewBox="0 0 24 24" fill="none"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><polyline points="7 10 12 15 17 10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
      </button>
    </div>
  `;

  row.addEventListener('click', () => playTrack(item));

  row.querySelector('.track-play-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    playTrack(item);
  });
  row.querySelector('.btn-add-queue').addEventListener('click', (e) => {
    e.stopPropagation();
    addToQueue(item, true);
  });
  row.querySelector('.btn-add-playlist').addEventListener('click', (e) => {
    e.stopPropagation();
    openPlaylistModal(item);
  });
  row.querySelector('.btn-download').addEventListener('click', (e) => {
    e.stopPropagation();
    downloadTrack(item.videoId, item.title);
  });

  return row;
}

// Keep createCard as alias for backward compat
function createCard(item, index) { return createTrackRow(item, index); }

function highlightPlayingCard(videoId) {
  document.querySelectorAll('.track-row.playing, .card.playing, .curated-card.playing').forEach(c => {
    c.classList.remove('playing');
    const btn = c.querySelector('.track-play-btn, .play-btn');
    if (btn) { btn.classList.remove('active'); const s = btn.querySelector('span'); if(s) s.textContent = 'เล่น'; }
  });
  const card = document.getElementById(`card-${videoId}`);
  if (card) {
    card.classList.add('playing');
    const btn = card.querySelector('.track-play-btn, .play-btn');
    if (btn) { btn.classList.add('active'); const s = btn.querySelector('span'); if(s) s.textContent = 'กำลังเล่น'; }
    card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
  document.querySelectorAll(`.curated-card[data-videoid="${CSS.escape(videoId)}"]`).forEach(el => {
    el.classList.add('playing');
  });
}


// ── Play & Recommendations Engine ────────────────────────────────────
function saveRecentTrack(track) {
  if (!track || !track.videoId) return;
  const entry = {
    videoId: track.videoId,
    title: track.title || '',
    channel: track.channel || '',
    duration: track.duration || '',
    thumbnail: track.thumbnail || `https://img.youtube.com/vi/${track.videoId}/hqdefault.jpg`,
  };
  recentTracks = [entry, ...recentTracks.filter(t => t.videoId !== entry.videoId)].slice(0, 30);
  localStorage.setItem('wuntube_recent_tracks', JSON.stringify(recentTracks));
}

function getExcludeIdList(extra = []) {
  const ids = new Set(extra);
  playedSessionIds.forEach(id => ids.add(id));
  queue.slice(-20).forEach(t => { if (t?.videoId) ids.add(t.videoId); });
  return Array.from(ids).slice(-35);
}

async function fetchUpNextRecommendations(track) {
  if (!track?.videoId) return [];
  if (recFetchController) recFetchController.abort();
  recFetchController = new AbortController();

  try {
    const exclude = getExcludeIdList([track.videoId]).join(',');
    const res = await fetch(
      `${API}/recommendations?videoId=${encodeURIComponent(track.videoId)}&exclude=${encodeURIComponent(exclude)}`,
      { signal: recFetchController.signal }
    );
    if (!res.ok) return [];
    const data = await res.json();
    const list = Array.isArray(data.recommendations) ? data.recommendations : [];
    upNextRecommendations = list;
    renderNpRelated(upNextRecommendations);
    return list;
  } catch (err) {
    if (err.name !== 'AbortError') console.warn('Recommendations fetch failed:', err);
    return [];
  }
}

async function fetchHomeRecommendations(forceRefresh = false) {
  if (!recommendedGrid) return;
  if (refreshRecBtn) refreshRecBtn.classList.add('spinning');

  try {
    const seeds = recentTracks.slice(0, 8).map(t => t.videoId).join(',');
    const exclude = forceRefresh
      ? homeRecommendations.map(t => t.videoId).slice(0, 20).join(',')
      : '';
    const headers = {};
    const token = localStorage.getItem('wuntube_token');
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const url = `${API}/recommendations?seeds=${encodeURIComponent(seeds)}&exclude=${encodeURIComponent(exclude)}`;
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    homeRecommendations = Array.isArray(data.recommendations) ? data.recommendations : [];

    if (recommendedSubtitle) {
      recommendedSubtitle.textContent = data.source === 'personalized'
        ? 'คัดสรรจากแนวเพลงที่คุณฟัง · เล่นต่อเนื่องหลากหลายศิลปิน'
        : 'วิดีโอยอดนิยมบน YouTube · กดเล่นเพื่อปรับแต่งแนวเพลงของคุณ';
    }

    renderHomeRecommendations(homeRecommendations);
  } catch (err) {
    console.warn('Home recommendations failed:', err);
    if (!homeRecommendations.length) {
      recommendedGrid.innerHTML = '<div class="queue-empty" style="grid-column: 1 / -1; padding: 20px 0;">ไม่สามารถโหลดรายการแนะนำได้ในขณะนี้</div>';
    }
  } finally {
    if (refreshRecBtn) refreshRecBtn.classList.remove('spinning');
  }
}

function renderHomeRecommendations(tracks) {
  if (!recommendedGrid) return;
  recommendedGrid.innerHTML = '';

  if (!tracks.length) {
    recommendedGrid.innerHTML = '<div class="queue-empty" style="grid-column: 1 / -1; padding: 20px 0;">ยังไม่มีรายการแนะนำ — ลองค้นหาและฟังเพลงดูก่อน</div>';
    return;
  }

  tracks.forEach((track) => {
    const isPlaying = currentTrack?.videoId === track.videoId;
    const card = document.createElement('div');
    card.className = 'curated-card' + (isPlaying ? ' playing' : '');
    card.dataset.videoid = track.videoId;

    const thumb = track.thumbnail || `https://img.youtube.com/vi/${track.videoId}/hqdefault.jpg`;
    const durBadge = (track.duration && track.duration !== 'N/A')
      ? `<span class="curated-duration">${esc(track.duration)}</span>`
      : '';

    card.innerHTML = `
      <div class="curated-thumb">
        <img src="${esc(thumb)}" alt="" loading="lazy" onerror="this.src='https://img.youtube.com/vi/${esc(track.videoId)}/hqdefault.jpg'" />
        ${durBadge}
        <div class="curated-play-pill">
          <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="6 4 20 12 6 20 6 4"/></svg>
        </div>
      </div>
      <div class="yt-card-body">
        ${getChannelAvatarHtml(track.channel || 'YouTube')}
        <div class="curated-info">
          <p class="curated-title" title="${esc(track.title)}">${esc(track.title)}</p>
          <div class="curated-meta-row">
            <p class="curated-sub">${esc(track.channel || 'YouTube')}</p>
            <button type="button" class="curated-q-btn" title="เพิ่มลงคิว">+ คิว</button>
          </div>
        </div>
      </div>
    `;

    card.addEventListener('click', () => playTrack(track));
    card.querySelector('.curated-q-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      addToQueue(track, true);
    });
    recommendedGrid.appendChild(card);
  });
}

function updateAutoplayToggleUI() {
  if (!npBtnAutoplay) return;
  npBtnAutoplay.classList.toggle('active', isAutoplayRelated);
  npBtnAutoplay.title = isAutoplayRelated
    ? 'เล่นวิดีโอที่คุณอาจจะชอบอัตโนมัติ: เปิด'
    : 'เล่นวิดีโอที่คุณอาจจะชอบอัตโนมัติ: ปิด';
}

if (npBtnAutoplay) {
  updateAutoplayToggleUI();
  npBtnAutoplay.addEventListener('click', () => {
    isAutoplayRelated = !isAutoplayRelated;
    localStorage.setItem('wuntube_autoplay', isAutoplayRelated ? '1' : '0');
    updateAutoplayToggleUI();
    showBriefToast(isAutoplayRelated ? '✨ เปิดเล่นวิดีโอแนะนำอัตโนมัติ' : '⏸ ปิดเล่นวิดีโอแนะนำอัตโนมัติ');
  });
}

if (refreshRecBtn) {
  refreshRecBtn.addEventListener('click', () => fetchHomeRecommendations(true));
}

function ensureYouTubeIframeAPI() {
  if (ytApiPromise) return ytApiPromise;
  ytApiPromise = new Promise((resolve) => {
    if (window.YT && window.YT.Player) {
      resolve(window.YT);
      return;
    }
    const prevReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (typeof prevReady === 'function') prevReady();
      resolve(window.YT);
    };
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);
  });
  return ytApiPromise;
}

function stopYtProgressTimer() {
  if (ytProgressTimer) {
    clearInterval(ytProgressTimer);
    ytProgressTimer = null;
  }
}

function startYtProgressTimer() {
  stopYtProgressTimer();
  ytProgressTimer = setInterval(() => {
    if (!useYtFallback || isSeeking || !ytPlayer || typeof ytPlayer.getDuration !== 'function') return;
    const dur = ytPlayer.getDuration() || 0;
    const cur = ytPlayer.getCurrentTime() || 0;
    if (!dur) return;
    const pct = Math.min(100, (cur / dur) * 100);
    progressFill.style.width = `${pct}%`;
    npProgressFill.style.width = `${pct}%`;
    npProgressThumb.style.setProperty('--pct', `${pct}%`);
    npTimeCurrent.textContent = formatTime(cur);
    npTimeDuration.textContent = formatTime(dur);
  }, 400);
}

async function playViaYouTubeFallback(track) {
  useYtFallback = true;
  audio.pause();
  if (!ytFallbackNotified) {
    ytFallbackNotified = true;
    showBriefToast('▶ เล่นผ่านโหมด YouTube Player (เซิร์ฟเวอร์ไม่มี yt-dlp)');
  }

  const YT = await ensureYouTubeIframeAPI();
  if (currentTrack?.videoId !== track.videoId) return;

  if (!ytPlayer) {
    ytPendingTrack = track;
    ytPlayer = new YT.Player('ytFallbackHost', {
      height: '2',
      width: '2',
      videoId: track.videoId,
      playerVars: {
        autoplay: 1,
        controls: 0,
        disablekb: 1,
        playsinline: 1,
        rel: 0,
      },
      events: {
        onReady: (ev) => {
          ev.target.setVolume(Number(volumeSlider.value || 100));
          if (ytPendingTrack) {
            ev.target.loadVideoById(ytPendingTrack.videoId);
            ytPendingTrack = null;
          }
        },
        onStateChange: (ev) => {
          if (!useYtFallback) return;
          if (ev.data === YT.PlayerState.PLAYING) {
            consecutiveAudioErrors = 0;
            setPlayerState('playing');
            artworkViz.classList.add('active');
            npViz.classList.add('active');
            bgPlayBadge.classList.remove('hidden');
            updateMediaSessionState('playing');
            startYtProgressTimer();
          } else if (ev.data === YT.PlayerState.PAUSED) {
            setPlayerState('paused');
            artworkViz.classList.remove('active');
            npViz.classList.remove('active');
            updateMediaSessionState('paused');
            stopYtProgressTimer();
          } else if (ev.data === YT.PlayerState.BUFFERING) {
            setPlayerState('loading');
          } else if (ev.data === YT.PlayerState.ENDED) {
            artworkViz.classList.remove('active');
            npViz.classList.remove('active');
            stopYtProgressTimer();
            if (isLoopOn) { loadAndPlay(currentTrack); }
            else { autoplayNext(); }
          }
        },
        onError: () => {
          if (!useYtFallback) return;
          stopYtProgressTimer();
          setPlayerState('paused');
          consecutiveAudioErrors++;
          if (consecutiveAudioErrors <= 2) {
            setTimeout(() => autoplayNext(), 1200);
          } else {
            showBriefToast('⚠️ วิดีโอนี้ไม่สามารถเล่นแบบฝังได้ ลองเลือกเพลงอื่น');
          }
        },
      },
    });
  } else if (typeof ytPlayer.loadVideoById === 'function') {
    ytPlayer.setVolume(Number(volumeSlider.value || 100));
    ytPlayer.loadVideoById(track.videoId);
  }
}

function getActiveMediaEl() {
  return (isVideoMode && videoEl) ? videoEl : audio;
}

function stopMediaElement(el) {
  if (!el) return;
  try { el.pause(); } catch (_) {}
  if (el.getAttribute('src')) {
    el.removeAttribute('src');
    try { el.load(); } catch (_) {}
  }
}

function syncYtOverlayPosition() {
  if (!ytFallbackHost) return;
  const shouldShowStage = useYtFallback && isVideoMode && nowPlayingPanel && !nowPlayingPanel.classList.contains('hidden') && npArtworkWrap;
  if (!shouldShowStage) {
    ytFallbackHost.classList.remove('stage-active');
    ytFallbackHost.style.left = '';
    ytFallbackHost.style.top = '';
    ytFallbackHost.style.width = '';
    ytFallbackHost.style.height = '';
    return;
  }
  const rect = npArtworkWrap.getBoundingClientRect();
  if (rect.width < 20 || rect.height < 20) return;
  ytFallbackHost.classList.add('stage-active');
  ytFallbackHost.style.left = `${rect.left}px`;
  ytFallbackHost.style.top = `${rect.top}px`;
  ytFallbackHost.style.width = `${rect.width}px`;
  ytFallbackHost.style.height = `${rect.height}px`;
}

function syncVideoStageUI() {
  if (npBtnVideoMode) {
    npBtnVideoMode.classList.toggle('active', isVideoMode);
  }
  if (npVideoModeText) {
    npVideoModeText.textContent = isVideoMode ? 'โหมดวิดีโอ' : 'โหมดฟังเพลง';
  }
  if (videoEl) {
    const showHtmlVideo = isVideoMode && !useYtFallback;
    videoEl.classList.toggle('hidden', !showHtmlVideo);
  }
  syncYtOverlayPosition();
}

function playTrack(track) {
  if (typeof track === 'string') track = JSON.parse(track);

  if (currentTrack?.videoId === track.videoId) {
    if (isVideoMode && nowPlayingPanel.classList.contains('hidden')) {
      openNowPlaying();
      if (isActivePlayerPaused()) togglePlayPause();
    } else {
      togglePlayPause();
    }
    return;
  }
  currentTrack = track;
  consecutiveAudioErrors = 0;
  // Add to queue if not already there
  if (!queue.find(t => t.videoId === track.videoId)) queue.push(track);
  updateQueueBadge();
  if (isVideoMode && nowPlayingPanel.classList.contains('hidden')) {
    openNowPlaying();
  }
  loadAndPlay(track);
}

function loadStreamOnMedia(mediaEl, track, streamType, resumeAt = 0, allowVideoFallbackToAudio = true) {
  const targetId = track.videoId;
  const inactiveEl = mediaEl === videoEl ? audio : videoEl;
  stopMediaElement(inactiveEl);

  mediaEl.volume = Number(volumeSlider.value || 100) / 100;
  mediaEl.src = `${API}/stream?videoId=${encodeURIComponent(track.videoId)}&type=${streamType}`;
  mediaEl.load();

  let seekApplied = false;
  const onCanPlay = () => {
    mediaEl.removeEventListener('canplay', onCanPlay);
    if (useYtFallback || currentTrack?.videoId !== targetId || mediaEl !== getActiveMediaEl()) return;
    if (resumeAt > 0 && !seekApplied) {
      seekApplied = true;
      try { mediaEl.currentTime = resumeAt; } catch (_) {}
    }
    mediaEl.play().catch(err => {
      console.error('Play failed for videoId ' + track.videoId + ':', err);
      if (err.name === 'AbortError') return;
      if (err.name === 'NotAllowedError') {
        setPlayerState('paused');
        showBriefToast('⏸ กดปุ่ม ▶ เพื่อเริ่มเล่น');
      } else {
        setPlayerState('paused');
        if (++consecutiveAudioErrors <= 2) setTimeout(() => autoplayNext(), 1500);
      }
    });
  };
  mediaEl.addEventListener('canplay', onCanPlay);

  const onError = async () => {
    mediaEl.removeEventListener('canplay', onCanPlay);
    mediaEl.removeEventListener('error', onError);
    if (useYtFallback || currentTrack?.videoId !== targetId || mediaEl !== getActiveMediaEl()) return;
    setPlayerState('paused');

    try {
      const probe = await fetch(`${API}/stream?videoId=${encodeURIComponent(targetId)}&type=${streamType}`, { method: 'GET' });
      if (probe.status === 503) {
        serverHasYtDlp = false;
        playViaYouTubeFallback(track);
        syncVideoStageUI();
        return;
      }
    } catch (_) {}

    // If MP4 progressive video failed, fall back to audio-only stream or YouTube IFrame player
    if (streamType === 'video' && allowVideoFallbackToAudio) {
      console.warn('[video] Progressive MP4 unavailable, falling back to audio/YouTube stream:', targetId);
      loadStreamOnMedia(audio, track, 'audio', resumeAt, false);
      if (videoEl) videoEl.classList.add('hidden');
      return;
    }

    console.error('[media] Error loading track:', track.videoId);
    if (++consecutiveAudioErrors <= 2) {
      setTimeout(() => autoplayNext(), 1500);
    } else {
      showBriefToast('⚠️ ไม่สามารถเล่นวิดีโอนี้ได้');
    }
  };
  mediaEl.addEventListener('error', onError, { once: true });
}

async function loadAndPlay(track) {
  playerBar.classList.remove('hidden');
  // Mini player info
  playerTitle.textContent = track.title || '—';
  playerChannel.textContent = track.channel || '—';
  playerThumbImg.src = track.thumbnail || `https://img.youtube.com/vi/${track.videoId}/hqdefault.jpg`;
  progressFill.style.width = '0%';
  npProgressFill.style.width = '0%';
  npTimeCurrent.textContent = '0:00';
  npTimeDuration.textContent = '0:00';

  // Now Playing panel info
  npTitle.textContent = track.title || '—';
  npChannel.textContent = track.channel || '—';
  const thumb = track.thumbnail || `https://img.youtube.com/vi/${track.videoId}/hqdefault.jpg`;
  npArtwork.src = thumb;
  npBgBlur.style.backgroundImage = `url('${thumb}')`;

  setPlayerState('loading');

  playedSessionIds.add(track.videoId);
  saveRecentTrack(track);
  fetchUpNextRecommendations(track);

  // Record history if logged in
  if (currentUser) {
    fetch(`${API}/history`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('wuntube_token')}`
      },
      body: JSON.stringify({ videoId: track.videoId, title: track.title, channel: track.channel })
    }).catch(console.error);
  }

  highlightPlayingCard(track.videoId);
  updateQueueHighlight();
  renderNpQueue();
  setupMediaSession(track);

  // Wait briefly for initial /api/info capability check if not completed yet
  if (serverHasYtDlp === null) {
    await Promise.race([capabilitiesPromise, new Promise(r => setTimeout(r, 1500))]);
  }
  if (currentTrack?.videoId !== track.videoId) return;

  if (serverHasYtDlp === false) {
    stopMediaElement(audio);
    stopMediaElement(videoEl);
    playViaYouTubeFallback(track);
    syncVideoStageUI();
    return;
  }

  useYtFallback = false;
  stopYtProgressTimer();
  if (ytPlayer && typeof ytPlayer.pauseVideo === 'function') {
    try { ytPlayer.pauseVideo(); } catch (_) {}
  }

  syncVideoStageUI();
  loadStreamOnMedia(getActiveMediaEl(), track, isVideoMode ? 'video' : 'audio');
}

function getActiveDuration() {
  if (useYtFallback && ytPlayer && typeof ytPlayer.getDuration === 'function') {
    return ytPlayer.getDuration() || 0;
  }
  return getActiveMediaEl()?.duration || 0;
}

function getActiveCurrentTime() {
  if (useYtFallback && ytPlayer && typeof ytPlayer.getCurrentTime === 'function') {
    return ytPlayer.getCurrentTime() || 0;
  }
  return getActiveMediaEl()?.currentTime || 0;
}

function seekActivePlayer(seconds) {
  if (useYtFallback && ytPlayer && typeof ytPlayer.seekTo === 'function') {
    ytPlayer.seekTo(seconds, true);
  } else {
    const el = getActiveMediaEl();
    if (el) el.currentTime = seconds;
  }
}

function isActivePlayerPaused() {
  if (useYtFallback && ytPlayer && typeof ytPlayer.getPlayerState === 'function') {
    return ytPlayer.getPlayerState() !== 1;
  }
  return getActiveMediaEl()?.paused ?? true;
}

function togglePlayPause() {
  if (!currentTrack) return;
  if (useYtFallback && ytPlayer && typeof ytPlayer.playVideo === 'function') {
    isActivePlayerPaused() ? ytPlayer.playVideo() : ytPlayer.pauseVideo();
    return;
  }
  const el = getActiveMediaEl();
  if (!el) return;
  if (!el.getAttribute('src')) {
    loadStreamOnMedia(el, currentTrack, isVideoMode ? 'video' : 'audio');
    return;
  }
  el.paused ? el.play().catch(console.error) : el.pause();
}

// ── Media Element Events (shared for Audio & Video) ───────────────────
function attachMediaEvents(el) {
  if (!el) return;
  el.addEventListener('playing', () => {
    if (useYtFallback || el !== getActiveMediaEl()) return;
    consecutiveAudioErrors = 0;
    setPlayerState('playing');
    artworkViz.classList.add('active');
    npViz.classList.add('active');
    bgPlayBadge.classList.remove('hidden');
    updateMediaSessionState('playing');
  });
  el.addEventListener('pause', () => {
    if (useYtFallback || el !== getActiveMediaEl()) return;
    setPlayerState('paused');
    artworkViz.classList.remove('active');
    npViz.classList.remove('active');
    updateMediaSessionState('paused');
  });
  el.addEventListener('waiting', () => {
    if (!useYtFallback && el === getActiveMediaEl()) setPlayerState('loading');
  });
  el.addEventListener('canplay', () => {
    if (!useYtFallback && el === getActiveMediaEl() && !el.paused) setPlayerState('playing');
  });
  el.addEventListener('ended', () => {
    if (useYtFallback || el !== getActiveMediaEl()) return;
    artworkViz.classList.remove('active');
    npViz.classList.remove('active');
    if (isLoopOn) { loadAndPlay(currentTrack); }
    else { autoplayNext(); }
  });
  el.addEventListener('timeupdate', () => {
    if (useYtFallback || el !== getActiveMediaEl() || isSeeking || !el.duration) return;
    const pct = (el.currentTime / el.duration) * 100;
    progressFill.style.width = `${pct}%`;
    npProgressFill.style.width = `${pct}%`;
    npProgressThumb.style.setProperty('--pct', `${pct}%`);
    npTimeCurrent.textContent = formatTime(el.currentTime);
    npTimeDuration.textContent = formatTime(el.duration);
  });
}

attachMediaEvents(audio);
attachMediaEvents(videoEl);

async function pickNextRecommendedTrack() {
  const queuedIds = new Set(queue.map(t => t.videoId));
  let candidates = upNextRecommendations.filter(
    t => !playedSessionIds.has(t.videoId) && !queuedIds.has(t.videoId)
  );

  if (!candidates.length && currentTrack) {
    const fresh = await fetchUpNextRecommendations(currentTrack);
    candidates = fresh.filter(t => !playedSessionIds.has(t.videoId) && !queuedIds.has(t.videoId));
    if (!candidates.length) {
      candidates = fresh.filter(t => t.videoId !== currentTrack.videoId);
    }
  }

  if (!candidates.length) return null;

  // Prefer a different artist/channel from currentTrack so playback stays varied like YouTube Radio
  const currentCh = (currentTrack?.channel || '').trim().toLowerCase();
  const differentChannel = currentCh
    ? candidates.find(t => (t.channel || '').trim().toLowerCase() !== currentCh)
    : null;

  return differentChannel || candidates[0];
}

async function advancePlayback() {
  if (!queue.length) return;

  if (isShuffleOn) {
    const unplayedInQueue = queue.filter(t => !playedSessionIds.has(t.videoId));
    if (unplayedInQueue.length > 0) {
      const pick = unplayedInQueue[Math.floor(Math.random() * unplayedInQueue.length)];
      currentTrack = pick;
      loadAndPlay(pick);
      return;
    }
  } else {
    const idx = queue.findIndex(t => t.videoId === currentTrack?.videoId);
    if (idx >= 0 && idx < queue.length - 1) {
      const next = queue[idx + 1];
      currentTrack = next;
      loadAndPlay(next);
      return;
    }
  }

  // Reached end of explicit queue: play YouTube-style "วิดีโอที่คุณอาจจะชอบ" instead of repeating same artist
  if (isAutoplayRelated) {
    const rec = await pickNextRecommendedTrack();
    if (rec) {
      if (!queue.find(t => t.videoId === rec.videoId)) queue.push(rec);
      updateQueueBadge();
      currentTrack = rec;
      loadAndPlay(rec);
      showBriefToast(`✨ เล่นวิดีโอแนะนำ: ${truncate(rec.title, 26)}`);
      return;
    }
  }

  if (queue.length > 1) {
    const fallback = isShuffleOn
      ? queue[Math.floor(Math.random() * queue.length)]
      : queue[0];
    if (fallback) { currentTrack = fallback; loadAndPlay(fallback); }
  }
}

function autoplayNext() {
  return advancePlayback();
}

function playNextInQueue() {
  return advancePlayback();
}

function playPrevInQueue() {
  if (!queue.length) return;
  if (getActiveCurrentTime() > 3) { seekActivePlayer(0); return; }
  const idx = queue.findIndex(t => t.videoId === currentTrack?.videoId);
  const prev = idx > 0 ? queue[idx - 1] : queue[queue.length - 1];
  if (prev) { currentTrack = prev; loadAndPlay(prev); }
}

function shuffleQueue() {
  for (let i = queue.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [queue[i], queue[j]] = [queue[j], queue[i]];
  }
}

// ── Player Controls ───────────────────────────────────────────────────
btnPlay.addEventListener('click', togglePlayPause);
btnPrev.addEventListener('click', playPrevInQueue);
btnNext.addEventListener('click', playNextInQueue);

npBtnPlay.addEventListener('click', togglePlayPause);
npBtnPrev.addEventListener('click', playPrevInQueue);
npBtnNext.addEventListener('click', playNextInQueue);

npBtnLoop.addEventListener('click', () => {
  isLoopOn = !isLoopOn;
  npBtnLoop.classList.toggle('active', isLoopOn);
  npBtnLoop.title = isLoopOn ? 'เล่นซ้ำ: เปิด' : 'เล่นซ้ำ: ปิด';
});

npBtnShuffle.addEventListener('click', () => {
  isShuffleOn = !isShuffleOn;
  npBtnShuffle.classList.toggle('active', isShuffleOn);
  npBtnShuffle.title = isShuffleOn ? 'สุ่มเพลง: เปิด' : 'สุ่มเพลง: ปิด';
});

function applyVolume(val) {
  const num = Number(val);
  audio.volume = num / 100;
  if (videoEl) videoEl.volume = num / 100;
  if (ytPlayer && typeof ytPlayer.setVolume === 'function') {
    ytPlayer.setVolume(num);
  }
}
volumeSlider.addEventListener('input', () => { applyVolume(volumeSlider.value); npVolumeSlider.value = volumeSlider.value; });
npVolumeSlider.addEventListener('input', () => { applyVolume(npVolumeSlider.value); volumeSlider.value = npVolumeSlider.value; });
if (videoEl) videoEl.volume = Number(volumeSlider.value) / 100;

// ── Player State ──────────────────────────────────────────────────────
function setPlayerState(state) {
  // Mini bar
  [iconPlay, iconPause, iconLoading].forEach(el => el.classList.add('hidden'));
  // NP panel
  [npIconPlay, npIconPause, npIconLoading].forEach(el => el.classList.add('hidden'));

  if (state === 'playing') { iconPause.classList.remove('hidden'); npIconPause.classList.remove('hidden'); }
  else if (state === 'loading') { iconLoading.classList.remove('hidden'); npIconLoading.classList.remove('hidden'); }
  else { iconPlay.classList.remove('hidden'); npIconPlay.classList.remove('hidden'); }
}

// ── Video / Audio Stage Mode Toggle ───────────────────────────────────
function toggleVideoMode() {
  isVideoMode = !isVideoMode;
  localStorage.setItem('wuntube_video_mode', isVideoMode ? '1' : '0');
  syncVideoStageUI();
  showBriefToast(isVideoMode ? '🎬 เปิดโหมดเล่นวิดีโอแล้ว' : '🎵 เปลี่ยนเป็นโหมดฟังเพลงแล้ว');

  if (currentTrack && !useYtFallback) {
    const prevEl = isVideoMode ? audio : videoEl;
    const nextEl = getActiveMediaEl();
    const curTime = prevEl ? (prevEl.currentTime || 0) : 0;
    const wasPaused = prevEl ? prevEl.paused : true;
    stopMediaElement(prevEl);
    if (!wasPaused) {
      loadStreamOnMedia(nextEl, currentTrack, isVideoMode ? 'video' : 'audio', curTime, true);
    }
  }
}

if (npBtnVideoMode) {
  npBtnVideoMode.addEventListener('click', toggleVideoMode);
}
syncVideoStageUI();

// Keep YouTube video overlay aligned with #npArtworkWrap
window.addEventListener('resize', syncYtOverlayPosition);
if (typeof ResizeObserver !== 'undefined' && npArtworkWrap) {
  new ResizeObserver(syncYtOverlayPosition).observe(npArtworkWrap);
}

// ── Now Playing Panel ─────────────────────────────────────────────────
// Click on player body (not controls) → open NP panel
playerBodyClick.addEventListener('click', (e) => {
  if (!currentTrack) return;
  openNowPlaying();
});

function openNowPlaying() {
  nowPlayingPanel.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  renderNpQueue();
  syncVideoStageUI();
  requestAnimationFrame(syncYtOverlayPosition);
  setTimeout(syncYtOverlayPosition, 320);
}

function closeNowPlaying() {
  if (ytFallbackHost) {
    ytFallbackHost.classList.remove('stage-active');
    ytFallbackHost.style.top = '';
    ytFallbackHost.style.left = '';
    ytFallbackHost.style.width = '';
    ytFallbackHost.style.height = '';
  }
  nowPlayingPanel.classList.add('closing');
  setTimeout(() => {
    nowPlayingPanel.classList.add('hidden');
    nowPlayingPanel.classList.remove('closing');
    document.body.style.overflow = '';
    syncYtOverlayPosition();
  }, 300);
}

npCloseBtn.addEventListener('click', closeNowPlaying);

// NP panel progress bar seek
npProgressArea.addEventListener('mousedown', startNpSeek);
npProgressArea.addEventListener('touchstart', startNpSeek, { passive: true });

function startNpSeek(e) {
  isSeeking = true;
  npSeek(e);
  const moveFn = npSeek;
  const upFn = () => { isSeeking = false; document.removeEventListener('mousemove', moveFn); document.removeEventListener('touchmove', moveFn); document.removeEventListener('mouseup', upFn); document.removeEventListener('touchend', upFn); };
  document.addEventListener('mousemove', moveFn);
  document.addEventListener('touchmove', moveFn);
  document.addEventListener('mouseup', upFn);
  document.addEventListener('touchend', upFn);
}

function npSeek(e) {
  const dur = getActiveDuration();
  if (!dur) return;
  const rect = npProgressArea.getBoundingClientRect();
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  const t = pct * dur;
  npProgressFill.style.width = `${pct * 100}%`;
  npProgressThumb.style.setProperty('--pct', `${pct * 100}%`);
  progressFill.style.width = `${pct * 100}%`;
  npTimeCurrent.textContent = formatTime(t);
  seekActivePlayer(t);
}

// Mini bar seek
progressArea.addEventListener('click', (e) => {
  e.stopPropagation();
  const dur = getActiveDuration();
  if (!dur) return;
  const rect = progressArea.getBoundingClientRect();
  const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  seekActivePlayer(pct * dur);
});

// NP Queue Tab
function switchNpTab(tab) {
  npActiveTab = tab;
  tabQueue.classList.toggle('active', tab === 'queue');
  tabRelated.classList.toggle('active', tab === 'related');
  npQueueList.classList.toggle('hidden', tab !== 'queue');
  npRelatedList.classList.toggle('hidden', tab !== 'related');
}

function renderNpQueue() {
  npQueueList.innerHTML = '';
  if (!queue.length) {
    npQueueList.innerHTML = '<div class="queue-empty" style="padding:24px 0;font-size:.85rem">คิวว่าง — เพิ่มเพลงจากผลการค้นหา</div>';
    return;
  }
  queue.forEach((track, i) => {
    const item = document.createElement('div');
    item.className = 'queue-item' + (currentTrack?.videoId === track.videoId ? ' active' : '');
    item.innerHTML = `
      <span class="queue-num">${i + 1}</span>
      <img class="queue-img" src="${esc(track.thumbnail || `https://img.youtube.com/vi/${track.videoId}/hqdefault.jpg`)}" alt="" loading="lazy"/>
      <div class="queue-info">
        <div class="queue-title">${esc(track.title)}</div>
        <div class="queue-ch">${esc(track.channel || '')}</div>
      </div>
      <button class="queue-remove" onclick="event.stopPropagation();removeFromQueueById('${esc(track.videoId)}')">
        <svg viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
      </button>
    `;
    item.querySelector('.queue-info').addEventListener('click', () => { currentTrack = track; loadAndPlay(track); });
    npQueueList.appendChild(item);
  });
  // Scroll to active
  const active = npQueueList.querySelector('.queue-item.active');
  if (active) active.scrollIntoView({ block: 'nearest' });
}

function renderNpRelated(results) {
  npRelatedList.innerHTML = '';
  if (!results || !results.length) {
    npRelatedList.innerHTML = '<div class="queue-empty" style="padding:24px 0;font-size:.85rem">ยังไม่มีวิดีโอแนะนำ — ลองกดเล่นสัก 1 เพลง</div>';
    return;
  }
  results.slice(0, 20).forEach((track, i) => {
    const isPlaying = currentTrack?.videoId === track.videoId;
    const item = document.createElement('div');
    item.className = 'queue-item' + (isPlaying ? ' active' : '');
    item.innerHTML = `
      <span class="queue-num">${i + 1}</span>
      <img class="queue-img" src="${esc(track.thumbnail || `https://img.youtube.com/vi/${track.videoId}/hqdefault.jpg`)}" alt="" loading="lazy"/>
      <div class="queue-info">
        <div class="queue-title">${esc(track.title)}</div>
        <div class="queue-ch">${esc(track.channel || '')}</div>
      </div>
      <button class="queue-remove" title="+ เพิ่มเข้าคิว" style="opacity:0.75">
        <svg viewBox="0 0 24 24" fill="none"><line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
      </button>
    `;
    item.querySelector('.queue-info').addEventListener('click', () => playTrack(track));
    item.querySelector('.queue-remove').addEventListener('click', (e) => {
      e.stopPropagation();
      addToQueue(track, true);
    });
    npRelatedList.appendChild(item);
  });
}

// ── Queue ─────────────────────────────────────────────────────────────
function addToQueue(track, fromBtn = false) {
  if (typeof track === 'string') track = JSON.parse(track);
  if (queue.find(t => t.videoId === track.videoId)) {
    if (fromBtn) showBriefToast('✓ เพลงนี้อยู่ในคิวแล้ว');
    return;
  }
  queue.push(track);
  updateQueueBadge();
  renderNpQueue();
  if (fromBtn) showBriefToast(`+ เพิ่ม "${truncate(track.title, 28)}" ลงคิวแล้ว`);
}

function removeFromQueueById(videoId) {
  queue = queue.filter(t => t.videoId !== videoId);
  updateQueueBadge();
  renderNpQueue();
  renderQueueList();
}

function updateQueueBadge() {
  queueBadge.textContent = queue.length;
  queueBadge.classList.toggle('hidden', !queue.length);
}

function updateQueueHighlight() {
  document.querySelectorAll('#queueList .queue-item').forEach(el => {
    el.classList.toggle('active', el.dataset.videoid === currentTrack?.videoId);
  });
}

function renderQueueList() {
  queueList.innerHTML = '';
  if (!queue.length) { queueEmpty.classList.remove('hidden'); return; }
  queueEmpty.classList.add('hidden');
  queue.forEach((track, i) => {
    const item = document.createElement('div');
    item.className = 'queue-item' + (currentTrack?.videoId === track.videoId ? ' active' : '');
    item.dataset.videoid = track.videoId;
    item.style.animationDelay = `${i * 0.04}s`;
    item.innerHTML = `
      <span class="queue-num">${i + 1}</span>
      <img class="queue-img" src="${esc(track.thumbnail || `https://img.youtube.com/vi/${track.videoId}/hqdefault.jpg`)}" alt="" loading="lazy"/>
      <div class="queue-info">
        <div class="queue-title">${esc(track.title)}</div>
        <div class="queue-ch">${esc(track.channel || '')}</div>
      </div>
      <button class="queue-remove" onclick="event.stopPropagation();removeFromQueueById('${esc(track.videoId)}')">
        <svg viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
      </button>
    `;
    item.querySelector('.queue-info').addEventListener('click', () => { currentTrack = track; loadAndPlay(track); });
    queueList.appendChild(item);
  });
}

clearQueueBtn.addEventListener('click', () => {
  queue = [];
  updateQueueBadge();
  renderQueueList();
  renderNpQueue();
});

// ── Media Session ─────────────────────────────────────────────────────
function setupMediaSession(track) {
  if (!('mediaSession' in navigator)) return;
  navigator.mediaSession.metadata = new MediaMetadata({
    title:  track.title   || 'Unknown',
    artist: track.channel || 'YouTube',
    album:  'WunTube',
    artwork: [{ src: track.thumbnail || `https://img.youtube.com/vi/${track.videoId}/hqdefault.jpg`, sizes: '480x360', type: 'image/jpeg' }],
  });
  navigator.mediaSession.setActionHandler('play',          () => { if (isActivePlayerPaused()) togglePlayPause(); });
  navigator.mediaSession.setActionHandler('pause',         () => { if (!isActivePlayerPaused()) togglePlayPause(); });
  navigator.mediaSession.setActionHandler('previoustrack', playPrevInQueue);
  navigator.mediaSession.setActionHandler('nexttrack',     playNextInQueue);
  navigator.mediaSession.setActionHandler('seekto',        (d) => { if (d.seekTime !== undefined) seekActivePlayer(d.seekTime); });
}
function updateMediaSessionState(state) {
  if ('mediaSession' in navigator) navigator.mediaSession.playbackState = state;
}

// ── Download ──────────────────────────────────────────────────────────
const activeDownloads = new Set();
async function downloadTrack(videoId, title) {
  if (serverHasYtDlp !== true) {
    try {
      const infoRes = await fetch(`${API}/info`);
      if (infoRes.ok) {
        const infoData = await infoRes.json();
        serverHasYtDlp = Boolean(infoData.hasYtDlp);
      }
    } catch (_) {}
  }

  if (serverHasYtDlp === false) {
    showBriefToast('⚠️ เซิร์ฟเวอร์นี้ไม่มี yt-dlp/ffmpeg สำหรับแปลงไฟล์ MP3');
    return;
  }
  if (activeDownloads.has(videoId)) return;
  activeDownloads.add(videoId);
  const btn = document.getElementById(`dl-${videoId}`);
  if (btn) btn.classList.add('loading');
  showToast(`กำลังแปลง MP3 "${truncate(title, 30)}"...`, '⬇️');

  try {
    const res = await fetch(`${API}/download?videoId=${encodeURIComponent(videoId)}&title=${encodeURIComponent(title)}`);
    if (!res.ok) {
      let errMsg = `ดาวน์โหลดไม่สำเร็จ (HTTP ${res.status})`;
      try {
        const errData = await res.json();
        if (errData?.code === 'YTDLP_UNAVAILABLE') {
          serverHasYtDlp = false;
          errMsg = '⚠️ เซิร์ฟเวอร์นี้ไม่มี yt-dlp/ffmpeg สำหรับแปลงไฟล์ MP3';
        } else if (errData?.error) {
          errMsg = errData.error;
        }
      } catch (_) {}
      showBriefToast(errMsg);
      return;
    }

    const blob = await res.blob();
    const ct = (res.headers.get('content-type') || '').toLowerCase();
    const ext = ct.includes('mp4') ? 'm4a' : (ct.includes('webm') ? 'webm' : 'mp3');
    const safeName = (title || videoId).replace(/[\\/:*?"<>|]+/g, '_').trim() || videoId;

    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = `${safeName}.${ext}`;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
    showBriefToast(`✓ ดาวน์โหลด "${truncate(title, 28)}" สำเร็จ`);
  } catch (err) {
    console.error('Download failed:', err);
    showBriefToast('❌ เกิดข้อผิดพลาดในการดาวน์โหลด');
  } finally {
    if (btn) btn.classList.remove('loading');
    activeDownloads.delete(videoId);
  }
}

// ── Toast ─────────────────────────────────────────────────────────────
function showToast(msg, icon = '🎵') {
  toastTitle.textContent = icon + ' WunTube';
  toastMsg.textContent = msg;
  toast.classList.remove('hidden');
  const bar = toast.querySelector('.toast-bar');
  bar.style.animation = 'none'; bar.offsetHeight; bar.style.animation = '';
}
function hideToast() { toast.classList.add('hidden'); }
function showBriefToast(msg) {
  showToast(msg);
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(hideToast, 2500);
}

// ── UI Helpers ─────────────────────────────────────────────────────────
function setSearchLoading(v) {
  if(searchBtn) searchBtn.disabled = v;
  if(searchInput) searchInput.disabled = v;
  if(searchBtnPage) searchBtnPage.disabled = v;
  if(searchInputPage) searchInputPage.disabled = v;
}
function formatTime(s) {
  if (!s || isNaN(s)) return '0:00';
  const m = Math.floor(s / 60), sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2,'0')}`;
}
function truncate(str, max) { return str && str.length > max ? str.substring(0, max) + '…' : str; }
function esc(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

// ── Share Link ─────────────────────────────────────────────────────────
async function loadShareInfo() {
  try {
    const res = await fetch(`${API}/info`);
    if (!res.ok) {
      if (capabilitiesResolve) { capabilitiesResolve(); capabilitiesResolve = null; }
      return;
    }
    const data = await res.json();
    if (typeof data.hasYtDlp === 'boolean') {
      serverHasYtDlp = data.hasYtDlp;
    }
    if (capabilitiesResolve) {
      capabilitiesResolve();
      capabilitiesResolve = null;
    }

    const url = data.publicUrl || (data.localUrls && data.localUrls[0]);
    if (!url) return;
    shareUrlInput.value = url;
    shareBar.classList.remove('hidden');
    shareHint.textContent = data.publicUrl
      ? (data.tunnelPassword ? `ลิงก์อินเทอร์เน็ต — password: ${data.tunnelPassword}` : 'ลิงก์นี้เปิดจากอินเทอร์เน็ตได้')
      : 'ใช้ได้ใน Wi-Fi เดียวกัน — รัน php share.php เพื่อลิงก์อินเทอร์เน็ต';
  } catch (_) {
    if (capabilitiesResolve) { capabilitiesResolve(); capabilitiesResolve = null; }
  }
}
copyShareBtn.addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(shareUrlInput.value); }
  catch { shareUrlInput.select(); document.execCommand('copy'); }
  copyShareBtn.textContent = '✓ คัดลอก';
  setTimeout(() => { copyShareBtn.textContent = 'คัดลอก'; }, 2000);
});

// Background badge visibility
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && !isActivePlayerPaused()) bgPlayBadge.classList.remove('hidden');
});

// ── Auth ───────────────────────────────────────────────────────────────
function openAuthModal(e) {
  if (e) e.preventDefault();
  if (currentUser) {
    logout();
    return;
  }
  authModal.classList.remove('hidden');
}

function closeAuthModal() {
  authModal.classList.add('hidden');
}

function toggleAuthMode(e) {
  if (e) e.preventDefault();
  isRegisterMode = !isRegisterMode;
  if (isRegisterMode) {
    authNameGroup.classList.remove('hidden');
    authName.required = true;
    authSubmitBtn.textContent = 'สมัครสมาชิก';
    authSwitchPrompt.textContent = 'มีบัญชีแล้ว?';
    authSwitchBtn.textContent = 'เข้าสู่ระบบ';
  } else {
    authNameGroup.classList.add('hidden');
    authName.required = false;
    authSubmitBtn.textContent = 'เข้าสู่ระบบ';
    authSwitchPrompt.textContent = 'ยังไม่มีบัญชี?';
    authSwitchBtn.textContent = 'สมัครสมาชิก';
  }
}

async function handleAuth(e) {
  e.preventDefault();
  const email = authEmail.value;
  const password = authPassword.value;
  const name = authName.value;

  const endpoint = isRegisterMode ? `${API}/register` : `${API}/login`;
  const body = { email, password, name };

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    
    if (!res.ok) throw new Error(data.error || 'Auth failed');
    
    if (isRegisterMode) {
      showBriefToast('สมัครสมาชิกสำเร็จ กรุณาเข้าสู่ระบบ');
      toggleAuthMode(); // switch back to login
    } else {
      localStorage.setItem('wuntube_token', data.token);
      showBriefToast('เข้าสู่ระบบสำเร็จ!');
      closeAuthModal();
      checkAuth();
    }
  } catch (err) {
    alert(err.message);
  }
}

function logout() {
  if (!confirm('ต้องการออกจากระบบหรือไม่?')) return;
  localStorage.removeItem('wuntube_token');
  currentUser = null;
  updateAuthUI();
  showBriefToast('ออกจากระบบแล้ว');
}

async function checkAuth() {
  const token = localStorage.getItem('wuntube_token');
  if (!token) return updateAuthUI();
  
  try {
    const res = await fetch(`${API}/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (res.ok) {
      currentUser = data.user;
    } else {
      localStorage.removeItem('wuntube_token');
      currentUser = null;
    }
    updateAuthUI();
  } catch {
    updateAuthUI();
  }
}

function updateAuthUI() {
  if (currentUser) {
    if (bNavLoginText) bNavLoginText.textContent = 'โปรไฟล์';
    if (headerSignInBtn) headerSignInBtn.classList.add('hidden');
    if (userAvatarBtn) userAvatarBtn.classList.remove('hidden');
    if (userAvatarText) userAvatarText.textContent = (currentUser.name || currentUser.email || 'U').charAt(0).toUpperCase();
    fetchAndRenderTopFavorites();
  } else {
    if (bNavLoginText) bNavLoginText.textContent = 'เข้าสู่ระบบ';
    if (headerSignInBtn) headerSignInBtn.classList.remove('hidden');
    if (userAvatarBtn) userAvatarBtn.classList.add('hidden');
    const tfSection = document.getElementById('topFavoritesSection');
    if (tfSection) tfSection.classList.add('hidden');
  }
  fetchHomeRecommendations();
}

async function fetchAndRenderTopFavorites() {
  const tfSection = document.getElementById('topFavoritesSection');
  const tfGrid = document.getElementById('topFavoritesGrid');
  if (!tfSection || !tfGrid) return;
  
  try {
    const res = await fetch(`${API}/top-favorites`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('wuntube_token')}` }
    });
    if (!res.ok) return;
    const data = await res.json();
    if (data.favorites && data.favorites.length > 0) {
      tfGrid.innerHTML = '';
      data.favorites.forEach(track => {
        const div = document.createElement('div');
        div.className = 'curated-card';
        div.dataset.videoid = track.videoId;
        div.onclick = () => playTrack({
          videoId: track.videoId,
          title: track.title,
          channel: track.channel,
          thumbnail: `https://img.youtube.com/vi/${track.videoId}/hqdefault.jpg`
        });
        div.innerHTML = `
          <div class="curated-thumb">
            <img src="https://img.youtube.com/vi/${esc(track.videoId)}/hqdefault.jpg" alt="" loading="lazy"/>
            <span class="curated-duration">★ ${track.playCount}</span>
            <div class="curated-play-pill">
              <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="6 4 20 12 6 20 6 4"/></svg>
            </div>
          </div>
          <div class="yt-card-body">
            ${getChannelAvatarHtml(track.channel || 'YouTube')}
            <div class="curated-info">
              <p class="curated-title">${esc(track.title)}</p>
              <div class="curated-meta-row">
                <p class="curated-sub">${esc(track.channel || 'YouTube')}</p>
              </div>
            </div>
          </div>
        `;
        tfGrid.appendChild(div);
      });
      tfSection.classList.remove('hidden');
    } else {
      tfSection.classList.add('hidden');
    }
  } catch(err) {
    console.error(err);
  }
}

// ── Firebase Auth Setup ────────────────────────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyCb9oY_pTAlEvVqu7BWiETSrjQDYgI4MAY",
  authDomain: "wuntube-wun.firebaseapp.com",
  projectId: "wuntube-wun",
  storageBucket: "wuntube-wun.firebasestorage.app",
  messagingSenderId: "99668067474",
  appId: "1:99668067474:web:c7642bf0b610a3c2f1124b"
};

let fAuth = null;
let googleProvider = null;
let firebaseLoaded = false;

function loadFirebaseSDK() {
  return new Promise((resolve) => {
    if (firebaseLoaded) { resolve(); return; }
    const s1 = document.createElement('script');
    s1.src = 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js';
    s1.onload = () => {
      const s2 = document.createElement('script');
      s2.src = 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js';
      s2.onload = () => {
        firebaseLoaded = true;
        try {
          firebase.initializeApp(firebaseConfig);
          fAuth = firebase.auth();
          googleProvider = new firebase.auth.GoogleAuthProvider();
        } catch(e) { /* already initialized */ }
        resolve();
      };
      document.head.appendChild(s2);
    };
    document.head.appendChild(s1);
  });
}

async function handleFirebaseGoogleLogin() {
  showBriefToast('⏳ กำลังโหลด...');
  await loadFirebaseSDK();
  try {
    const result = await fAuth.signInWithPopup(googleProvider);
    const token = await result.user.getIdToken();
    localStorage.setItem('wuntube_token', token);
    showBriefToast('เข้าสู่ระบบด้วย Google สำเร็จ!');
    closeAuthModal();
    checkAuth();
  } catch (error) {
    console.error(error);
    if (error.code === 'auth/configuration-not-found' || error.code === 'auth/invalid-api-key') {
      // Firebase not fully set up — use mock mode
      localStorage.setItem('wuntube_token', 'mock_firebase_token');
      showBriefToast('เข้าสู่ระบบสำเร็จ (Mock)!');
      closeAuthModal();
      checkAuth();
    } else {
      alert('Google Login Error: ' + error.message);
    }
  }
}

function focusSearch(e) {
  if (e) e.preventDefault();
  window.scrollTo({ top: 0, behavior: 'smooth' });
  setTimeout(() => {
    if (searchInput) {
      searchInput.focus();
      searchInput.select();
    }
  }, 100);
}

// ── Init ───────────────────────────────────────────────────────────────
window.addEventListener('load', () => {
  setTimeout(() => {
    if (splashScreen) {
      splashScreen.classList.add('fade-out');
      setTimeout(() => splashScreen.remove(), 500);
    }
  }, 1200);
});

renderSidebarPlaylists();
loadShareInfo();
checkAuth();
setInterval(loadShareInfo, 5000);
