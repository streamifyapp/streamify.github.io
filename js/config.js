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
    
    // ============ STREAMING SERVERS ============
   SERVERS: {
    server1: {
        name: 'Server 1 - Mars',
        getMovieUrl: function(tmdbId) {
            return `https://peachify.top/?type=movie&id=${tmdbId}`;
        },
        getTVUrl: function(tmdbId, season, episode) {
            return `https://peachify.top/?type=tv&id=${tmdbId}&s=${season}&e=${episode}`;
        }
    },
    server2: {
        name: 'Server 2 - Earth [Multi Lang]',
        getMovieUrl: function(tmdbId) {
            return `https://vidrock.ru/movie/${tmdbId}`;
        },
        getTVUrl: function(tmdbId, season, episode) {
            return `https://vidrock.ru/tv/${tmdbId}/${season}/${episode}`;
        }
    }
},
DEFAULT_SERVER: 'server1',

    // Get movie stream URL
    getMovieStreamUrl: function(tmdbId, server) {
        const srv = server || this.DEFAULT_SERVER;
        return this.SERVERS[srv].getMovieUrl(tmdbId);
    },

    // Get TV stream URL
    getTVStreamUrl: function(tmdbId, season = 1, episode = 1, server) {
        const srv = server || this.DEFAULT_SERVER;
        return this.SERVERS[srv].getTVUrl(tmdbId, season, episode);
    },

    // Get all server keys
    getServerKeys: function() {
        return Object.keys(this.SERVERS);
    },

    // Get server name
    getServerName: function(key) {
        return this.SERVERS[key]?.name || key;
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
    
    // Country/Region Codes
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
        preferences: 'streamify_preferences',
        selectedServer: 'streamify_server'
    },
    
    // Number of items per request
    ITEMS_PER_PAGE: 20
};

// Freeze config
Object.freeze(CONFIG.IMAGE_SIZES);
Object.freeze(CONFIG.GENRES);
Object.freeze(CONFIG.REGIONS);
Object.freeze(CONFIG.STORAGE_KEYS);
