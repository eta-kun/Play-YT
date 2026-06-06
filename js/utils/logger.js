const enabled = location.search.includes("debug=true");

export const logger = {
  info(...args) {
    if (enabled) console.info("[PulseTube]", ...args);
  },
  warn(...args) {
    console.warn("[PulseTube]", ...args);
  },
  error(...args) {
    console.error("[PulseTube]", ...args);
  }
};
