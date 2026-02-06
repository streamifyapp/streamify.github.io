/* ============================================
   WATCH PAGE - COMPLETE FIXED
============================================ */

const WatchDOM = {
    playerLoading: document.getElementById('playerLoading'),
    videoPlayer: document.getElementById('videoPlayer'),
    contentTitle: document.getElementById('contentTitle'),
    contentRating: document.getElementById('contentRating'),
    contentYear: document.getElementById('contentYear'),
    contentDuration: document.getElementById('contentDuration'),
    contentDescription: document.getElementById('contentDescription'),
    contentGenres: document.getElementById('contentGenres'),
    contentCast: document.getElementById('contentCast'),
    episodesSelector: document.getElementById('episodesSelector'),
    seasonSelect: document.getElementById('seasonSelect'),
    episodeSelect: document.getElementById('episodeSelect'),
    playEpisodeBtn: document.getElementById('playEpisodeBtn'),
    addListBtn: document.getElementById('addListBtn'),
    shareBtn: document.getElementById('shareBtn'),
    similarGrid: document.getElementById('similarGrid')
};

let currentContent = null;
let currentType = 'movie';
let currentSeason = 1;
let currentEpisode = 1;
let episodesData = [];

document.addEventListener('DOMContentLoaded', init);

async function init() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const type = params.get('type') || 'movie';
    
    if (!id) {
        window.location.href = 'index.html';
        return;
    }
    
    currentType = type;
    
    await loadContent(id, type);
    initButtons();
}

async function loadContent(id, type) {
    let data;
    
    if (type === 'movie') {
        data = await API.getMovieDetails(id);
    } else {
        data = await API.getTVDetails(id);
    }
    
    if (!data) return;
    
    currentContent = { ...data, type };
    
    // Update UI
    document.title = `${data.title || data.name} - Streamify`;
    WatchDOM.contentTitle.textContent = data.title || data.name;
    WatchDOM.contentRating.textContent = `⭐ ${data.vote_average?.toFixed(1) || 'N/A'}`;
    WatchDOM.contentYear.textContent = (data.release_date || data.first_air_date || '').split('-')[0];
    WatchDOM.contentDescription.textContent = data.overview || 'No description available.';
    WatchDOM.contentGenres.textContent = data.genres?.map(g => g.name).join(', ') || '-';
    
    if (data.credits?.cast) {
        WatchDOM.contentCast.textContent = data.credits.cast.slice(0, 5).map(c => c.name).join(', ') || '-';
    }
    
    if (type === 'movie') {
        WatchDOM.contentDuration.textContent = `${data.runtime || 0} min`;
        // Play movie immediately
        playVideo(id, 'movie');
    } else {
        WatchDOM.contentDuration.textContent = `${data.number_of_seasons} Season${data.number_of_seasons > 1 ? 's' : ''}`;
        // Show episode selector
        await loadSeasons(id, data.seasons);
    }
    
    // Load similar
    loadSimilar(data);
    
    // Update list button
    updateListButton();
}

async function loadSeasons(tvId, seasons) {
    if (!seasons?.length) return;
    
    const validSeasons = seasons.filter(s => s.season_number > 0);
    if (!validSeasons.length) return;
    
    WatchDOM.episodesSelector.style.display = 'block';
    
    // Populate season dropdown
    WatchDOM.seasonSelect.innerHTML = validSeasons.map(s => 
        `<option value="${s.season_number}">Season ${s.season_number} (${s.episode_count} Episodes)</option>`
    ).join('');
    
    // Load first season episodes
    await loadEpisodes(tvId, 1);
    
    // Season change
    WatchDOM.seasonSelect.addEventListener('change', async () => {
        currentSeason = parseInt(WatchDOM.seasonSelect.value);
        await loadEpisodes(tvId, currentSeason);
    });
    
    // Play episode button
    WatchDOM.playEpisodeBtn.addEventListener('click', () => {
        currentEpisode = parseInt(WatchDOM.episodeSelect.value);
        playVideo(tvId, 'tv', currentSeason, currentEpisode);
    });
    
    // Auto-play first episode
    playVideo(tvId, 'tv', 1, 1);
}

async function loadEpisodes(tvId, seasonNum) {
    const data = await API.getSeasonDetails(tvId, seasonNum);
    
    if (data?.episodes) {
        episodesData = data.episodes;
        
        WatchDOM.episodeSelect.innerHTML = data.episodes.map(ep => 
            `<option value="${ep.episode_number}">Ep ${ep.episode_number}: ${ep.name}</option>`
        ).join('');
    }
}

function playVideo(id, type, season = 1, episode = 1) {
    let url;
    
    if (type === 'movie') {
        url = CONFIG.getMovieStreamUrl(id);
    } else {
        url = CONFIG.getTVStreamUrl(id, season, episode);
    }
    
    WatchDOM.videoPlayer.src = url;
    
    WatchDOM.videoPlayer.onload = () => {
        WatchDOM.playerLoading.classList.add('hidden');
    };
    
    // Update URL
    const newUrl = `watch.html?id=${id}&type=${type}${type === 'tv' ? `&s=${season}&e=${episode}` : ''}`;
    history.replaceState(null, '', newUrl);
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Save to continue watching
    if (currentContent) {
        Storage.updateContinueWatching({
            id: currentContent.id,
            type: type,
            title: currentContent.title || currentContent.name,
            poster_path: currentContent.poster_path,
            backdrop_path: currentContent.backdrop_path,
            season: type === 'tv' ? season : null,
            episode: type === 'tv' ? episode : null
        }, 10);
    }
}

function loadSimilar(data) {
    const similar = data.similar?.results || data.recommendations?.results || [];
    
    WatchDOM.similarGrid.innerHTML = similar.slice(0, 12).map(item => `
        <div class="similar-card" onclick="window.location.href='watch.html?id=${item.id}&type=${currentType}'">
            <img src="${API.getImageUrl(item.poster_path)}" alt="${item.title || item.name}">
            <p>${item.title || item.name}</p>
        </div>
    `).join('');
}

function initButtons() {
    WatchDOM.addListBtn.addEventListener('click', () => {
        if (currentContent) {
            if (Storage.isInMyList(currentContent.id, currentType)) {
                Storage.removeFromMyList(currentContent.id, currentType);
            } else {
                Storage.addToMyList({ ...currentContent, type: currentType });
            }
            updateListButton();
        }
    });
    
    WatchDOM.shareBtn.addEventListener('click', () => {
        if (navigator.share) {
            navigator.share({
                title: currentContent?.title || currentContent?.name,
                url: window.location.href
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert('Link copied!');
        }
    });
}

function updateListButton() {
    if (currentContent && Storage.isInMyList(currentContent.id, currentType)) {
        WatchDOM.addListBtn.innerHTML = '<i class="fas fa-check"></i> Added';
        WatchDOM.addListBtn.classList.add('active');
    } else {
        WatchDOM.addListBtn.innerHTML = '<i class="fas fa-plus"></i> My List';
        WatchDOM.addListBtn.classList.remove('active');
    }
}
