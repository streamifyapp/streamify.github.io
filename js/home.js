/* ============================================
   STREAMIFY - HOMEPAGE LOGIC
   Netflix-Style Homepage Functionality
============================================ */

// ============ DOM ELEMENTS ============
const DOM = {
    // Navbar
    navbar: document.getElementById('navbar'),
    searchBox: document.getElementById('searchBox'),
    searchToggle: document.getElementById('searchToggle'),
    searchInput: document.getElementById('searchInput'),
    
    // Hero Banner
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
    
    // Content Rows
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
    
    // Modal
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
    
    // See All Modal
    seeAllModal: document.getElementById('seeAllModal'),
    seeAllTitle: document.getElementById('seeAllTitle'),
    seeAllGrid: document.getElementById('seeAllGrid'),
    seeAllClose: document.getElementById('seeAllClose'),
    
    // Search Results
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

// ============ NAVBAR FUNCTIONS ============
function initNavbar() {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            DOM.navbar.classList.add('scrolled');
        } else {
            DOM.navbar.classList.remove('scrolled');
        }
    });
}

// ============ SEARCH FUNCTIONS ============
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
    DOM.searchResults.innerHTML = '<div class="loading">Searching...</div>';
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
                const id = card.dataset.id;
                const type = card.dataset.type;
                openModal(id, type);
            });
        });
    } else {
        DOM.searchResults.innerHTML = '<p>No results found.</p>';
    }
}

// ============ MODAL FUNCTIONS ============
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
        DOM.modalDuration.textContent = type === 'movie' 
            ? `${data.runtime || 0} min` 
            : `${data.number_of_seasons || 0} Season${data.number_of_seasons > 1 ? 's' : ''}`;
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
function playContent(id, type, season = 1, episode = 1) {
    window.location.href = `watch.html?id=${id}&type=${type}&season=${season}&episode=${episode}`;
}

// ============ SLIDER FUNCTIONS ============
function initSliders() {
    document.querySelectorAll('.slider-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
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

// ============ SEE ALL FUNCTIONALITY ============
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
            const title = titleElement.textContent.trim();
            const container = section.querySelector('.row-content');
            
            await openSeeAllModal(title, container);
        });
    });
}

async function openSeeAllModal(title, sourceContainer) {
    DOM.seeAllTitle.textContent = title;
    DOM.seeAllModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    const cards = sourceContainer.querySelectorAll('.content-card, .top-10-card');
    
    DOM.seeAllGrid.innerHTML = '<div class="loading" style="color: #fff; text-align: center; padding: 50px;">Loading...</div>';
    
    // First load existing cards
    let cardsHtml = '';
    cards.forEach(card => {
        const id = card.dataset.id;
        const type = card.dataset.type || 'movie';
        let imgSrc = '';
        
        const img = card.querySelector('img');
        if (img) {
            imgSrc = img.src.replace('/w780/', '/w500/').replace('/original/', '/w500/');
        }
        
        if (card.classList.contains('top-10-card')) {
            const poster = card.querySelector('.top-10-poster');
            if (poster) imgSrc = poster.src;
        }
        
        cardsHtml += `
            <div class="see-all-card" data-id="${id}" data-type="${type}">
                <img src="${imgSrc}" alt="Poster" loading="lazy">
            </div>
        `;
    });
    
    DOM.seeAllGrid.innerHTML = cardsHtml;
    
    // Add click events
    addSeeAllCardEvents();
    
    // Load more content
    await loadMoreForSeeAll(title);
}

async function loadMoreForSeeAll(title) {
    let data = null;
    const titleLower = title.toLowerCase();
    
    if (titleLower.includes('trending')) {
        data = await API.getTrendingMovies('week');
    } else if (titleLower.includes('new release')) {
        data = await API.getNowPlayingMovies();
    } else if (titleLower.includes('top rated') || titleLower.includes('top 10')) {
        data = await API.getTopRatedMovies();
    } else if (titleLower.includes('k-drama')) {
        data = await API.getKDrama();
    } else if (titleLower.includes('bollywood')) {
        data = await API.getBollywoodMovies();
    } else if (titleLower.includes('action')) {
        data = await API.getMoviesByGenre(28);
    } else if (titleLower.includes('adventure')) {
        data = await API.getMoviesByGenre(12);
    } else if (titleLower.includes('animation')) {
        data = await API.getMoviesByGenre(16);
    } else if (titleLower.includes('comedy')) {
        data = await API.getMoviesByGenre(35);
    } else if (titleLower.includes('crime')) {
        data = await API.getMoviesByGenre(80);
    } else if (titleLower.includes('documentary')) {
        data = await API.getMoviesByGenre(99);
    } else if (titleLower.includes('family')) {
        data = await API.getMoviesByGenre(10751);
    } else if (titleLower.includes('history')) {
        data = await API.getMoviesByGenre(36);
    } else if (titleLower.includes('horror')) {
        data = await API.getMoviesByGenre(27);
    } else if (titleLower.includes('romance')) {
        data = await API.getMoviesByGenre(10749);
    } else if (titleLower.includes('science fiction')) {
        data = await API.getMoviesByGenre(878);
    } else if (titleLower.includes('thriller')) {
        data = await API.getMoviesByGenre(53);
    }
    
    if (data && data.results) {
        data.results.forEach(item => {
            const type = item.media_type || (item.first_air_date ? 'tv' : 'movie');
            
            const exists = DOM.seeAllGrid.querySelector(`[data-id="${item.id}"]`);
            if (exists) return;
            
            const seeAllCard = document.createElement('div');
            seeAllCard.className = 'see-all-card';
            seeAllCard.dataset.id = item.id;
            seeAllCard.dataset.type = type;
            seeAllCard.innerHTML = `<img src="${API.getImageUrl(item.poster_path)}" alt="${item.title || item.name}" loading="lazy">`;
            
            seeAllCard.addEventListener('click', () => {
                closeSeeAllModal();
                openModal(item.id, type);
            });
            
            DOM.seeAllGrid.appendChild(seeAllCard);
        });
    }
}

function addSeeAllCardEvents() {
    DOM.seeAllGrid.querySelectorAll('.see-all-card').forEach(card => {
        card.addEventListener('click', () => {
            const id = card.dataset.id;
            const type = card.dataset.type;
            closeSeeAllModal();
            openModal(id, type);
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
    loadGenreMovies('actionMovies', CONFIG.GENRES.movie.action);
    loadGenreMovies('adventureMovies', CONFIG.GENRES.movie.adventure);
    loadGenreMovies('animationMovies', CONFIG.GENRES.movie.animation);
    loadGenreMovies('comedyMovies', CONFIG.GENRES.movie.comedy);
    loadGenreMovies('crimeMovies', CONFIG.GENRES.movie.crime);
    loadGenreMovies('documentaries', CONFIG.GENRES.movie.documentary);
    loadGenreMovies('familyMovies', CONFIG.GENRES.movie.family);
    loadGenreMovies('historyMovies', CONFIG.GENRES.movie.history);
    loadGenreMovies('horrorMovies', CONFIG.GENRES.movie.horror);
    loadGenreMovies('romanceMovies', CONFIG.GENRES.movie.romance);
    loadGenreMovies('scifiMovies', CONFIG.GENRES.movie.scifi);
    loadGenreMovies('thrillerMovies', CONFIG.GENRES.movie.thriller);
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
        DOM.continueWatching.innerHTML = items.map(item => createContinueCard(item)).join('');
        addCardEventListeners(DOM.continueWatching);
    }
}

function createContinueCard(item) {
    return `
        <div class="content-card" data-id="${item.id}" data-type="${item.type}">
            <img class="card-image" src="${API.getImageUrl(item.backdrop_path || item.poster_path, 'card')}" alt="${item.title}">
            <div class="continue-progress">
                <div class="progress-bar" style="width: ${item.progress}%"></div>
            </div>
            <div class="card-info">
                <div class="card-buttons">
                    <button class="card-btn play-btn" data-action="play"><i class="fas fa-play"></i></button>
                    <button class="card-btn" data-action="list"><i class="fas fa-plus"></i></button>
                    <button class="card-btn" data-action="like"><i class="fas fa-thumbs-up"></i></button>
                    <button class="card-btn expand-btn" data-action="info"><i class="fas fa-chevron-down"></i></button>
                </div>
                <div class="card-meta">
                    <span class="card-match">${Math.floor(Math.random() * 20) + 80}% Match</span>
                    <span class="card-hd">HD</span>
                </div>
                <p class="card-title">${item.title}</p>
            </div>
        </div>
    `;
}

// ============ TRENDING NOW ============
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

// ============ NEW RELEASES ============
async function loadNewReleases() {
    showLoadingSkeletons(DOM.newReleases);
    
    const data = await API.getNowPlayingMovies();
    
    if (data?.results) {
        const items = data.results.map(m => ({ ...m, type: 'movie' }));
        renderCards(DOM.newReleases, items);
    }
}

// ============ TOP 10 MOVIES ============
async function loadTop10Movies() {
    showLoadingSkeletons(DOM.top10Movies);
    
    const data = await API.getPopularMovies();
    
    if (data?.results) {
        const items = data.results.slice(0, 10);
        renderTop10Cards(DOM.top10Movies, items);
    }
}

// ============ TOP RATED ============
async function loadTopRated() {
    showLoadingSkeletons(DOM.topRated);
    
    const data = await API.getTopRatedMovies();
    
    if (data?.results) {
        const items = data.results.map(m => ({ ...m, type: 'movie' }));
        renderCards(DOM.topRated, items);
    }
}

// ============ K-DRAMA ============
async function loadKDrama() {
    showLoadingSkeletons(DOM.kDrama);
    
    const data = await API.getKDrama();
    
    if (data?.results) {
        const items = data.results.map(t => ({ ...t, type: 'tv' }));
        renderCards(DOM.kDrama, items);
    }
}

// ============ BOLLYWOOD ============
async function loadBollywood() {
    showLoadingSkeletons(DOM.bollywood);
    
    const data = await API.getBollywoodMovies();
    
    if (data?.results) {
        const items = data.results.map(m => ({ ...m, type: 'movie' }));
        renderCards(DOM.bollywood, items);
    }
}

// ============ GENRE MOVIES ============
async function loadGenreMovies(containerId, genreId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    showLoadingSkeletons(container);
    
    const data = await API.getMoviesByGenre(genreId);
    
    if (data?.results) {
        const items = data.results.map(m => ({ ...m, type: 'movie' }));
        renderCards(container, items);
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
    
    return `
        <div class="content-card" data-id="${item.id}" data-type="${item.type || 'movie'}">
            <img class="card-image" src="${API.getImageUrl(item.backdrop_path || item.poster_path, 'card')}" alt="${title}" loading="lazy">
            <div class="card-info">
                <div class="card-buttons">
                    <button class="card-btn play-btn" data-action="play"><i class="fas fa-play"></i></button>
                    <button class="card-btn" data-action="list"><i class="fas fa-plus"></i></button>
                    <button class="card-btn" data-action="like"><i class="fas fa-thumbs-up"></i></button>
                    <button class="card-btn expand-btn" data-action="info"><i class="fas fa-chevron-down"></i></button>
                </div>
                <div class="card-meta">
                    <span class="card-match">${Math.floor(Math.random() * 20) + 80}% Match</span>
                    <span class="card-rating-badge">${rating}</span>
                    <span class="card-hd">HD</span>
                </div>
                <p class="card-title">${title}</p>
                <div class="card-genres">
                    <span>${year}</span>
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
            const id = card.dataset.id;
            const type = card.dataset.type;
            openModal(id, type);
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

// ============ UTILITY FUNCTIONS ============
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}
