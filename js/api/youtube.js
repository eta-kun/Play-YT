import { getAccessToken } from "./auth.js";
import { CONFIG, API_PARTS, QUOTA, SPECIAL_PLAYLISTS } from "../utils/constants.js";
import { recordQuotaUsage } from "../storage/quota.js";

async function request(path, params = {}, options = {}) {
  const token = options.public ? null : await getAccessToken();
  const url = new URL(`${CONFIG.API_BASE}/${path}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") url.searchParams.set(key, value);
  });
  if (options.public && !CONFIG.YOUTUBE_API_KEY.startsWith("YOUR_")) {
    url.searchParams.set("key", CONFIG.YOUTUBE_API_KEY);
  }
  const response = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const reason = payload.error?.errors?.[0]?.reason || payload.error?.message || response.statusText;
    const error = new Error(normalizeError(reason));
    error.status = response.status;
    error.reason = reason;
    throw error;
  }
  recordQuotaUsage(options.quotaCost ?? quotaCostFor(path));
  return payload;
}

export function listPlaylists(pageToken) {
  return request("playlists", {
    part: API_PARTS.playlistCard,
    mine: "true",
    maxResults: 25,
    pageToken
  });
}

export function listPlaylistItems(playlistId, pageToken) {
  return request("playlistItems", {
    part: "snippet,contentDetails",
    playlistId,
    maxResults: 50,
    pageToken
  });
}

export function listLikedVideos(pageToken) {
  return request("videos", {
    part: API_PARTS.videoCard,
    myRating: "like",
    maxResults: 25,
    pageToken
  });
}

export function listWatchLater(pageToken) {
  return listPlaylistItems(SPECIAL_PLAYLISTS.watchLater, pageToken);
}

export function listSubscriptions(pageToken) {
  return request("subscriptions", {
    part: API_PARTS.subscriptionCard,
    mine: "true",
    maxResults: 25,
    order: "alphabetical",
    pageToken
  });
}

export function listPopularVideos(pageToken) {
  return request("videos", {
    part: API_PARTS.videoCard,
    chart: "mostPopular",
    maxResults: 24,
    regionCode: "US",
    pageToken
  }, { public: true });
}

export function getVideos(ids) {
  return request("videos", {
    part: API_PARTS.videoCard,
    id: ids.filter(Boolean).join(","),
    maxResults: 50
  });
}

export function searchVideos(query, pageToken) {
  return request("search", {
    part: "snippet",
    q: query,
    type: "video",
    maxResults: 25,
    pageToken
  }, { quotaCost: QUOTA.COSTS.search });
}

function quotaCostFor(path) {
  return path === "search" ? QUOTA.COSTS.search : QUOTA.COSTS.default;
}

function normalizeError(reason) {
  if (/quota/i.test(reason)) return "The YouTube API quota is exhausted. Try again later or use another API key.";
  if (/auth|credential|login|required/i.test(reason)) return "YouTube needs a fresh Google sign in.";
  if (/playlist/i.test(reason) && /forbidden|notFound/i.test(reason)) return "This playlist is private or unavailable for this account.";
  return reason;
}
