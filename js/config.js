/* ============================================
   STREAMIFY - CONFIGURATION FILE
   All API Keys & Settings
============================================ */

const CONFIG = {
    // TMDB API Configuration
    TMDB_API_KEY: 'e0ac94644d2e67f0dbda4bb9da3e900d',
    TMDB_BASE_URL: 'https://api.themoviedb.org/3',
    TMDB_IMAGE_BASE: 'https://image.tmdb.org/t/p',
    
    // Image Sizes
    IMAGE_SIZES: {
        poster: '/w500',
        backdrop: '/original',
        card: '/w780',
        profile: '/w185'
    },
    
    // Streaming API Configuration
    STREAMING_BASE_URL: 'https://player.videasy.net',
    
    // Build streaming URL for movies
    getMovieStreamUrl: function(tmdbId) {
        return `${this.STREAMING_BASE_URL}/movie/${tmdbId}`;
    },
    
    // Build streaming URL for TV shows
    getTVStreamUrl: function(tmdbId, season = 1, episode = 1) {
        return `${this.STREAMING_BASE_URL}/tv/${tmdbId}/${season}/${episode}`;
    },
    
    // TMDB Genre IDs
    GENRES: {
        movie: {
            action: 28,
            adventure: 12,
            animation: 16,
            comedy: 35,
            crime: 80,
            documentary: 99,
            drama: 18,
            family: 10751,
            fantasy: 14,
            history: 36,
            horror: 27,
            music: 10402,
            mystery: 9648,
            romance: 10749,
            scifi: 878,
            thriller: 53,
            war: 10752,
            western: 37
        },
        tv: {
            action: 10759,
            animation: 16,
            comedy: 35,
            crime: 80,
            documentary: 99,
            drama: 18,
            family: 10751,
            kids: 10762,
            mystery: 9648,
            reality: 10764,
            scifi: 10765,
            soap: 10766,
            talk: 10767,
            war: 10768,
            western: 37
        }
    },
    
    // Country/Region Codes for K-Drama, Bollywood
    REGIONS: {
        korea: 'KR',
        india: 'IN',
        japan: 'JP',
        usa: 'US',
        uk: 'GB'
    },
    
    // Local Storage Keys
    STORAGE_KEYS: {
        myList: 'streamify_mylist',
        continueWatching: 'streamify_continue',
        watchHistory: 'streamify_history',
        preferences: 'streamify_preferences'
    },
    
    // Number of items to fetch per request
    ITEMS_PER_PAGE: 20
};

// Freeze config to prevent accidental changes
Object.freeze(CONFIG);
Object.freeze(CONFIG.IMAGE_SIZES);
Object.freeze(CONFIG.GENRES);
Object.freeze(CONFIG.REGIONS);
Object.freeze(CONFIG.STORAGE_KEYS);
