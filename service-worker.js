const CACHE_NAME = "kanjiflow-v68";
const APP_ASSETS = [
    "./",
    "./index.html",
    "./style.css",
    "./style.css?v=831",
    "./assets/s0labsHorizontal.png",
    "./assets/icons/icon-192.png",
    "./assets/icons/icon-512.png",
    "./assets/icons/icon-maskable-192.png",
    "./assets/icons/icon-maskable-512.png",
    "./assets/icons/apple-touch-icon.png",
    "./assets/icons/favicon-32.png",
    "./assets/icons/favicon-48.png",
    "./datos.csv",
    "./manifest.webmanifest",
    "./privacidad.html",
    "./KanjiStrokeOrders.woff",
    "./locales/es.json",
    "./locales/es.json?v=832",
    "./locales/en.json",
    "./locales/en.json?v=832",
    "./locales/de.json",
    "./locales/de.json?v=832",
    "./locales/fr.json",
    "./locales/fr.json?v=832",
    "./locales/pt.json",
    "./locales/pt.json?v=832",
    "./js/app.js",
    "./js/app.js?v=112",
    "./js/audio.js",
    "./js/audio.js?v=831",
    "./js/core.js",
    "./js/data.js",
    "./js/drawing.js",
    "./js/i18n.js",
    "./js/i18n.js?v=831",
    "./js/kanji-examples.js",
    "./js/profile.js",
    "./js/profile.js?v=831",
    "./js/achievements.js",
    "./js/achievements.js?v=831",
    "./js/reminders.js",
    "./js/reminders.js?v=831",
    "./js/storage.js",
    "./js/stroke-geometry.js",
    "./js/stroke-scoring.js",
    "./js/stroke-animation.js",
    "./js/exam.js",
    "./data/kanjivg/index.json",
    "./data/kana-strokes/index.json",
];

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(APP_ASSETS))
            .then(() => self.skipWaiting()),
    );
});

self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(
                keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)),
            ))
            .then(() => self.clients.claim()),
    );
});

self.addEventListener("fetch", event => {
    if (event.request.method !== "GET") return;
    const url = new URL(event.request.url);
    if (url.origin !== self.location.origin) return;

    if (event.request.mode === "navigate") {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    if (response.ok) {
                        const copy = response.clone();
                        caches.open(CACHE_NAME).then(cache => cache.put("./index.html", copy));
                    }
                    return response;
                })
                .catch(() => caches.match("./index.html")),
        );
        return;
    }

    event.respondWith(
        caches.match(event.request).then(cached => {
            const network = fetch(event.request)
                .then(response => {
                    if (response.ok) {
                        const copy = response.clone();
                        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
                    }
                    return response;
                })
                .catch(() => cached);
            return cached || network;
        }),
    );
});
