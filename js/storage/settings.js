import { STORAGE_KEYS } from "../utils/constants.js";

const defaults = {
  mode: "music",
  theme: "dark",
  repeat: "off",
  shuffle: false,
  powerSaving: false,
  enableSearchSuggestions: false,
  saveSearchHistory: true
};

export function loadSettings() {
  try {
    return { ...defaults, ...JSON.parse(localStorage.getItem(STORAGE_KEYS.settings) || "{}") };
  } catch {
    return { ...defaults };
  }
}

export function saveSettings(next) {
  const settings = { ...loadSettings(), ...next };
  localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
  return settings;
}

export function safeSessionSet(key, value) {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Private browsing modes may reject storage. The app can still run in memory.
  }
}

export function safeSessionGet(key) {
  try {
    return JSON.parse(sessionStorage.getItem(key) || "null");
  } catch {
    return null;
  }
}

export function safeSessionRemove(key) {
  try {
    sessionStorage.removeItem(key);
  } catch {
    // Ignore storage cleanup failures.
  }
}
