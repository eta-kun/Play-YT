import { $, $$ } from "../utils/dom.js";
import { saveSettings } from "../storage/settings.js";

export function applyMusicMode() {
  $(".app-shell").dataset.mode = "music";
  $$("#primaryTabs .nav-item").forEach((button) => button.classList.remove("is-youtube-mode"));
  saveSettings({ mode: "music" });
}
