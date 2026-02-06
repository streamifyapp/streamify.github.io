/* ============================================
   STREAMIFY - HOME PAGE
   Final Complete Version
============================================ */

// DOM Elements
const $ = id => document.getElementById(id);

const DOM = {
    navbar: $('navbar'),
    menuBtn: $('menuBtn'),
    mobileMenu: $('mobileMenu'),
    closeMenu: $('closeMenu'),
    menuOverlay: $('menuOverlay'),
    searchBtn: $('searchBtn'),
    searchModal: $('searchModal'),
    searchInput: $('searchInput'),
    searchClose: $('searchClose'),
    searchResults: $('searchResults'),
    
    heroBg: $('heroBg'),
    heroTitle: $('heroTitle'),
    heroDesc: $('heroDesc'),
    heroRating: $('heroRating'),
    heroYear: $('heroYear'),
    heroType: $('heroType'),
    heroPlay: $('heroPlay'),
    heroInfo: $('heroInfo'),
    
    continueSection: $('continueSection'),
    continueWatching: $('continueWatching'),
    trendingNow: $('trendingNow'),
    newReleases: $('newReleases'),
    topRated: $('topRated'),
    actionMovies: $('actionMovies'),
    comedyMovies: $('comedyMovies'),
    horrorMovies: $('horrorMovies'),
    romanceMovies: $('romanceMovies'),
    thrillerMovies: $('thrillerMovies'),
    scifiMovies: $('scifiMovies'),
    dramaMovies: $('dramaMovies'),
    animationMovies: $('animationMovies'),
    crimeMovies: $('crimeMovies'),
    documentaries: $('documentaries'),
    familyMovies: $('familyMovies'),
    
    seeAllModal: $('seeAllModal'),
    seeAllTitle: $('seeAllTitle'),
    seeAllGrid: $('seeAllGrid'),
    seeAllClose: $('seeAllClose'),
    
    detailModal: $('detailModal'),
    detailClose: $('detailClose'),
    detailBanner: $('detailBanner'),
    detailTitle: $('detailTitle'),
    detailRating: $('detailRating'),
    detailYear: $('detailYear'),
    detailDuration: $('detailDuration'),
    detailDesc: $('detailDesc'),
    detailGenres: $('detailGenres'),
    detailPlay: $('detailPlay'),
    detailList: $('detailList')
};

let currentItem = null;
let heroItems = [];
let heroIndex = 0;

// Genre IDs for mixing Hollywood + Bollywood
const GENRE_IDS = {
    action: 28,
    comedy: 35,
    horror: 27,
    romance: 10749,
    thriller: 53,
    scifi: 878,
    drama: 18,
    animation: 16,
    crime: 80,
    documentary: 99,
    family: 10751
};

// Init
document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    initMobileMenu();
    initSearch();
    initModals();
    initSeeAll();
    loadContinueWatching();
    loadHero();
    loadAllCategories();
});

// Navbar
function initNavbar() {
    window.addEventListener('scroll', () => {
        DOM.navbar.classList.toggle('scrolled', window.scrollY > 50);
    });
}

// Mobile Menu
function initMobileMenu() {
    DOM.menuBtn?.addEventListener('click', () => {
        DOM.mobileMenu.classList.add('active');
        DOM.menuOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
    
    const closeMenu = () => {
        DOM.mobileMenu.classList.remove('active');
        DOM.menuOverlay.classList.remove('active');
        document.body.style.overflow = '';
    };
    
    DOM.closeMenu?.addEventListener('click', closeMenu);
    DOM.menuOverlay?.addEventListener('click', closeMenu);
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
    
    let timeout;
    DOM.searchInput?.addEventListener('input', e => {
        clearTimeout(timeout);
        const q = e.target.value.trim();
        if (q.length > 2) {
            timeout = setTimeout(() => search(q), 400);
        }
    });
}

async function search(query) {
    DOM.searchResults.innerHTML = '<p style="text-align:center;padding:50px;color:#666;">Searching...</p>';
    
    const data = await API.multiSearch(query);
    if (data?.results?.length) {
        const filtered = data.results.filter(i => 
            (i.media_type === 'movie' || i.media_type === 'tv') && i.poster_path
        );
        DOM.searchResults.innerHTML = filtered.map(i => createPosterCard(i, i.media_type)).join('');
        addCardListeners(DOM.searchResults);
    } else {
        DOM.searchResults.innerHTML = '<p style="text-align:center;padding:50px;color:#666;">No results found</p>';
    }
}

// Continue Watching
function loadContinueWatching() {
    const items = Storage.getContinueWatching();
    
    if (items && items.length > 0) {
        DOM.continueSection.style.display = 'block';
        
        DOM.continueWatching.innerHTML = items.map(item => `
            <div class="poster-card" data-id="${item.id}" data-type="${item.type}">
                <img class="poster-img" src="${API.getImageUrl(item.poster_path || item.backdrop_path)}" alt="${item.title}">
                <div class="progress-wrap">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${item.progress || 10}%"></div>
                    </div>
                </div>
                <div class="poster-info">
                    <p class="poster-title">${item.title}</p>
                    <div class="poster-meta">
                        <span class="poster-type">${item.type === 'movie' ? 'Movie' : 'Series'}</span>
                        ${item.season ? `<span>S${item.season} E${item.episode}</span>` : ''}
                    </div>
                </div>
            </div>
        `).join('');
        
        addCardListeners(DOM.continueWatching);
    }
}

// Hero
async function loadHero() {
    const data = await API.getTrendingMovies('day');
    if (data?.results) {
        heroItems = data.results.filter(i => i.backdrop_path).slice(0, 8);
        if (heroItems.length) {
            updateHero(heroItems[0]);
            setInterval(() => {
                heroIndex = (heroIndex + 1) % heroItems.length;
                updateHero(heroItems[heroIndex]);
            }, 7000);
        }
    }
}

function updateHero(item) {
    const type = item.media_type || 'movie';
    
    DOM.heroBg.style.backgroundImage = `url(${API.getBackdropUrl(item.backdrop_path)})`;
    DOM.heroTitle.textContent = item.title || item.name;
    DOM.heroDesc.textContent = item.overview || '';
    DOM.heroRating.textContent = item.vote_average?.toFixed(1) || 'N/A';
    DOM.heroYear.textContent = (item.release_date || item.first_air_date || '').split('-')[0];
    DOM.heroType.textContent = type.toUpperCase();
    
    DOM.heroPlay.onclick = () => location.href = `watch.html?id=${item.id}&type=${type}`;
    DOM.heroInfo.onclick = () => openDetail(item.id, type);
}

// Load All Categories - MIXED Hollywood + Bollywood
async function loadAllCategories() {
    loadMixedCategory(DOM.trendingNow, '/trending/all/week');
    loadMixedCategory(DOM.newReleases, '/movie/now_playing');
    loadMixedCategory(DOM.topRated, '/movie/top_rated');
    
    loadMixedGenre(DOM.actionMovies, GENRE_IDS.action);
    loadMixedGenre(DOM.comedyMovies, GENRE_IDS.comedy);
    loadMixedGenre(DOM.horrorMovies, GENRE_IDS.horror);
    loadMixedGenre(DOM.romanceMovies, GENRE_IDS.romance);
    loadMixedGenre(DOM.thrillerMovies, GENRE_IDS.thriller);
    loadMixedGenre(DOM.scifiMovies, GENRE_IDS.scifi);
    loadMixedGenre(DOM.dramaMovies, GENRE_IDS.drama);
    loadMixedGenre(DOM.animationMovies, GENRE_IDS.animation);
    loadMixedGenre(DOM.crimeMovies, GENRE_IDS.crime);
    loadMixedGenre(DOM.documentaries, GENRE_IDS.documentary);
    loadMixedGenre(DOM.familyMovies, GENRE_IDS.family);
}

async function loadMixedCategory(container, endpoint) {
    if (!container) return;
    showLoading(container);
    
    // Fetch both Hollywood and Bollywood
    const [hollywood, bollywood] = await Promise.all([
        API.fetchFromTMDB(endpoint, { page: 1 }),
        API.fetchFromTMDB('/discover/movie', { with_origin_country: 'IN', sort_by: 'popularity.desc', page: 1 })
    ]);
    
    const mixed = mixContent(
        (hollywood?.results || []).map(i => ({ ...i, type: i.media_type || 'movie' })),
        (bollywood?.results || []).map(i => ({ ...i, type: 'movie' }))
    );
    
    renderCards(container, mixed);
}

async function loadMixedGenre(container, genreId) {
    if (!container) return;
    showLoading(container);
    
    const [hollywood, bollywood] = await Promise.all([
        API.fetchFromTMDB('/discover/movie', { with_genres: genreId, page: 1 }),
        API.fetchFromTMDB('/discover/movie', { with_genres: genreId, with_origin_country: 'IN', page: 1 })
    ]);
    
    const mixed = mixContent(
        (hollywood?.results || []).map(i => ({ ...i, type: 'movie' })),
        (bollywood?.results || []).map(i => ({ ...i, type: 'movie' }))
    );
    
    renderCards(container, mixed);
}

// Mix Hollywood and Bollywood alternately
function mixContent(list1, list2) {
    const mixed = [];
    const max = Math.max(list1.length, list2.length);
    
    for (let i = 0; i < max; i++) {
        if (list1[i]) mixed.push(list1[i]);
        if (list2[i]) mixed.push(list2[i]);
    }
    
    // Remove duplicates
    const seen = new Set();
    return mixed.filter(item => {
        if (seen.has(item.id) || !item.poster_path) return false;
        seen.add(item.id);
        return true;
    }).slice(0, 20);
}

function showLoading(container) {
    container.innerHTML = Array(8).fill('<div class="skeleton"></div>').join('');
}

function renderCards(container, items) {
    container.innerHTML = items.map(i => createPosterCard(i, i.type || 'movie')).join('');
    addCardListeners(container);
}

function createPosterCard(item, type) {
    const title = item.title || item.name;
    const year = (item.release_date || item.first_air_date || '').split('-')[0];
    const rating = item.vote_average?.toFixed(1) || 'N/A';
    
    return `
        <div class="poster-card" data-id="${item.id}" data-type="${type}">
            <img class="poster-img" src="${API.getImageUrl(item.poster_path)}" alt="${title}" loading="lazy">
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
}

function addCardListeners(container) {
    container.querySelectorAll('.poster-card').forEach(card => {
        card.addEventListener('click', () => {
            openDetail(card.dataset.id, card.dataset.type);
        });
    });
}

// Detail Modal
function initModals() {
    DOM.detailClose?.addEventListener('click', closeDetail);
    DOM.detailModal?.addEventListener('click', e => {
        if (e.target === DOM.detailModal) closeDetail();
    });
    
    DOM.detailPlay?.addEventListener('click', () => {
        if (currentItem) {
            location.href = `watch.html?id=${currentItem.id}&type=${currentItem.type}`;
        }
    });
    
    DOM.detailList?.addEventListener('click', () => {
        if (currentItem) {
            if (Storage.isInMyList(currentItem.id, currentItem.type)) {
                Storage.removeFromMyList(currentItem.id, currentItem.type);
                DOM.detailList.innerHTML = '<i class="fas fa-plus"></i> My List';
            } else {
                Storage.addToMyList(currentItem);
                DOM.detailList.innerHTML = '<i class="fas fa-check"></i> Added';
            }
        }
    });
    
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            closeDetail();
            closeSeeAll();
        }
    });
}

async function openDetail(id, type) {
    DOM.detailModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    const data = type === 'movie' 
        ? await API.getMovieDetails(id) 
        : await API.getTVDetails(id);
    
    if (data) {
        currentItem = { ...data, type };
        
        DOM.detailBanner.style.backgroundImage = `url(${API.getBackdropUrl(data.backdrop_path)})`;
        DOM.detailTitle.textContent = data.title || data.name;
        DOM.detailRating.textContent = data.vote_average?.toFixed(1) || 'N/A';
        DOM.detailYear.textContent = (data.release_date || data.first_air_date || '').split('-')[0];
        DOM.detailDuration.textContent = type === 'movie' 
            ? `${data.runtime || 0} min` 
            : `${data.number_of_seasons || 0} Season${data.number_of_seasons > 1 ? 's' : ''}`;
        DOM.detailDesc.textContent = data.overview || 'No description available.';
        DOM.detailGenres.textContent = data.genres?.map(g => g.name).join(', ') || 'N/A';
        
        DOM.detailList.innerHTML = Storage.isInMyList(data.id, type) 
            ? '<i class="fas fa-check"></i> Added' 
            : '<i class="fas fa-plus"></i> My List';
    }
}

function closeDetail() {
    DOM.detailModal.classList.remove('active');
    document.body.style.overflow = '';
    currentItem = null;
}

// See All
function initSeeAll() {
    document.querySelectorAll('.see-all').forEach(btn => {
        btn.addEventListener('click', () => openSeeAll(btn.dataset.category));
    });
    
    DOM.seeAllClose?.addEventListener('click', closeSeeAll);
}

async function openSeeAll(category) {
    DOM.seeAllModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    const titles = {
        trending: 'Trending Now',
        new: 'New Releases',
        toprated: 'Top Rated',
        action: 'Action',
        comedy: 'Comedy',
        horror: 'Horror',
        romance: 'Romance',
        thriller: 'Thriller',
        scifi: 'Science Fiction',
        drama: 'Drama',
        animation: 'Animation',
        crime: 'Crime',
        documentary: 'Documentary',
        family: 'Family'
    };
    
    DOM.seeAllTitle.textContent = titles[category] || 'Movies';
    DOM.seeAllGrid.innerHTML = '<p style="text-align:center;padding:50px;color:#666;">Loading...</p>';
    
    let allItems = [];
    
    // Fetch 3 pages of mixed content
    for (let page = 1; page <= 3; page++) {
        let hollywood, bollywood;
        
        switch(category) {
            case 'trending':
                hollywood = await API.fetchFromTMDB('/trending/all/week', { page });
                bollywood = await API.fetchFromTMDB('/discover/movie', { with_origin_country: 'IN', page });
                break;
            case 'new':
                hollywood = await API.fetchFromTMDB('/movie/now_playing', { page });
                bollywood = await API.fetchFromTMDB('/discover/movie', { with_origin_country: 'IN', sort_by: 'release_date.desc', page });
                break;
            case 'toprated':
                hollywood = await API.fetchFromTMDB('/movie/top_rated', { page });
                bollywood = await API.fetchFromTMDB('/discover/movie', { with_origin_country: 'IN', sort_by: 'vote_average.desc', 'vote_count.gte': 100, page });
                break;
            default:
                const genreId = GENRE_IDS[category] || 28;
                hollywood = await API.fetchFromTMDB('/discover/movie', { with_genres: genreId, page });
                bollywood = await API.fetchFromTMDB('/discover/movie', { with_genres: genreId, with_origin_country: 'IN', page });
        }
        
        const mixed = mixContent(
            (hollywood?.results || []).map(i => ({ ...i, type: i.media_type || 'movie' })),
            (bollywood?.results || []).map(i => ({ ...i, type: 'movie' }))
        );
        
        allItems.push(...mixed);
    }
    
    // Remove duplicates
    const seen = new Set();
    const unique = allItems.filter(item => {
        if (seen.has(item.id) || !item.poster_path) return false;
        seen.add(item.id);
        return true;
    });
    
    DOM.seeAllGrid.innerHTML = unique.map(item => {
        const title = item.title || item.name;
        const year = (item.release_date || item.first_air_date || '').split('-')[0];
        const rating = item.vote_average?.toFixed(1) || 'N/A';
        const type = item.type || 'movie';
        
        return `
            <div class="see-all-card" data-id="${item.id}" data-type="${type}">
                <img src="${API.getImageUrl(item.poster_path)}" alt="${title}" loading="lazy">
                <div class="see-all-card-info">
                    <p class="see-all-card-title">${title}</p>
                    <div class="see-all-card-meta">
                        <span class="rating">⭐ ${rating}</span>
                        <span>${year}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    DOM.seeAllGrid.querySelectorAll('.see-all-card').forEach(card => {
        card.addEventListener('click', () => {
            closeSeeAll();
            openDetail(card.dataset.id, card.dataset.type);
        });
    });
}

function closeSeeAll() {
    DOM.seeAllModal.classList.remove('active');
    document.body.style.overflow = '';
}
