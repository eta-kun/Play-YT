export function formatDuration(seconds = 0) {
  if (!Number.isFinite(seconds) || seconds <= 0) return "0:00";
  const whole = Math.floor(seconds);
  const h = Math.floor(whole / 3600);
  const m = Math.floor((whole % 3600) / 60);
  const s = whole % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
    : `${m}:${String(s).padStart(2, "0")}`;
}

export function compactNumber(value) {
  const number = Number(value || 0);
  return new Intl.NumberFormat(undefined, { notation: "compact" }).format(number);
}

export function bestThumbnail(thumbnails = {}) {
  return thumbnails.maxres?.url || thumbnails.high?.url || thumbnails.medium?.url || thumbnails.default?.url || "assets/images/placeholder.svg";
}

export function decodeText(value = "") {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = value;
  return textarea.value;
}
