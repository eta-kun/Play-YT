import { $, $$ } from "../utils/dom.js";
import { saveSettings } from "../storage/settings.js";

export function applyYoutubeMode() {
  $(".app-shell").dataset.mode = "youtube";
  $$("#primaryTabs .nav-item").forEach((button) => button.classList.add("is-youtube-mode"));
  saveSettings({ mode: "youtube" });
}
