/**
 * Mobile Ad Blocker Script
 * Forcefully removes desktop ads on mobile devices
 * Place this script at the END of body tag
 */

(function() {
    'use strict';
    
    // Check if mobile device
    function isMobile() {
        return window.innerWidth <= 768 || 
               /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
    
    // Remove desktop ads on mobile
    function removeDesktopAds() {
        if (isMobile()) {
            // Remove desktop banner ads
            const desktopBanners = document.querySelectorAll('.desktop-banner-top');
            desktopBanners.forEach(function(ad) {
                ad.remove();
            });
            
            // Remove native ads
            const nativeAds = document.querySelectorAll('.native-ad');
            nativeAds.forEach(function(ad) {
                ad.remove();
            });
            
            // Remove by ID if they exist
            const adIds = [
                'container-f89d0146f9f9ad2a66987064830a7dee',
                'midGridAdDesktop',
                'listAdDesktop'
            ];
            
            adIds.forEach(function(id) {
                const adElement = document.getElementById(id);
                if (adElement) {
                    // Remove parent container too
                    const parent = adElement.closest('.ad-container');
                    if (parent) {
                        parent.remove();
                    } else {
                        adElement.remove();
                    }
                }
            });
            
            console.log('Mobile Ad Blocker: Desktop ads removed');
        }
    }
    
    // Run on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', removeDesktopAds);
    } else {
        removeDesktopAds();
    }
    
    // Run again after a delay (in case ads load late)
    setTimeout(removeDesktopAds, 500);
    setTimeout(removeDesktopAds, 1000);
    setTimeout(removeDesktopAds, 2000);
    
    // Run on window resize
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(removeDesktopAds, 250);
    });
    
    // Use MutationObserver to catch dynamically loaded ads
    if (isMobile() && window.MutationObserver) {
        const observer = new MutationObserver(function(mutations) {
            let shouldCheck = false;
            
            mutations.forEach(function(mutation) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) { // Element node
                        if (node.classList && 
                            (node.classList.contains('desktop-banner-top') || 
                             node.classList.contains('native-ad'))) {
                            shouldCheck = true;
                        }
                    }
                });
            });
            
            if (shouldCheck) {
                removeDesktopAds();
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
})();
