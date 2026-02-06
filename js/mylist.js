/* ============================================
   STREAMIFY - MY LIST PAGE LOGIC
   FULLY OPTIMIZED FOR MOBILE
============================================ */

const MyListDOM = {
    myListGrid: document.getElementById('myListGrid'),
    emptyState: document.getElementById('emptyState'),
    mylistCount: document.getElementById('mylistCount'),
    
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

let currentModalItem = null;
let isModalOpen = false;

document.addEventListener('DOMContentLoaded', () => {
    loadMyList();
    initModal();
});

function loadMyList() {
    const items = Storage.getMyList();
    
    if (items && items.length > 0) {
        MyListDOM.emptyState.style.display = 'none';
        MyListDOM.myListGrid.style.display = 'grid';
        MyListDOM.mylistCount.textContent = `${items.length} title${items.length > 1 ? 's' : ''}`;
        
        MyListDOM.myListGrid.innerHTML = items.map(item => createGridCard(item)).join('');
        
        requestAnimationFrame(() => {
            addCardEventListeners();
        });
    } else {
        MyListDOM.emptyState.style.display = 'flex';
        MyListDOM.myListGrid.style.display = 'none';
        MyListDOM.mylistCount.textContent = '0 titles';
    }
}

function createGridCard(item) {
    const title = item.title || item.name || 'Untitled';
    const posterUrl = item.poster_path 
        ? API.getImageUrl(item.poster_path) 
        : 'https://via.placeholder.com/300x450?text=No+Image';
    const rating = item.vote_average ? item.vote_average.toFixed(1) : 'N/A';
    
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
                    <span class="grid-card-year">${item.type === 'movie' ? 'Movie' : 'Series'}</span>
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
    MyListDOM.myListGrid?.querySelectorAll('.grid-card').forEach(card => {
        const id = parseInt(card.dataset.id);
        const type = card.dataset.type;
        
        card.style.cursor = 'pointer';
        
        card.onclick = function(e) {
            const button = e.target.closest('button');
            
            if (button) {
                e.stopPropagation();
                const action = button.dataset.action;
                
                if (action === 'play') {
                    window.location.href = `watch.html?id=${id}&type=${type}`;
                } else if (action === 'remove') {
                    removeFromList(id, type);
                } else if (action === 'info') {
                    openModal(id, type);
                }
            } else {
                openModal(id, type);
            }
        };
    });
}

function removeFromList(id, type) {
    Storage.removeFromMyList(id, type);
    loadMyList();
}

function initModal() {
    MyListDOM.modalClose?.addEventListener('click', closeModal);
    
    MyListDOM.modalOverlay?.addEventListener('click', (e) => {
        if (e.target === MyListDOM.modalOverlay) {
            closeModal();
        }
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });
    
    MyListDOM.modalPlayBtn?.addEventListener('click', () => {
        if (currentModalItem) {
            window.location.href = `watch.html?id=${currentModalItem.id}&type=${currentModalItem.type}`;
        }
    });
    
    MyListDOM.modalAddList?.addEventListener('click', () => {
        if (currentModalItem) {
            Storage.removeFromMyList(currentModalItem.id, currentModalItem.type);
            closeModal();
            loadMyList();
        }
    });
}

async function openModal(id, type) {
    if (isModalOpen) return;
    isModalOpen = true;
    
    MyListDOM.modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    MyListDOM.modalTitle.textContent = 'Loading...';
    MyListDOM.modalDescription.textContent = '';
    MyListDOM.modalBanner.style.backgroundImage = '';
    
    try {
        const data = type === 'movie' 
            ? await API.getMovieDetails(id) 
            : await API.getTVDetails(id);
        
        if (data) {
            currentModalItem = { ...data, type };
            
            MyListDOM.modalBanner.style.backgroundImage = `url(${API.getBackdropUrl(data.backdrop_path)})`;
            MyListDOM.modalTitle.textContent = data.title || data.name;
            MyListDOM.modalMatch.textContent = `${Math.round(data.vote_average * 10)}% Match`;
            MyListDOM.modalYear.textContent = (data.release_date || data.first_air_date || '').split('-')[0];
            MyListDOM.modalDuration.textContent = type === 'movie' 
                ? `${Math.floor((data.runtime || 0) / 60)}h ${(data.runtime || 0) % 60}m`
                : `${data.number_of_seasons || 0} Season${data.number_of_seasons > 1 ? 's' : ''}`;
            MyListDOM.modalDescription.textContent = data.overview || 'No description available.';
            MyListDOM.modalGenres.textContent = data.genres ? data.genres.map(g => g.name).join(', ') : 'N/A';
            MyListDOM.modalRating.textContent = data.vote_average ? data.vote_average.toFixed(1) : 'N/A';
            
            // Update button to show "Remove"
            const icon = MyListDOM.modalAddList?.querySelector('i');
            if (icon) icon.className = 'fas fa-check';
        }
    } catch (error) {
        console.error('Error loading details:', error);
        MyListDOM.modalTitle.textContent = 'Error loading content';
    }
}

function closeModal() {
    MyListDOM.modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
    currentModalItem = null;
    isModalOpen = false;
}
