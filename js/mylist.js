/* ============================================
   STREAMIFY - MY LIST PAGE
   Firebase Realtime DB: Favorites/{uid}/{itemId}
   Real-time listener — updates live as user
   adds/removes items from any device.
============================================ */

// ── Firebase Config (same project as profile.html) ──────────────────────────
const firebaseConfig = {
    apiKey:            "AIzaSyBGE29YUks6sp4jZS4MzE2JIMF-RMLwVLg",
    authDomain:        "moddy-store.firebaseapp.com",
    databaseURL:       "https://moddy-store-default-rtdb.firebaseio.com",
    projectId:         "moddy-store",
    storageBucket:     "moddy-store.appspot.com",
    messagingSenderId: "37854973622",
    appId:             "1:37854873622:web:8f927e0a1d267d099ca017"
};

// Only initialise once (guard for pages that already init Firebase)
if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);

const _auth = firebase.auth();
const _db   = firebase.database();

const TMDB_IMG = 'https://image.tmdb.org/t/p/w500';

// ── DOM helpers ──────────────────────────────────────────────────────────────
const MyListDOM = {
    get grid()       { return document.getElementById('myListGrid');  },
    get empty()      { return document.getElementById('emptyState');  },
    get count()      { return document.getElementById('mylistCount'); },
    get loader()     { return document.getElementById('myListLoader'); } // optional skeleton
};

// ── Real-time listener ref (so we can detach on signout) ────────────────────
let _favRef      = null;
let _favListener = null;

// ── Entry point ──────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    // Show skeleton / loading state immediately
    showLoader();

    _auth.onAuthStateChanged(user => {
        if (!user) {
            // Not logged in — redirect to login
            window.location.href = 'login.html';
            return;
        }
        attachFavoritesListener(user.uid);
    });
});

// ── Attach real-time listener to Favorites/{uid} ─────────────────────────────
function attachFavoritesListener(uid) {
    // Detach previous listener if any
    if (_favRef && _favListener) {
        _favRef.off('value', _favListener);
    }

    _favRef = _db.ref('Favorites/' + uid);

    _favListener = _favRef.on('value', snap => {
        const data = snap.val();
        hideLoader();

        if (!data) {
            renderEmpty();
            return;
        }

        // Convert Firebase object → sorted array (most-recently-added first)
        // Firebase key is the item id; each value has { id, title, posterPath, movie }
        const items = Object.values(data).sort((a, b) => {
            // If a timestamp field exists use it; otherwise keep insertion order
            return (b.addedAt || 0) - (a.addedAt || 0);
        });

        if (items.length === 0) {
            renderEmpty();
        } else {
            renderGrid(items, uid);
        }
    }, err => {
        console.error('Favorites listener error:', err);
        hideLoader();
        renderEmpty();
    });
}

// ── Render grid of cards ─────────────────────────────────────────────────────
function renderGrid(items, uid) {
    const grid = MyListDOM.grid;
    const empty = MyListDOM.empty;
    const count = MyListDOM.count;

    if (empty) empty.style.display = 'none';
    if (grid)  grid.style.display  = 'grid';
    if (count) count.textContent   = `${items.length} title${items.length !== 1 ? 's' : ''}`;

    if (!grid) return;

    grid.innerHTML = items.map(item => buildCard(item, uid)).join('');

    // Delegate click events
    grid.querySelectorAll('.grid-card').forEach(card => {
        card.addEventListener('click', e => {
            const removeBtn = e.target.closest('[data-action="remove"]');
            if (removeBtn) {
                e.preventDefault();
                e.stopPropagation();
                const itemId = card.dataset.id;
                removeFromFirebase(uid, itemId, card);
            } else {
                const id   = card.dataset.id;
                const type = card.dataset.type;
                window.location.href = `watch.html?id=${id}&type=${type}`;
            }
        });
    });
}

// ── Build a single card HTML string ─────────────────────────────────────────
function buildCard(item, uid) {
    const id    = item.id;
    const type  = item.movie === false ? 'tv' : 'movie';   // movie:false → tv series
    const title = item.title || 'Untitled';

    // Resolve poster
    let poster = 'https://via.placeholder.com/300x450/1a1a1a/666?text=No+Image';
    if (item.posterPath && item.posterPath !== 'null') {
        poster = item.posterPath.startsWith('http')
            ? item.posterPath
            : TMDB_IMG + (item.posterPath.startsWith('/') ? item.posterPath : '/' + item.posterPath);
    }

    const typeLabel = item.movie === false ? 'Series' : 'Movie';

    return `
        <div class="grid-card" data-id="${id}" data-type="${type}" data-uid="${uid}">
            <button class="grid-card-btn remove-btn" data-action="remove" type="button" title="Remove from My List">
                <i class="fas fa-times"></i>
            </button>
            <img
                src="${poster}"
                alt="${title}"
                loading="lazy"
                onerror="this.src='https://via.placeholder.com/300x450/1a1a1a/666?text=No+Image'"
            >
            <div class="grid-card-overlay">
                <p class="grid-card-title">${title}</p>
                <div class="grid-card-meta">
                    <span class="grid-card-rating"><i class="fas fa-star"></i> —</span>
                    <span class="grid-card-year">${typeLabel}</span>
                </div>
            </div>
        </div>
    `;
}

// ── Remove item from Firebase ────────────────────────────────────────────────
async function removeFromFirebase(uid, itemId, cardEl) {
    // Animate out immediately for snappy UX
    if (cardEl) {
        cardEl.style.transition  = 'opacity 0.25s ease, transform 0.25s ease';
        cardEl.style.opacity     = '0';
        cardEl.style.transform   = 'scale(0.85)';
    }

    try {
        await _db.ref(`Favorites/${uid}/${itemId}`).remove();
        // The real-time listener will fire and re-render automatically,
        // but the card is already faded so the UX feels instant.
    } catch (err) {
        console.error('Failed to remove from Favorites:', err);
        // Restore card if remove failed
        if (cardEl) {
            cardEl.style.opacity   = '1';
            cardEl.style.transform = '';
        }
        showToast('Failed to remove. Try again.', 'error');
    }
}

// ── Empty state ──────────────────────────────────────────────────────────────
function renderEmpty() {
    const grid  = MyListDOM.grid;
    const empty = MyListDOM.empty;
    const count = MyListDOM.count;

    if (grid)  grid.style.display  = 'none';
    if (empty) empty.style.display = 'flex';
    if (count) count.textContent   = '0 titles';
}

// ── Skeleton / loader helpers ────────────────────────────────────────────────
function showLoader() {
    const loader = MyListDOM.loader;
    const grid   = MyListDOM.grid;
    if (loader) loader.style.display = 'flex';
    if (grid)   grid.style.display   = 'none';
}

function hideLoader() {
    const loader = MyListDOM.loader;
    if (loader) loader.style.display = 'none';
}

// ── Optional toast (reuse your existing one if already on the page) ──────────
function showToast(msg, type = 'info') {
    // If the page already has a #toast element (like profile.html) use it
    const t = document.getElementById('toast');
    if (!t) { console.warn('Toast:', msg); return; }
    const icons = { success: 'fa-circle-check', error: 'fa-circle-exclamation', info: 'fa-circle-info' };
    const icon  = t.querySelector('i');
    if (icon) icon.className = `fas ${icons[type] || icons.info}`;
    t.className = `toast ${type}`;
    const msgEl = document.getElementById('toastMsg');
    if (msgEl) msgEl.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3200);
}
