/* ============================================
   STREAMIFY - HOMEPAGE LOGIC
   Complete Fixed Version
============================================ */

// DOM Elements
const DOM = {
    navbar: document.getElementById('navbar'),
    menuBtn: document.getElementById('menuBtn'),
    mobileMenu: document.getElementById('mobileMenu'),
    closeMenu: document.getElementById('closeMenu'),
    searchBtn: document.getElementById('searchBtn'),
    searchModal: document.getElementById('searchModal'),
    searchInput: document.getElementById('searchInput'),
    searchClose: document.getElementById('searchClose'),
    searchResults: document.getElementById('searchResults'),
    
    heroBackground: document.getElementById('heroBackground'),
    heroTitle: document.getElementById('heroTitle'),
    heroDescription: document.getElementById('heroDescription'),
    heroRating: document.getElementById('heroRating'),
    heroYear: document.getElementById('heroYear'),
    heroPlayBtn: document.getElementById('heroPlayBtn'),
    heroInfoBtn: document.getElementById('heroInfoBtn'),
    
    trendingNow: document.getElementById('trendingNow'),
    newReleases: document.getElementById('newReleases'),
    topRated: document.getElementById('topRated'),
    kDrama: document.getElementById('kDrama'),
    bollywood: document.getElementById('bollywood'),
    actionMovies: document.getElementById('actionMovies'),
    comedyMovies: document.getElementById('comedyMovies'),
    horrorMovies: document.getElementById('horrorMovies'),
    romanceMovies: document.getElementById('romanceMovies'),
    scifiMovies: document.getElementById('scifiMovies'),
    thrillerMovies: document.getElementById('thrillerMovies'),
    animationMovies: document.getElementById('animationMovies'),
    documentaries: document.getElementById('documentaries'),
    
    seeAllModal: document.getElementById('seeAllModal'),
    seeAllTitle: document.getElementById('seeAllTitle'),
    seeAllGrid: document.getElementById('seeAllGrid'),
    seeAllClose: document.getElementById('seeAllClose'),
    
    detailModal: document.getElementById('detailModal'),
    detailClose: document.getElementById('detailClose'),
    detailBanner: document.getElementById('detailBanner'),
    detailTitle: document.getElementById('detailTitle'),
    detailRating: document.getElementById('detailRating'),
    detailYear: document.getElementById('detailYear'),
    detailDuration: document.getElementById('detailDuration'),
    detailDescription: document.getElementById('detailDescription'),
    detailGenres: document.getElementById('detailGenres'),
    detailPlayBtn: document.getElementById('detailPlayBtn'),
    detailListBtn: document.getElementById('detailListBtn')
};

let currentItem = null;
let heroItems = [];
let heroIndex = 0;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    initMobileMenu();
    initSearch();
    initModals();
    initSeeAll();
    loadAllContent();
});

// Navbar scroll effect
function initNavbar() {
    window.addEventListener('scroll', () => {
        DOM.navbar.classList.toggle('scrolled', window.scrollY > 50);
    });
}

// Mobile Menu
function initMobileMenu() {
    DOM.menuBtn?.addEventListener('click', () => {
        DOM.mobileMenu.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
    
    DOM.closeMenu?.addEventListener('click', closeMobileMenu);
    
    // Close when clicking outside
    document.addEventListener('click', (e) => {
        if (DOM.mobileMenu.classList.contains('active') && 
            !DOM.mobileMenu.contains(e.target) && 
            !DOM.menuBtn.contains(e.target)) {
            closeMobileMenu();
        }
    });
}

function closeMobileMenu() {
    DOM.mobileMenu.classList.remove('active');
    document.body.style.overflow = '';
}

// Search
function initSearch() {
    DOM.searchBtn?.addEventListener('click', () => {
        DOM.searchModal.classList.add('active');
        DOM.searchInput.focus();
    });
    
    DOM.searchClose?.addEventListener('click', () => {
        DOM.searchModal.classList.remove('active');
        DOM.searchInput.value = '';
        DOM.searchResults.innerHTML = '';
    });
    
    let searchTimeout;
    DOM.searchInput?.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        const query = e.target.value.trim();
        
        if (query.length > 2) {
            searchTimeout = setTimeout(() => performSearch(query), 500);
        }
    });
}

async function performSearch(query) {
    DOM.searchResults.innerHTML = '<p style="text-align:center;padding:20px;color:#888;">Searching...</p>';
    
    const data = await API.multiSearch(query);
    
    if (data?.results?.length > 0) {
        const filtered = data.results.filter(i => 
            (i.media_type === 'movie' || i.media_type === 'tv') && i.poster_path
        );
        
        DOM.searchResults.innerHTML = filtered.map(item => `
            <img src="${API.getImageUrl(item.poster_path)}" 
                 alt="${item.title || item.name}"
                 data-id="${item.id}" 
                 data-type="${item.media_type}">
        `).join('');
        
        DOM.searchResults.querySelectorAll('img').forEach(img => {
            img.addEventListener('click', () => {
                DOM.searchModal.classList.remove('active');
                openDetailModal(img.dataset.id, img.dataset.type);
            });
        });
    } else {
        DOM.searchResults.innerHTML = '<p style="text-align:center;padding:20px;color:#888;">No results found</p>';
    }
}

// Modals
function initModals() {
    DOM.detailClose?.addEventListener('click', closeDetailModal);
    
    DOM.detailModal?.addEventListener('click', (e) => {
        if (e.target === DOM.detailModal) closeDetailModal();
    });
    
    DOM.detailPlayBtn?.addEventListener('click', () => {
        if (currentItem) {
            window.location.href = `watch.html?id=${currentItem.id}&type=${currentItem.type}`;
        }
    });
    
    DOM.detailListBtn?.addEventListener('click', () => {
        if (currentItem) {
            if (Storage.isInMyList(currentItem.id, currentItem.type)) {
                Storage.removeFromMyList(currentItem.id, currentItem.type);
                DOM.detailListBtn.innerHTML = '<i class="fas fa-plus"></i> My List';
            } else {
                Storage.addToMyList(currentItem);
                DOM.detailListBtn.innerHTML = '<i class="fas fa-check"></i> Added';
            }
        }
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeDetailModal();
            closeSeeAllModal();
        }
    });
}

async function openDetailModal(id, type) {
    DOM.detailModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    let data;
    if (type === 'movie') {
        data = await API.getMovieDetails(id);
    } else {
        data = await API.getTVDetails(id);
    }
    
    if (data) {
        currentItem = { ...data, type };
        
        DOM.detailBanner.style.backgroundImage = `url(${API.getBackdropUrl(data.backdrop_path)})`;
        DOM.detailTitle.textContent = data.title || data.name;
        DOM.detailRating.textContent = `⭐ ${data.vote_average?.toFixed(1) || 'N/A'}`;
        DOM.detailYear.textContent = (data.release_date || data.first_air_date || '').split('-')[0];
        DOM.detailDuration.textContent = type === 'movie' 
            ? `${data.runtime || 0} min` 
            : `${data.number_of_seasons || 0} Season${data.number_of_seasons > 1 ? 's' : ''}`;
        DOM.detailDescription.textContent = data.overview || 'No description available.';
        DOM.detailGenres.textContent = data.genres?.map(g => g.name).join(', ') || 'N/A';
        
        // Update list button
        if (Storage.isInMyList(data.id, type)) {
            DOM.detailListBtn.innerHTML = '<i class="fas fa-check"></i> Added';
        } else {
            DOM.detailListBtn.innerHTML = '<i class="fas fa-plus"></i> My List';
        }
    }
}

function closeDetailModal() {
    DOM.detailModal.classList.remove('active');
    document.body.style.overflow = '';
    currentItem = null;
}

// See All
function initSeeAll() {
    document.querySelectorAll('.see-all-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const category = btn.dataset.category;
            openSeeAllModal(category);
        });
    });
    
    DOM.seeAllClose?.addEventListener('click', closeSeeAllModal);
}

async function openSeeAllModal(category) {
    DOM.seeAllModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    const titles = {
        trending: '🔥 Trending Now',
        new: '✨ New Releases',
        toprated: '⭐ Top Rated',
        kdrama: '🇰🇷 K-Drama',
        bollywood: '🇮🇳 Bollywood',
        action: '💥 Action',
        comedy: '😂 Comedy',
        horror: '👻 Horror',
        romance: '❤️ Romance',
        scifi: '🚀 Science Fiction',
        thriller: '😱 Thriller',
        animation: '🎨 Animation',
        documentary: '📽️ Documentary'
    };
    
    DOM.seeAllTitle.textContent = titles[category] || 'Movies';
    DOM.seeAllGrid.innerHTML = '<p style="text-align:center;padding:50px;color:#888;">Loading...</p>';
    
    let allItems = [];
    
    for (let page = 1; page <= 3; page++) {
        let data;
        
        switch(category) {
            case 'trending':
                data = await API.fetchFromTMDB('/trending/all/week', { page });
                break;
            case 'new':
                data = await API.fetchFromTMDB('/movie/now_playing', { page });
                break;
            case 'toprated':
                data = await API.fetchFromTMDB('/movie/top_rated', { page });
                break;
            case 'kdrama':
                data = await API.fetchFromTMDB('/discover/tv', { with_origin_country: 'KR', page });
                break;
            case 'bollywood':
                data = await API.fetchFromTMDB('/discover/movie', { with_origin_country: 'IN', page });
                break;
            case 'action':
                data = await API.fetchFromTMDB('/discover/movie', { with_genres: 28, page });
                break;
            case 'comedy':
                data = await API.fetchFromTMDB('/discover/movie', { with_genres: 35, page });
                break;
            case 'horror':
                data = await API.fetchFromTMDB('/discover/movie', { with_genres: 27, page });
                break;
            case 'romance':
                data = await API.fetchFromTMDB('/discover/movie', { with_genres: 10749, page });
                break;
            case 'scifi':
                data = await API.fetchFromTMDB('/discover/movie', { with_genres: 878, page });
                break;
            case 'thriller':
                data = await API.fetchFromTMDB('/discover/movie', { with_genres: 53, page });
                break;
            case 'animation':
                data = await API.fetchFromTMDB('/discover/movie', { with_genres: 16, page });
                break;
            case 'documentary':
                data = await API.fetchFromTMDB('/discover/movie', { with_genres: 99, page });
                break;
            default:
                data = await API.fetchFromTMDB('/movie/popular', { page });
        }
        
        if (data?.results) {
            allItems.push(...data.results);
        }
    }
    
    // Remove duplicates
    const unique = [];
    const ids = new Set();
    allItems.forEach(item => {
        if (!ids.has(item.id) && item.poster_path) {
            ids.add(item.id);
            unique.push(item);
        }
    });
    
    renderSeeAllGrid(unique);
}

function renderSeeAllGrid(items) {
    DOM.seeAllGrid.innerHTML = items.map(item => {
        const title = item.title || item.name;
        const year = (item.release_date || item.first_air_date || '').split('-')[0];
        const rating = item.vote_average?.toFixed(1) || 'N/A';
        const type = item.media_type || (item.first_air_date ? 'tv' : 'movie');
        
        return `
            <div class="see-all-card" data-id="${item.id}" data-type="${type}">
                <img src="${API.getImageUrl(item.poster_path)}" alt="${title}">
                <div class="see-all-card-info">
                    <p class="see-all-card-title">${title}</p>
                    <div class="see-all-card-meta">
                        <span class="see-all-card-rating">⭐ ${rating}</span>
                        <span>${year}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    DOM.seeAllGrid.querySelectorAll('.see-all-card').forEach(card => {
        card.addEventListener('click', () => {
            closeSeeAllModal();
            openDetailModal(card.dataset.id, card.dataset.type);
        });
    });
}

function closeSeeAllModal() {
    DOM.seeAllModal.classList.remove('active');
    document.body.style.overflow = '';
}

// Load All Content
async function loadAllContent() {
    loadHeroBanner();
    loadCategory(DOM.trendingNow, '/trending/all/week');
    loadCategory(DOM.newReleases, '/movie/now_playing');
    loadCategory(DOM.topRated, '/movie/top_rated');
    loadCategory(DOM.kDrama, '/discover/tv', { with_origin_country: 'KR' });
    loadCategory(DOM.bollywood, '/discover/movie', { with_origin_country: 'IN' });
    loadCategory(DOM.actionMovies, '/discover/movie', { with_genres: 28 });
    loadCategory(DOM.comedyMovies, '/discover/movie', { with_genres: 35 });
    loadCategory(DOM.horrorMovies, '/discover/movie', { with_genres: 27 });
    loadCategory(DOM.romanceMovies, '/discover/movie', { with_genres: 10749 });
    loadCategory(DOM.scifiMovies, '/discover/movie', { with_genres: 878 });
    loadCategory(DOM.thrillerMovies, '/discover/movie', { with_genres: 53 });
    loadCategory(DOM.animationMovies, '/discover/movie', { with_genres: 16 });
    loadCategory(DOM.documentaries, '/discover/movie', { with_genres: 99 });
}

async function loadHeroBanner() {
    const data = await API.getTrendingMovies('day');
    
    if (data?.results) {
        heroItems = data.results.filter(i => i.backdrop_path).slice(0, 5);
        if (heroItems.length > 0) {
            updateHero(heroItems[0]);
            setInterval(() => {
                heroIndex = (heroIndex + 1) % heroItems.length;
                updateHero(heroItems[heroIndex]);
            }, 8000);
        }
    }
}

function updateHero(item) {
    const type = item.media_type || 'movie';
    
    DOM.heroBackground.style.backgroundImage = `url(${API.getBackdropUrl(item.backdrop_path)})`;
    DOM.heroTitle.textContent = item.title || item.name;
    DOM.heroDescription.textContent = item.overview || '';
    DOM.heroRating.innerHTML = `<i class="fas fa-star"></i> ${item.vote_average?.toFixed(1) || 'N/A'}`;
    DOM.heroYear.textContent = (item.release_date || item.first_air_date || '').split('-')[0];
    
    DOM.heroPlayBtn.onclick = () => {
        window.location.href = `watch.html?id=${item.id}&type=${type}`;
    };
    
    DOM.heroInfoBtn.onclick = () => openDetailModal(item.id, type);
}

async function loadCategory(container, endpoint, params = {}) {
    if (!container) return;
    
    // Show loading
    container.innerHTML = Array(8).fill('<div class="loading-skeleton"></div>').join('');
    
    const data = await API.fetchFromTMDB(endpoint, { ...params, page: 1 });
    
    if (data?.results) {
        renderPosterCards(container, data.results);
    }
}

function renderPosterCards(container, items) {
    container.innerHTML = items.filter(i => i.poster_path).map(item => {
        const title = item.title || item.name;
        const year = (item.release_date || item.first_air_date || '').split('-')[0];
        const rating = item.vote_average?.toFixed(1) || 'N/A';
        const type = item.media_type || (item.first_air_date ? 'tv' : 'movie');
        
        return `
            <div class="poster-card" data-id="${item.id}" data-type="${type}">
                <img class="poster-image" src="${API.getImageUrl(item.poster_path)}" alt="${title}">
                <div class="poster-info">
                    <p class="poster-title">${title}</p>
                    <div class="poster-meta">
                        <span class="poster-rating">⭐ ${rating}</span>
                        <span>${year}</span>
                        <span class="poster-type">${type === 'movie' ? 'Movie' : 'Series'}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    container.querySelectorAll('.poster-card').forEach(card => {
        card.addEventListener('click', () => {
            openDetailModal(card.dataset.id, card.dataset.type);
        });
    });
}
