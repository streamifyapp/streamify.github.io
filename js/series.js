/* ============================================
   STREAMIFY - TV SHOWS PAGE LOGIC
   Browse All TV Shows with Filters
============================================ */

// ============ DOM ELEMENTS ============
const SeriesDOM = {
    seriesGrid: document.getElementById('seriesGrid'),
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
    loadSeries();
});

// ============ FILTERS ============
function initFilters() {
    // Genre dropdown toggle
    SeriesDOM.genreBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        SeriesDOM.genreBtn.parentElement.classList.toggle('active');
        SeriesDOM.sortBtn.parentElement.classList.remove('active');
    });
    
    // Sort dropdown toggle
    SeriesDOM.sortBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        SeriesDOM.sortBtn.parentElement.classList.toggle('active');
        SeriesDOM.genreBtn.parentElement.classList.remove('active');
    });
    
    // Close dropdowns on outside click
    document.addEventListener('click', () => {
        SeriesDOM.genreBtn.parentElement.classList.remove('active');
        SeriesDOM.sortBtn.parentElement.classList.remove('active');
    });
    
    // Genre selection
    SeriesDOM.genreDropdown.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const genre = link.dataset.genre;
            
            SeriesDOM.genreDropdown.querySelectorAll('a').forEach(a => a.classList.remove('active'));
            link.classList.add('active');
            SeriesDOM.genreBtn.querySelector('span').textContent = link.textContent;
            SeriesDOM.genreBtn.parentElement.classList.remove('active');
            
            currentGenre = genre;
            currentPage = 1;
            SeriesDOM.seriesGrid.innerHTML = '';
            loadSeries();
        });
    });
    
    // Sort selection
    SeriesDOM.sortDropdown.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sort = link.dataset.sort;
            
            SeriesDOM.sortDropdown.querySelectorAll('a').forEach(a => a.classList.remove('active'));
            link.classList.add('active');
            SeriesDOM.sortBtn.querySelector('span').textContent = link.textContent;
            SeriesDOM.sortBtn.parentElement.classList.remove('active');
            
            currentSort = sort;
            currentPage = 1;
            SeriesDOM.seriesGrid.innerHTML = '';
            loadSeries();
        });
    });
    
    // Load more button
    SeriesDOM.loadMoreBtn.addEventListener('click', () => {
        if (!isLoading && currentPage < totalPages) {
            currentPage++;
            loadSeries(true);
        }
    });
}

// ============ SEARCH ============
function initSearch() {
    SeriesDOM.searchToggle.addEventListener('click', () => {
        SeriesDOM.searchBox.classList.toggle('active');
        if (SeriesDOM.searchBox.classList.contains('active')) {
            SeriesDOM.searchInput.focus();
        }
    });
    
    SeriesDOM.searchInput.addEventListener('keypress', async (e) => {
        if (e.key === 'Enter' && SeriesDOM.searchInput.value.trim()) {
            const query = SeriesDOM.searchInput.value.trim();
            currentPage = 1;
            SeriesDOM.seriesGrid.innerHTML = '';
            await searchSeries(query);
        }
    });
}

async function searchSeries(query) {
    showLoading();
    
    const data = await API.searchTV(query, currentPage);
    
    if (data && data.results) {
        totalPages = data.total_pages;
        renderSeries(data.results, false);
        updateLoadMoreButton();
    }
    
    hideLoading();
}

// ============ LOAD TV SHOWS ============
async function loadSeries(append = false) {
    if (isLoading) return;
    
    showLoading();
    
    let data;
    
    if (currentGenre === 'all') {
        data = await API.fetchFromTMDB('/discover/tv', {
            sort_by: currentSort,
            page: currentPage,
            'vote_count.gte': 100
        });
    } else {
        data = await API.fetchFromTMDB('/discover/tv', {
            with_genres: currentGenre,
            sort_by: currentSort,
            page: currentPage,
            'vote_count.gte': 50
        });
    }
    
    if (data && data.results) {
        totalPages = Math.min(data.total_pages, 500);
        renderSeries(data.results, append);
        updateLoadMoreButton();
    }
    
    hideLoading();
}

function renderSeries(shows, append = false) {
    const html = shows.map(show => createGridCard(show, 'tv')).join('');
    
    if (append) {
        SeriesDOM.seriesGrid.innerHTML += html;
    } else {
        SeriesDOM.seriesGrid.innerHTML = html;
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
    SeriesDOM.seriesGrid.querySelectorAll('.grid-card').forEach(card => {
        const id = card.dataset.id;
        const type = card.dataset.type;
        
        card.querySelector('[data-action="play"]')?.addEventListener('click', (e) => {
            e.stopPropagation();
            window.location.href = `watch.html?id=${id}&type=${type}`;
        });
        
        card.querySelector('[data-action="list"]')?.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleListFromCard(card, id, type);
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

async function toggleListFromCard(card, id, type) {
    const btn = card.querySelector('[data-action="list"]');
    const icon = btn.querySelector('i');
    const title = card.querySelector('.grid-card-title').textContent;
    const img = card.querySelector('img');
    
    if (Storage.isInMyList(parseInt(id), type)) {
        Storage.removeFromMyList(parseInt(id), type);
        icon.className = 'fas fa-plus';
    } else {
        Storage.addToMyList({
            id: parseInt(id),
            type: type,
            title: title,
            poster_path: img.src.includes('image.tmdb.org') ? img.src.split('/').pop() : null
        });
        icon.className = 'fas fa-check';
    }
}

// ============ MODAL ============
function initModal() {
    SeriesDOM.modalClose.addEventListener('click', closeModal);
    
    SeriesDOM.modalOverlay.addEventListener('click', (e) => {
        if (e.target === SeriesDOM.modalOverlay) {
            closeModal();
        }
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });
    
    SeriesDOM.modalPlayBtn.addEventListener('click', () => {
        if (currentModalItem) {
            window.location.href = `watch.html?id=${currentModalItem.id}&type=tv`;
        }
    });
    
    SeriesDOM.modalAddList.addEventListener('click', () => {
        if (currentModalItem) {
            toggleMyList(currentModalItem);
        }
    });
}

async function openModal(id, type) {
    SeriesDOM.modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    const data = await API.getTVDetails(id);
    
    if (data) {
        currentModalItem = { ...data, type: 'tv' };
        
        SeriesDOM.modalBanner.style.backgroundImage = `url(${API.getBackdropUrl(data.backdrop_path)})`;
        SeriesDOM.modalTitle.textContent = data.name;
        SeriesDOM.modalMatch.textContent = `${Math.round(data.vote_average * 10)}% Match`;
        SeriesDOM.modalYear.textContent = (data.first_air_date || '').split('-')[0];
        SeriesDOM.modalDuration.textContent = `${data.number_of_seasons || 0} Season${data.number_of_seasons > 1 ? 's' : ''}`;
        SeriesDOM.modalDescription.textContent = data.overview || 'No description available.';
        SeriesDOM.modalGenres.textContent = data.genres ? data.genres.map(g => g.name).join(', ') : 'N/A';
        SeriesDOM.modalRating.textContent = data.vote_average ? data.vote_average.toFixed(1) : 'N/A';
        
        updateModalListButton();
    }
}

function closeModal() {
    SeriesDOM.modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
    currentModalItem = null;
}

function toggleMyList(item) {
    if (Storage.isInMyList(item.id, 'tv')) {
        Storage.removeFromMyList(item.id, 'tv');
    } else {
        Storage.addToMyList({ ...item, type: 'tv' });
    }
    updateModalListButton();
}

function updateModalListButton() {
    const icon = SeriesDOM.modalAddList.querySelector('i');
    if (currentModalItem && Storage.isInMyList(currentModalItem.id, 'tv')) {
        icon.className = 'fas fa-check';
    } else {
        icon.className = 'fas fa-plus';
    }
}

// ============ UTILITIES ============
function showLoading() {
    isLoading = true;
    SeriesDOM.loadMoreBtn.classList.add('loading');
    SeriesDOM.loadMoreBtn.querySelector('span').textContent = 'Loading...';
    SeriesDOM.loadMoreBtn.querySelector('i').className = 'fas fa-spinner';
}

function hideLoading() {
    isLoading = false;
    SeriesDOM.loadMoreBtn.classList.remove('loading');
    SeriesDOM.loadMoreBtn.querySelector('span').textContent = 'Load More';
    SeriesDOM.loadMoreBtn.querySelector('i').className = 'fas fa-chevron-down';
}

function updateLoadMoreButton() {
    if (currentPage >= totalPages) {
        SeriesDOM.loadMoreBtn.style.display = 'none';
    } else {
        SeriesDOM.loadMoreBtn.style.display = 'flex';
    }
}
