/* ============================================
   STREAMIFY - WATCH PAGE
   Player & Server Management
============================================ */

// Global variables
let currentType = 'movie';
let currentId = null;
let currentSeason = 1;
let currentEpisode = 1;
let currentServer = null;
let mediaData = null;

// ============ INITIALIZATION ============

document.addEventListener('DOMContentLoaded', () => {
    initWatchPage();
});

async function initWatchPage() {
    // Get URL parameters
    const params = new URLSearchParams(window.location.search);
    currentId = params.get('id');
    currentType = params.get('type') || 'movie';
    currentSeason = parseInt(params.get('season')) || 1;
    currentEpisode = parseInt(params.get('episode')) || 1;

    if (!currentId) {
        showError('No content ID provided');
        return;
    }

    // Load saved server or use default
    currentServer = localStorage.getItem(CONFIG.STORAGE_KEYS.selectedServer) || CONFIG.DEFAULT_SERVER;

    // Initialize server buttons
    initServerButtons();

    // Load content data
    await loadContentData();

    // Load player
    loadPlayer();

    // Setup action buttons
    setupActionButtons();
}

// ============ SERVER MANAGEMENT ============

function initServerButtons() {
    const serverButtonsContainer = document.getElementById('serverButtons');
    serverButtonsContainer.innerHTML = '';

    const serverKeys = CONFIG.getServerKeys();

    serverKeys.forEach((key, index) => {
        const btn = document.createElement('button');
        btn.className = `server-btn ${key === currentServer ? 'active' : ''}`;
        btn.dataset.server = key;
        btn.innerHTML = `
            <i class="fas fa-play-circle"></i>
            <span>${CONFIG.getServerName(key)}</span>
        `;
        btn.addEventListener('click', () => switchServer(key));
        serverButtonsContainer.appendChild(btn);
    });
}

function switchServer(serverKey) {
    if (serverKey === currentServer) return;

    // Update current server
    currentServer = serverKey;

    // Save preference
    localStorage.setItem(CONFIG.STORAGE_KEYS.selectedServer, serverKey);

    // Update button states
    document.querySelectorAll('.server-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.server === serverKey) {
            btn.classList.add('active');
        }
    });

    // Reload player with new server
    loadPlayer();

    // Show notification
    showNotification(`Switched to ${CONFIG.getServerName(serverKey)}`);
}

// ============ PLAYER MANAGEMENT ============

function loadPlayer() {
    const player = document.getElementById('player');
    const loader = document.getElementById('playerLoader');

    // Show loader
    loader.style.display = 'flex';
    player.style.opacity = '0';

    // Get stream URL based on type and server
    let streamUrl;
    if (currentType === 'movie') {
        streamUrl = CONFIG.getMovieStreamUrl(currentId, currentServer);
    } else {
        streamUrl = CONFIG.getTVStreamUrl(currentId, currentSeason, currentEpisode, currentServer);
    }

    // Set iframe source
    player.src = streamUrl;

    // Hide loader when iframe loads
    player.onload = () => {
        loader.style.display = 'none';
        player.style.opacity = '1';
    };

    // Handle load error
    player.onerror = () => {
        loader.innerHTML = `
            <i class="fas fa-exclamation-triangle" style="font-size: 48px; color: #e50914;"></i>
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
    // Update page title
    document.title = `${movie.title} - Streamify`;

    // Update content info
    document.getElementById('watchTitle').textContent = movie.title;
    document.getElementById('watchRating').textContent = movie.vote_average?.toFixed(1) || 'N/A';
    document.getElementById('watchYear').textContent = movie.release_date?.split('-')[0] || 'N/A';
    document.getElementById('watchDuration').textContent = formatRuntime(movie.runtime);
    document.getElementById('watchDesc').textContent = movie.overview || 'No description available.';

    // Genres
    const genres = movie.genres?.map(g => g.name).join(', ') || 'N/A';
    document.getElementById('watchGenres').textContent = genres;

    // Cast
    const cast = movie.credits?.cast?.slice(0, 5).map(c => c.name).join(', ') || 'N/A';
    document.getElementById('watchCast').textContent = cast;

    // Load similar movies
    loadSimilarContent(movie.similar?.results || movie.recommendations?.results || []);
}

function displayTVData(show) {
    // Update page title
    document.title = `${show.name} - Streamify`;

    // Update content info
    document.getElementById('watchTitle').textContent = show.name;
    document.getElementById('watchRating').textContent = show.vote_average?.toFixed(1) || 'N/A';
    document.getElementById('watchYear').textContent = show.first_air_date?.split('-')[0] || 'N/A';
    document.getElementById('watchDuration').textContent = `${show.number_of_seasons} Season${show.number_of_seasons > 1 ? 's' : ''}`;
    document.getElementById('watchDesc').textContent = show.overview || 'No description available.';

    // Genres
    const genres = show.genres?.map(g => g.name).join(', ') || 'N/A';
    document.getElementById('watchGenres').textContent = genres;

    // Cast
    const cast = show.credits?.cast?.slice(0, 5).map(c => c.name).join(', ') || 'N/A';
    document.getElementById('watchCast').textContent = cast;

    // Show episode selector
    initEpisodeSelector(show);

    // Load similar shows
    loadSimilarContent(show.similar?.results || show.recommendations?.results || []);
}

// ============ EPISODE SELECTOR ============

function initEpisodeSelector(show) {
    const episodeSelector = document.getElementById('episodeSelector');
    const seasonSelect = document.getElementById('seasonSelect');

    if (!show.seasons || show.seasons.length === 0) {
        episodeSelector.style.display = 'none';
        return;
    }

    episodeSelector.style.display = 'block';

    // Filter out season 0 (specials) and populate season select
    const seasons = show.seasons.filter(s => s.season_number > 0);
    seasonSelect.innerHTML = seasons.map(s => 
        `<option value="${s.season_number}" ${s.season_number === currentSeason ? 'selected' : ''}>
            Season ${s.season_number}
        </option>`
    ).join('');

    // Load episodes for current season
    loadEpisodes(currentSeason);

    // Season change event
    seasonSelect.addEventListener('change', (e) => {
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
                    <img src="${ep.still_path ? API.getImageUrl(ep.still_path, 'card') : 'https://via.placeholder.com/300x170?text=No+Image'}" 
                         alt="${ep.name}"
                         loading="lazy">
                    <div class="episode-play">
                        <i class="fas fa-play"></i>
                    </div>
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
    currentSeason = season;
    currentEpisode = episode;

    // Update URL without refresh
    const newUrl = `watch.html?type=tv&id=${currentId}&season=${season}&episode=${episode}`;
    window.history.pushState({}, '', newUrl);

    // Update active episode
    document.querySelectorAll('.episode-card').forEach(card => {
        card.classList.remove('active');
        if (parseInt(card.dataset.episode) === episode) {
            card.classList.add('active');
        }
    });

    // Reload player
    loadPlayer();

    // Scroll to player
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
            <img src="${item.poster_path ? API.getImageUrl(item.poster_path, 'poster') : 'https://via.placeholder.com/200x300?text=No+Image'}" 
                 alt="${item.title || item.name}"
                 loading="lazy">
            <div class="similar-info">
                <h4>${item.title || item.name}</h4>
                <span><i class="fas fa-star"></i> ${item.vote_average?.toFixed(1) || 'N/A'}</span>
            </div>
        </a>
    `).join('');
}

// ============ ACTION BUTTONS ============

function setupActionButtons() {
    // My List button
    const listBtn = document.getElementById('listBtn');
    updateListButton();
    listBtn.addEventListener('click', toggleMyList);

    // Share button
    const shareBtn = document.getElementById('shareBtn');
    shareBtn.addEventListener('click', shareContent);

    // Like button
    const likeBtn = document.getElementById('likeBtn');
    likeBtn.addEventListener('click', () => {
        likeBtn.classList.toggle('liked');
        likeBtn.querySelector('i').classList.toggle('fas');
        likeBtn.querySelector('i').classList.toggle('far');
        showNotification(likeBtn.classList.contains('liked') ? 'Added to Liked!' : 'Removed from Liked');
    });
}

function updateListButton() {
    const listBtn = document.getElementById('listBtn');
    const isInList = Storage.isInMyList(parseInt(currentId), currentType);
    
    if (isInList) {
        listBtn.innerHTML = '<i class="fas fa-check"></i><span>In My List</span>';
        listBtn.classList.add('in-list');
    } else {
        listBtn.innerHTML = '<i class="fas fa-plus"></i><span>My List</span>';
        listBtn.classList.remove('in-list');
    }
}

function toggleMyList() {
    const isInList = Storage.isInMyList(parseInt(currentId), currentType);
    
    if (isInList) {
        Storage.removeFromMyList(parseInt(currentId), currentType);
        showNotification('Removed from My List');
    } else {
        Storage.addToMyList({
            id: parseInt(currentId),
            type: currentType,
            title: mediaData?.title || mediaData?.name,
            poster_path: mediaData?.poster_path,
            backdrop_path: mediaData?.backdrop_path,
            vote_average: mediaData?.vote_average
        });
        showNotification('Added to My List');
    }
    
    updateListButton();
}

function shareContent() {
    const url = window.location.href;
    const title = mediaData?.title || mediaData?.name || 'Check this out!';
    
    if (navigator.share) {
        navigator.share({
            title: title,
            text: `Watch ${title} on Streamify`,
            url: url
        });
    } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(url).then(() => {
            showNotification('Link copied to clipboard!');
        });
    }
}

// ============ UTILITIES ============

function formatRuntime(minutes) {
    if (!minutes) return 'N/A';
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
}

function showError(message) {
    document.getElementById('watchTitle').textContent = 'Error';
    document.getElementById('watchDesc').textContent = message;
}

function showNotification(message) {
    // Remove existing notification
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();

    // Create notification
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(notification);

    // Show notification
    setTimeout(() => notification.classList.add('show'), 10);

    // Hide after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}
