export const CONFIG = {
  // Replace these values before publishing. Keep OAuth redirect origins in Google Cloud
  // limited to your GitHub Pages URL and local test URL.
  GOOGLE_CLIENT_ID: "YOUR_GOOGLE_OAUTH_CLIENT_ID.apps.googleusercontent.com",
  YOUTUBE_API_KEY: "YOUR_YOUTUBE_DATA_API_KEY",
  SCOPES: [
    "https://www.googleapis.com/auth/youtube.readonly"
  ].join(" "),
  API_BASE: "https://www.googleapis.com/youtube/v3",
  TOKEN_SKEW_MS: 60 * 1000
};

export const PAGE_TITLES = {
  home: "Home",
  playlists: "Playlists",
  likes: "Liked videos",
  watchLater: "Watch Later",
  subscriptions: "Subscriptions",
  searchPage: "Search"
};

export const STORAGE_KEYS = {
  auth: "pulsetube.auth",
  settings: "pulsetube.settings",
  queue: "pulsetube.queue",
  searchHistory: "pulsetube.searchHistory",
  quotaUsage: "pulsetube.quotaUsage"
};

export const QUOTA = {
  DAILY_LIMIT: 10000,
  COSTS: {
    search: 100,
    default: 1
  }
};

export const SPECIAL_PLAYLISTS = {
  likes: "LL",
  watchLater: "WL"
};

export const API_PARTS = {
  videoCard: "snippet,contentDetails,statistics",
  playlistCard: "snippet,contentDetails",
  subscriptionCard: "snippet,contentDetails"
};
