const CACHE_NAME = "pulsetube-static-v2";
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./css/themes.css",
  "./css/main.css",
  "./css/layout.css",
  "./css/player.css",
  "./js/app.js",
  "./js/api/auth.js",
  "./js/api/youtube.js",
  "./js/api/search.js",
  "./js/player/player.js",
  "./js/player/queue.js",
  "./js/player/pip.js",
  "./js/storage/searchHistory.js",
  "./js/ui/tabs.js",
  "./js/ui/musicMode.js",
  "./js/ui/youtubeMode.js",
  "./js/ui/render.js",
  "./js/storage/settings.js",
  "./js/pages/home.js",
  "./js/pages/playlists.js",
  "./js/pages/likes.js",
  "./js/pages/watchLater.js",
  "./js/pages/subscriptions.js",
  "./js/pages/searchPage.js",
  "./js/utils/constants.js",
  "./js/utils/dom.js",
  "./js/utils/format.js",
  "./js/utils/logger.js",
  "./assets/icons/icon.svg",
  "./assets/icons/icon-192.svg",
  "./assets/icons/icon-512.svg",
  "./assets/images/placeholder.svg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
    ))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== location.origin) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        return response;
      }).catch(() => caches.match("./index.html"));
    })
  );
});
