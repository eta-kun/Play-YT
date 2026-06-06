# PulseTube Music PWA

A GitHub Pages compatible Progressive Web App inspired by YouTube Music, built with static HTML, CSS, and vanilla JavaScript.

## What is included

- Google Identity Services OAuth flow
- YouTube Data API v3 modules for playlists, playlist contents, liked videos, Watch Later, subscriptions, search, and popular public videos
- YouTube IFrame Player API wrapper
- Queue, next, previous, shuffle, and repeat support
- Music Mode and YouTube Mode without reloading data
- Local search history suggestions with live API suggestions disabled by default
- Search history can be disabled or cleared from the sidebar
- Estimated YouTube API quota usage with a simple help tooltip
- Offline app shell caching through a service worker
- Installable PWA manifest
- Responsive dark interface

## Setup

1. Create a Google Cloud project.
2. Enable the YouTube Data API v3.
3. Create an OAuth 2.0 Web Client ID.
4. Add your GitHub Pages origin to Authorized JavaScript origins, for example `https://your-name.github.io`.
5. Create a YouTube Data API key.
6. Edit `js/utils/constants.js`:

```js
GOOGLE_CLIENT_ID: "YOUR_CLIENT_ID.apps.googleusercontent.com",
YOUTUBE_API_KEY: "YOUR_API_KEY"
```

## Local testing

Because OAuth and service workers require a secure context, test with a local static server instead of opening `index.html` directly.

```sh
python -m http.server 8080
```

Then open `http://localhost:8080/youtube-music-pwa/`.

## GitHub Pages

Publish the `youtube-music-pwa` folder from your repository. The app uses relative paths, so it works from a project page path such as:

```txt
https://your-name.github.io/your-repository/
```

## Notes

- Access tokens are kept in session storage, not long-term storage.
- The app requests read-only YouTube access.
- Search results load only when the user presses Enter or the Search button. Typing uses local history suggestions unless API suggestions are explicitly enabled in settings.
- Signing out requires a confirmation dialog and removes auth-related stored tokens.
- Playlist editing, liking, subscription changes, mini-player, power saving mode, and playback speed controls are intentionally left as future modules.
