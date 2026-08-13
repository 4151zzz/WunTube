/* ═══════════════════════════════════════════════════════════════════
   WunTube — v2 App Logic
   Now Playing Panel · Playlists · Queue · Autoplay · Media Session
   ═══════════════════════════════════════════════════════════════════ */

const API = '/api';

// ── DOM refs ─────────────────────────────────────────────────────────
const audio           = document.getElementById('globalAudio');
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
let isSeeking      = false;
let currentResults = [];
let activeView     = 'home';
let currentPlaylistId = null;
let npActiveTab    = 'queue';
let pendingPlaylistTrack = null;
let toastTimer     = null;
let currentUser    = null;
let isRegisterMode = false;


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
menuBtn.addEventListener('click', openSidebar);
sidebarCloseBtn.addEventListener('click', closeSidebar);
sidebarOverlay.addEventListener('click', closeSidebar);
function openSidebar() { sidebar.classList.add('open'); sidebarOverlay.classList.add('open'); }
function closeSidebar() { sidebar.classList.remove('open'); sidebarOverlay.classList.remove('open'); }

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
  renderNpRelated(results);
}

// ── Track Row (new search result style) ──────────────────────────────
function createTrackRow(item, index) {
  const row = document.createElement('div');
  row.className = 'track-row' + (currentTrack?.videoId === item.videoId ? ' playing' : '');
  row.id = `card-${item.videoId}`;
  row.style.animationDelay = `${Math.min(index * 0.03, 0.6)}s`;
  const thumb = item.thumbnail || `https://img.youtube.com/vi/${item.videoId}/hqdefault.jpg`;
  const isPlaying = currentTrack?.videoId === item.videoId;
  row.innerHTML = `
    <span class="track-num">${index + 1}</span>
    <div class="track-eq"><span></span><span></span><span></span></div>
    <img class="track-thumb" src="${esc(thumb)}" alt=""
         onerror="this.src='https://img.youtube.com/vi/${esc(item.videoId)}/hqdefault.jpg'" loading="lazy"/>
    <div class="track-info">
      <div class="track-title" title="${esc(item.title)}">${esc(item.title)}</div>
      <div class="track-channel">
        <svg viewBox="0 0 24 24" fill="none"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2"/></svg>
        ${esc(item.channel)}
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
  document.querySelectorAll('.track-row.playing, .card.playing').forEach(c => {
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
}


// ── Play ─────────────────────────────────────────────────────────────
function playTrack(track) {
  if (typeof track === 'string') track = JSON.parse(track);

  if (currentTrack?.videoId === track.videoId) { togglePlayPause(); return; }
  currentTrack = track;
  // Add to queue if not already there
  if (!queue.find(t => t.videoId === track.videoId)) queue.push(track);
  updateQueueBadge();
  loadAndPlay(track);
}

function loadAndPlay(track) {
  playerBar.classList.remove('hidden');
  // Mini player info
  playerTitle.textContent = track.title || '—';
  playerChannel.textContent = track.channel || '—';
  playerThumbImg.src = track.thumbnail || `https://img.youtube.com/vi/${track.videoId}/hqdefault.jpg`;
  progressFill.style.width = '0%';

  // Now Playing panel info
  npTitle.textContent = track.title || '—';
  npChannel.textContent = track.channel || '—';
  const thumb = track.thumbnail || `https://img.youtube.com/vi/${track.videoId}/hqdefault.jpg`;
  npArtwork.src = thumb;
  npBgBlur.style.backgroundImage = `url('${thumb}')`;


  setPlayerState('loading');

  audio.src = `${API}/stream?videoId=${encodeURIComponent(track.videoId)}`;
  audio.load();

  // Wait for the audio to be ready (handles redirect to CDN URL)
  const onCanPlay = () => {
    audio.removeEventListener('canplay', onCanPlay);
    audio.play().catch(err => {
      console.error('Play failed for videoId ' + track.videoId + ':', err);
      if (err.name === 'AbortError') {
        // Safe to ignore — browser is still loading/redirecting
        return;
      }
      if (err.name === 'NotAllowedError') {
        setPlayerState('paused');
        showBriefToast('⏸ กดปุ่ม ▶ เพื่อเริ่มเล่น');
      } else {
        setPlayerState('paused');
        setTimeout(() => autoplayNext(), 2000);
      }
    });
  };
  audio.addEventListener('canplay', onCanPlay);

  // Fallback: if canplay never fires (e.g. error) remove listener
  const onError = () => {
    audio.removeEventListener('canplay', onCanPlay);
    audio.removeEventListener('error', onError);
    setPlayerState('paused');
    console.error('[audio] Error loading track:', track.videoId);
    setTimeout(() => autoplayNext(), 2000);
  };
  audio.addEventListener('error', onError, { once: true });

  // Record history if logged in
  if (currentUser) {
    fetch('/api/history', {
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
}

function togglePlayPause() {
  if (!currentTrack) return;
  audio.paused ? audio.play().catch(console.error) : audio.pause();
}

// ── Audio Events ──────────────────────────────────────────────────────
audio.addEventListener('playing', () => {
  setPlayerState('playing');
  artworkViz.classList.add('active');
  npViz.classList.add('active');
  bgPlayBadge.classList.remove('hidden');
  updateMediaSessionState('playing');
});
audio.addEventListener('pause', () => {
  setPlayerState('paused');
  artworkViz.classList.remove('active');
  npViz.classList.remove('active');
  updateMediaSessionState('paused');
});
audio.addEventListener('waiting', () => setPlayerState('loading'));
audio.addEventListener('canplay', () => { if (!audio.paused) setPlayerState('playing'); });
audio.addEventListener('ended', () => {
  artworkViz.classList.remove('active');
  npViz.classList.remove('active');
  if (isLoopOn) { loadAndPlay(currentTrack); }
  else { autoplayNext(); }
});
audio.addEventListener('error', () => { setPlayerState('paused'); autoplayNext(); });

audio.addEventListener('timeupdate', () => {
  if (isSeeking || !audio.duration) return;
  const pct = (audio.currentTime / audio.duration) * 100;
  // Mini bar
  progressFill.style.width = `${pct}%`;
  // NP panel
  npProgressFill.style.width = `${pct}%`;
  npProgressThumb.style.setProperty('--pct', `${pct}%`);
  npTimeCurrent.textContent = formatTime(audio.currentTime);
  npTimeDuration.textContent = formatTime(audio.duration);
});

// Autoplay: play next in queue
function autoplayNext() {
  if (!queue.length) return;
  let nextIdx;
  if (isShuffleOn) {
    nextIdx = Math.floor(Math.random() * queue.length);
  } else {
    const idx = queue.findIndex(t => t.videoId === currentTrack?.videoId);
    if (idx >= 0 && idx < queue.length - 1) {
      nextIdx = idx + 1;
    } else {
      if (currentResults && currentResults.length > 0) {
        const resIdx = currentResults.findIndex(t => t.videoId === currentTrack?.videoId);
        if (resIdx >= 0 && resIdx < currentResults.length - 1) {
          const nextRes = currentResults[resIdx + 1];
          if (!queue.find(t => t.videoId === nextRes.videoId)) queue.push(nextRes);
          updateQueueBadge();
          currentTrack = nextRes;
          loadAndPlay(nextRes);
          return;
        }
      }
      nextIdx = 0;
    }
  }
  const next = queue[nextIdx];
  if (next) { currentTrack = next; loadAndPlay(next); }
}

function playNextInQueue() {
  if (!queue.length) return;
  let nextIdx;
  if (isShuffleOn) {
    nextIdx = Math.floor(Math.random() * queue.length);
  } else {
    const idx = queue.findIndex(t => t.videoId === currentTrack?.videoId);
    if (idx >= 0 && idx < queue.length - 1) {
      nextIdx = idx + 1;
    } else {
      if (currentResults && currentResults.length > 0) {
        const resIdx = currentResults.findIndex(t => t.videoId === currentTrack?.videoId);
        if (resIdx >= 0 && resIdx < currentResults.length - 1) {
          const nextRes = currentResults[resIdx + 1];
          if (!queue.find(t => t.videoId === nextRes.videoId)) queue.push(nextRes);
          updateQueueBadge();
          currentTrack = nextRes;
          loadAndPlay(nextRes);
          return;
        }
      }
      nextIdx = 0;
    }
  }
  const next = queue[nextIdx];
  if (next) { currentTrack = next; loadAndPlay(next); }
}

function playPrevInQueue() {
  if (!queue.length) return;
  if (audio.currentTime > 3) { audio.currentTime = 0; return; }
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

volumeSlider.addEventListener('input', () => { audio.volume = volumeSlider.value / 100; npVolumeSlider.value = volumeSlider.value; });
npVolumeSlider.addEventListener('input', () => { audio.volume = npVolumeSlider.value / 100; volumeSlider.value = npVolumeSlider.value; });

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
}

function closeNowPlaying() {
  nowPlayingPanel.classList.add('closing');
  setTimeout(() => {
    nowPlayingPanel.classList.add('hidden');
    nowPlayingPanel.classList.remove('closing');
    document.body.style.overflow = '';
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
  if (!audio.duration) return;
  const rect = npProgressArea.getBoundingClientRect();
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  const t = pct * audio.duration;
  npProgressFill.style.width = `${pct * 100}%`;
  npProgressThumb.style.setProperty('--pct', `${pct * 100}%`);
  progressFill.style.width = `${pct * 100}%`;
  npTimeCurrent.textContent = formatTime(t);
  audio.currentTime = t;
}

// Mini bar seek
progressArea.addEventListener('click', (e) => {
  e.stopPropagation();
  if (!audio.duration) return;
  const rect = progressArea.getBoundingClientRect();
  const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  audio.currentTime = pct * audio.duration;
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
  results.slice(0, 15).forEach((track, i) => {
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
    `;
    item.addEventListener('click', () => playTrack(track));
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
  navigator.mediaSession.setActionHandler('play',          () => audio.play());
  navigator.mediaSession.setActionHandler('pause',         () => audio.pause());
  navigator.mediaSession.setActionHandler('previoustrack', playPrevInQueue);
  navigator.mediaSession.setActionHandler('nexttrack',     playNextInQueue);
  navigator.mediaSession.setActionHandler('seekto',        (d) => { if (d.seekTime !== undefined) audio.currentTime = d.seekTime; });
}
function updateMediaSessionState(state) {
  if ('mediaSession' in navigator) navigator.mediaSession.playbackState = state;
}

// ── Download ──────────────────────────────────────────────────────────
const activeDownloads = new Set();
function downloadTrack(videoId, title) {
  if (activeDownloads.has(videoId)) return;
  activeDownloads.add(videoId);
  const btn = document.getElementById(`dl-${videoId}`);
  if (btn) btn.classList.add('loading');
  showToast(`ดาวน์โหลด "${truncate(title, 35)}"`, '⬇️');
  const a = document.createElement('a');
  a.href = `${API}/download?videoId=${encodeURIComponent(videoId)}&title=${encodeURIComponent(title)}`;
  a.download = `${title}.mp3`;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => { if (btn) btn.classList.remove('loading'); activeDownloads.delete(videoId); hideToast(); }, 35000);
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
    const res = await fetch('/api/info'); if (!res.ok) return;
    const data = await res.json();
    const url = data.publicUrl || (data.localUrls && data.localUrls[0]);
    if (!url) return;
    shareUrlInput.value = url;
    shareBar.classList.remove('hidden');
    shareHint.textContent = data.publicUrl
      ? (data.tunnelPassword ? `ลิงก์อินเทอร์เน็ต — password: ${data.tunnelPassword}` : 'ลิงก์นี้เปิดจากอินเทอร์เน็ตได้')
      : 'ใช้ได้ใน Wi-Fi เดียวกัน — รัน npm run share เพื่อลิงก์อินเทอร์เน็ต';
  } catch (_) {}
}
copyShareBtn.addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(shareUrlInput.value); }
  catch { shareUrlInput.select(); document.execCommand('copy'); }
  copyShareBtn.textContent = '✓ คัดลอก';
  setTimeout(() => { copyShareBtn.textContent = 'คัดลอก'; }, 2000);
});

// Background badge visibility
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && !audio.paused) bgPlayBadge.classList.remove('hidden');
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

  const endpoint = isRegisterMode ? '/api/register' : '/api/login';
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
    const res = await fetch('/api/me', {
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
    bNavLoginText.textContent = 'โปรไฟล์';
    userAvatarBtn.classList.remove('hidden');
    userAvatarText.textContent = currentUser.name.charAt(0).toUpperCase();
    fetchAndRenderTopFavorites();
  } else {
    bNavLoginText.textContent = 'เข้าสู่ระบบ';
    userAvatarBtn.classList.add('hidden');
    const tfSection = document.getElementById('topFavoritesSection');
    if (tfSection) tfSection.classList.add('hidden');
  }
}

async function fetchAndRenderTopFavorites() {
  const tfSection = document.getElementById('topFavoritesSection');
  const tfGrid = document.getElementById('topFavoritesGrid');
  if (!tfSection || !tfGrid) return;
  
  try {
    const res = await fetch('/api/top-favorites', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('wuntube_token')}` }
    });
    if (!res.ok) return;
    const data = await res.json();
    if (data.favorites && data.favorites.length > 0) {
      tfGrid.innerHTML = '';
      data.favorites.forEach(track => {
        const div = document.createElement('div');
        div.className = 'curated-card';
        div.onclick = () => quickSearch({ textContent: track.title });
        div.innerHTML = `
          <div class="curated-thumb">
            <img src="https://img.youtube.com/vi/${esc(track.videoId)}/hqdefault.jpg" alt=""/>
            <div class="curated-overlay">★<br/>${track.playCount} plays</div>
          </div>
          <div class="curated-info">
            <p class="curated-title">${esc(track.title)}</p>
            <p class="curated-sub">${esc(track.channel)}</p>
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
  if(e) e.preventDefault();
  showView('home');
  window.scrollTo(0, 0);
  setTimeout(() => {
    searchInput.focus();
    // scroll to search on mobile
    const hw = document.querySelector('.hero-search-wrap');
    if(hw) hw.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 150);
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
