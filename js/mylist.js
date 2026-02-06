/* ============================================
   STREAMIFY - MY LIST PAGE LOGIC
   Watchlist / Favorites Management
============================================ */

// ============ DOM ELEMENTS ============
const MyListDOM = {
    myListGrid: document.getElementById('myListGrid'),
    emptyState: document.getElementById('emptyState'),
    mylistCount: document.getElementById('mylistCount'),
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
let currentModalItem = null;

// ============ INITIALIZATION ============
document.addEventListener('DOMContentLoaded', () => {
    initSearch();
    initModal();
    loadMyList();
});

// ============ SEARCH ============
function initSearch() {
    MyListDOM.searchToggle.addEventListener('click', () => {
        MyListDOM.searchBox.classList.toggle('active');
        if (MyListDOM.searchBox.classList.contains('active')) {
            MyListDOM.searchInput.focus();
        }
    });
    
    MyListDOM.searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && MyListDOM.searchInput.value.trim()) {
            // Redirect to home with search
            window.location.href = `index.html?search=${encodeURIComponent(MyListDOM.searchInput.value.trim())}`;
        }
    });
}

// ============ LOAD MY LIST ============
function loadMyList() {
    const items = Storage.getMyList();
    
    // Update count
    MyListDOM.mylistCount.textContent = `${items.length} title${items.length !== 1 ? 's' : ''}`;
    
    if (items.length === 0) {
        MyListDOM.emptyState.style.display = 'flex';
        MyListDOM.myListGrid.style.display = 'none';
        return;
    }
    
    MyListDOM.emptyState.style.display = 'none';
    MyListDOM.myListGrid.style.display = 'grid';
    
    // Sort by added date (newest first)
    items.sort((a, b) => (b.addedAt || 0) - (a.addedAt || 0));
    
    MyListDOM.myListGrid.innerHTML = items.map(item => createMyListCard(item)).join('');
    
    addCardEventListeners();
}

function createMyListCard(item) {
    const title = item.title || item.name || 'Unknown Title';
    const rating = item.vote_average ? item.vote_average.toFixed(1) : 'N/A';
    const posterUrl = item.poster_path 
        ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
        : 'https://via.placeholder.com/300x450?text=No+Image';
    
    return `
        <div class="grid-card" data-id="${item.id}" data-type="${item.type}">
            <button class="grid-card-btn remove-btn" data-action="remove">
                <i class="fas fa-times"></i>
            </button>
            <img src="${posterUrl}" alt="${title}" loading="lazy">
            <div class="grid-card-overlay">
                <p class="grid-card-title">${title}</p>
                <div class="grid-card-meta">
                    <span class="grid-card-rating"><i class="fas fa-star"></i> ${rating}</span>
                    <span class="grid-card-type">${item.type === 'movie' ? 'Movie' : 'TV Show'}</span>
                </div>
                <div class="grid-card-buttons">
                    <button class="grid-card-btn play-btn" data-action="play">
                        <i class="fas fa-play"></i>
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
    MyListDOM.myListGrid.querySelectorAll('.grid-card').forEach(card => {
        const id = parseInt(card.dataset.id);
        const type = card.dataset.type;
        
        // Play button
        card.querySelector('[data-action="play"]')?.addEventListener('click', (e) => {
            e.stopPropagation();
            window.location.href = `watch.html?id=${id}&type=${type}`;
        });
        
        // Remove button
        card.querySelector('[data-action="remove"]')?.addEventListener('click', (e) => {
            e.stopPropagation();
            removeFromList(card, id, type);
        });
        
        // Info button
        card.querySelector('[data-action="info"]')?.addEventListener('click', (e) => {
            e.stopPropagation();
            openModal(id, type);
        });
        
        // Card click
        card.addEventListener('click', () => {
            openModal(id, type);
        });
    });
}

function removeFromList(card, id, type) {
    // Animate removal
    card.style.transform = 'scale(0.8)';
    card.style.opacity = '0';
    
    setTimeout(() => {
        Storage.removeFromMyList(id, type);
        loadMyList();
    }, 300);
}

// ============ MODAL ============
function initModal() {
    MyListDOM.modalClose.addEventListener('click', closeModal);
    
    MyListDOM.modalOverlay.addEventListener('click', (e) => {
        if (e.target === MyListDOM.modalOverlay) {
            closeModal();
        }
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });
    
    MyListDOM.modalPlayBtn.addEventListener('click', () => {
        if (currentModalItem) {
            window.location.href = `watch.html?id=${currentModalItem.id}&type=${currentModalItem.type}`;
        }
    });
    
    MyListDOM.modalAddList.addEventListener('click', () => {
        if (currentModalItem) {
            toggleMyList(currentModalItem);
        }
    });
}

async function openModal(id, type) {
    MyListDOM.modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    let data;
    if (type === 'movie') {
        data = await API.getMovieDetails(id);
    } else {
        data = await API.getTVDetails(id);
    }
    
    if (data) {
        currentModalItem = { ...data, type };
        
        MyListDOM.modalBanner.style.backgroundImage = `url(${API.getBackdropUrl(data.backdrop_path)})`;
        MyListDOM.modalTitle.textContent = data.title || data.name;
        MyListDOM.modalMatch.textContent = `${Math.round(data.vote_average * 10)}% Match`;
        MyListDOM.modalYear.textContent = (data.release_date || data.first_air_date || '').split('-')[0];
        
        if (type === 'movie') {
            MyListDOM.modalDuration.textContent = data.runtime ? `${Math.floor(data.runtime / 60)}h ${data.runtime % 60}m` : 'N/A';
        } else {
            MyListDOM.modalDuration.textContent = `${data.number_of_seasons || 0} Season${data.number_of_seasons > 1 ? 's' : ''}`;
        }
        
        MyListDOM.modalDescription.textContent = data.overview || 'No description available.';
        MyListDOM.modalGenres.textContent = data.genres ? data.genres.map(g => g.name).join(', ') : 'N/A';
        MyListDOM.modalRating.textContent = data.vote_average ? data.vote_average.toFixed(1) : 'N/A';
        
        updateModalListButton();
    }
}

function closeModal() {
    MyListDOM.modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
    currentModalItem = null;
}

function toggleMyList(item) {
    if (Storage.isInMyList(item.id, item.type)) {
        Storage.removeFromMyList(item.id, item.type);
    } else {
        Storage.addToMyList(item);
    }
    updateModalListButton();
    
    // Reload the list to reflect changes
    setTimeout(() => {
        loadMyList();
    }, 300);
}

function updateModalListButton() {
    const icon = MyListDOM.modalAddList.querySelector('i');
    if (currentModalItem && Storage.isInMyList(currentModalItem.id, currentModalItem.type)) {
        icon.className = 'fas fa-check';
    } else {
        icon.className = 'fas fa-plus';
    }
}
