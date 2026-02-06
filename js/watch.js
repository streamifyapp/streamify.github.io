/* ============================================
   STREAMIFY - WATCH PAGE LOGIC
   Fixed TV Series Episode Selection
============================================ */

const WatchDOM = {
    watchNav: document.getElementById('watchNav'),
    watchTitle: document.getElementById('watchTitle'),
    playerContainer: document.getElementById('playerContainer'),
    playerLoading: document.getElementById('playerLoading'),
    videoPlayer: document.getElementById('videoPlayer'),
    
    infoTitle: document.getElementById('infoTitle'),
    infoMatch: document.getElementById('infoMatch'),
    infoYear: document.getElementById('infoYear'),
    infoDuration: document.getElementById('infoDuration'),
    infoDescription: document.getElementById('infoDescription'),
    infoCast: document.getElementById('infoCast'),
    infoGenres: document.getElementById('infoGenres'),
    infoRating: document.getElementById('infoRating'),
    
    addListBtn: document.getElementById('addListBtn'),
    likeBtn: document.getElementById('likeBtn'),
    shareBtn: document.getElementById('shareBtn'),
    
    episodesSection: document.getElementById('episodesSection'),
    seasonSelect: document.getElementById('seasonSelect'),
    episodesList: document.getElementById('episodesList'),
    
    similarContent: document.getElementById('similarContent')
};

let currentContent = null;
let currentType = 'movie';
let currentSeason = 1;
let currentEpisode = 1;
let seasonsData = [];
let isPlaying = false;

document.addEventListener('DOMContentLoaded', () => {
    initWatchPage();
});

async function initWatchPage() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const type = params.get('type') || 'movie';
    const season = parseInt(params.get('season')) || 1;
    const episode = parseInt(params.get('episode')) || 1;
    
    if (!id) {
        window.location.href = 'index.html';
        return;
    }
    
    currentType = type;
    currentSeason = season;
    currentEpisode = episode;
    
    await loadContent(id, type);
    
    // For movies, play immediately
    // For TV shows, show episode selector first (don't auto-play)
    if (type === 'movie') {
        playVideo(id, type);
    }
    
    initActionButtons();
}

async function loadContent(id, type) {
    let data;
    
    if (type === 'movie') {
        data = await API.getMovieDetails(id);
    } else {
        data = await API.getTVDetails(id);
    }
    
    if (!data) {
        console.error('Failed to load content');
        return;
    }
    
    currentContent = { ...data, type };
    updatePageInfo(data, type);
    
    if (type === 'tv') {
        await loadSeasons(id, data.seasons);
    }
    
    loadSimilarContent(data);
}

function updatePageInfo(data, type) {
    const title = data.title || data.name;
    
    WatchDOM.watchTitle.textContent = title;
    document.title = `${title} - Streamify`;
    
    WatchDOM.infoTitle.textContent = title;
    WatchDOM.infoMatch.textContent = `${Math.round(data.vote_average * 10)}% Match`;
    WatchDOM.infoYear.textContent = (data.release_date || data.first_air_date || '').split('-')[0];
    WatchDOM.infoDescription.textContent = data.overview || 'No description available.';
    WatchDOM.infoRating.textContent = data.vote_average ? data.vote_average.toFixed(1) : 'N/A';
    
    if (type === 'movie') {
        WatchDOM.infoDuration.textContent = formatRuntime(data.runtime);
    } else {
        WatchDOM.infoDuration.textContent = `${data.number_of_seasons} Season${data.number_of_seasons > 1 ? 's' : ''}`;
    }
    
    if (data.genres) {
        WatchDOM.infoGenres.textContent = data.genres.map(g => g.name).join(', ');
    }
    
    if (data.credits && data.credits.cast) {
        const topCast = data.credits.cast.slice(0, 5).map(c => c.name).join(', ');
        WatchDOM.infoCast.textContent = topCast || 'N/A';
    }
    
    updateListButtonState();
}

function formatRuntime(minutes) {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
}

function playVideo(id, type, season = 1, episode = 1) {
    let streamUrl;
    
    if (type === 'movie') {
        streamUrl = CONFIG.getMovieStreamUrl(id);
    } else {
        streamUrl = CONFIG.getTVStreamUrl(id, season, episode);
    }
    
    WatchDOM.videoPlayer.src = streamUrl;
    isPlaying = true;
    
    WatchDOM.videoPlayer.onload = () => {
        WatchDOM.playerLoading.classList.add('hidden');
    };
    
    const newUrl = `watch.html?id=${id}&type=${type}&season=${season}&episode=${episode}`;
    window.history.replaceState({}, '', newUrl);
    
    // Scroll to player
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Update continue watching
    updateContinueWatching();
}

// ============ SEASONS & EPISODES - FIXED ============
async function loadSeasons(tvId, seasons) {
    if (!seasons || seasons.length === 0) return;
    
    seasonsData = seasons.filter(s => s.season_number > 0);
    
    if (seasonsData.length === 0) return;
    
    WatchDOM.episodesSection.style.display = 'block';
    
    WatchDOM.seasonSelect.innerHTML = seasonsData.map(season => `
        <option value="${season.season_number}" ${season.season_number === currentSeason ? 'selected' : ''}>
            Season ${season.season_number} (${season.episode_count} Episodes)
        </option>
    `).join('');
    
    await loadEpisodes(tvId, currentSeason);
    
    WatchDOM.seasonSelect.addEventListener('change', async (e) => {
        currentSeason = parseInt(e.target.value);
        currentEpisode = 1;
        await loadEpisodes(tvId, currentSeason);
    });
}

async function loadEpisodes(tvId, seasonNumber) {
    WatchDOM.episodesList.innerHTML = `
        <div style="padding: 30px; text-align: center; color: #808080;">
                    <i class="fas fa-spinner fa-spin" style="font-size: 24px;"></i>
            <p style="margin-top: 10px;">Loading episodes...</p>
        </div>
    `;
    
    const data = await API.getSeasonDetails(tvId, seasonNumber);
    
    if (!data || !data.episodes) {
        WatchDOM.episodesList.innerHTML = '<p style="padding: 30px; text-align: center; color: #808080;">No episodes found.</p>';
        return;
    }
    
    WatchDOM.episodesList.innerHTML = data.episodes.map(ep => {
        const isActive = ep.episode_number === currentEpisode && isPlaying;
        const stillImage = ep.still_path 
            ? API.getImageUrl(ep.still_path, 'card') 
            : 'https://via.placeholder.com/300x169?text=No+Preview';
        
        return `
            <div class="episode-card ${isActive ? 'active' : ''}" data-episode="${ep.episode_number}">
                <div class="episode-thumbnail">
                    <img src="${stillImage}" alt="${ep.name}">
                    <div class="episode-play-icon">
                        <i class="fas fa-play"></i>
                    </div>
                    <span class="episode-number-badge">${ep.episode_number}</span>
                </div>
                <div class="episode-info">
                    <div class="episode-header">
                        <span class="episode-title">${ep.episode_number}. ${ep.name}</span>
                        <span class="episode-duration">${ep.runtime ? ep.runtime + 'm' : ''}</span>
                    </div>
                    <p class="episode-description">${ep.overview || 'No description available.'}</p>
                </div>
            </div>
        `;
    }).join('');
    
    // Add click events to episodes
    WatchDOM.episodesList.querySelectorAll('.episode-card').forEach(card => {
        card.addEventListener('click', () => {
            const episodeNum = parseInt(card.dataset.episode);
            currentEpisode = episodeNum;
            
            // Update active state
            WatchDOM.episodesList.querySelectorAll('.episode-card').forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            
            // Play the episode
            playVideo(currentContent.id, 'tv', currentSeason, episodeNum);
        });
    });
}

// ============ SIMILAR CONTENT ============
function loadSimilarContent(data) {
    let similar = [];
    
    if (data.similar && data.similar.results) {
        similar = data.similar.results.slice(0, 12);
    } else if (data.recommendations && data.recommendations.results) {
        similar = data.recommendations.results.slice(0, 12);
    }
    
    if (similar.length === 0) {
        WatchDOM.similarContent.innerHTML = '<p style="color: #808080;">No similar content found.</p>';
        return;
    }
    
    WatchDOM.similarContent.innerHTML = similar.map(item => `
        <div class="similar-card" data-id="${item.id}" data-type="${currentType}">
            <img src="${API.getImageUrl(item.backdrop_path || item.poster_path, 'card')}" alt="${item.title || item.name}">
            <div class="similar-card-info">
                <p class="similar-card-title">${item.title || item.name}</p>
                <div class="similar-card-meta">
                    <span class="similar-card-match">${Math.round(item.vote_average * 10)}% Match</span>
                    <span>${(item.release_date || item.first_air_date || '').split('-')[0]}</span>
                </div>
            </div>
        </div>
    `).join('');
    
    WatchDOM.similarContent.querySelectorAll('.similar-card').forEach(card => {
        card.addEventListener('click', () => {
            const id = card.dataset.id;
            const type = card.dataset.type;
            window.location.href = `watch.html?id=${id}&type=${type}`;
        });
    });
}

// ============ ACTION BUTTONS ============
function initActionButtons() {
    WatchDOM.addListBtn.addEventListener('click', () => {
        if (currentContent) {
            if (Storage.isInMyList(currentContent.id, currentType)) {
                Storage.removeFromMyList(currentContent.id, currentType);
            } else {
                Storage.addToMyList({
                    ...currentContent,
                    type: currentType
                });
            }
            updateListButtonState();
        }
    });
    
    WatchDOM.likeBtn.addEventListener('click', () => {
        WatchDOM.likeBtn.classList.toggle('active');
    });
    
    WatchDOM.shareBtn.addEventListener('click', async () => {
        const shareData = {
            title: currentContent.title || currentContent.name,
            text: `Watch ${currentContent.title || currentContent.name} on Streamify!`,
            url: window.location.href
        };
        
        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                copyToClipboard(window.location.href);
            }
        } else {
            copyToClipboard(window.location.href);
        }
    });
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert('Link copied to clipboard!');
    });
}

function updateListButtonState() {
    if (currentContent && Storage.isInMyList(currentContent.id, currentType)) {
        WatchDOM.addListBtn.classList.add('active');
        WatchDOM.addListBtn.querySelector('i').className = 'fas fa-check';
    } else {
        WatchDOM.addListBtn.classList.remove('active');
        WatchDOM.addListBtn.querySelector('i').className = 'fas fa-plus';
    }
}

// ============ CONTINUE WATCHING ============
function updateContinueWatching() {
    if (currentContent) {
        Storage.updateContinueWatching({
            id: currentContent.id,
            type: currentType,
            title: currentContent.title || currentContent.name,
            poster_path: currentContent.poster_path,
            backdrop_path: currentContent.backdrop_path,
            season: currentType === 'tv' ? currentSeason : null,
            episode: currentType === 'tv' ? currentEpisode : null
        }, Math.floor(Math.random() * 50) + 10);
    }
}

// ============ KEYBOARD SHORTCUTS ============
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        window.location.href = 'index.html';
    }
    
    if (e.key === 'f' || e.key === 'F') {
        if (WatchDOM.playerContainer.requestFullscreen) {
            WatchDOM.playerContainer.requestFullscreen();
        }
    }
});
            
