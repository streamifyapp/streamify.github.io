/* ============================================
   WATCH PAGE - FINAL
============================================ */

const $ = id => document.getElementById(id);

const DOM = {
    playerLoader: $('playerLoader'),
    player: $('player'),
    watchTitle: $('watchTitle'),
    watchRating: $('watchRating'),
    watchYear: $('watchYear'),
    watchDuration: $('watchDuration'),
    watchDesc: $('watchDesc'),
    watchGenres: $('watchGenres'),
    watchCast: $('watchCast'),
    episodeSelector: $('episodeSelector'),
    seasonSelect: $('seasonSelect'),
    episodesGrid: $('episodesGrid'),
    listBtn: $('listBtn'),
    shareBtn: $('shareBtn'),
    likeBtn: $('likeBtn'),
    similarGrid: $('similarGrid')
};

let content = null;
let contentType = 'movie';
let currentSeason = 1;
let currentEpisode = 1;

// Init
document.addEventListener('DOMContentLoaded', init);

async function init() {
    const params = new URLSearchParams(location.search);
    const id = params.get('id');
    const type = params.get('type') || 'movie';
    
    if (!id) {        location.href = 'index.html';
        return;
    }
    
    contentType = type;
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
    
    if (!data) {
        alert('Failed to load content');
        return;
    }
    
    content = { ...data, type };
    
    // Update UI
    document.title = `${data.title || data.name} - Streamify`;
    DOM.watchTitle.textContent = data.title || data.name;
    DOM.watchRating.textContent = data.vote_average?.toFixed(1) || 'N/A';
    DOM.watchYear.textContent = (data.release_date || data.first_air_date || '').split('-')[0];
    DOM.watchDesc.textContent = data.overview || 'No description available.';
    DOM.watchGenres.textContent = data.genres?.map(g => g.name).join(', ') || '-';
    
    if (data.credits?.cast) {
        DOM.watchCast.textContent = data.credits.cast.slice(0, 6).map(c => c.name).join(', ') || '-';
    }
    
    if (type === 'movie') {
        DOM.watchDuration.textContent = `${data.runtime || 0} min`;
        // Play movie immediately
        playVideo(id, 'movie');
    } else {
        DOM.watchDuration.textContent = `${data.number_of_seasons} Season${data.number_of_seasons > 1 ? 's' : ''}`;
        // Load episodes
        await loadSeasons(id, data.seasons);
        // Auto-play first episode
        playVideo(id, 'tv', 1, 1);
    }
    
    // Load similar content
    loadSimilar(data);
    
    // Update list button
    updateListBtn();
    
    // Save to continue watching
    saveToContinue();
}

async function loadSeasons(tvId, seasons) {
    if (!seasons || seasons.length === 0) return;
    
    const validSeasons = seasons.filter(s => s.season_number > 0);
    if (validSeasons.length === 0) return;
    
    DOM.episodeSelector.style.display = 'block';
    
    // Populate season dropdown
    DOM.seasonSelect.innerHTML = validSeasons.map(s => 
        `<option value="${s.season_number}">Season ${s.season_number}</option>`
    ).join('');
    
    // Load first season episodes
    await loadEpisodes(tvId, 1);
    
    // Season change event
    DOM.seasonSelect.addEventListener('change', async () => {
        currentSeason = parseInt(DOM.seasonSelect.value);
        await loadEpisodes(tvId, currentSeason);
    });
}

async function loadEpisodes(tvId, seasonNum) {
    DOM.episodesGrid.innerHTML = `
        <div style="text-align:center;padding:40px;color:#666;">
            <div class="spinner" style="margin:0 auto 15px;width:40px;height:40px;"></div>
            Loading episodes...
        </div>
    `;
    
    const data = await API.getSeasonDetails(tvId, seasonNum);
    
    if (!data || !data.episodes) {
        DOM.episodesGrid.innerHTML = '<p style="text-align:center;padding:30px;color:#666;">No episodes found</p>';
        return;
    }
    
    DOM.episodesGrid.innerHTML = data.episodes.map(ep => {
        const isActive = ep.episode_number === currentEpisode && seasonNum === currentSeason;
        const stillImg = ep.still_path 
            ? API.getImageUrl(ep.still_path, 'card') 
            : 'https://via.placeholder.com/320x180/1a1a1a/666?text=No+Preview';
        
        return `
            <div class="episode-card ${isActive ? 'active' : ''}" 
                 data-season="${seasonNum}" 
                 data-episode="${ep.episode_number}">
                <div class="episode-thumb">
                    <img src="${stillImg}" alt="${ep.name}">
                    <span class="episode-number">E${ep.episode_number}</span>
                    <div class="episode-play">
                        <i class="fas fa-play"></i>
                    </div>
                </div>
                <div class="episode-info">
                    <div class="episode-header">
                        <span class="episode-title">${ep.name || 'Episode ' + ep.episode_number}</span>
                        <span class="episode-duration">${ep.runtime ? ep.runtime + ' min' : ''}</span>
                    </div>
                    <p class="episode-desc">${ep.overview || 'No description available for this episode.'}</p>
                </div>
            </div>
        `;
    }).join('');
    
    // Add click events
    DOM.episodesGrid.querySelectorAll('.episode-card').forEach(card => {
        card.addEventListener('click', () => {
            const season = parseInt(card.dataset.season);
            const episode = parseInt(card.dataset.episode);
            
            currentSeason = season;
            currentEpisode = episode;
            
            // Update active state
            DOM.episodesGrid.querySelectorAll('.episode-card').forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            
            // Play episode
            playVideo(content.id, 'tv', season, episode);
            
            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
            
            // Save progress
            saveToContinue();
        });
    });
}

function playVideo(id, type, season = 1, episode = 1) {
    let url;
    
    if (type === 'movie') {
        url = CONFIG.getMovieStreamUrl(id);
    } else {
        url = CONFIG.getTVStreamUrl(id, season, episode);
    }
    
    DOM.player.src = url;
    
    DOM.player.onload = () => {
        DOM.playerLoader.classList.add('hidden');
    };
    
    // Update URL
    const newUrl = type === 'movie' 
        ? `watch.html?id=${id}&type=movie`
        : `watch.html?id=${id}&type=tv&s=${season}&e=${episode}`;
    history.replaceState(null, '', newUrl);
}

function loadSimilar(data) {
    const items = data.similar?.results || data.recommendations?.results || [];
    
    if (items.length === 0) {
        DOM.similarGrid.innerHTML = '<p style="color:#666;">No similar content found</p>';
        return;
    }
    
    DOM.similarGrid.innerHTML = items.slice(0, 12).map(item => `
        <div class="similar-card" onclick="location.href='watch.html?id=${item.id}&type=${contentType}'">
            <img src="${API.getImageUrl(item.poster_path)}" alt="${item.title || item.name}" loading="lazy">
            <p>${item.title || item.name}</p>
        </div>
    `).join('');
}

function initButtons() {
    // My List
    DOM.listBtn.addEventListener('click', () => {
        if (!content) return;
        
        if (Storage.isInMyList(content.id, contentType)) {
            Storage.removeFromMyList(content.id, contentType);
        } else {
            Storage.addToMyList({ ...content, type: contentType });
        }
        updateListBtn();
    });
    
    // Share
    DOM.shareBtn.addEventListener('click', async () => {
        const shareData = {
            title: content?.title || content?.name || 'Streamify',
            text: `Watch ${content?.title || content?.name} on Streamify!`,
            url: location.href
        };
        
        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(location.href);
                alert('Link copied to clipboard!');
            }
        } catch (err) {
            console.log('Share failed:', err);
        }
    });
    
    // Like
    DOM.likeBtn.addEventListener('click', () => {
        DOM.likeBtn.classList.toggle('active');
    });
}

function updateListBtn() {
    if (content && Storage.isInMyList(content.id, contentType)) {
        DOM.listBtn.classList.add('active');
        DOM.listBtn.innerHTML = '<i class="fas fa-check"></i><span>Added</span>';
    } else {
        DOM.listBtn.classList.remove('active');
        DOM.listBtn.innerHTML = '<i class="fas fa-plus"></i><span>My List</span>';
    }
}

function saveToContinue() {
    if (!content) return;
    
    Storage.updateContinueWatching({
        id: content.id,
        type: contentType,
        title: content.title || content.name,
        poster_path: content.poster_path,
        backdrop_path: content.backdrop_path,
        season: contentType === 'tv' ? currentSeason : null,
        episode: contentType === 'tv' ? currentEpisode : null
    }, Math.floor(Math.random() * 40) + 10);
}

// Keyboard shortcuts
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        location.href = 'index.html';
    }
    if (e.key === 'f' || e.key === 'F') {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            DOM.player.parentElement.requestFullscreen?.();
        }
    }
});
        
