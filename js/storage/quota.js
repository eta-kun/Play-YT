import { QUOTA, STORAGE_KEYS } from "../utils/constants.js";

const RESET_TIME_ZONE = "America/Los_Angeles";

export function recordQuotaUsage(units) {
  const state = loadQuotaState();
  state.used = Math.min(QUOTA.DAILY_LIMIT, state.used + Math.max(0, Number(units) || 0));
  saveQuotaState(state);
  window.dispatchEvent(new CustomEvent("quotausagechange", { detail: getQuotaSummary() }));
}

export function getQuotaSummary() {
  const state = loadQuotaState();
  const percent = Math.min(100, Math.round((state.used / QUOTA.DAILY_LIMIT) * 1000) / 10);
  return {
    used: state.used,
    limit: QUOTA.DAILY_LIMIT,
    percent,
    resetAt: state.resetAt,
    timeRemainingMs: Math.max(0, state.resetAt - Date.now())
  };
}

export function formatResetTime(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const totalMinutes = Math.floor(totalSeconds / 60);
  if (totalSeconds > 3600) {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}m`;
  }
  const seconds = totalSeconds % 60;
  return `${totalMinutes}m ${seconds}s`;
}

function loadQuotaState() {
  const resetAt = nextPacificMidnight();
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.quotaUsage) || "null");
    if (stored?.resetAt && stored.resetAt > Date.now()) {
      return {
        used: Number(stored.used) || 0,
        resetAt: stored.resetAt
      };
    }
  } catch {
    // Fall through to a fresh daily bucket.
  }
  const fresh = { used: 0, resetAt };
  saveQuotaState(fresh);
  return fresh;
}

function saveQuotaState(state) {
  localStorage.setItem(STORAGE_KEYS.quotaUsage, JSON.stringify(state));
}

function nextPacificMidnight() {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: RESET_TIME_ZONE,
    hour: "numeric",
    minute: "numeric",
    hourCycle: "h23"
  });
  const now = Date.now();
  const roundedNow = now - (now % 60000);
  for (let i = 1; i <= 36 * 60; i += 1) {
    const candidate = roundedNow + i * 60000;
    const parts = formatter.formatToParts(new Date(candidate));
    const hour = Number(parts.find((part) => part.type === "hour")?.value);
    const minute = Number(parts.find((part) => part.type === "minute")?.value);
    if (hour === 0 && minute === 0) return candidate;
  }
  return now + 24 * 60 * 60 * 1000;
}
