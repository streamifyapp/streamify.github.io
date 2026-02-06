/* ============================================
   STREAMIFY - TMDB API FUNCTIONS
   All API Calls & Data Fetching
============================================ */

const API = {
    
    // Base fetch function with error handling
    async fetchFromTMDB(endpoint, params = {}) {
        const url = new URL(`${CONFIG.TMDB_BASE_URL}${endpoint}`);
        url.searchParams.append('api_key', CONFIG.TMDB_API_KEY);
        
        for (const [key, value] of Object.entries(params)) {
            url.searchParams.append(key, value);
        }
        
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            return null;
        }
    },
    
    // ============ MOVIES ============
    
    // Get Trending Movies
    async getTrendingMovies(timeWindow = 'week') {
        return await this.fetchFromTMDB(`/trending/movie/${timeWindow}`);
    },
    
    // Get Popular Movies
    async getPopularMovies(page = 1) {
        return await this.fetchFromTMDB('/movie/popular', { page });
    },
    
    // Get Top Rated Movies
    async getTopRatedMovies(page = 1) {
        return await this.fetchFromTMDB('/movie/top_rated', { page });
    },
    
    // Get Now Playing Movies
    async getNowPlayingMovies(page = 1) {
        return await this.fetchFromTMDB('/movie/now_playing', { page });
    },
    
    // Get Upcoming Movies
    async getUpcomingMovies(page = 1) {
        return await this.fetchFromTMDB('/movie/upcoming', { page });
    },
    
    // Get Movies by Genre
    async getMoviesByGenre(genreId, page = 1) {
        return await this.fetchFromTMDB('/discover/movie', {
            with_genres: genreId,
            sort_by: 'popularity.desc',
            page
        });
    },
    
    // Get Movie Details
    async getMovieDetails(movieId) {
        return await this.fetchFromTMDB(`/movie/${movieId}`, {
            append_to_response: 'credits,videos,similar,recommendations'
        });
    },
    
    // Get Bollywood Movies (Indian Movies)
    async getBollywoodMovies(page = 1) {
        return await this.fetchFromTMDB('/discover/movie', {
            with_origin_country: 'IN',
            sort_by: 'popularity.desc',
            page
        });
    },
    
    // ============ TV SHOWS ============
    
    // Get Trending TV Shows
    async getTrendingTV(timeWindow = 'week') {
        return await this.fetchFromTMDB(`/trending/tv/${timeWindow}`);
    },
    
    // Get Popular TV Shows
    async getPopularTV(page = 1) {
        return await this.fetchFromTMDB('/tv/popular', { page });
    },
    
    // Get Top Rated TV Shows
    async getTopRatedTV(page = 1) {
        return await this.fetchFromTMDB('/tv/top_rated', { page });
    },
    
    // Get TV Shows Airing Today
    async getAiringTodayTV(page = 1) {
        return await this.fetchFromTMDB('/tv/airing_today', { page });
    },
    
    // Get On The Air TV Shows
    async getOnTheAirTV(page = 1) {
        return await this.fetchFromTMDB('/tv/on_the_air', { page });
    },
    
    // Get TV Shows by Genre
    async getTVByGenre(genreId, page = 1) {
        return await this.fetchFromTMDB('/discover/tv', {
            with_genres: genreId,
            sort_by: 'popularity.desc',
            page
        });
    },
    
    // Get TV Show Details
    async getTVDetails(tvId) {
        return await this.fetchFromTMDB(`/tv/${tvId}`, {
            append_to_response: 'credits,videos,similar,recommendations'
        });
    },
    
    // Get TV Season Details
    async getSeasonDetails(tvId, seasonNumber) {
        return await this.fetchFromTMDB(`/tv/${tvId}/season/${seasonNumber}`);
    },
    
    // Get K-Drama (Korean TV Shows)
    async getKDrama(page = 1) {
        return await this.fetchFromTMDB('/discover/tv', {
            with_origin_country: 'KR',
            sort_by: 'popularity.desc',
            page
        });
    },
    
    // ============ SEARCH ============
    
    // Multi Search (Movies, TV, People)
    async multiSearch(query, page = 1) {
        return await this.fetchFromTMDB('/search/multi', { query, page });
    },
    
    // Search Movies
    async searchMovies(query, page = 1) {
        return await this.fetchFromTMDB('/search/movie', { query, page });
    },
    
    // Search TV Shows
    async searchTV(query, page = 1) {
        return await this.fetchFromTMDB('/search/tv', { query, page });
    },
    
    // ============ UTILITIES ============
    
    // Get all movie genres
    async getMovieGenres() {
        return await this.fetchFromTMDB('/genre/movie/list');
    },
    
    // Get all TV genres
    async getTVGenres() {
        return await this.fetchFromTMDB('/genre/tv/list');
    },
    
    // Get image URL
    getImageUrl(path, size = 'poster') {
        if (!path) return 'https://via.placeholder.com/500x750?text=No+Image';
        return `${CONFIG.TMDB_IMAGE_BASE}${CONFIG.IMAGE_SIZES[size]}${path}`;
    },
    
    // Get backdrop URL
    getBackdropUrl(path) {
        if (!path) return 'https://via.placeholder.com/1920x1080?text=No+Image';
        return `${CONFIG.TMDB_IMAGE_BASE}${CONFIG.IMAGE_SIZES.backdrop}${path}`;
    }
};

// ============ LOCAL STORAGE FUNCTIONS ============

const Storage = {
    
    // Get My List
    getMyList() {
        const data = localStorage.getItem(CONFIG.STORAGE_KEYS.myList);
        return data ? JSON.parse(data) : [];
    },
    
    // Add to My List
    addToMyList(item) {
        const myList = this.getMyList();
        const exists = myList.find(i => i.id === item.id && i.type === item.type);
        if (!exists) {
            myList.push({
                id: item.id,
                type: item.type, // 'movie' or 'tv'
                title: item.title || item.name,
                poster_path: item.poster_path,
                backdrop_path: item.backdrop_path,
                vote_average: item.vote_average,
                addedAt: Date.now()
            });
            localStorage.setItem(CONFIG.STORAGE_KEYS.myList, JSON.stringify(myList));
        }
        return myList;
    },
    
    // Remove from My List
    removeFromMyList(id, type) {
        let myList = this.getMyList();
        myList = myList.filter(item => !(item.id === id && item.type === type));
        localStorage.setItem(CONFIG.STORAGE_KEYS.myList, JSON.stringify(myList));
        return myList;
    },
    
    // Check if in My List
    isInMyList(id, type) {
        const myList = this.getMyList();
        return myList.some(item => item.id === id && item.type === type);
    },
    
    // Get Continue Watching
    getContinueWatching() {
        const data = localStorage.getItem(CONFIG.STORAGE_KEYS.continueWatching);
        return data ? JSON.parse(data) : [];
    },
    
    // Update Continue Watching
    updateContinueWatching(item, progress) {
        let continueList = this.getContinueWatching();
        
        // Remove if exists
        continueList = continueList.filter(i => !(i.id === item.id && i.type === item.type));
        
        // Add to beginning
        continueList.unshift({
            id: item.id,
            type: item.type,
            title: item.title || item.name,
            poster_path: item.poster_path,
            backdrop_path: item.backdrop_path,
            progress: progress, // 0-100 percentage
            season: item.season || null,
            episode: item.episode || null,
            updatedAt: Date.now()
        });
        
        // Keep only last 20 items
        continueList = continueList.slice(0, 20);
        
        localStorage.setItem(CONFIG.STORAGE_KEYS.continueWatching, JSON.stringify(continueList));
        return continueList;
    },
    
    // Remove from Continue Watching
    removeFromContinueWatching(id, type) {
        let continueList = this.getContinueWatching();
        continueList = continueList.filter(item => !(item.id === id && item.type === type));
        localStorage.setItem(CONFIG.STORAGE_KEYS.continueWatching, JSON.stringify(continueList));
        return continueList;
    }
};
