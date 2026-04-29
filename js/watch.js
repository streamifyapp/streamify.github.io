/* ============================================
   STREAMIFY - WATCH PAGE
   Player & Server Management + Firebase CW + Firebase Favorites
   NOTE: Firebase is initialized by firebase-config.js
         which is loaded BEFORE this file in watch.html
============================================ */

// Global variables
let currentType    = 'movie';
let currentId      = null;
let currentSeason  = 1;
let currentEpisode = 1;
let currentServer  = null;
let mediaData      = null;

// ── Firebase — already initialized by firebase-config.js ─────────────────────
window._fbReady = true;
window._fbAuth  = firebase.auth();
window._fbDB    = firebase.database();

// Once auth state is known, sync the My List button with Firebase truth
window._fbAuth.onAuthStateChanged(user => {
    if (user && currentId) {
        syncListButtonWithFirebase(user.uid);
    }
});

// ============================================
//  SAVE TO CONTINUE WATCHING (Firebase)
// ============================================
async function saveToContinueWatching() {
    if (!mediaData) return;
    const user = window._fbAuth.currentUser;
    if (!user) return;

    const isMovie = currentType === 'movie';
    const itemKey = currentId + (isMovie ? '_movie' : '_series');
    const title   = mediaData.title || mediaData.name || 'Unknown';
    const poster  = mediaData.poster_path || null;

    const entry = {
        id:         parseInt(currentId),
        isMovie:    isMovie,
        title:      title,
        posterPath: poster,
        timestamp:  Date.now()
    };

    if (!isMovie) {
        entry.season  = currentSeason;
        entry.episode = currentEpisode;
    }

    try {
        await window._fbDB
            .ref('ContinueWatching/' + user.uid + '/' + itemKey)
            .set(entry);
        console.log('Saved to ContinueWatching');
    } catch (e) {
        console.warn('ContinueWatching save failed:', e);
    }
}

// ============================================
//  FAVORITES — FIREBASE READ / WRITE
// ============================================

async function addToFavoritesFirebase() {
    if (!mediaData) return;
    const user = window._fbAuth.currentUser;
    if (!user) {
        showNotification('Please log in to save to My List');
        return;
    }

    const isMovie = currentType === 'movie';
    const entry   = {
        id:         parseInt(currentId),
        movie:      isMovie,
        title:      mediaData.title || mediaData.name || 'Unknown',
        posterPath: mediaData.poster_path || null,
        addedAt:    Date.now()
    };

    try {
        await window._fbDB
            .ref('Favorites/' + user.uid + '/' + currentId)
            .set(entry);
        console.log('Saved to Firebase Favorites:', entry);
    } catch (e) {
        console.warn('Favorites save failed:', e);
        showNotification('Failed to save. Try again.');
    }
}

async function removeFromFavoritesFirebase() {
    const user = window._fbAuth.currentUser;
    if (!user) return;

    try {
        await window._fbDB
            .ref('Favorites/' + user.uid + '/' + currentId)
            .remove();
        console.log('Removed from Firebase Favorites');
    } catch (e) {
        console.warn('Favorites remove failed:', e);
        showNotification('Failed to remove. Try again.');
    }
}

async function syncListButtonWithFirebase(uid) {
    if (!currentId) return;
    try {
        const snap       = await window._fbDB.ref('Favorites/' + uid + '/' + currentId).once('value');
        const inFirebase = snap.exists();
        setListButtonState(inFirebase);
    } catch (e) {
        console.warn('Sync list button failed:', e);
    }
}

// ============ INITIALIZATION ============

document.addEventListener('DOMContentLoaded', () => {
    initWatchPage();
});

async function initWatchPage() {
    const params   = new URLSearchParams(window.location.search);
    currentId      = params.get('id');
    currentType    = params.get('type') || 'movie';
    currentSeason  = parseInt(params.get('season'))  || 1;
    currentEpisode = parseInt(params.get('episode')) || 1;

    if (!currentId) { showError('No content ID provided'); return; }

    currentServer = localStorage.getItem(CONFIG.STORAGE_KEYS.selectedServer) || CONFIG.DEFAULT_SERVER;

    // ── Reposition action buttons based on content type ──────────────────────
    // MOVIE  → buttons appear right below the server selector
    // TV     → buttons stay in HTML position (naturally below episodeSelector)
    const actionsEl = document.querySelector('.watch-actions');
    if (actionsEl && currentType === 'movie') {
        document.querySelector('.server-selector')
            .insertAdjacentElement('afterend', actionsEl);
    }

    initServerButtons();
    await loadContentData();
    loadPlayer();
    setupActionButtons();
}

// ============ SERVER MANAGEMENT ============

function initServerButtons() {
    const container = document.getElementById('serverButtons');
    container.innerHTML = '';

    CONFIG.getServerKeys().forEach(key => {
        const btn          = document.createElement('button');
        btn.className      = `server-btn ${key === currentServer ? 'active' : ''}`;
        btn.dataset.server = key;
        btn.innerHTML      = `<i class="fas fa-play-circle"></i><span>${CONFIG.getServerName(key)}</span>`;
        btn.addEventListener('click', () => switchServer(key));
        container.appendChild(btn);
    });
}

function switchServer(serverKey) {
    if (serverKey === currentServer) return;
    currentServer = serverKey;
    localStorage.setItem(CONFIG.STORAGE_KEYS.selectedServer, serverKey);
    document.querySelectorAll('.server-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.server === serverKey);
    });
    loadPlayer();
    showNotification(`Switched to ${CONFIG.getServerName(serverKey)}`);
}

// ============ PLAYER ============

function loadPlayer() {
    const player = document.getElementById('player');
    const loader = document.getElementById('playerLoader');

    loader.style.display = 'flex';
    player.style.opacity = '0';

    const streamUrl = currentType === 'movie'
        ? CONFIG.getMovieStreamUrl(currentId, currentServer)
        : CONFIG.getTVStreamUrl(currentId, currentSeason, currentEpisode, currentServer);

    player.src = streamUrl;

    player.onload = () => {
        loader.style.display = 'none';
        player.style.opacity = '1';
        saveToContinueWatching();
    };

    player.onerror = () => {
        loader.innerHTML = `
            <i class="fas fa-exclamation-triangle" style="font-size:48px;color:#e50914;"></i>
            <p>Failed to load player. Try another server.</p>
        `;
    };
}

// ============ CONTENT DATA ============

async function loadContentData() {
    try {
        if (currentType === 'movie') {
            mediaData = await API.getMovieDetails(currentId);
            displayMovieData(mediaData);
        } else {
            mediaData = await API.getTVDetails(currentId);
            displayTVData(mediaData);
        }
    } catch (error) {
        console.error('Error loading content:', error);
        showError('Failed to load content details');
    }
}

function displayMovieData(movie) {
    document.title = `${movie.title} - Streamify`;
    document.getElementById('watchTitle').textContent    = movie.title;
    document.getElementById('watchRating').textContent   = movie.vote_average?.toFixed(1) || 'N/A';
    document.getElementById('watchYear').textContent     = movie.release_date?.split('-')[0] || 'N/A';
    document.getElementById('watchDuration').textContent = formatRuntime(movie.runtime);
    document.getElementById('watchDesc').textContent     = movie.overview || 'No description available.';
    document.getElementById('watchGenres').textContent   = movie.genres?.map(g => g.name).join(', ') || 'N/A';
    document.getElementById('watchCast').textContent     = movie.credits?.cast?.slice(0, 5).map(c => c.name).join(', ') || 'N/A';
    loadSimilarContent(movie.similar?.results || movie.recommendations?.results || []);
}

function displayTVData(show) {
    document.title = `${show.name} - Streamify`;
    document.getElementById('watchTitle').textContent    = show.name;
    document.getElementById('watchRating').textContent   = show.vote_average?.toFixed(1) || 'N/A';
    document.getElementById('watchYear').textContent     = show.first_air_date?.split('-')[0] || 'N/A';
    document.getElementById('watchDuration').textContent = `${show.number_of_seasons} Season${show.number_of_seasons > 1 ? 's' : ''}`;
    document.getElementById('watchDesc').textContent     = show.overview || 'No description available.';
    document.getElementById('watchGenres').textContent   = show.genres?.map(g => g.name).join(', ') || 'N/A';
    document.getElementById('watchCast').textContent     = show.credits?.cast?.slice(0, 5).map(c => c.name).join(', ') || 'N/A';
    initEpisodeSelector(show);
    loadSimilarContent(show.similar?.results || show.recommendations?.results || []);
}

// ============ EPISODE SELECTOR ============

function initEpisodeSelector(show) {
    const episodeSelector = document.getElementById('episodeSelector');
    const seasonSelect    = document.getElementById('seasonSelect');

    if (!show.seasons || show.seasons.length === 0) {
        episodeSelector.style.display = 'none';
        return;
    }

    episodeSelector.style.display = 'block';
    const seasons = show.seasons.filter(s => s.season_number > 0);
    seasonSelect.innerHTML = seasons.map(s =>
        `<option value="${s.season_number}" ${s.season_number === currentSeason ? 'selected' : ''}>
            Season ${s.season_number}
        </option>`
    ).join('');

    loadEpisodes(currentSeason);
    seasonSelect.addEventListener('change', e => {
        currentSeason = parseInt(e.target.value);
        loadEpisodes(currentSeason);
    });
}

async function loadEpisodes(seasonNumber) {
    const episodesGrid = document.getElementById('episodesGrid');
    episodesGrid.innerHTML = '<div class="loading-episodes">Loading episodes...</div>';

    try {
        const seasonData = await API.getSeasonDetails(currentId, seasonNumber);
        if (!seasonData || !seasonData.episodes) {
            episodesGrid.innerHTML = '<p>No episodes found</p>';
            return;
        }

        episodesGrid.innerHTML = seasonData.episodes.map(ep => `
            <div class="episode-card ${ep.episode_number === currentEpisode && seasonNumber === currentSeason ? 'active' : ''}"
                 data-episode="${ep.episode_number}"
                 onclick="playEpisode(${seasonNumber}, ${ep.episode_number})">
                <div class="episode-thumb">
                    <img src="${ep.still_path
                        ? API.getImageUrl(ep.still_path, 'card')
                        : 'https://via.placeholder.com/300x170?text=No+Image'}"
                         alt="${ep.name}" loading="lazy">
                    <div class="episode-play"><i class="fas fa-play"></i></div>
                </div>
                <div class="episode-info">
                    <h4>E${ep.episode_number}: ${ep.name}</h4>
                    <p>${ep.overview?.slice(0, 100) || 'No description'}${ep.overview?.length > 100 ? '...' : ''}</p>
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error('Error loading episodes:', error);
        episodesGrid.innerHTML = '<p>Failed to load episodes</p>';
    }
}

function playEpisode(season, episode) {
    currentSeason  = season;
    currentEpisode = episode;

    const newUrl = `watch.html?type=tv&id=${currentId}&season=${season}&episode=${episode}`;
    window.history.pushState({}, '', newUrl);

    document.querySelectorAll('.episode-card').forEach(card => {
        card.classList.toggle('active', parseInt(card.dataset.episode) === episode);
    });

    loadPlayer();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============ SIMILAR CONTENT ============

function loadSimilarContent(items) {
    const similarGrid = document.getElementById('similarGrid');
    if (!items || items.length === 0) {
        similarGrid.innerHTML = '<p>No similar content found</p>';
        return;
    }
    similarGrid.innerHTML = items.slice(0, 12).map(item => `
        <a href="watch.html?type=${currentType}&id=${item.id}" class="similar-card">
            <img src="${item.poster_path
                ? API.getImageUrl(item.poster_path, 'poster')
                : 'https://via.placeholder.com/200x300?text=No+Image'}"
                 alt="${item.title || item.name}" loading="lazy">
            <div class="similar-info">
                <h4>${item.title || item.name}</h4>
                <span><i class="fas fa-star"></i> ${item.vote_average?.toFixed(1) || 'N/A'}</span>
            </div>
        </a>
    `).join('');
}

// ============ ACTION BUTTONS ============
// Buttons are hardcoded in watch.html — we just bind events here

function setupActionButtons() {
    const inLocal = Storage.isInMyList(parseInt(currentId), currentType);
    setListButtonState(inLocal);

    const listBtn  = document.getElementById('listBtn');
    const shareBtn = document.getElementById('shareBtn');
    const likeBtn  = document.getElementById('likeBtn');

    if (listBtn)  listBtn.addEventListener('click', toggleMyList);
    if (shareBtn) shareBtn.addEventListener('click', shareContent);
    if (likeBtn)  likeBtn.addEventListener('click', () => {
        likeBtn.classList.toggle('liked');
        likeBtn.querySelector('i').classList.toggle('fas');
        likeBtn.querySelector('i').classList.toggle('far');
        showNotification(likeBtn.classList.contains('liked') ? 'Added to Liked!' : 'Removed from Liked');
    });
}

// ── Set list button UI state ─────────────────────────────────────────────────
function setListButtonState(isInList) {
    const listBtn = document.getElementById('listBtn');
    if (!listBtn) return;
    if (isInList) {
        listBtn.innerHTML = '<i class="fas fa-check"></i><span>In My List</span>';
        listBtn.classList.add('in-list');
    } else {
        listBtn.innerHTML = '<i class="fas fa-plus"></i><span>My List</span>';
        listBtn.classList.remove('in-list');
    }
}

// ── Toggle My List — saves to Firebase + localStorage ────────────────────────
async function toggleMyList() {
    const listBtn  = document.getElementById('listBtn');
    const isInList = listBtn.classList.contains('in-list');

    // Optimistic UI — update immediately so it feels instant
    setListButtonState(!isInList);

    if (isInList) {
        Storage.removeFromMyList(parseInt(currentId), currentType);
        await removeFromFavoritesFirebase();
        showNotification('Removed from My List');
    } else {
        Storage.addToMyList({
            id:            parseInt(currentId),
            type:          currentType,
            title:         mediaData?.title || mediaData?.name,
            poster_path:   mediaData?.poster_path,
            backdrop_path: mediaData?.backdrop_path,
            vote_average:  mediaData?.vote_average
        });
        await addToFavoritesFirebase();
        showNotification('Added to My List ✓');
    }
}

function shareContent() {
    const url   = window.location.href;
    const title = mediaData?.title || mediaData?.name || 'Check this out!';
    if (navigator.share) {
        navigator.share({ title, text: `Watch ${title} on Streamify`, url });
    } else {
        navigator.clipboard.writeText(url).then(() => showNotification('Link copied to clipboard!'));
    }
}

// ============ UTILITIES ============

function formatRuntime(minutes) {
    if (!minutes) return 'N/A';
    const hrs  = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
}

function showError(message) {
    document.getElementById('watchTitle').textContent = 'Error';
    document.getElementById('watchDesc').textContent  = message;
}

function showNotification(message) {
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `<i class="fas fa-check-circle"></i><span>${message}</span>`;
    document.body.appendChild(notification);
    setTimeout(() => notification.classList.add('show'), 10);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}
