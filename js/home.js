/* ============================================
   STREAMIFY - HOME PAGE (FULLY OPTIMIZED)
   Fixed: Korean, Bollywood, Mixed Content, Mobile
============================================ */

const $ = id => document.getElementById(id);

const DOM = {
    welcomePopup: $('welcomePopup'),
    popupClose: $('popupClose'),
    
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
    heroContent: $('heroContent'),
    heroTitle: $('heroTitle'),
    heroDesc: $('heroDesc'),
    heroRating: $('heroRating'),
    heroYear: $('heroYear'),
    heroType: $('heroType'),
    heroPlay: $('heroPlay'),
    heroInfo: $('heroInfo'),
    
    continueSection: $('continueSection'),
    continueWatching: $('continueWatching'),
    top5Today: $('top5Today'),
    trendingNow: $('trendingNow'),
    bollywoodContent: $('bollywoodContent'),
    newReleases: $('newReleases'),
    topRated: $('topRated'),
    koreanContent: $('koreanContent'),
    actionMovies: $('actionMovies'),
    comedyMovies: $('comedyMovies'),
    horrorMovies: $('horrorMovies'),
    romanceMovies: $('romanceMovies'),
    thrillerMovies: $('thrillerMovies'),
    scifiMovies: $('scifiMovies'),
    dramaMovies: $('dramaMovies'),
    animationMovies: $('animationMovies'),
    adventureContent: $('adventureContent'),
    crimeContent: $('crimeContent'),
    fantasyContent: $('fantasyContent'),
    mysteryContent: $('mysteryContent'),
    documentaryContent: $('documentaryContent'),
    familyContent: $('familyContent'),
    
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
    adventure: 12,
    animation: 16,
    comedy: 35,
    crime: 80,
    documentary: 99,
    drama: 18,
    family: 10751,
    fantasy: 14,
    horror: 27,
    mystery: 9648,
    romance: 10749,
    scifi: 878,
    thriller: 53
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initWelcomePopup();
    initNavbar();
    initMobileMenu();
    initSearch();
    initScrollArrows();
    initSeeAll();
    initDetailModal();
    loadContinueWatching();
    loadHero();
    loadTop5();
    loadAllCategories();
});

// Welcome Popup
function initWelcomePopup() {
    setTimeout(() => {
        DOM.welcomePopup.classList.add('active');
    }, 1500);
    
    DOM.popupClose?.addEventListener('click', () => {
        DOM.welcomePopup.classList.remove('active');
    });
    
    DOM.welcomePopup?.addEventListener('click', (e) => {
        if (e.target === DOM.welcomePopup) {
            DOM.welcomePopup.classList.remove('active');
        }
    });
}

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
        document.body.style.overflow = 'hidden';
    });
    
    const close = () => {
        DOM.mobileMenu.classList.remove('active');
        DOM.overlay.classList.remove('active');
        document.body.style.overflow = '';
    };
    
    DOM.closeMenu?.addEventListener('click', close);
    DOM.overlay?.addEventListener('click', close);
}

// Search
function initSearch() {
    DOM.searchBtn?.addEventListener('click', () => {
        DOM.searchModal.classList.add('active');
        DOM.searchInput.focus();
        document.body.style.overflow = 'hidden';
    });
    
    DOM.searchClose?.addEventListener('click', () => {
        DOM.searchModal.classList.remove('active');
        DOM.searchInput.value = '';
        DOM.searchResults.innerHTML = '';
        document.body.style.overflow = '';
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

// Scroll Arrows
function initScrollArrows() {
    document.querySelectorAll('.row-wrapper').forEach(wrapper => {
        const row = wrapper.querySelector('.content-row');
        const leftBtn = wrapper.querySelector('.scroll-arrow.left');
        const rightBtn = wrapper.querySelector('.scroll-arrow.right');
        
        leftBtn?.addEventListener('click', () => {
            row.scrollBy({ left: -row.clientWidth * 0.8, behavior: 'smooth' });
        });
        
        rightBtn?.addEventListener('click', () => {
            row.scrollBy({ left: row.clientWidth * 0.8, behavior: 'smooth' });
        });
    });
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

// Hero - Mixed Content
async function loadHero() {
    const [movies, tv] = await Promise.all([
        API.getTrendingMovies('day'),
        API.getTrendingTV('day')
    ]);
    
    heroItems = mixArrays(
        (movies?.results || []).map(i => ({ ...i, type: 'movie' })),
        (tv?.results || []).map(i => ({ ...i, type: 'tv' }))
    ).filter(i => i.backdrop_path).slice(0, 10);
    
    if (heroItems.length) {
        updateHero(heroItems[0]);
        setInterval(() => {
            heroIndex = (heroIndex + 1) % heroItems.length;
            animateHeroChange(heroItems[heroIndex]);
        }, 6000);
    }
}

function animateHeroChange(item) {
    DOM.heroBg.classList.add('fade-out');
    DOM.heroContent.classList.add('fade-out');
    
    setTimeout(() => {
        updateHero(item);
        DOM.heroBg.classList.remove('fade-out');
        DOM.heroContent.classList.remove('fade-out');
    }, 500);
}

function updateHero(item) {
    const type = item.type || 'movie';
    
    DOM.heroBg.style.backgroundImage = `url(${API.getBackdropUrl(item.backdrop_path)})`;
    DOM.heroTitle.textContent = item.title || item.name;
    DOM.heroDesc.textContent = item.overview || '';
    DOM.heroRating.textContent = item.vote_average?.toFixed(1) || 'N/A';
    DOM.heroYear.textContent = (item.release_date || item.first_air_date || '').split('-')[0];
    DOM.heroType.textContent = type.toUpperCase();
    
    DOM.heroPlay.onclick = () => location.href = `watch.html?id=${item.id}&type=${type}`;
    DOM.heroInfo.onclick = () => openDetail(item.id, type);
}

// FIXED: Top 5 Today with Title & Info (Mobile Compatible)
async function loadTop5() {
    if (!DOM.top5Today) return;
    
    DOM.top5Today.innerHTML = Array(5).fill('<div class="skeleton" style="width:200px;height:225px;"></div>').join('');
    
    const [movies, tv] = await Promise.all([
        API.getPopularMovies(),
        API.getPopularTV()
    ]);
    
    const mixed = mixArrays(
        (movies?.results || []).map(i => ({ ...i, type: 'movie' })),
        (tv?.results || []).map(i => ({ ...i, type: 'tv' }))
    ).slice(0, 5);
    
    DOM.top5Today.innerHTML = mixed.map((item, idx) => `
        <div class="top-5-card" data-id="${item.id}" data-type="${item.type}">
            <span class="rank-number">${idx + 1}</span>
            <img class="top-5-poster" src="${API.getImageUrl(item.poster_path)}" alt="${item.title || item.name}">
            <div class="top-5-info">
                <p class="top-5-title">${item.title || item.name}</p>
                <div class="top-5-meta">
                    <span class="top-5-rating">⭐ ${item.vote_average?.toFixed(1) || 'N/A'}</span>
                    <span class="top-5-type">${item.type === 'movie' ? 'Movie' : 'Series'}</span>
                </div>
            </div>
        </div>
    `).join('');
    
    DOM.top5Today.querySelectorAll('.top-5-card').forEach(card => {
        card.addEventListener('click', () => {
            openDetail(card.dataset.id, card.dataset.type);
        });
    });
}

// Load ALL Categories - MIXED Movies & TV Shows
async function loadAllCategories() {
    // Original Categories
    loadMixed(DOM.trendingNow, 'trending');
    
    // BOLLYWOOD CATEGORY - Shows below New Releases
    loadBollywood();
    
    loadMixed(DOM.newReleases, 'new');
    loadMixed(DOM.topRated, 'toprated');
    
    // KOREAN CATEGORY - Shows after Top Rated
    loadKorean();
    
    // Genre Categories (All Mixed)
    loadMixedGenre(DOM.actionMovies, GENRES.action);
    loadMixedGenre(DOM.comedyMovies, GENRES.comedy);
    loadMixedGenre(DOM.horrorMovies, GENRES.horror);
    loadMixedGenre(DOM.romanceMovies, GENRES.romance);
    loadMixedGenre(DOM.thrillerMovies, GENRES.thriller);
    loadMixedGenre(DOM.scifiMovies, GENRES.scifi);
    loadMixedGenre(DOM.dramaMovies, GENRES.drama);
    loadMixedGenre(DOM.animationMovies, GENRES.animation);
    loadMixedGenre(DOM.adventureContent, GENRES.adventure);
    loadMixedGenre(DOM.crimeContent, GENRES.crime);
    loadMixedGenre(DOM.fantasyContent, GENRES.fantasy);
    loadMixedGenre(DOM.mysteryContent, GENRES.mystery);
    loadMixedGenre(DOM.documentaryContent, GENRES.documentary);
    loadMixedGenre(DOM.familyContent, GENRES.family);
}

// BOLLYWOOD CATEGORY - Hindi Movies & Series
async function loadBollywood() {
    if (!DOM.bollywoodContent) return;
    DOM.bollywoodContent.innerHTML = Array(10).fill('<div class="skeleton"></div>').join('');
    
    // Fetch Hindi (India) content
    const [movies, tv] = await Promise.all([
        API.fetchFromTMDB('/discover/movie', {
            with_original_language: 'hi',
            sort_by: 'popularity.desc',
            'vote_count.gte': 50
        }),
        API.fetchFromTMDB('/discover/tv', {
            with_original_language: 'hi',
            sort_by: 'popularity.desc',
            'vote_count.gte': 20
        })
    ]);
    
    const mixed = mixArrays(
        (movies?.results || []).map(i => ({ ...i, type: 'movie' })),
        (tv?.results || []).map(i => ({ ...i, type: 'tv' }))
    );
    
    DOM.bollywoodContent.innerHTML = mixed.map(i => createCard(i, i.type)).join('');
    addCardEvents(DOM.bollywoodContent);
}

// KOREAN CATEGORY - Korean Movies & Series  
async function loadKorean() {
    if (!DOM.koreanContent) return;
    DOM.koreanContent.innerHTML = Array(10).fill('<div class="skeleton"></div>').join('');
    
    // Fetch Korean content
    const [movies, tv] = await Promise.all([
        API.fetchFromTMDB('/discover/movie', {
            with_original_language: 'ko',
            sort_by: 'popularity.desc',
            'vote_count.gte': 50
        }),
        API.fetchFromTMDB('/discover/tv', {
            with_original_language: 'ko',
            sort_by: 'popularity.desc',
            'vote_count.gte': 20
        })
    ]);
    
    const mixed = mixArrays(
        (movies?.results || []).map(i => ({ ...i, type: 'movie' })),
        (tv?.results || []).map(i => ({ ...i, type: 'tv' }))
    );
    
    DOM.koreanContent.innerHTML = mixed.map(i => createCard(i, i.type)).join('');
    addCardEvents(DOM.koreanContent);
}

async function loadMixed(container, category) {
    if (!container) return;
    container.innerHTML = Array(10).fill('<div class="skeleton"></div>').join('');
    
    let movies, tv;
    
    if (category === 'trending') {
        [movies, tv] = await Promise.all([
            API.getTrendingMovies('week'),
            API.getTrendingTV('week')
        ]);
    } else if (category === 'new') {
        [movies, tv] = await Promise.all([
            API.getNowPlayingMovies(),
            API.getAiringTodayTV()
        ]);
    } else if (category === 'toprated') {
        [movies, tv] = await Promise.all([
            API.getTopRatedMovies(),
            API.getTopRatedTV()
        ]);
    }
    
    const mixed = mixArrays(
        (movies?.results || []).map(i => ({ ...i, type: 'movie' })),
        (tv?.results || []).map(i => ({ ...i, type: 'tv' }))
    );
    
    container.innerHTML = mixed.map(i => createCard(i, i.type)).join('');
    addCardEvents(container);
}

async function loadMixedGenre(container, genreId) {
    if (!container) return;
    container.innerHTML = Array(10).fill('<div class="skeleton"></div>').join('');
    
    const [movies, tv] = await Promise.all([
        API.getMoviesByGenre(genreId),
        API.getTVByGenre(genreId)
    ]);
    
    const mixed = mixArrays(
        (movies?.results || []).map(i => ({ ...i, type: 'movie' })),
        (tv?.results || []).map(i => ({ ...i, type: 'tv' }))
    );
    
    container.innerHTML = mixed.map(i => createCard(i, i.type)).join('');
    addCardEvents(container);
}

// Mix arrays alternating between movies and TV shows
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

// FIXED: Card Events - Opens modal on any click (not just play button)
function addCardEvents(container) {
    container.querySelectorAll('.card').forEach(card => {
        // Make entire card clickable
        card.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const id = card.dataset.id;
            const type = card.dataset.type;
            openDetail(id, type);
        });
        
        // Prevent double-trigger
        card.style.cursor = 'pointer';
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
        bollywood: 'Bollywood',
        korean: 'Korean Drama',
        action: 'Action',
        adventure: 'Adventure',
        animation: 'Animation',
        comedy: 'Comedy',
        crime: 'Crime',
        documentary: 'Documentary',
        drama: 'Drama',
        family: 'Family',
        fantasy: 'Fantasy',
        horror: 'Horror',
        mystery: 'Mystery',
        romance: 'Romance',
        scifi: 'Science Fiction',
        thriller: 'Thriller'
    };
    
    DOM.seeAllTitle.textContent = titles[cat] || 'Content';
    DOM.seeAllGrid.innerHTML = '<p style="text-align:center;color:#666;padding:50px;">Loading...</p>';
    
    let items = [];
    
    for (let p = 1; p <= 3; p++) {
        let movies, tv;
        
        if (cat === 'trending') {
            [movies, tv] = await Promise.all([
                API.getTrendingMovies('week'),
                API.getTrendingTV('week')
            ]);
        } else if (cat === 'new') {
            [movies, tv] = await Promise.all([
                API.getNowPlayingMovies(),
                API.getAiringTodayTV()
            ]);
        } else if (cat === 'toprated') {
            [movies, tv] = await Promise.all([
                API.getTopRatedMovies(),
                API.getTopRatedTV()
            ]);
        } else if (cat === 'bollywood') {
            [movies, tv] = await Promise.all([
                API.fetchFromTMDB('/discover/movie', {
                    with_original_language: 'hi',
                    sort_by: 'popularity.desc',
                    page: p
                }),
                API.fetchFromTMDB('/discover/tv', {
                    with_original_language: 'hi',
                    sort_by: 'popularity.desc',
                    page: p
                })
            ]);
        } else if (cat === 'korean') {
            [movies, tv] = await Promise.all([
                API.fetchFromTMDB('/discover/movie', {
                    with_original_language: 'ko',
                    sort_by: 'popularity.desc',
                    page: p
                }),
                API.fetchFromTMDB('/discover/tv', {
                    with_original_language: 'ko',
                    sort_by: 'popularity.desc',
                    page: p
                })
            ]);
        } else {
            const gid = GENRES[cat] || 28;
            [movies, tv] = await Promise.all([
                API.getMoviesByGenre(gid),
                API.getTVByGenre(gid)
            ]);
        }
        
        items.push(...mixArrays(
            (movies?.results || []).map(i => ({ ...i, type: 'movie' })),
            (tv?.results || []).map(i => ({ ...i, type: 'tv' }))
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
            <div class="see-all-card" data-id="${item.id}" data-type="${item.type}">
                <img src="${API.getImageUrl(item.poster_path)}" alt="${title}" loading="lazy">
                <div class="see-all-card-info">
                    <p class="see-all-card-title">${title}</p>
                    <div class="see-all-card-meta">⭐ ${rating} • ${year}</div>
                </div>
            </div>
        `;
    }).join('');
    
    // FIXED: Make entire card clickable
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
            if (DOM.searchModal.classList.contains('active')) {
                DOM.searchModal.classList.remove('active');
                document.body.style.overflow = '';
            }
            DOM.welcomePopup.classList.remove('active');
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
