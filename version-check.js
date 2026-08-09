/* ============================================
   STREAMIFY - VERSION CHECK + CACHE BUSTING
   GitHub Pages friendly

   HOW IT WORKS:
   1. Fetches version.json with cache disabled.
   2. Compares it with the version stored in this browser.
   3. If a newer version is detected, fetches the latest HTML.
   4. Adds ?v=VERSION to local CSS/JS assets in that HTML.
   5. Replaces the current document with the fresh HTML.

   FUTURE UPDATE:
   Change ONLY version.json, for example:
   1.0.0 -> 1.0.1
============================================ */

(function () {
    'use strict';

    var VERSION_URL = new URL('version.json', document.baseURI).href;
    var VERSION_KEY = 'streamify_site_version';
    var UPDATE_FLAG = 'streamify_updating';

    function getStoredVersion() {
        try {
            return localStorage.getItem(VERSION_KEY);
        } catch (e) {
            return null;
        }
    }

    function storeVersion(version) {
        try {
            localStorage.setItem(VERSION_KEY, version);
        } catch (e) {}
    }

    function addVersionToLocalAssets(html, version) {
        var parser = new DOMParser();
        var doc = parser.parseFromString(html, 'text/html');
        var selector = [
            'link[rel="stylesheet"][href]',
            'script[src]'
        ].join(',');

        doc.querySelectorAll(selector).forEach(function (el) {
            var attr = el.tagName.toLowerCase() === 'script' ? 'src' : 'href';
            var value = el.getAttribute(attr);
            if (!value) return;

            // Only version Streamify's own local CSS/JS files.
            // External libraries such as Firebase, Google Fonts and Font Awesome
            // are intentionally left untouched.
            var absolute;
            try {
                absolute = new URL(value, document.baseURI);
            } catch (e) {
                return;
            }

            if (absolute.origin !== location.origin) return;
            if (!/\.(css|js)(?:$|\?)/i.test(absolute.pathname)) return;

            absolute.searchParams.set('v', version);
            el.setAttribute(attr, absolute.href);
        });

        return '<!DOCTYPE html>\n' + doc.documentElement.outerHTML;
    }

    async function updatePage(serverVersion) {
        if (sessionStorage.getItem(UPDATE_FLAG) === serverVersion) return;
        sessionStorage.setItem(UPDATE_FLAG, serverVersion);
        storeVersion(serverVersion);

        var url = new URL(location.href);
        url.searchParams.set('__streamify_update', serverVersion);
        url.searchParams.set('__streamify_cache', Date.now().toString());

        try {
            var response = await fetch(url.href, {
                cache: 'no-store',
                credentials: 'same-origin',
                headers: { 'Cache-Control': 'no-cache' }
            });

            if (!response.ok) throw new Error('Failed to fetch latest page');

            var html = await response.text();
            html = addVersionToLocalAssets(html, serverVersion);

            document.open();
            document.write(html);
            document.close();
        } catch (error) {
            // If the fresh HTML cannot be fetched, fall back to a normal reload.
            // The version is already stored, so this will not create a reload loop.
            console.warn('[Streamify] Update refresh failed:', error);
            location.reload();
        }
    }

    async function checkVersion() {
        try {
            var response = await fetch(VERSION_URL + '?_=' + Date.now(), {
                cache: 'no-store',
                credentials: 'same-origin',
                headers: { 'Cache-Control': 'no-cache' }
            });

            if (!response.ok) return;

            var data = await response.json();
            var serverVersion = String(data.version || '').trim();
            if (!serverVersion) return;

            var storedVersion = getStoredVersion();

            // First visit on this browser: remember the current version.
            if (!storedVersion) {
                storeVersion(serverVersion);
                return;
            }

            // Already current.
            if (storedVersion === serverVersion) return;

            // New version detected.
            await updatePage(serverVersion);
        } catch (error) {
            // Never block Streamify if the version check is unavailable.
            console.warn('[Streamify] Version check skipped:', error);
        }
    }

    // Run shortly after parsing starts so the normal page remains usable even
    // if version.json is temporarily unavailable.
    if (document.readyState === 'loading') {
        setTimeout(checkVersion, 0);
    } else {
        checkVersion();
    }
})();
