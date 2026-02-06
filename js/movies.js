/* ============================================
   STREAMIFY - MOVIES PAGE LOGIC
   COMPLETELY FIXED FOR MOBILE & DESKTOP
============================================ */

// Wait for DOM and scripts to load
document.addEventListener('DOMContentLoaded', initMoviesPage);

function initMoviesPage() {
    // Check if API is loaded
    if (typeof API === 'undefined') {
        console.error('API not loaded');
        return;
    }
    
    initFilters();
    initSearch();
    initModal();
    loadMovies();
}

// DOM Elements
const MoviesDOM = {
    get moviesGrid() { return document.getElementById('moviesGrid'); },
    get loadMoreBtn() { return document.getElementById('loadMoreBtn'); },
    get genreBtn() { return document.getElementById('genreBtn'); },
    get genreDropdown() { return document.getElementById('genreDropdown'); },
    get sortBtn() { return document.getElementById('sortBtn'); },
    get sortDropdown() { return document.getElementById('sortDropdown'); },
    get searchBox() { return document.getElementById('searchBox'); },
    get searchToggle() { return document.getElementById('searchToggle'); },
    get searchInput() { return document.getElementById('searchInput'); },
    get modalOverlay() { return document.getElementById('modalOverlay'); },
    get modalClose() { return document.getElementById('modalClose'); },
    get modalBanner() { return document.getElementById('modalBanner'); },
    get modalTitle() { return document.getElementById('modalTitle'); },
    get modalMatch() { return document.getElementById('modalMatch'); },
    get modalYear() { return document.getElementById('modalYear'); },
    get modalDuration() { return document.getElementById('modalDuration'); },
    get modalDescription() { return document.getElementById('modalDescription'); },
    get modalGenres() { return document.getElementById('modalGenres'); },
    get modalRating() { return document.getElementById('modalRating'); },
    get modalPlayBtn() { return document.getElementById('modalPlayBtn'); },
    get modalAddList() { return document.getElementById('modalAddList'); }
};

let currentPage = 1;
let currentGenre = 'all';
let currentSort = 'popularity.desc';
let isLoading = false;
let totalPages = 1;
let currentModalItem = null;
let isModalOpen = false;

function initFilters() {
    const genreBtn = MoviesDOM.genreBtn;
    const sortBtn = MoviesDOM.sortBtn;
    const genreDropdown = MoviesDOM.genreDropdown;
    const sortDropdown = MoviesDOM.sortDropdown;
    
    genreBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        genreBtn.parentElement.classList.toggle('active');
        sortBtn?.parentElement.classList.remove('active');
    });
    
    sortBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        sortBtn.parentElement.classList.toggle('active');
        genreBtn?.parentElement.classList.remove('active');
    });
    
    document.addEventListener('click', () => {
        genreBtn?.parentElement.classList.remove('active');
        sortBtn?.parentElement.classList.remove('active');
    });
    
    genreDropdown?.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const genre = link.dataset.genre;
            
            genreDropdown.querySelectorAll('a').forEach(a => a.classList.remove('active'));
            link.classList.add('active');
            genreBtn.querySelector('span').textContent = link.textContent;
            genreBtn.parentElement.classList.remove('active');
            
            currentGenre = genre;
            currentPage = 1;
            MoviesDOM.moviesGrid.innerHTML = '';
            loadMovies();
        });
    });
    
    sortDropdown?.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sort = link.dataset.sort;
            
            sortDropdown.querySelectorAll('a').forEach(a => a.classList.remove('active'));
            link.classList.add('active');
            sortBtn.querySelector('span').textContent = link.textContent;
            sortBtn.parentElement.classList.remove('active');
            
            currentSort = sort;
            currentPage = 1;
            MoviesDOM.moviesGrid.innerHTML = '';
            loadMovies();
        });
    });
    
    MoviesDOM.loadMoreBtn?.addEventListener('click', () => {
        if (!isLoading && currentPage < totalPages) {
            currentPage++;
            loadMovies(true);
        }
    });
}

function initSearch() {
    MoviesDOM.searchToggle?.addEventListener('click', () => {
        MoviesDOM.searchBox.classList.toggle('active');
        if (MoviesDOM.searchBox.classList.contains('active')) {
            MoviesDOM.searchInput.focus();
        }
    });
    
    MoviesDOM.searchInput?.addEventListener('keypress', async (e) => {
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
    try {
        const data = await API.searchMovies(query, currentPage);
        if (data && data.results) {
            totalPages = data.total_pages;
            renderMovies(data.results, false);
            updateLoadMoreButton();
        }
    } catch (error) {
        console.error('Search error:', error);
    }
    hideLoading();
}

async function loadMovies(append = false) {
    if (isLoading) return;
    showLoading();
    
    try {
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
    } catch (error) {
        console.error('Load movies error:', error);
    }
    hideLoading();
}

function renderMovies(movies, append = false) {
    const grid = MoviesDOM.moviesGrid;
    if (!grid) return;
    
    const html = movies.map(movie => createGridCard(movie, 'movie')).join('');
    
    if (append) {
        grid.innerHTML += html;
    } else {
        grid.innerHTML = html;
    }
    
    // Add event listeners after render
    setTimeout(() => {
        addCardEventListeners();
    }, 100);
}

function createGridCard(item, type) {
    const title = item.title || item.name || 'Untitled';
    const year = (item.release_date || item.first_air_date || '').split('-')[0];
    const rating = item.vote_average ? item.vote_average.toFixed(1) : 'N/A';
    const posterUrl = item.poster_path 
        ? API.getImageUrl(item.poster_path) 
        : 'https://via.placeholder.com/300x450/1a1a1a/666?text=No+Image';
    
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
                    <button class="grid-card-btn play-btn" data-action="play" type="button">
                        <i class="fas fa-play"></i>
                    </button>
                    <button class="grid-card-btn" data-action="list" type="button">
                        <i class="fas fa-plus"></i>
                    </button>
                    <button class="grid-card-btn" data-action="info" type="button">
                        <i class="fas fa-chevron-down"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}

// FIXED: Event listeners that work on both mobile and desktop
function addCardEventListeners() {
    const grid = MoviesDOM.moviesGrid;
    if (!grid) return;
    
    const cards = grid.querySelectorAll('.grid-card');
    
    cards.forEach(card => {
        const id = card.dataset.id;
        const type = card.dataset.type;
        
        if (!id) return;
        
        // Remove old listeners by cloning
        const newCard = card.cloneNode(true);
        card.parentNode.replaceChild(newCard, card);
        
        // Add click listener to entire card
        newCard.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const button = e.target.closest('button');
            
            if (button) {
                const action = button.dataset.action;
                
                if (action === 'play') {
                    // Go to watch page
                    window.location.href = `watch.html?id=${id}&type=${type}`;
                } else if (action === 'list') {
                    // Toggle my list
                    toggleListFromCard(newCard, parseInt(id), type);
                } else if (action === 'info') {
                    // Open modal
                    openModal(parseInt(id), type);
                }
            } else {
                // Clicked on card (not button) - open modal
                openModal(parseInt(id), type);
            }
        });
        
        // Touch support for mobile
        newCard.addEventListener('touchend', function(e) {
            // Only if not scrolling
            if (e.cancelable) {
                // Let click handler deal with it
            }
        }, { passive: true });
    });
}

function toggleListFromCard(card, id, type) {
    const btn = card.querySelector('[data-action="list"]');
    const icon = btn?.querySelector('i');
    if (!icon) return;
    
    const title = card.querySelector('.grid-card-title')?.textContent || '';
    const img = card.querySelector('img');
    const posterPath = img?.src.includes('image.tmdb.org') 
        ? '/' + img.src.split('/').slice(-1)[0] 
        : null;
    
    if (typeof Storage !== 'undefined' && Storage.isInMyList) {
        if (Storage.isInMyList(id, type)) {
            Storage.removeFromMyList(id, type);
            icon.className = 'fas fa-plus';
        } else {
            Storage.addToMyList({
                id: id,
                type: type,
                title: title,
                poster_path: posterPath
            });
            icon.className = 'fas fa-check';
        }
    }
}

function initModal() {
    const overlay = MoviesDOM.modalOverlay;
    const closeBtn = MoviesDOM.modalClose;
    const playBtn = MoviesDOM.modalPlayBtn;
    const addListBtn = MoviesDOM.modalAddList;
    
    // Close button
    closeBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        closeModal();
    });
    
    // Click outside to close
    overlay?.addEventListener('click', (e) => {
        if (e.target === overlay) {
            closeModal();
        }
    });
    
    // Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isModalOpen) {
            closeModal();
        }
    });
    
    // Play button
    playBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        if (currentModalItem) {
            window.location.href = `watch.html?id=${currentModalItem.id}&type=movie`;
        }
    });
    
    // Add to list button
    addListBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        if (currentModalItem) {
            toggleMyList(currentModalItem);
        }
    });
}

async function openModal(id, type) {
    // Prevent multiple opens
    if (isModalOpen) {
        console.log('Modal already open');
        return;
    }
    
    console.log('Opening modal for:', id, type);
    isModalOpen = true;
    
    const overlay = MoviesDOM.modalOverlay;
    if (!overlay) {
        console.error('Modal overlay not found');
        isModalOpen = false;
        return;
    }
    
    // Show modal with loading state
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Set loading state
    if (MoviesDOM.modalTitle) MoviesDOM.modalTitle.textContent = 'Loading...';
    if (MoviesDOM.modalDescription) MoviesDOM.modalDescription.textContent = '';
    if (MoviesDOM.modalBanner) MoviesDOM.modalBanner.style.backgroundImage = 'none';
    
    try {
        const data = await API.getMovieDetails(id);
        
        if (data) {
            currentModalItem = { ...data, type: 'movie' };
            
            // Update modal content
            if (MoviesDOM.modalBanner) {
                MoviesDOM.modalBanner.style.backgroundImage = data.backdrop_path 
                    ? `url(${API.getBackdropUrl(data.backdrop_path)})` 
                    : 'none';
            }
            if (MoviesDOM.modalTitle) {
                MoviesDOM.modalTitle.textContent = data.title || 'Untitled';
            }
            if (MoviesDOM.modalMatch) {
                MoviesDOM.modalMatch.textContent = `${Math.round((data.vote_average || 0) * 10)}% Match`;
            }
            if (MoviesDOM.modalYear) {
                MoviesDOM.modalYear.textContent = (data.release_date || '').split('-')[0] || 'N/A';
            }
            if (MoviesDOM.modalDuration) {
                const runtime = data.runtime || 0;
                MoviesDOM.modalDuration.textContent = runtime 
                    ? `${Math.floor(runtime / 60)}h ${runtime % 60}m` 
                    : 'N/A';
            }
            if (MoviesDOM.modalDescription) {
                MoviesDOM.modalDescription.textContent = data.overview || 'No description available.';
            }
            if (MoviesDOM.modalGenres) {
                MoviesDOM.modalGenres.textContent = data.genres 
                    ? data.genres.map(g => g.name).join(', ') 
                    : 'N/A';
            }
            if (MoviesDOM.modalRating) {
                MoviesDOM.modalRating.textContent = data.vote_average 
                    ? data.vote_average.toFixed(1) 
                    : 'N/A';
            }
            
            updateModalListButton();
        } else {
            if (MoviesDOM.modalTitle) MoviesDOM.modalTitle.textContent = 'Error loading content';
        }
    } catch (error) {
        console.error('Error loading movie details:', error);
        if (MoviesDOM.modalTitle) MoviesDOM.modalTitle.textContent = 'Error loading content';
    }
}

function closeModal() {
    console.log('Closing modal');
    const overlay = MoviesDOM.modalOverlay;
    
    if (overlay) {
        overlay.classList.remove('active');
    }
    document.body.style.overflow = '';
    currentModalItem = null;
    isModalOpen = false;
}

function toggleMyList(item) {
    if (typeof Storage === 'undefined' || !Storage.isInMyList) return;
    
    if (Storage.isInMyList(item.id, 'movie')) {
        Storage.removeFromMyList(item.id, 'movie');
    } else {
        Storage.addToMyList({ ...item, type: 'movie' });
    }
    updateModalListButton();
}

function updateModalListButton() {
    const icon = MoviesDOM.modalAddList?.querySelector('i');
    if (!icon) return;
    
    if (typeof Storage !== 'undefined' && Storage.isInMyList && currentModalItem) {
        if (Storage.isInMyList(currentModalItem.id, 'movie')) {
            icon.className = 'fas fa-check';
        } else {
            icon.className = 'fas fa-plus';
        }
    }
}

function showLoading() {
    isLoading = true;
    const btn = MoviesDOM.loadMoreBtn;
    if (btn) {
        btn.classList.add('loading');
        const span = btn.querySelector('span');
        const icon = btn.querySelector('i');
        if (span) span.textContent = 'Loading...';
        if (icon) icon.className = 'fas fa-spinner';
    }
}

function hideLoading() {
    isLoading = false;
    const btn = MoviesDOM.loadMoreBtn;
    if (btn) {
        btn.classList.remove('loading');
        const span = btn.querySelector('span');
        const icon = btn.querySelector('i');
        if (span) span.textContent = 'Load More';
        if (icon) icon.className = 'fas fa-chevron-down';
    }
}

function updateLoadMoreButton() {
    const btn = MoviesDOM.loadMoreBtn;
    if (btn) {
        btn.style.display = (currentPage >= totalPages) ? 'none' : 'flex';
    }
}
