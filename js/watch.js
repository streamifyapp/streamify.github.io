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
            
