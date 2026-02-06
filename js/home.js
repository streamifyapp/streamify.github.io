/* ============================================
   STREAMIFY - HOME PAGE (FULLY OPTIMIZED)
   Fixed: Search, Korean, Bollywood, Mixed Content, Mobile
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
let searchTimeout = null;

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
        if (DOM.welcomePopup) {
            DOM.welcomePopup.classList.add('active');
        }
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
        if (DOM.navbar) {
            DOM.navbar.classList.toggle('scrolled', window.scrollY > 50);
        }
    });
}

// Mobile Menu
function initMobileMenu() {
    DOM.menuBtn?.addEventListener('click', () => {
        DOM.mobileMenu?.classList.add('active');
        DOM.overlay?.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
    
    const closeMenu = () => {
        DOM.mobileMenu?.classList.remove('active');
        DOM.overlay?.classList.remove('active');
        document.body.style.overflow = '';
    };
    
    DOM.closeMenu?.addEventListener('click', closeMenu);
    DOM.overlay?.addEventListener('click', closeMenu);
}

// ============ SEARCH - FIXED ============
function initSearch() {
    // Open search modal
    DOM.searchBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        openSearchModal();
    });
    
    // Close search modal
    DOM.searchClose?.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        closeSearchModal();
    });
    
    // Close on clicking outside
    DOM.searchModal?.addEventListener('click', (e) => {
        if (e.target === DOM.searchModal) {
            closeSearchModal();
        }
    });
    
    // Search input - with debounce
    DOM.searchInput?.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        
        // Clear previous timeout
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }
        
        // Clear results if query is too short
        if (query.length < 2) {
            if (DOM.searchResults) {
                DOM.searchResults.innerHTML = `
                    <div class="search-message">
                        <i class="fas fa-film"></i>
                        <p>Search for movies and TV shows</p>
                        <span>Type at least 2 characters to start searching</span>
                    </div>
                `;
            }
            return;
        }
        
        // Show loading
        if (DOM.searchResults) {
            DOM.searchResults.innerHTML = `
                <div class="search-message">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Searching...</p>
                    <span>Please wait</span>
                </div>
            `;
        }
        
        // Debounce search - wait 500ms after user stops typing
        searchTimeout = setTimeout(() => {
            performSearch(query);
        }, 500);
    });
    
    // Search on Enter key
    DOM.searchInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const query = e.target.value.trim();
            if (query.length >= 2) {
                if (searchTimeout) {
                    clearTimeout(searchTimeout);
                }
                performSearch(query);
            }
        }
    });
    
    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (DOM.searchModal?.classList.contains('active')) {
                closeSearchModal();
            }
        }
    });
}

function openSearchModal() {
    if (DOM.searchModal) {
        DOM.searchModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Focus input after modal opens
        setTimeout(() => {
            DOM.searchInput?.focus();
        }, 100);
        
        // Show initial message
        if (DOM.searchResults) {
            DOM.searchResults.innerHTML = `
                <div class="search-message">
                    <i class="fas fa-film"></i>
                    <p>Search for movies and TV shows</p>
                    <span>Type at least 2 characters to start searching</span>
                </div>
            `;
        }
    }
}

function closeSearchModal() {
    if (DOM.searchModal) {
        DOM.searchModal.classList.remove('active');
        document.body.style.overflow = '';
        
        // Clear search
        if (DOM.searchInput) {
            DOM.searchInput.value = '';
        }
        if (DOM.searchResults) {
            DOM.searchResults.innerHTML = '';
        }
        
        // Clear timeout
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }
    }
}

async function performSearch(query) {
    console.log('Searching for:', query);
    
    if (!query || query.length < 2) {
        return;
    }
    
    try {
        const data = await API.multiSearch(query);
        
        if (data && data.results && data.results.length > 0) {
            // Filter only movies and TV shows with posters
            const items = data.results.filter(item => 
                (item.media_type === 'movie' || item.media_type === 'tv') && 
                item.poster_path
            );
            
            if (items.length > 0) {
                renderSearchResults(items);
            } else {
                showNoResults(query);
            }
        } else {
            showNoResults(query);
        }
    } catch (error) {
        console.error('Search error:', error);
        if (DOM.searchResults) {
            DOM.searchResults.innerHTML = `
                <div class="search-message">
                    <i class="fas fa-exclamation-triangle" style="color:#e50914;"></i>
                    <p>Error searching</p>
                    <span>Please try again</span>
                </div>
            `;
        }
    }
}

function renderSearchResults(items) {
    if (!DOM.searchResults) return;
    
    // Create grid container
    let html = '<div class="search-results-grid">';
    
    html += items.map(item => {
        const title = item.title || item.name || 'Untitled';
        const year = (item.release_date || item.first_air_date || '').split('-')[0];
        const rating = item.vote_average ? item.vote_average.toFixed(1) : 'N/A';
        const type = item.media_type || 'movie';
        const posterUrl = item.poster_path 
            ? API.getImageUrl(item.poster_path)
            : 'https://via.placeholder.com/200x300/1a1a1a/666?text=No+Image';
        
        return `
            <div class="search-result-card" data-id="${item.id}" data-type="${type}">
                <img src="${posterUrl}" alt="${title}" loading="lazy">
                <div class="search-result-info">
                    <p class="search-result-title">${title}</p>
                    <div class="search-result-meta">
                        <span>⭐ ${rating}</span>
                        <span>${year}</span>
                        <span class="search-result-type">${type === 'movie' ? 'Movie' : 'Series'}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    html += '</div>';
    
    DOM.searchResults.innerHTML = html;
    
    // Add click events to search results
    DOM.searchResults.querySelectorAll('.search-result-card').forEach(card => {
        card.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const id = card.dataset.id;
            const type = card.dataset.type;
            
            if (id && type) {
                window.location.href = `watch.html?id=${id}&type=${type}`;
            }
        });
    });
}

function showNoResults(query) {
    if (DOM.searchResults) {
        DOM.searchResults.innerHTML = `
            <div class="search-message">
                <i class="fas fa-search"></i>
                <p>No results found for "${query}"</p>
                <span>Try different keywords or check the spelling</span>
            </div>
        `;
    }
}

// Scroll Arrows
function initScrollArrows() {
    document.querySelectorAll('.row-wrapper').forEach(wrapper => {
        const row = wrapper.querySelector('.content-row');
        const leftBtn = wrapper.querySelector('.scroll-arrow.left');
        const rightBtn = wrapper.querySelector('.scroll-arrow.right');
        
        leftBtn?.addEventListener('click', () => {
            row?.scrollBy({ left: -row.clientWidth * 0.8, behavior: 'smooth' });
        });
        
        rightBtn?.addEventListener('click', () => {
            row?.scrollBy({ left: row.clientWidth * 0.8, behavior: 'smooth' });
        });
    });
}

// Continue Watching
function loadContinueWatching() {
    const items = Storage.getContinueWatching();
    
    if (items && items.length > 0 && DOM.continueSection && DOM.continueWatching) {
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

// Hero - Mixed Hollywood + Bollywood + Movies + TV
async function loadHero() {
    try {
        const [hollywoodMovies, hollywoodTV, bollywoodMovies] = await Promise.all([
            API.getTrendingMovies('day'),
            API.getTrendingTV('day'),
            API.fetchFromTMDB('/discover/movie', {
                with_original_language: 'hi',
                sort_by: 'popularity.desc',
                'vote_count.gte': 100
            })
        ]);
        
        const allContent = [
            ...(hollywoodMovies?.results || []).slice(0, 4).map(i => ({ ...i, type: 'movie' })),
                        ...(hollywoodTV?.results || []).slice(0, 3).map(i => ({ ...i, type: 'tv' })),
            ...(bollywoodMovies?.results || []).slice(0, 2).map(i => ({ ...i, type: 'movie' }))
        ];
        
        heroItems = shuffleArray(allContent).filter(i => i.backdrop_path).slice(0, 10);
        
        if (heroItems.length) {
            updateHero(heroItems[0]);
            setInterval(() => {
                heroIndex = (heroIndex + 1) % heroItems.length;
                animateHeroChange(heroItems[heroIndex]);
            }, 6000);
        }
    } catch (error) {
        console.error('Error loading hero:', error);
    }
}

function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function animateHeroChange(item) {
    DOM.heroBg?.classList.add('fade-out');
    DOM.heroContent?.classList.add('fade-out');
    
    setTimeout(() => {
        updateHero(item);
        DOM.heroBg?.classList.remove('fade-out');
        DOM.heroContent?.classList.remove('fade-out');
    }, 500);
}

function updateHero(item) {
    const type = item.type || 'movie';
    
    if (DOM.heroBg) DOM.heroBg.style.backgroundImage = `url(${API.getBackdropUrl(item.backdrop_path)})`;
    if (DOM.heroTitle) DOM.heroTitle.textContent = item.title || item.name;
    if (DOM.heroDesc) DOM.heroDesc.textContent = item.overview || '';
    if (DOM.heroRating) DOM.heroRating.textContent = item.vote_average?.toFixed(1) || 'N/A';
    if (DOM.heroYear) DOM.heroYear.textContent = (item.release_date || item.first_air_date || '').split('-')[0];
    if (DOM.heroType) DOM.heroType.textContent = type.toUpperCase();
    
    if (DOM.heroPlay) {
        DOM.heroPlay.onclick = () => location.href = `watch.html?id=${item.id}&type=${type}`;
    }
    if (DOM.heroInfo) {
        DOM.heroInfo.onclick = () => openDetail(item.id, type);
    }
}

// Top 5 Today - Mixed Content
async function loadTop5() {
    if (!DOM.top5Today) return;
    
    DOM.top5Today.innerHTML = Array(5).fill('<div class="skeleton" style="width:200px;height:225px;"></div>').join('');
    
    try {
        const [movies, tv, bollywood] = await Promise.all([
            API.getPopularMovies(),
            API.getPopularTV(),
            API.fetchFromTMDB('/discover/movie', {
                with_original_language: 'hi',
                sort_by: 'popularity.desc'
            })
        ]);
        
        const allContent = [
            ...(movies?.results || []).slice(0, 2).map(i => ({ ...i, type: 'movie' })),
            ...(tv?.results || []).slice(0, 2).map(i => ({ ...i, type: 'tv' })),
            ...(bollywood?.results || []).slice(0, 1).map(i => ({ ...i, type: 'movie' }))
        ];
        
        const mixed = shuffleArray(allContent).slice(0, 5);
        
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
                const id = card.dataset.id;
                const type = card.dataset.type;
                window.location.href = `watch.html?id=${id}&type=${type}`;
            });
        });
    } catch (error) {
        console.error('Error loading top 5:', error);
    }
}

// Load ALL Categories
async function loadAllCategories() {
    loadMixedCategory(DOM.trendingNow, 'trending');
    loadMixedCategory(DOM.newReleases, 'new');
    loadMixedCategory(DOM.topRated, 'toprated');
    
    // Bollywood - Only Hindi content
    loadBollywood();
    
    // Korean - Only Korean content
    loadKorean();
    
    // Genre Categories
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

// Bollywood - Only Hindi
async function loadBollywood() {
    if (!DOM.bollywoodContent) return;
    DOM.bollywoodContent.innerHTML = Array(10).fill('<div class="skeleton"></div>').join('');
    
    try {
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
    } catch (error) {
        console.error('Error loading Bollywood:', error);
    }
}

// Korean - Only Korean
async function loadKorean() {
    if (!DOM.koreanContent) return;
    DOM.koreanContent.innerHTML = Array(10).fill('<div class="skeleton"></div>').join('');
    
    try {
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
    } catch (error) {
        console.error('Error loading Korean:', error);
    }
}

// Mixed Category
async function loadMixedCategory(container, category) {
    if (!container) return;
    container.innerHTML = Array(10).fill('<div class="skeleton"></div>').join('');
    
    try {
        let hollywoodMovies, hollywoodTV, bollywoodMovies;
        
        if (category === 'trending') {
            [hollywoodMovies, hollywoodTV, bollywoodMovies] = await Promise.all([
                API.getTrendingMovies('week'),
                API.getTrendingTV('week'),
                API.fetchFromTMDB('/discover/movie', {
                    with_original_language: 'hi',
                    sort_by: 'popularity.desc'
                })
            ]);
        } else if (category === 'new') {
            [hollywoodMovies, hollywoodTV, bollywoodMovies] = await Promise.all([
                API.getNowPlayingMovies(),
                API.getAiringTodayTV(),
                API.fetchFromTMDB('/discover/movie', {
                    with_original_language: 'hi',
                    sort_by: 'release_date.desc',
                    'vote_count.gte': 10
                })
            ]);
        } else if (category === 'toprated') {
            [hollywoodMovies, hollywoodTV, bollywoodMovies] = await Promise.all([
                API.getTopRatedMovies(),
                API.getTopRatedTV(),
                API.fetchFromTMDB('/discover/movie', {
                    with_original_language: 'hi',
                    sort_by: 'vote_average.desc',
                    'vote_count.gte': 100
                })
            ]);
        }
        
        const allContent = [
            ...(hollywoodMovies?.results || []).map(i => ({ ...i, type: 'movie' })),
            ...(hollywoodTV?.results || []).map(i => ({ ...i, type: 'tv' })),
            ...(bollywoodMovies?.results || []).slice(0, 5).map(i => ({ ...i, type: 'movie' }))
        ];
        
        const mixed = mixAndDedupe(allContent);
        
        container.innerHTML = mixed.map(i => createCard(i, i.type)).join('');
        addCardEvents(container);
    } catch (error) {
        console.error('Error loading category:', error);
    }
}

// Mixed Genre
async function loadMixedGenre(container, genreId) {
    if (!container) return;
    container.innerHTML = Array(10).fill('<div class="skeleton"></div>').join('');
    
    try {
        const [hollywoodMovies, hollywoodTV, bollywoodMovies] = await Promise.all([
            API.getMoviesByGenre(genreId),
            API.getTVByGenre(genreId),
            API.fetchFromTMDB('/discover/movie', {
                with_original_language: 'hi',
                with_genres: genreId,
                sort_by: 'popularity.desc'
            })
        ]);
        
        const allContent = [
            ...(hollywoodMovies?.results || []).map(i => ({ ...i, type: 'movie' })),
            ...(hollywoodTV?.results || []).map(i => ({ ...i, type: 'tv' })),
            ...(bollywoodMovies?.results || []).slice(0, 4).map(i => ({ ...i, type: 'movie' }))
        ];
        
        const mixed = mixAndDedupe(allContent);
        
        container.innerHTML = mixed.map(i => createCard(i, i.type)).join('');
        addCardEvents(container);
    } catch (error) {
        console.error('Error loading genre:', error);
    }
}

// Utility functions
function mixArrays(a, b) {
    const mixed = [];
    const max = Math.max(a.length, b.length);
    for (let i = 0; i < max; i++) {
        if (a[i]) mixed.push(a[i]);
        if (b[i]) mixed.push(b[i]);
    }
    return dedupeArray(mixed);
}

function mixAndDedupe(arr) {
    const shuffled = shuffleArray(arr);
    return dedupeArray(shuffled).slice(0, 20);
}

function dedupeArray(arr) {
    const seen = new Set();
    return arr.filter(i => {
        const key = `${i.id}-${i.type}`;
        if (seen.has(key) || !i.poster_path) return false;
        seen.add(key);
        return true;
    });
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

// Card Events - Go to watch page
function addCardEvents(container) {
    if (!container) return;
    
    container.querySelectorAll('.card').forEach(card => {
        card.style.cursor = 'pointer';
        
        card.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const id = card.dataset.id;
            const type = card.dataset.type;
            
            if (id && type) {
                window.location.href = `watch.html?id=${id}&type=${type}`;
            }
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
    if (!DOM.seeAllModal) return;
    
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
    
    if (DOM.seeAllTitle) DOM.seeAllTitle.textContent = titles[cat] || 'Content';
    if (DOM.seeAllGrid) DOM.seeAllGrid.innerHTML = '<p style="text-align:center;color:#666;padding:50px;"><i class="fas fa-spinner fa-spin"></i> Loading...</p>';
    
    let allItems = [];
    
    try {
        for (let p = 1; p <= 4; p++) {
            let movies, tv;
            
            if (cat === 'trending') {
                [movies, tv] = await Promise.all([
                    API.fetchFromTMDB('/trending/movie/week', { page: p }),
                    API.fetchFromTMDB('/trending/tv/week', { page: p })
                ]);
            } else if (cat === 'new') {
                [movies, tv] = await Promise.all([
                    API.fetchFromTMDB('/movie/now_playing', { page: p }),
                    API.fetchFromTMDB('/tv/airing_today', { page: p })
                ]);
            } else if (cat === 'toprated') {
                [movies, tv] = await Promise.all([
                    API.fetchFromTMDB('/movie/top_rated', { page: p }),
                    API.fetchFromTMDB('/tv/top_rated', { page: p })
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
                    API.fetchFromTMDB('/discover/movie', { with_genres: gid, page: p, sort_by: 'popularity.desc' }),
                    API.fetchFromTMDB('/discover/tv', { with_genres: gid, page: p, sort_by: 'popularity.desc' })
                ]);
            }
            
            allItems.push(
                ...(movies?.results || []).map(i => ({ ...i, type: 'movie' })),
                ...(tv?.results || []).map(i => ({ ...i, type: 'tv' }))
            );
        }
        
        const unique = dedupeArray(allItems).slice(0, 80);
        
        if (DOM.seeAllGrid) {
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
            
            // Add click events
            DOM.seeAllGrid.querySelectorAll('.see-all-card').forEach(card => {
                card.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const id = card.dataset.id;
                    const type = card.dataset.type;
                    
                    window.location.href = `watch.html?id=${id}&type=${type}`;
                });
            });
        }
    } catch (error) {
        console.error('Error loading see all:', error);
        if (DOM.seeAllGrid) {
            DOM.seeAllGrid.innerHTML = '<p style="text-align:center;color:#e50914;padding:50px;">Error loading content. Please try again.</p>';
        }
    }
}

function closeSeeAll() {
    DOM.seeAllModal?.classList.remove('active');
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
            closeSearchModal();
            DOM.welcomePopup?.classList.remove('active');
        }
    });
}

async function openDetail(id, type) {
    if (!DOM.detailModal) return;
    
    DOM.detailModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    if (DOM.detailTitle) DOM.detailTitle.textContent = 'Loading...';
    if (DOM.detailDesc) DOM.detailDesc.textContent = '';
    if (DOM.detailBanner) DOM.detailBanner.style.backgroundImage = '';
    
    try {
        const data = type === 'movie' 
            ? await API.getMovieDetails(id) 
            : await API.getTVDetails(id);
        
        if (data) {
            currentItem = { ...data, type };
            
            if (DOM.detailBanner) DOM.detailBanner.style.backgroundImage = `url(${API.getBackdropUrl(data.backdrop_path)})`;
            if (DOM.detailTitle) DOM.detailTitle.textContent = data.title || data.name;
            if (DOM.detailRating) DOM.detailRating.textContent = data.vote_average?.toFixed(1) || 'N/A';
            if (DOM.detailYear) DOM.detailYear.textContent = (data.release_date || data.first_air_date || '').split('-')[0];
            if (DOM.detailDuration) {
                DOM.detailDuration.textContent = type === 'movie' 
                    ? `${data.runtime || 0} min` 
                    : `${data.number_of_seasons || 0} Season${data.number_of_seasons > 1 ? 's' : ''}`;
            }
            if (DOM.detailDesc) DOM.detailDesc.textContent = data.overview || 'No description available.';
            if (DOM.detailGenres) DOM.detailGenres.textContent = data.genres?.map(g => g.name).join(', ') || 'N/A';
            
            if (DOM.detailList) {
                DOM.detailList.innerHTML = Storage.isInMyList(data.id, type) 
                    ? '<i class="fas fa-check"></i> Added' 
                    : '<i class="fas fa-plus"></i> My List';
            }
        }
    } catch (error) {
        console.error('Error loading details:', error);
    }
}

function closeDetail() {
    DOM.detailModal?.classList.remove('active');
    document.body.style.overflow = '';
    currentItem = null;
}
