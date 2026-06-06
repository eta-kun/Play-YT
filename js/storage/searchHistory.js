import { STORAGE_KEYS } from "../utils/constants.js";
import { loadSettings } from "./settings.js";

const MAX_HISTORY_ITEMS = 20;

export function loadSearchHistory() {
  if (!loadSettings().saveSearchHistory) return [];
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEYS.searchHistory) || "[]");
    return Array.isArray(value) ? value.filter(Boolean) : [];
  } catch {
    return [];
  }
}

export function saveSearchQuery(query) {
  if (!loadSettings().saveSearchHistory) return [];
  const normalized = query.trim();
  if (!normalized) return loadSearchHistory();
  const next = [
    normalized,
    ...loadSearchHistory().filter((item) => item.toLowerCase() !== normalized.toLowerCase())
  ].slice(0, MAX_HISTORY_ITEMS);
  localStorage.setItem(STORAGE_KEYS.searchHistory, JSON.stringify(next));
  return next;
}

export function getLocalSearchSuggestions(query, limit = 6) {
  if (!loadSettings().saveSearchHistory) return [];
  const normalized = query.trim().toLowerCase();
  const history = loadSearchHistory();
  if (!normalized) return history.slice(0, limit);
  return history
    .filter((item) => item.toLowerCase().includes(normalized))
    .slice(0, limit);
}

export function clearSearchHistory() {
  localStorage.removeItem(STORAGE_KEYS.searchHistory);
}
