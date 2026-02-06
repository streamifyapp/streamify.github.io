/* ============================================
   STREAMIFY - MY LIST PAGE
   FIXED: Poster click goes to watch page
============================================ */

document.addEventListener('DOMContentLoaded', initMyListPage);

function initMyListPage() {
    loadMyList();
}

// DOM Elements
const MyListDOM = {
    get myListGrid() { return document.getElementById('myListGrid'); },
    get emptyState() { return document.getElementById('emptyState'); },
    get mylistCount() { return document.getElementById('mylistCount'); }
};

function loadMyList() {
    const items = Storage.getMyList();
    
    if (items && items.length > 0) {
        // Show grid, hide empty state
        if (MyListDOM.emptyState) MyListDOM.emptyState.style.display = 'none';
        if (MyListDOM.myListGrid) MyListDOM.myListGrid.style.display = 'grid';
        if (MyListDOM.mylistCount) MyListDOM.mylistCount.textContent = `${items.length} title${items.length > 1 ? 's' : ''}`;
        
        // Render cards
        MyListDOM.myListGrid.innerHTML = items.map(item => createGridCard(item)).join('');
        
        // Add event listeners
        addCardEventListeners();
    } else {
        // Show empty state, hide grid
        if (MyListDOM.emptyState) MyListDOM.emptyState.style.display = 'flex';
        if (MyListDOM.myListGrid) MyListDOM.myListGrid.style.display = 'none';
        if (MyListDOM.mylistCount) MyListDOM.mylistCount.textContent = '0 titles';
    }
}

function createGridCard(item) {
    const title = item.title || item.name || 'Untitled';
    const rating = item.vote_average ? item.vote_average.toFixed(1) : 'N/A';
    const type = item.type || 'movie';
    
    let posterUrl = 'https://via.placeholder.com/300x450/1a1a1a/666?text=No+Image';
    
    if (item.poster_path) {
        if (item.poster_path.startsWith('http')) {
            posterUrl = item.poster_path;
        } else if (item.poster_path.startsWith('/')) {
            posterUrl = `https://image.tmdb.org/t/p/w500${item.poster_path}`;
        } else {
            posterUrl = `https://image.tmdb.org/t/p/w500/${item.poster_path}`;
        }
    }
    
    return `
        <div class="grid-card" data-id="${item.id}" data-type="${type}">
            <button class="grid-card-btn remove-btn" data-action="remove" type="button">
                <i class="fas fa-times"></i>
            </button>
            <img src="${posterUrl}" alt="${title}" loading="lazy">
            <div class="grid-card-overlay">
                <p class="grid-card-title">${title}</p>
                <div class="grid-card-meta">
                    <span class="grid-card-rating"><i class="fas fa-star"></i> ${rating}</span>
                    <span class="grid-card-year">${type === 'movie' ? 'Movie' : 'Series'}</span>
                </div>
            </div>
        </div>
    `;
}

function addCardEventListeners() {
    const grid = MyListDOM.myListGrid;
    if (!grid) return;
    
    grid.querySelectorAll('.grid-card').forEach(card => {
        const id = card.dataset.id;
        const type = card.dataset.type;
        
        if (!id) return;
        
        // Click on card - GO TO WATCH PAGE
        card.addEventListener('click', function(e) {
            const removeBtn = e.target.closest('[data-action="remove"]');
            
            if (removeBtn) {
                // Remove button clicked
                e.preventDefault();
                e.stopPropagation();
                removeFromList(parseInt(id), type);
            } else {
                // Card clicked - GO TO WATCH PAGE DIRECTLY
                e.preventDefault();
                e.stopPropagation();
                window.location.href = `watch.html?id=${id}&type=${type}`;
            }
        });
    });
}

function removeFromList(id, type) {
    if (typeof Storage !== 'undefined' && Storage.removeFromMyList) {
        Storage.removeFromMyList(id, type);
        loadMyList(); // Refresh the list
    }
}
