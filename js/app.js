import { initAuth, getAuthState, onAuthChange, signIn, signOut } from "./api/auth.js";
import { getApiSearchSuggestions } from "./api/search.js";
import { $, $$, clearNotice, setBusy, showNotice } from "./utils/dom.js";
import { PAGE_TITLES } from "./utils/constants.js";
import { loadSettings, saveSettings } from "./storage/settings.js";
import { clearSearchHistory, getLocalSearchSuggestions, saveSearchQuery } from "./storage/searchHistory.js";
import { formatResetTime, getQuotaSummary } from "./storage/quota.js";
import { logger } from "./utils/logger.js";
import { initTabs, selectTab } from "./ui/tabs.js";
import { applyMusicMode } from "./ui/musicMode.js";
import { applyYoutubeMode } from "./ui/youtubeMode.js";
import { initPlayer } from "./player/player.js";
import { cycleRepeat, toggleShuffle } from "./player/queue.js";
import { renderHome } from "./pages/home.js";
import { renderPlaylists } from "./pages/playlists.js";
import { renderLikes } from "./pages/likes.js";
import { renderWatchLater } from "./pages/watchLater.js";
import { renderSubscriptions } from "./pages/subscriptions.js";
import { renderSearchPage } from "./pages/searchPage.js";

const pageRenderers = {
  home: renderHome,
  playlists: renderPlaylists,
  likes: renderLikes,
  watchLater: renderWatchLater,
  subscriptions: renderSubscriptions,
  searchPage: renderSearchPage
};

const state = {
  page: "home",
  searchQuery: "",
  suggestionTimer: 0
};

window.addEventListener("DOMContentLoaded", boot);

async function boot() {
  applySavedMode();
  bindChrome();
  initQuotaUi();
  initTabs(loadPage);
  initPlayer();
  initInstallPrompt();
  initConnectivity();
  initServiceWorker();

  try {
    await initAuth();
  } catch (error) {
    showNotice(error.message, "error");
  }
  onAuthChange((authState) => {
    renderProfile(authState);
    loadPage(state.page);
  });
  renderProfile(getAuthState());
  loadPage("home");
}

async function loadPage(page, options = {}) {
  state.page = page;
  state.searchQuery = options.searchQuery ?? state.searchQuery;
  selectTab(page);
  $("#pageTitle").textContent = PAGE_TITLES[page] || "Home";
  $("#pageEyebrow").textContent = $(".app-shell").dataset.mode === "youtube" ? "YouTube Mode" : "Music Mode";

  const content = $("#pageContent");
  setBusy(content, true);
  content.replaceChildren();
  clearNotice();

  const authState = getAuthState();
  if (!authState.isSignedIn && page !== "home") {
    showNotice("Sign in with Google to load your YouTube library.", "warning");
    setBusy(content, false);
    return;
  }

  try {
    const rendered = await pageRenderers[page]({ authState, searchQuery: state.searchQuery });
    content.replaceChildren(...(Array.isArray(rendered) ? rendered : [rendered]));
  } catch (error) {
    logger.error(error);
    showNotice(error.message || "Something went wrong while loading this page.", "error");
  } finally {
    setBusy(content, false);
  }
}

function bindChrome() {
  $("#loginButton").addEventListener("click", () => {
    const authState = getAuthState();
    if (!authState.isConfigured) {
      showNotice("Add your Google OAuth client ID in js/utils/constants.js before signing in.", "warning");
      return;
    }
    if (authState.isSignedIn) openSignOutModal();
    else signIn();
  });
  $("#searchForm").addEventListener("submit", (event) => {
    event.preventDefault();
    state.searchQuery = $("#searchInput").value.trim();
    saveSearchQuery(state.searchQuery);
    hideSearchSuggestions();
    loadPage("searchPage", { searchQuery: state.searchQuery });
  });
  $("#searchInput").addEventListener("input", () => updateSearchSuggestions());
  $("#searchInput").addEventListener("focus", () => updateSearchSuggestions());
  $("#searchInput").addEventListener("keydown", (event) => {
    if (event.key === "Escape") hideSearchSuggestions();
  });
  document.addEventListener("click", (event) => {
    if (!$("#searchForm").contains(event.target)) hideSearchSuggestions();
  });
  $("#searchSuggestionsToggle").addEventListener("change", (event) => {
    saveSettings({ enableSearchSuggestions: event.target.checked });
    updateSearchSuggestions();
  });
  $("#searchHistoryToggle").addEventListener("change", (event) => {
    saveSettings({ saveSearchHistory: event.target.checked });
    $("#clearSearchHistoryButton").disabled = !event.target.checked;
    if (!event.target.checked) {
      clearSearchHistory();
      hideSearchSuggestions();
    } else {
      updateSearchSuggestions();
    }
  });
  $("#clearSearchHistoryButton").addEventListener("click", () => {
    clearSearchHistory();
    hideSearchSuggestions();
    showNotice("Search history cleared.", "success");
  });
  $("#quotaHelpButton").addEventListener("click", () => {
    const help = $("#quotaHelp");
    const isOpen = help.hidden;
    help.hidden = !isOpen;
    $("#quotaHelpButton").setAttribute("aria-expanded", String(isOpen));
  });
  $("#cancelSignOutButton").addEventListener("click", closeSignOutModal);
  $("#signOutSecondConfirm").addEventListener("change", (event) => {
    $("#confirmSignOutButton").disabled = !event.target.checked;
  });
  $("#confirmSignOutButton").addEventListener("click", () => {
    signOut();
    closeSignOutModal();
    showNotice("You are signed out. Auth tokens were removed from this browser.", "success");
  });
  $("#signOutModal").addEventListener("click", (event) => {
    if (event.target === $("#signOutModal")) closeSignOutModal();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !$("#signOutModal").hidden) closeSignOutModal();
  });
  $("#menuButton").addEventListener("click", () => $(".app-shell").classList.toggle("is-menu-open"));
  $$("#primaryTabs .nav-item").forEach((button) => {
    button.addEventListener("click", () => $(".app-shell").classList.remove("is-menu-open"));
  });
  $$(".mode-button").forEach((button) => {
    button.addEventListener("click", () => {
      button.dataset.modeChoice === "youtube" ? applyYoutubeMode() : applyMusicMode();
      $$(".mode-button").forEach((choice) => choice.classList.toggle("is-active", choice === button));
      loadPage(state.page);
    });
  });
  $("#shuffleButton").addEventListener("click", (event) => {
    const active = toggleShuffle();
    event.currentTarget.classList.toggle("is-active", active);
  });
  $("#repeatButton").addEventListener("click", (event) => {
    const repeat = cycleRepeat();
    event.currentTarget.dataset.repeat = repeat;
    event.currentTarget.setAttribute("aria-label", `Repeat ${repeat}`);
  });
}

function renderProfile(authState) {
  const button = $("#loginButton");
  button.classList.toggle("is-signed-in", authState.isSignedIn);
  if (!authState.isConfigured) {
    button.textContent = "Configure OAuth";
    return;
  }
  if (!authState.isSignedIn) {
    button.textContent = "Sign in";
    return;
  }
  const picture = authState.profile?.picture;
  button.replaceChildren();
  if (picture) {
    const img = document.createElement("img");
    img.className = "profile-avatar";
    img.src = picture;
    img.alt = "";
    button.append(img);
  }
  button.append(document.createTextNode(authState.profile?.name || "Sign out"));
}

function applySavedMode() {
  const settings = loadSettings();
  $("#searchSuggestionsToggle").checked = settings.enableSearchSuggestions;
  $("#searchHistoryToggle").checked = settings.saveSearchHistory;
  $("#clearSearchHistoryButton").disabled = !settings.saveSearchHistory;
  settings.mode === "youtube" ? applyYoutubeMode() : applyMusicMode();
  $$(".mode-button").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.modeChoice === settings.mode);
  });
}

async function updateSearchSuggestions() {
  const input = $("#searchInput");
  const settings = loadSettings();
  $("#clearSearchHistoryButton").disabled = !settings.saveSearchHistory;
  const localSuggestions = getLocalSearchSuggestions(input.value);
  renderSearchSuggestions(localSuggestions, localSuggestions.length ? "Recent searches" : "");

  clearTimeout(state.suggestionTimer);
  if (!settings.enableSearchSuggestions || !getAuthState().isSignedIn) return;

  state.suggestionTimer = setTimeout(async () => {
    try {
      const apiSuggestions = await getApiSearchSuggestions(input.value);
      renderSearchSuggestions([...localSuggestions, ...apiSuggestions], localSuggestions.length ? "Recent and YouTube suggestions" : "YouTube suggestions");
    } catch (error) {
      logger.warn("Search suggestions unavailable", error);
    }
  }, 500);
}

function initQuotaUi() {
  renderQuotaUi();
  window.addEventListener("quotausagechange", renderQuotaUi);
  setInterval(renderQuotaUi, 1000);
}

function renderQuotaUi() {
  const quota = getQuotaSummary();
  $("#quotaMeterFill").style.width = `${quota.percent}%`;
  $("#quotaUsageText").textContent = `${quota.percent}% used (${quota.used} of ${quota.limit} units)`;
  $("#quotaResetText").textContent = `Resets in ${formatResetTime(quota.timeRemainingMs)}`;
}

function openSignOutModal() {
  $("#signOutSecondConfirm").checked = false;
  $("#confirmSignOutButton").disabled = true;
  $("#signOutModal").hidden = false;
  $("#cancelSignOutButton").focus();
}

function closeSignOutModal() {
  $("#signOutModal").hidden = true;
  $("#loginButton").focus();
}

function renderSearchSuggestions(items, sourceLabel) {
  const list = $("#searchSuggestions");
  const uniqueItems = [...new Set(items.map((item) => item.trim()).filter(Boolean))].slice(0, 8);
  if (!uniqueItems.length) {
    hideSearchSuggestions();
    return;
  }
  const label = sourceLabel ? [suggestionLabel(sourceLabel)] : [];
  list.replaceChildren(...label, ...uniqueItems.map((item) => suggestionButton(item)));
  list.hidden = false;
  $("#searchInput").setAttribute("aria-expanded", "true");
}

function suggestionLabel(text) {
  const label = document.createElement("div");
  label.className = "suggestion-source";
  label.textContent = text;
  return label;
}

function suggestionButton(text) {
  const button = document.createElement("button");
  button.className = "suggestion-button";
  button.type = "button";
  button.setAttribute("role", "option");
  button.textContent = text;
  button.addEventListener("click", () => {
    $("#searchInput").value = text;
    hideSearchSuggestions();
    $("#searchInput").focus();
  });
  return button;
}

function hideSearchSuggestions() {
  clearTimeout(state.suggestionTimer);
  $("#searchSuggestions").hidden = true;
  $("#searchSuggestions").replaceChildren();
  $("#searchInput").setAttribute("aria-expanded", "false");
}

function initConnectivity() {
  const update = () => {
    if (navigator.onLine === false) showNotice("You are offline. Cached app files are available, but YouTube data needs a connection.", "warning");
  };
  window.addEventListener("offline", update);
  window.addEventListener("online", () => showNotice("Back online.", "success"));
  update();
}

function initInstallPrompt() {
  let promptEvent;
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    promptEvent = event;
    $("#installButton").hidden = false;
  });
  $("#installButton").addEventListener("click", async () => {
    if (!promptEvent) return;
    promptEvent.prompt();
    await promptEvent.userChoice;
    $("#installButton").hidden = true;
    promptEvent = null;
  });
}

function initServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js")
      .catch((error) => logger.warn("Service worker registration failed", error));
  });
}
