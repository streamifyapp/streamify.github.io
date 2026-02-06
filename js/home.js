/* ============================================
   STREAMIFY - HOME PAGE
   Complete Fixed Version
============================================ */

const $ = id => document.getElementById(id);

const DOM = {
    navbar: $('navbar'),
    menuBtn: $('menuBtn'),
    mobileMenu: $('mobileMenu'),
    closeMenu: $('closeMenu'),
    overlay: $('overlay'),
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

const GENRES = {
    action: 28,
    comedy: 35,
    horror: 27,
    romance: 10749,
    thriller: 53,
    scifi: 878,
    drama: 18,
    animation: 16
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    initMobileMenu();
    initSearch();
    initSeeAll();
    initDetailModal();
    loadContinueWatching();
    loadHero();
    loadAllCategories();
});

// Navbar scroll
function initNavbar() {
    window.addEventListener('scroll', () => {
        DOM.navbar.classList.toggle('scrolled', window.scrollY > 50);
    });
}

// Mobile Menu
function initMobileMenu() {
    DOM.menuBtn?.addEventListener('click', () => {
        DOM.mobileMenu.classList.add('active');
        DOM.overlay.classList.add('active');
    });
    
    const close = () => {
        DOM.mobileMenu.classList.remove('active');
        DOM.overlay.classList.remove('active');
    };
    
    DOM.closeMenu?.addEventListener('click', close);
    DOM.overlay?.addEventListener('click', close);
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
        if (e.target.value.length > 2) {
            timeout = setTimeout(() => doSearch(e.target.value), 500);
        }
    });
}

async function doSearch(query) {
    DOM.searchResults.innerHTML = '<p style="text-align:center;color:#666;padding:30px;">Searching...</p>';
    
    const data = await API.multiSearch(query);
    
    if (data?.results?.length) {
        const items = data.results.filter(i => (i.media_type === 'movie' || i.media_type === 'tv') && i.poster_path);
        DOM.searchResults.innerHTML = items.map(i => createCard(i, i.media_type)).join('');
        addCardEvents(DOM.searchResults);
    } else {
        DOM.searchResults.innerHTML = '<p style="text-align:center;color:#666;padding:30px;">No results found</p>';
    }
}

// Continue Watching
function loadContinueWatching() {
    const items = Storage.getContinueWatching();
    
    if (items && items.length > 0) {
        DOM.continueSection.style.display = 'block';
        
        DOM.continueWatching.innerHTML = items.map(item => `
            <div class="card" data-id="${item.id}" data-type="${item.type}">
                <img class="card-img" src="${API.getImageUrl(item.poster_path || item.backdrop_path)}" alt="${item.title}">
                <div class="card-progress">
                    <div class="card-progress-fill" style="width:${item.progress || 10}%"></div>
                </div>
                <div class="card-info">
                    <p class="card-title">${item.title}</p>
                    <div class="card-meta">
                        <span class="card-type">${item.type === 'movie' ? 'Movie' : 'Series'}</span>
                    </div>
                </div>
            </div>
        `).join('');
        
        addCardEvents(DOM.continueWatching);
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

// Load Categories - Mixed content
async function loadAllCategories() {
    loadMixed(DOM.trendingNow, '/trending/all/week');
    loadMixed(DOM.newReleases, '/movie/now_playing');
    loadMixed(DOM.topRated, '/movie/top_rated');
    loadMixedGenre(DOM.actionMovies, GENRES.action);
    loadMixedGenre(DOM.comedyMovies, GENRES.comedy);
    loadMixedGenre(DOM.horrorMovies, GENRES.horror);
    loadMixedGenre(DOM.romanceMovies, GENRES.romance);
    loadMixedGenre(DOM.thrillerMovies, GENRES.thriller);
    loadMixedGenre(DOM.scifiMovies, GENRES.scifi);
    loadMixedGenre(DOM.dramaMovies, GENRES.drama);
    loadMixedGenre(DOM.animationMovies, GENRES.animation);
}

async function loadMixed(container, endpoint) {
    if (!container) return;
    container.innerHTML = Array(8).fill('<div class="skeleton"></div>').join('');
    
    const [hw, bw] = await Promise.all([
        API.fetchFromTMDB(endpoint),
        API.fetchFromTMDB('/discover/movie', { with_origin_country: 'IN', sort_by: 'popularity.desc' })
    ]);
    
    const mixed = mixArrays(
        (hw?.results || []).map(i => ({ ...i, type: i.media_type || 'movie' })),
        (bw?.results || []).map(i => ({ ...i, type: 'movie' }))
    );
    
    container.innerHTML = mixed.map(i => createCard(i, i.type)).join('');
    addCardEvents(container);
}

async function loadMixedGenre(container, genreId) {
    if (!container) return;
    container.innerHTML = Array(8).fill('<div class="skeleton"></div>').join('');
    
    const [hw, bw] = await Promise.all([
        API.fetchFromTMDB('/discover/movie', { with_genres: genreId }),
        API.fetchFromTMDB('/discover/movie', { with_genres: genreId, with_origin_country: 'IN' })
    ]);
    
    const mixed = mixArrays(
        (hw?.results || []).map(i => ({ ...i, type: 'movie' })),
        (bw?.results || []).map(i => ({ ...i, type: 'movie' }))
    );
    
    container.innerHTML = mixed.map(i => createCard(i, i.type)).join('');
    addCardEvents(container);
}

function mixArrays(a, b) {
    const mixed = [];
    const max = Math.max(a.length, b.length);
    for (let i = 0; i < max; i++) {
        if (a[i]) mixed.push(a[i]);
        if (b[i]) mixed.push(b[i]);
    }
    const seen = new Set();
    return mixed.filter(i => {
        if (seen.has(i.id) || !i.poster_path) return false;
        seen.add(i.id);
        return true;
    }).slice(0, 20);
}

function createCard(item, type) {
    const title = item.title || item.name;
    const year = (item.release_date || item.first_air_date || '').split('-')[0];
    const rating = item.vote_average?.toFixed(1) || 'N/A';
    
    return `
        <div class="card" data-id="${item.id}" data-type="${type}">
            <img class="card-img" src="${API.getImageUrl(item.poster_path)}" alt="${title}" loading="lazy">
            <div class="card-info">
                <p class="card-title">${title}</p>
                <div class="card-meta">
                    <span class="card-rating">⭐ ${rating}</span>
                    <span>${year}</span>
                    <span class="card-type">${type === 'movie' ? 'Movie' : 'Series'}</span>
                </div>
            </div>
        </div>
    `;
}

function addCardEvents(container) {
    container.querySelectorAll('.card').forEach(card => {
        card.addEventListener('click', () => {
            openDetail(card.dataset.id, card.dataset.type);
        });
    });
}

// See All Modal
function initSeeAll() {
    document.querySelectorAll('.see-all-btn').forEach(btn => {
        btn.addEventListener('click', () => openSeeAll(btn.dataset.cat));
    });
    
    DOM.seeAllClose?.addEventListener('click', closeSeeAll);
    
    DOM.seeAllModal?.addEventListener('click', e => {
        if (e.target === DOM.seeAllModal) closeSeeAll();
    });
}

async function openSeeAll(cat) {
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
        animation: 'Animation'
    };
    
    DOM.seeAllTitle.textContent = titles[cat] || 'Movies';
    DOM.seeAllGrid.innerHTML = '<p style="text-align:center;color:#666;padding:50px;">Loading...</p>';
    
    let items = [];
    
    for (let p = 1; p <= 3; p++) {
        let hw, bw;
        
        if (cat === 'trending') {
            hw = await API.fetchFromTMDB('/trending/all/week', { page: p });
            bw = await API.fetchFromTMDB('/discover/movie', { with_origin_country: 'IN', page: p });
        } else if (cat === 'new') {
            hw = await API.fetchFromTMDB('/movie/now_playing', { page: p });
            bw = await API.fetchFromTMDB('/discover/movie', { with_origin_country: 'IN', sort_by: 'release_date.desc', page: p });
        } else if (cat === 'toprated') {
            hw = await API.fetchFromTMDB('/movie/top_rated', { page: p });
            bw = await API.fetchFromTMDB('/discover/movie', { with_origin_country: 'IN', sort_by: 'vote_average.desc', 'vote_count.gte': 100, page: p });
        } else {
            const gid = GENRES[cat] || 28;
            hw = await API.fetchFromTMDB('/discover/movie', { with_genres: gid, page: p });
            bw = await API.fetchFromTMDB('/discover/movie', { with_genres: gid, with_origin_country: 'IN', page: p });
        }
        
        items.push(...mixArrays(
            (hw?.results || []).map(i => ({ ...i, type: i.media_type || 'movie' })),
            (bw?.results || []).map(i => ({ ...i, type: 'movie' }))
        ));
    }
    
    const seen = new Set();
    const unique = items.filter(i => {
        if (seen.has(i.id) || !i.poster_path) return false;
        seen.add(i.id);
        return true;
    });
    
    DOM.seeAllGrid.innerHTML = unique.map(item => {
        const title = item.title || item.name;
        const year = (item.release_date || item.first_air_date || '').split('-')[0];
        const rating = item.vote_average?.toFixed(1) || 'N/A';
        
        return `
            <div class="see-all-card" data-id="${item.id}" data-type="${item.type || 'movie'}">
                <img src="${API.getImageUrl(item.poster_path)}" alt="${title}" loading="lazy">
                <div class="see-all-card-info">
                    <p class="see-all-card-title">${title}</p>
                    <div class="see-all-card-meta">⭐ ${rating} • ${year}</div>
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

// Detail Modal
function initDetailModal() {
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
