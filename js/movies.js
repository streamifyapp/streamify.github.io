/* ============================================
   STREAMIFY - MOVIES PAGE LOGIC (FIXED)
   Browse All Movies with Filters
============================================ */

// ============ DOM ELEMENTS ============
const MoviesDOM = {
    moviesGrid: document.getElementById('moviesGrid'),
    loadMoreBtn: document.getElementById('loadMoreBtn'),
    genreBtn: document.getElementById('genreBtn'),
    genreDropdown: document.getElementById('genreDropdown'),
    sortBtn: document.getElementById('sortBtn'),
    sortDropdown: document.getElementById('sortDropdown'),
    searchBox: document.getElementById('searchBox'),
    searchToggle: document.getElementById('searchToggle'),
    searchInput: document.getElementById('searchInput'),
    
    // Modal
    modalOverlay: document.getElementById('modalOverlay'),
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
    modalAddList: document.getElementById('modalAddList')
};

// ============ STATE ============
let currentPage = 1;
let currentGenre = 'all';
let currentSort = 'popularity.desc';
let isLoading = false;
let totalPages = 1;
let currentModalItem = null;

// ============ INITIALIZATION ============
document.addEventListener('DOMContentLoaded', () => {
    initFilters();
    initSearch();
    initModal();
    loadMovies();
});

// ============ FILTERS ============
function initFilters() {
    MoviesDOM.genreBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        MoviesDOM.genreBtn.parentElement.classList.toggle('active');
        MoviesDOM.sortBtn.parentElement.classList.remove('active');
    });
    
    MoviesDOM.sortBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        MoviesDOM.sortBtn.parentElement.classList.toggle('active');
        MoviesDOM.genreBtn.parentElement.classList.remove('active');
    });
    
    document.addEventListener('click', () => {
        MoviesDOM.genreBtn.parentElement.classList.remove('active');
        MoviesDOM.sortBtn.parentElement.classList.remove('active');
    });
    
    MoviesDOM.genreDropdown.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const genre = link.dataset.genre;
            
            MoviesDOM.genreDropdown.querySelectorAll('a').forEach(a => a.classList.remove('active'));
            link.classList.add('active');
            MoviesDOM.genreBtn.querySelector('span').textContent = link.textContent;
            MoviesDOM.genreBtn.parentElement.classList.remove('active');
            
            currentGenre = genre;
            currentPage = 1;
            MoviesDOM.moviesGrid.innerHTML = '';
            loadMovies();
        });
    });
    
    MoviesDOM.sortDropdown.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sort = link.dataset.sort;
            
            MoviesDOM.sortDropdown.querySelectorAll('a').forEach(a => a.classList.remove('active'));
            link.classList.add('active');
            MoviesDOM.sortBtn.querySelector('span').textContent = link.textContent;
            MoviesDOM.sortBtn.parentElement.classList.remove('active');
            
            currentSort = sort;
            currentPage = 1;
            MoviesDOM.moviesGrid.innerHTML = '';
            loadMovies();
        });
    });
    
    MoviesDOM.loadMoreBtn.addEventListener('click', () => {
        if (!isLoading && currentPage < totalPages) {
            currentPage++;
            loadMovies(true);
        }
    });
}

// ============ SEARCH ============
function initSearch() {
    MoviesDOM.searchToggle.addEventListener('click', () => {
        MoviesDOM.searchBox.classList.toggle('active');
        if (MoviesDOM.searchBox.classList.contains('active')) {
            MoviesDOM.searchInput.focus();
        }
    });
    
    MoviesDOM.searchInput.addEventListener('keypress', async (e) => {
        if (e.key === 'Enter' && MoviesDOM.searchInput.value.trim()) {
            const query = MoviesDOM.searchInput.value.trim();
            currentPage = 1;
            MoviesDOM.moviesGrid.innerHTML = '';
            await searchMovies(query);
        }
    });
}

async function searchMovies(query) {
    showLoading();
    const data = await API.searchMovies(query, currentPage);
    if (data && data.results) {
        totalPages = data.total_pages;
        renderMovies(data.results, false);
        updateLoadMoreButton();
    }
    hideLoading();
}

// ============ LOAD MOVIES ============
async function loadMovies(append = false) {
    if (isLoading) return;
    showLoading();
    
    let data;
    if (currentGenre === 'all') {
        data = await API.fetchFromTMDB('/discover/movie', {
            sort_by: currentSort,
            page: currentPage,
            'vote_count.gte': 100
        });
    } else {
        data = await API.fetchFromTMDB('/discover/movie', {
            with_genres: currentGenre,
            sort_by: currentSort,
            page: currentPage,
            'vote_count.gte': 50
        });
    }
    
    if (data && data.results) {
        totalPages = Math.min(data.total_pages, 500);
        renderMovies(data.results, append);
        updateLoadMoreButton();
    }
    hideLoading();
}

function renderMovies(movies, append = false) {
    const html = movies.map(movie => createGridCard(movie, 'movie')).join('');
    if (append) {
        MoviesDOM.moviesGrid.innerHTML += html;
    } else {
        MoviesDOM.moviesGrid.innerHTML = html;
    }
    addCardEventListeners();
}

function createGridCard(item, type) {
    const title = item.title || item.name;
    const year = (item.release_date || item.first_air_date || '').split('-')[0];
    const rating = item.vote_average ? item.vote_average.toFixed(1) : 'N/A';
    const posterUrl = item.poster_path 
        ? API.getImageUrl(item.poster_path) 
        : 'https://via.placeholder.com/300x450?text=No+Image';
    
    return `
        <div class="grid-card" data-id="${item.id}" data-type="${type}">
            <img src="${posterUrl}" alt="${title}" loading="lazy">
            <div class="grid-card-overlay">
                <p class="grid-card-title">${title}</p>
                <div class="grid-card-meta">
                    <span class="grid-card-rating"><i class="fas fa-star"></i> ${rating}</span>
                    <span class="grid-card-year">${year}</span>
                </div>
                <div class="grid-card-buttons">
                    <button class="grid-card-btn play-btn" data-action="play">
                        <i class="fas fa-play"></i>
                    </button>
                    <button class="grid-card-btn" data-action="list">
                        <i class="fas fa-plus"></i>
                    </button>
                    <button class="grid-card-btn" data-action="info">
                        <i class="fas fa-chevron-down"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}

function addCardEventListeners() {
    MoviesDOM.moviesGrid.querySelectorAll('.grid-card').forEach(card => {
        const id = parseInt(card.dataset.id);
        const type = card.dataset.type;
        
        // FIXED: Card click opens modal
        card.addEventListener('click', (e) => {
            // Don't open modal if clicking a button
            if (!e.target.closest('button')) {
                openModal(id, type);
            }
        });
        
        // Play button
        const playBtn = card.querySelector('[data-action="play"]');
        if (playBtn) {
            playBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                window.location.href = `watch.html?id=${id}&type=${type}`;
            });
        }
        
        // Add to list button
        const listBtn = card.querySelector('[data-action="list"]');
        if (listBtn) {
            listBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleListFromCard(card, id, type);
            });
        }
        
        // Info button
        const infoBtn = card.querySelector('[data-action="info"]');
        if (infoBtn) {
            infoBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                openModal(id, type);
            });
        }
    });
}

async function toggleListFromCard(card, id, type) {
    const btn = card.querySelector('[data-action="list"]');
    const icon = btn.querySelector('i');
    const title = card.querySelector('.grid-card-title').textContent;
    const img = card.querySelector('img');
    
    if (Storage.isInMyList(id, type)) {
        Storage.removeFromMyList(id, type);
        icon.className = 'fas fa-plus';
    } else {
        Storage.addToMyList({
            id: id,
            type: type,
            title: title,
            poster_path: img.src.includes('image.tmdb.org') ? img.src.split('/').pop() : null
        });
        icon.className = 'fas fa-check';
    }
}

// ============ MODAL ============
function initModal() {
    MoviesDOM.modalClose.addEventListener('click', closeModal);
    
    MoviesDOM.modalOverlay.addEventListener('click', (e) => {
        if (e.target === MoviesDOM.modalOverlay) {
            closeModal();
        }
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });
    
    MoviesDOM.modalPlayBtn.addEventListener('click', () => {
        if (currentModalItem) {
            window.location.href = `watch.html?id=${currentModalItem.id}&type=movie`;
        }
    });
    
    MoviesDOM.modalAddList.addEventListener('click', () => {
        if (currentModalItem) {
            toggleMyList(currentModalItem);
        }
    });
}

async function openModal(id, type) {
    MoviesDOM.modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    const data = await API.getMovieDetails(id);
    
    if (data) {
        currentModalItem = { ...data, type: 'movie' };
        
        MoviesDOM.modalBanner.style.backgroundImage = `url(${API.getBackdropUrl(data.backdrop_path)})`;
        MoviesDOM.modalTitle.textContent = data.title;
        MoviesDOM.modalMatch.textContent = `${Math.round(data.vote_average * 10)}% Match`;
        MoviesDOM.modalYear.textContent = (data.release_date || '').split('-')[0];
        MoviesDOM.modalDuration.textContent = data.runtime ? `${Math.floor(data.runtime / 60)}h ${data.runtime % 60}m` : 'N/A';
        MoviesDOM.modalDescription.textContent = data.overview || 'No description available.';
        MoviesDOM.modalGenres.textContent = data.genres ? data.genres.map(g => g.name).join(', ') : 'N/A';
        MoviesDOM.modalRating.textContent = data.vote_average ? data.vote_average.toFixed(1) : 'N/A';
        
        updateModalListButton();
    }
}

function closeModal() {
    MoviesDOM.modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
    currentModalItem = null;
}

function toggleMyList(item) {
    if (Storage.isInMyList(item.id, 'movie')) {
        Storage.removeFromMyList(item.id, 'movie');
    } else {
        Storage.addToMyList({ ...item, type: 'movie' });
    }
    updateModalListButton();
}

function updateModalListButton() {
    const icon = MoviesDOM.modalAddList.querySelector('i');
    if (currentModalItem && Storage.isInMyList(currentModalItem.id, 'movie')) {
        icon.className = 'fas fa-check';
    } else {
        icon.className = 'fas fa-plus';
    }
}

// ============ UTILITIES ============
function showLoading() {
    isLoading = true;
    MoviesDOM.loadMoreBtn.classList.add('loading');
    MoviesDOM.loadMoreBtn.querySelector('span').textContent = 'Loading...';
    MoviesDOM.loadMoreBtn.querySelector('i').className = 'fas fa-spinner';
}

function hideLoading() {
    isLoading = false;
    MoviesDOM.loadMoreBtn.classList.remove('loading');
    MoviesDOM.loadMoreBtn.querySelector('span').textContent = 'Load More';
    MoviesDOM.loadMoreBtn.querySelector('i').className = 'fas fa-chevron-down';
}

function updateLoadMoreButton() {
    if (currentPage >= totalPages) {
        MoviesDOM.loadMoreBtn.style.display = 'none';
    } else {
        MoviesDOM.loadMoreBtn.style.display = 'flex';
    }
}
