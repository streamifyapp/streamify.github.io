/* ============================================
   STREAMIFY - HOMEPAGE LOGIC
   Complete Fixed Version
============================================ */

// ============ DOM ELEMENTS ============
const DOM = {
    navbar: document.getElementById('navbar'),
    searchBox: document.getElementById('searchBox'),
    searchToggle: document.getElementById('searchToggle'),
    searchInput: document.getElementById('searchInput'),
    
    heroBanner: document.getElementById('heroBanner'),
    heroBackground: document.getElementById('heroBackground'),
    heroTitle: document.getElementById('heroTitle'),
    heroDescription: document.getElementById('heroDescription'),
    heroRating: document.getElementById('heroRating'),
    heroYear: document.getElementById('heroYear'),
    heroDuration: document.getElementById('heroDuration'),
    heroType: document.getElementById('heroType'),
    heroPlayBtn: document.getElementById('heroPlayBtn'),
    heroInfoBtn: document.getElementById('heroInfoBtn'),
    
    continueSection: document.getElementById('continueSection'),
    continueWatching: document.getElementById('continueWatching'),
    trendingNow: document.getElementById('trendingNow'),
    newReleases: document.getElementById('newReleases'),
    top10Movies: document.getElementById('top10Movies'),
    topRated: document.getElementById('topRated'),
    kDrama: document.getElementById('kDrama'),
    bollywood: document.getElementById('bollywood'),
    actionMovies: document.getElementById('actionMovies'),
    adventureMovies: document.getElementById('adventureMovies'),
    animationMovies: document.getElementById('animationMovies'),
    comedyMovies: document.getElementById('comedyMovies'),
    crimeMovies: document.getElementById('crimeMovies'),
    documentaries: document.getElementById('documentaries'),
    familyMovies: document.getElementById('familyMovies'),
    historyMovies: document.getElementById('historyMovies'),
    horrorMovies: document.getElementById('horrorMovies'),
    romanceMovies: document.getElementById('romanceMovies'),
    scifiMovies: document.getElementById('scifiMovies'),
    thrillerMovies: document.getElementById('thrillerMovies'),
    
    modalOverlay: document.getElementById('modalOverlay'),
    detailModal: document.getElementById('detailModal'),
    modalClose: document.getElementById('modalClose'),
    modalBanner: document.getElementById('modalBanner'),
    modalTitle: document.getElementById('modalTitle'),
    modalMatch: document.getElementById('modalMatch'),
    modalYear: document.getElementById('modalYear'),
    modalDuration: document.getElementById('modalDuration'),
    modalDescription: document.getElementById('modalDescription'),
    modalGenres: document.getElementById('modalGenres'),
    modalRating: document.getElementById('modalRating'),
    modalPlayBtn: document.getElementById('modalPlayBtn'),
    modalAddList: document.getElementById('modalAddList'),
    modalLike: document.getElementById('modalLike'),
    
    seeAllModal: document.getElementById('seeAllModal'),
    seeAllTitle: document.getElementById('seeAllTitle'),
    seeAllGrid: document.getElementById('seeAllGrid'),
    seeAllClose: document.getElementById('seeAllClose'),
    
    searchResultsPage: document.getElementById('searchResultsPage'),
    searchBack: document.getElementById('searchBack'),
    searchQuery: document.getElementById('searchQuery'),
    searchResults: document.getElementById('searchResults')
};

// ============ STATE ============
let currentHeroItem = null;
let currentModalItem = null;
let heroItems = [];
let heroIndex = 0;
let heroInterval = null;

// ============ INITIALIZATION ============
document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    initSearch();
    initModal();
    initSliders();
    initSeeAll();
    loadAllContent();
    loadContinueWatching();
});

// ============ NAVBAR ============
function initNavbar() {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            DOM.navbar.classList.add('scrolled');
        } else {
            DOM.navbar.classList.remove('scrolled');
        }
    });
}

// ============ SEARCH ============
function initSearch() {
    DOM.searchToggle.addEventListener('click', () => {
        DOM.searchBox.classList.toggle('active');
        if (DOM.searchBox.classList.contains('active')) {
            DOM.searchInput.focus();
        }
    });
    
    DOM.searchInput.addEventListener('keypress', async (e) => {
        if (e.key === 'Enter' && DOM.searchInput.value.trim()) {
            await performSearch(DOM.searchInput.value.trim());
        }
    });
    
    DOM.searchBack.addEventListener('click', () => {
        DOM.searchResultsPage.style.display = 'none';
        DOM.searchInput.value = '';
    });
    
    document.addEventListener('click', (e) => {
        if (!DOM.searchBox.contains(e.target) && DOM.searchBox.classList.contains('active')) {
            DOM.searchBox.classList.remove('active');
        }
    });
}

async function performSearch(query) {
    DOM.searchQuery.textContent = query;
    DOM.searchResults.innerHTML = '<div class="loading" style="padding: 50px; text-align: center;">Searching...</div>';
    DOM.searchResultsPage.style.display = 'block';
    
    const data = await API.multiSearch(query);
    
    if (data && data.results) {
        const filtered = data.results.filter(item => 
            (item.media_type === 'movie' || item.media_type === 'tv') && item.poster_path
        );
        
        DOM.searchResults.innerHTML = filtered.map(item => `
            <div class="search-card" data-id="${item.id}" data-type="${item.media_type}">
                <img src="${API.getImageUrl(item.poster_path)}" alt="${item.title || item.name}">
            </div>
        `).join('');
        
        DOM.searchResults.querySelectorAll('.search-card').forEach(card => {
            card.addEventListener('click', () => {
                openModal(card.dataset.id, card.dataset.type);
            });
        });
    } else {
        DOM.searchResults.innerHTML = '<p style="padding: 50px; text-align: center;">No results found.</p>';
    }
}

// ============ MODAL ============
function initModal() {
    DOM.modalClose.addEventListener('click', closeModal);
    
    DOM.modalOverlay.addEventListener('click', (e) => {
        if (e.target === DOM.modalOverlay) {
            closeModal();
        }
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
            closeSeeAllModal();
        }
    });
    
    DOM.modalPlayBtn.addEventListener('click', () => {
        if (currentModalItem) {
            playContent(currentModalItem.id, currentModalItem.type);
        }
    });
    
    DOM.modalAddList.addEventListener('click', () => {
        if (currentModalItem) {
            toggleMyList(currentModalItem);
        }
    });
}

async function openModal(id, type) {
    DOM.modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    let data;
    if (type === 'movie') {
        data = await API.getMovieDetails(id);
    } else {
        data = await API.getTVDetails(id);
    }
    
    if (data) {
        currentModalItem = { ...data, type };
        
        DOM.modalBanner.style.backgroundImage = `url(${API.getBackdropUrl(data.backdrop_path)})`;
        DOM.modalTitle.textContent = data.title || data.name;
        DOM.modalMatch.textContent = `${Math.round(data.vote_average * 10)}% Match`;
        DOM.modalYear.textContent = (data.release_date || data.first_air_date || '').split('-')[0];
        
        if (type === 'movie') {
            DOM.modalDuration.textContent = data.runtime ? `${Math.floor(data.runtime / 60)}h ${data.runtime % 60}m` : 'N/A';
        } else {
            DOM.modalDuration.textContent = `${data.number_of_seasons || 0} Season${data.number_of_seasons > 1 ? 's' : ''}`;
        }
        
        DOM.modalDescription.textContent = data.overview || 'No description available.';
        DOM.modalGenres.textContent = data.genres ? data.genres.map(g => g.name).join(', ') : 'N/A';
        DOM.modalRating.textContent = data.vote_average ? data.vote_average.toFixed(1) : 'N/A';
        
        updateMyListButton();
    }
}

function closeModal() {
    DOM.modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
    currentModalItem = null;
}

function updateMyListButton() {
    if (currentModalItem && Storage.isInMyList(currentModalItem.id, currentModalItem.type)) {
        DOM.modalAddList.innerHTML = '<i class="fas fa-check"></i>';
    } else {
        DOM.modalAddList.innerHTML = '<i class="fas fa-plus"></i>';
    }
}

function toggleMyList(item) {
    if (Storage.isInMyList(item.id, item.type)) {
        Storage.removeFromMyList(item.id, item.type);
    } else {
        Storage.addToMyList(item);
    }
    updateMyListButton();
}

// ============ PLAY CONTENT ============
function playContent(id, type) {
    // For TV shows, go to watch page which will show episode selector
    // For movies, go directly to watch page
    window.location.href = `watch.html?id=${id}&type=${type}`;
}

// ============ SLIDERS ============
function initSliders() {
    document.querySelectorAll('.slider-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const wrapper = btn.closest('.row-wrapper');
            const content = wrapper.querySelector('.row-content');
            const scrollAmount = content.clientWidth * 0.8;
            
            if (btn.classList.contains('slider-btn-left')) {
                content.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            } else {
                content.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            }
        });
    });
}

// ============ SEE ALL - FIXED ============
function initSeeAll() {
    DOM.seeAllClose?.addEventListener('click', closeSeeAllModal);
    
    DOM.seeAllModal?.addEventListener('click', (e) => {
        if (e.target === DOM.seeAllModal) {
            closeSeeAllModal();
        }
    });
    
    document.querySelectorAll('.see-all').forEach(link => {
        link.addEventListener('click', async (e) => {
            e.preventDefault();
            const section = link.closest('.content-row');
            const titleElement = section.querySelector('.row-title');
            let title = titleElement.textContent.trim();
            
            // Clean up title (remove emojis for API matching)
            title = title.replace(/[\u{1F300}-\u{1F9FF}]/gu, '').trim();
            
            await openSeeAllModal(title);
        });
    });
}

async function openSeeAllModal(title) {
    DOM.seeAllTitle.textContent = title;
    DOM.seeAllModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    DOM.seeAllGrid.innerHTML = '<div class="see-all-loading">Loading content...</div>';
    
    // Fetch 60 items based on category
    const items = await fetchCategoryContent(title, 3); // 3 pages = 60 items
    
    if (items.length > 0) {
        renderSeeAllCards(items);
    } else {
        DOM.seeAllGrid.innerHTML = '<div class="see-all-loading">No content found.</div>';
    }
}

async function fetchCategoryContent(title, pages = 3) {
    const titleLower = title.toLowerCase();
    let allItems = [];
    
    for (let page = 1; page <= pages; page++) {
        let data = null;
        
        if (titleLower.includes('trending')) {
            data = await API.fetchFromTMDB('/trending/all/week', { page });
        } else if (titleLower.includes('new release')) {
            data = await API.fetchFromTMDB('/movie/now_playing', { page });
        } else if (titleLower.includes('top 10') || titleLower.includes('top rated')) {
            data = await API.fetchFromTMDB('/movie/top_rated', { page });
        } else if (titleLower.includes('k-drama') || titleLower.includes('kdrama')) {
            data = await API.fetchFromTMDB('/discover/tv', { 
                with_origin_country: 'KR', 
                sort_by: 'popularity.desc',
                page 
            });
        } else if (titleLower.includes('bollywood')) {
            data = await API.fetchFromTMDB('/discover/movie', { 
                with_origin_country: 'IN', 
                sort_by: 'popularity.desc',
                page 
            });
        } else if (titleLower.includes('action')) {
            data = await API.fetchFromTMDB('/discover/movie', { with_genres: 28, sort_by: 'popularity.desc', page });
        } else if (titleLower.includes('adventure')) {
            data = await API.fetchFromTMDB('/discover/movie', { with_genres: 12, sort_by: 'popularity.desc', page });
        } else if (titleLower.includes('animation')) {
            data = await API.fetchFromTMDB('/discover/movie', { with_genres: 16, sort_by: 'popularity.desc', page });
        } else if (titleLower.includes('comedy')) {
            data = await API.fetchFromTMDB('/discover/movie', { with_genres: 35, sort_by: 'popularity.desc', page });
        } else if (titleLower.includes('crime')) {
            data = await API.fetchFromTMDB('/discover/movie', { with_genres: 80, sort_by: 'popularity.desc', page });
        } else if (titleLower.includes('documentary')) {
            data = await API.fetchFromTMDB('/discover/movie', { with_genres: 99, sort_by: 'popularity.desc', page });
        } else if (titleLower.includes('family')) {
            data = await API.fetchFromTMDB('/discover/movie', { with_genres: 10751, sort_by: 'popularity.desc', page });
        } else if (titleLower.includes('history')) {
            data = await API.fetchFromTMDB('/discover/movie', { with_genres: 36, sort_by: 'popularity.desc', page });
        } else if (titleLower.includes('horror')) {
            data = await API.fetchFromTMDB('/discover/movie', { with_genres: 27, sort_by: 'popularity.desc', page });
        } else if (titleLower.includes('romance')) {
            data = await API.fetchFromTMDB('/discover/movie', { with_genres: 10749, sort_by: 'popularity.desc', page });
        } else if (titleLower.includes('science fiction') || titleLower.includes('sci-fi')) {
            data = await API.fetchFromTMDB('/discover/movie', { with_genres: 878, sort_by: 'popularity.desc', page });
        } else if (titleLower.includes('thriller')) {
            data = await API.fetchFromTMDB('/discover/movie', { with_genres: 53, sort_by: 'popularity.desc', page });
        } else {
            data = await API.fetchFromTMDB('/movie/popular', { page });
        }
        
        if (data && data.results) {
            allItems.push(...data.results);
        }
    }
    
    // Remove duplicates and filter valid items
    const uniqueItems = [];
    const seenIds = new Set();
    
    allItems.forEach(item => {
        if (!seenIds.has(item.id) && (item.poster_path || item.backdrop_path)) {
            seenIds.add(item.id);
            uniqueItems.push(item);
        }
    });
    
    return uniqueItems;
}

function renderSeeAllCards(items) {
    DOM.seeAllGrid.innerHTML = items.map(item => {
        const title = item.title || item.name;
        const year = (item.release_date || item.first_air_date || '').split('-')[0];
        const rating = item.vote_average ? item.vote_average.toFixed(1) : 'N/A';
        const type = item.media_type || (item.first_air_date ? 'tv' : 'movie');
        const posterUrl = item.poster_path 
            ? API.getImageUrl(item.poster_path) 
            : 'https://via.placeholder.com/300x450?text=No+Image';
        
        return `
            <div class="see-all-card" data-id="${item.id}" data-type="${type}">
                <img src="${posterUrl}" alt="${title}" loading="lazy">
                <div class="see-all-card-info">
                    <p class="see-all-card-title">${title}</p>
                    <div class="see-all-card-meta">
                        <span class="see-all-card-rating"><i class="fas fa-star"></i> ${rating}</span>
                        <span class="see-all-card-year">${year}</span>
                        <span class="see-all-card-type">${type === 'movie' ? 'Movie' : 'Series'}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    // Add click events
    DOM.seeAllGrid.querySelectorAll('.see-all-card').forEach(card => {
        card.addEventListener('click', () => {
            closeSeeAllModal();
            openModal(card.dataset.id, card.dataset.type);
        });
    });
}

function closeSeeAllModal() {
    DOM.seeAllModal?.classList.remove('active');
    document.body.style.overflow = '';
}

// ============ CONTENT LOADING ============
async function loadAllContent() {
    loadHeroBanner();
    loadTrending();
    loadNewReleases();
    loadTop10Movies();
    loadTopRated();
    loadKDrama();
    loadBollywood();
    loadGenreMovies('actionMovies', 28);
    loadGenreMovies('adventureMovies', 12);
    loadGenreMovies('animationMovies', 16);
    loadGenreMovies('comedyMovies', 35);
    loadGenreMovies('crimeMovies', 80);
    loadGenreMovies('documentaries', 99);
    loadGenreMovies('familyMovies', 10751);
    loadGenreMovies('historyMovies', 36);
    loadGenreMovies('horrorMovies', 27);
    loadGenreMovies('romanceMovies', 10749);
    loadGenreMovies('scifiMovies', 878);
    loadGenreMovies('thrillerMovies', 53);
}

// ============ HERO BANNER ============
async function loadHeroBanner() {
    const data = await API.getTrendingMovies('day');
    
    if (data && data.results) {
        heroItems = data.results.filter(item => item.backdrop_path).slice(0, 10);
        
        if (heroItems.length > 0) {
            updateHeroBanner(heroItems[0]);
            startHeroRotation();
        }
    }
}

function updateHeroBanner(item) {
    currentHeroItem = item;
    const type = item.media_type || 'movie';
    
    DOM.heroBackground.style.opacity = '0';
    setTimeout(() => {
        DOM.heroBackground.style.backgroundImage = `url(${API.getBackdropUrl(item.backdrop_path)})`;
        DOM.heroBackground.style.opacity = '1';
    }, 300);
    
    DOM.heroTitle.textContent = item.title || item.name;
    DOM.heroDescription.textContent = item.overview || '';
    DOM.heroRating.innerHTML = `<i class="fas fa-star"></i> ${item.vote_average ? item.vote_average.toFixed(1) : 'N/A'}`;
    DOM.heroYear.textContent = (item.release_date || item.first_air_date || '').split('-')[0];
    DOM.heroType.innerHTML = `
        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Netflix_2015_N_logo.svg/1200px-Netflix_2015_N_logo.svg.png" class="n-logo" alt="N">
        <span>${type === 'movie' ? 'FILM' : 'SERIES'}</span>
    `;
    
    DOM.heroPlayBtn.onclick = () => playContent(item.id, type);
    DOM.heroInfoBtn.onclick = () => openModal(item.id, type);
}

function startHeroRotation() {
    heroInterval = setInterval(() => {
        heroIndex = (heroIndex + 1) % heroItems.length;
        updateHeroBanner(heroItems[heroIndex]);
    }, 8000);
}

// ============ CONTINUE WATCHING ============
function loadContinueWatching() {
    const items = Storage.getContinueWatching();
    
    if (items.length > 0) {
        DOM.continueSection.style.display = 'block';
        DOM.continueWatching.innerHTML = items.map(item => createContentCard({ ...item, type: item.type })).join('');
        addCardEventListeners(DOM.continueWatching);
    }
}

// ============ LOAD CATEGORIES ============
async function loadTrending() {
    showLoadingSkeletons(DOM.trendingNow);
    
    const [moviesData, tvData] = await Promise.all([
        API.getTrendingMovies('week'),
        API.getTrendingTV('week')
    ]);
    
    let items = [];
    if (moviesData?.results) items.push(...moviesData.results.map(m => ({ ...m, type: 'movie' })));
    if (tvData?.results) items.push(...tvData.results.map(t => ({ ...t, type: 'tv' })));
    
    items = shuffleArray(items).slice(0, 20);
    renderCards(DOM.trendingNow, items);
}

async function loadNewReleases() {
    showLoadingSkeletons(DOM.newReleases);
    const data = await API.getNowPlayingMovies();
    if (data?.results) {
        renderCards(DOM.newReleases, data.results.map(m => ({ ...m, type: 'movie' })));
    }
}

async function loadTop10Movies() {
    showLoadingSkeletons(DOM.top10Movies);
    const data = await API.getPopularMovies();
    if (data?.results) {
        renderTop10Cards(DOM.top10Movies, data.results.slice(0, 10));
    }
}

async function loadTopRated() {
    showLoadingSkeletons(DOM.topRated);
    const data = await API.getTopRatedMovies();
    if (data?.results) {
        renderCards(DOM.topRated, data.results.map(m => ({ ...m, type: 'movie' })));
    }
}

async function loadKDrama() {
    showLoadingSkeletons(DOM.kDrama);
    const data = await API.getKDrama();
    if (data?.results) {
        renderCards(DOM.kDrama, data.results.map(t => ({ ...t, type: 'tv' })));
    }
}

async function loadBollywood() {
    showLoadingSkeletons(DOM.bollywood);
    const data = await API.getBollywoodMovies();
    if (data?.results) {
        renderCards(DOM.bollywood, data.results.map(m => ({ ...m, type: 'movie' })));
    }
}

async function loadGenreMovies(containerId, genreId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    showLoadingSkeletons(container);
    const data = await API.getMoviesByGenre(genreId);
    if (data?.results) {
        renderCards(container, data.results.map(m => ({ ...m, type: 'movie' })));
    }
}

// ============ RENDER FUNCTIONS ============
function renderCards(container, items) {
    container.innerHTML = items.map(item => createContentCard(item)).join('');
    addCardEventListeners(container);
}

function createContentCard(item) {
    const title = item.title || item.name;
    const year = (item.release_date || item.first_air_date || '').split('-')[0];
    const rating = item.vote_average ? item.vote_average.toFixed(1) : 'N/A';
    const type = item.type || 'movie';
    
    return `
        <div class="content-card" data-id="${item.id}" data-type="${type}">
            <img class="card-image" src="${API.getImageUrl(item.backdrop_path || item.poster_path, 'card')}" alt="${title}" loading="lazy">
            <div class="card-info">
                <div class="card-buttons">
                    <button class="card-btn play-btn" data-action="play"><i class="fas fa-play"></i></button>
                    <button class="card-btn" data-action="list"><i class="fas fa-plus"></i></button>
                    <button class="card-btn" data-action="like"><i class="fas fa-thumbs-up"></i></button>
                    <button class="card-btn expand-btn" data-action="info"><i class="fas fa-chevron-down"></i></button>
                </div>
                <div class="card-meta">
                    <span class="card-match">${Math.floor(Math.random() * 15) + 85}% Match</span>
                    <span class="card-rating-badge">${rating}</span>
                    <span class="card-hd">HD</span>
                </div>
                <p class="card-title">${title}</p>
                <div class="card-genres">
                    <span>${year}</span>
                    <span>${type === 'movie' ? 'Movie' : 'Series'}</span>
                </div>
            </div>
        </div>
    `;
}

function renderTop10Cards(container, items) {
    container.innerHTML = items.map((item, index) => `
        <div class="top-10-card" data-id="${item.id}" data-type="movie">
            <span class="top-10-number">${index + 1}</span>
            <img class="top-10-poster" src="${API.getImageUrl(item.poster_path)}" alt="${item.title}" loading="lazy">
        </div>
    `).join('');
    
    container.querySelectorAll('.top-10-card').forEach(card => {
        card.addEventListener('click', () => {
            openModal(card.dataset.id, card.dataset.type);
        });
    });
}

function showLoadingSkeletons(container, count = 8) {
    container.innerHTML = Array(count).fill('<div class="card-skeleton skeleton"></div>').join('');
}

// ============ EVENT LISTENERS ============
function addCardEventListeners(container) {
    container.querySelectorAll('.content-card').forEach(card => {
        const id = card.dataset.id;
        const type = card.dataset.type;
        
        card.querySelector('[data-action="play"]')?.addEventListener('click', (e) => {
            e.stopPropagation();
            playContent(id, type);
        });
        
        card.querySelector('[data-action="list"]')?.addEventListener('click', (e) => {
            e.stopPropagation();
        });
        
        card.querySelector('[data-action="info"]')?.addEventListener('click', (e) => {
            e.stopPropagation();
            openModal(id, type);
        });
        
        card.addEventListener('click', () => {
            openModal(id, type);
        });
    });
}

// ============ UTILITIES ============
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}
