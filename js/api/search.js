import { searchVideos } from "./youtube.js";

export async function runSearch(query) {
  const trimmed = query.trim();
  if (!trimmed) return { items: [] };
  return searchVideos(trimmed);
}

export async function getApiSearchSuggestions(query) {
  const trimmed = query.trim();
  if (trimmed.length < 3) return [];
  const data = await searchVideos(trimmed);
  const titles = (data.items || []).map((item) => item.snippet?.title).filter(Boolean);
  return [...new Set(titles)].slice(0, 5);
}
