/* ============================================
   STREAMIFY - WATCH PAGE
   Complete Final Version
============================================ */

// Helper function
const $ = id => document.getElementById(id);

// DOM Elements
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

// State
let content = null;
let contentType = 'movie';
let currentSeason = 1;
let currentEpisode = 1;

// Initialize
document.addEventListener('DOMContentLoaded', init);

async function init() {
    const params = new URLSearchParams(location.search);
    const id = params.get('id');
    const type = params.get('type') || 'movie';
    
    if (!id) {
        location.href = 'index.html';
        return;
    }
    
    contentType = type;
    await loadContent(id, type);
    initButtons();
}

// Load Content Details
async function loadContent(id, type) {
    let data;
    
    if (type === 'movie') {
        data = await API.getMovieDetails(id);
    } else {
        data = await API.getTVDetails(id);
    }
    
    if (!data) {
        alert('Failed to load content');
        location.href = 'index.html';
        return;
    }
    
    content = { ...data, type };
    
    // Update Page Title
    document.title = `${data.title || data.name} - Streamify`;
    
    // Update UI Elements
    DOM.watchTitle.textContent = data.title || data.name;
    DOM.watchRating.textContent = data.vote_average?.toFixed(1) || 'N/A';
    DOM.watchYear.textContent = (data.release_date || data.first_air_date || '').split('-')[0];
    DOM.watchDesc.textContent = data.overview || 'No description available.';
    DOM.watchGenres.textContent = data.genres?.map(g => g.name).join(', ') || '-';
    
    // Cast
    if (data.credits && data.credits.cast) {
        const castNames = data.credits.cast.slice(0, 6).map(c => c.name).join(', ');
        DOM.watchCast.textContent = castNames || '-';
    } else {
        DOM.watchCast.textContent = '-';
    }
    
    // Handle Movie vs TV Show
    if (type === 'movie') {
        // Movie duration
        const hours = Math.floor((data.runtime || 0) / 60);
        const mins = (data.runtime || 0) % 60;
        DOM.watchDuration.textContent = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
        
        // Play movie immediately
        playVideo(id, 'movie');
    } else {
        // TV Show
        DOM.watchDuration.textContent = `${data.number_of_seasons || 0} Season${data.number_of_seasons > 1 ? 's' : ''}`;
        
        // Load seasons and episodes
        await loadSeasons(id, data.seasons);
        
        // Auto-play first episode
        playVideo(id, 'tv', 1, 1);
    }
    
    // Load similar content
    loadSimilar(data);
    
    // Update My List button state
    updateListBtn();
    
    // Save to continue watching
    saveToContinue();
}

// Load Seasons
async function loadSeasons(tvId, seasons) {
    if (!seasons || seasons.length === 0) return;
    
    // Filter out season 0 (specials)
    const validSeasons = seasons.filter(s => s.season_number > 0);
    
    if (validSeasons.length === 0) return;
    
    // Show episode selector
    DOM.episodeSelector.style.display = 'block';
    
    // Populate season dropdown
    DOM.seasonSelect.innerHTML = validSeasons.map(s => 
        `<option value="${s.season_number}">Season ${s.season_number} (${s.episode_count} Episodes)</option>`
    ).join('');
    
    // Load first season episodes
    await loadEpisodes(tvId, 1);
    
    // Season change event listener
    DOM.seasonSelect.addEventListener('change', async () => {
        currentSeason = parseInt(DOM.seasonSelect.value);
        currentEpisode = 1;
        await loadEpisodes(tvId, currentSeason);
    });
}

// Load Episodes
async function loadEpisodes(tvId, seasonNum) {
    // Show loading
    DOM.episodesGrid.innerHTML = `
        <div style="text-align:center; padding:50px; color:#666;">
            <div class="spinner" style="margin:0 auto 15px; width:40px; height:40px; border:3px solid #333; border-top-color:#e50914; border-radius:50%; animation:spin 1s linear infinite;"></div>
            <p>Loading episodes...</p>
        </div>
    `;
    
    const data = await API.getSeasonDetails(tvId, seasonNum);
    
    if (!data || !data.episodes || data.episodes.length === 0) {
        DOM.episodesGrid.innerHTML = '<p style="text-align:center; padding:40px; color:#666;">No episodes found for this season.</p>';
        return;
    }
    
    // Render episode cards
    DOM.episodesGrid.innerHTML = data.episodes.map(ep => {
        const isActive = ep.episode_number === currentEpisode && seasonNum === currentSeason;
        
        // Episode still image
        const stillImage = ep.still_path 
            ? API.getImageUrl(ep.still_path, 'card') 
            : 'https://via.placeholder.com/320x180/1a1a1a/666666?text=No+Preview';
        
        // Episode runtime
        const runtime = ep.runtime ? `${ep.runtime} min` : '';
        
        // Episode description
        const description = ep.overview || 'No description available for this episode.';
        
        return `
            <div class="episode-card ${isActive ? 'active' : ''}" 
                 data-season="${seasonNum}" 
                 data-episode="${ep.episode_number}">
                <div class="episode-thumb">
                    <img src="${stillImage}" alt="${ep.name}" loading="lazy">
                    <span class="episode-number">E${ep.episode_number}</span>
                    <div class="episode-play">
                        <i class="fas fa-play"></i>
                    </div>
                </div>
                <div class="episode-info">
                    <div class="episode-header">
                        <span class="episode-title">${ep.name || 'Episode ' + ep.episode_number}</span>
                        <span class="episode-duration">${runtime}</span>
                    </div>
                    <p class="episode-desc">${description}</p>
                </div>
            </div>
        `;
    }).join('');
    
    // Add click events to episode cards
    DOM.episodesGrid.querySelectorAll('.episode-card').forEach(card => {
        card.addEventListener('click', () => {
            const season = parseInt(card.dataset.season);
            const episode = parseInt(card.dataset.episode);
            
            // Update current state
            currentSeason = season;
            currentEpisode = episode;
            
            // Update active class
            DOM.episodesGrid.querySelectorAll('.episode-card').forEach(c => {
                c.classList.remove('active');
            });
            card.classList.add('active');
            
            // Play the episode
            playVideo(content.id, 'tv', season, episode);
            
            // Scroll to player
            window.scrollTo({ top: 0, behavior: 'smooth' });
            
            // Save progress
            saveToContinue();
        });
    });
}

// Play Video
function playVideo(id, type, season = 1, episode = 1) {
    let streamUrl;
    
    if (type === 'movie') {
        streamUrl = CONFIG.getMovieStreamUrl(id);
    } else {
        streamUrl = CONFIG.getTVStreamUrl(id, season, episode);
    }
    
    // Set iframe source
    DOM.player.src = streamUrl;
    
    // Hide loader when iframe loads
    DOM.player.onload = () => {
        DOM.playerLoader.classList.add('hidden');
    };
    
    // Update browser URL without reload
    let newUrl;
    if (type === 'movie') {
        newUrl = `watch.html?id=${id}&type=movie`;
    } else {
        newUrl = `watch.html?id=${id}&type=tv&s=${season}&e=${episode}`;
    }
    history.replaceState(null, '', newUrl);
}

// Load Similar Content
function loadSimilar(data) {
    // Get similar or recommendations
    const items = data.similar?.results || data.recommendations?.results || [];
    
    if (items.length === 0) {
        DOM.similarGrid.innerHTML = '<p style="color:#666; padding:20px 0;">No similar content found.</p>';
        return;
    }
    
    // Render similar cards
    DOM.similarGrid.innerHTML = items.slice(0, 12).map(item => {
        const title = item.title || item.name;
        const posterUrl = item.poster_path 
            ? API.getImageUrl(item.poster_path)
            : 'https://via.placeholder.com/200x300/1a1a1a/666666?text=No+Image';
        
        return `
            <div class="similar-card" onclick="window.location.href='watch.html?id=${item.id}&type=${contentType}'">
                <img src="${posterUrl}" alt="${title}" loading="lazy">
                <p>${title}</p>
            </div>
        `;
    }).join('');
}

// Initialize Buttons
function initButtons() {
    // My List Button
    DOM.listBtn.addEventListener('click', () => {
        if (!content) return;
        
        if (Storage.isInMyList(content.id, contentType)) {
            Storage.removeFromMyList(content.id, contentType);
        } else {
            Storage.addToMyList({ ...content, type: contentType });
        }
        
        updateListBtn();
    });
    
    // Share Button
    DOM.shareBtn.addEventListener('click', async () => {
        const title = content?.title || content?.name || 'Streamify';
        const shareData = {
            title: title,
            text: `Watch ${title} on Streamify!`,
            url: window.location.href
        };
        
        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(window.location.href);
                alert('Link copied to clipboard!');
            }
        } catch (err) {
            console.log('Share error:', err);
            // Fallback - copy to clipboard
            try {
                await navigator.clipboard.writeText(window.location.href);
                alert('Link copied to clipboard!');
            } catch (e) {
                console.log('Clipboard error:', e);
            }
        }
    });
    
    // Like Button
    DOM.likeBtn.addEventListener('click', () => {
        DOM.likeBtn.classList.toggle('active');
        
        // Optional: Save like state to localStorage
        const likedItems = JSON.parse(localStorage.getItem('streamify_liked') || '[]');
        const itemId = `${contentType}_${content?.id}`;
        
        if (DOM.likeBtn.classList.contains('active')) {
            if (!likedItems.includes(itemId)) {
                likedItems.push(itemId);
            }
        } else {
            const index = likedItems.indexOf(itemId);
            if (index > -1) {
                likedItems.splice(index, 1);
            }
        }
        
        localStorage.setItem('streamify_liked', JSON.stringify(likedItems));
    });
    
    // Check if already liked
    if (content) {
        const likedItems = JSON.parse(localStorage.getItem('streamify_liked') || '[]');
        const itemId = `${contentType}_${content?.id}`;
        if (likedItems.includes(itemId)) {
            DOM.likeBtn.classList.add('active');
        }
    }
}

// Update My List Button State
function updateListBtn() {
    if (!content) return;
    
    if (Storage.isInMyList(content.id, contentType)) {
        DOM.listBtn.classList.add('active');
        DOM.listBtn.innerHTML = '<i class="fas fa-check"></i><span>Added</span>';
    } else {
        DOM.listBtn.classList.remove('active');
        DOM.listBtn.innerHTML = '<i class="fas fa-plus"></i><span>My List</span>';
    }
}

// Save to Continue Watching
function saveToContinue() {
    if (!content) return;
    
    // Random progress between 10-50%
    const progress = Math.floor(Math.random() * 40) + 10;
    
    Storage.updateContinueWatching({
        id: content.id,
        type: contentType,
        title: content.title || content.name,
        poster_path: content.poster_path,
        backdrop_path: content.backdrop_path,
        season: contentType === 'tv' ? currentSeason : null,
        episode: contentType === 'tv' ? currentEpisode : null
    }, progress);
}

// Keyboard Shortcuts
document.addEventListener('keydown', (e) => {
    // Escape - Go back to home
    if (e.key === 'Escape') {
        window.location.href = 'index.html';
    }
    
    // F - Toggle Fullscreen
    if (e.key === 'f' || e.key === 'F') {
        const playerContainer = DOM.player.parentElement;
        
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            if (playerContainer.requestFullscreen) {
                playerContainer.requestFullscreen();
            } else if (playerContainer.webkitRequestFullscreen) {
                playerContainer.webkitRequestFullscreen();
            } else if (playerContainer.msRequestFullscreen) {
                playerContainer.msRequestFullscreen();
            }
        }
    }
});

// Add spinner animation CSS dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);
