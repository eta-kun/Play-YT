import { $, showNotice } from "../utils/dom.js";
import { formatDuration } from "../utils/format.js";
import { getQueueState, nextItem, onQueueChange, previousItem } from "./queue.js";

let player;
let ready = false;
let isPlaying = false;
let progressTimer;
let activeVideoId = null;

export function initPlayer() {
  bindControls();
  onQueueChange(({ current }) => {
    if (current) loadTrack(current);
  });
  waitForIframeApi().then(() => {
    player = new YT.Player("playerHost", {
      height: "1",
      width: "1",
      playerVars: {
        playsinline: 1,
        rel: 0,
        modestbranding: 1
      },
      events: {
        onReady: () => {
          ready = true;
          const current = getQueueState().current;
          if (current) loadTrack(current);
        },
        onStateChange: handleStateChange,
        onError: () => showNotice("This video cannot be played here. Try another item.", "error")
      }
    });
  }).catch(() => showNotice("The YouTube player failed to load. Check your connection and content blockers.", "error"));
}

export function loadTrack(track) {
  activeVideoId = track.videoId;
  $("#trackTitle").textContent = track.title || "Untitled";
  $("#trackChannel").textContent = track.channelTitle || "";
  $("#trackThumb").src = track.thumbnail || "assets/images/placeholder.svg";
  $("#trackThumb").alt = "";
  if (ready && player?.loadVideoById) player.loadVideoById(track.videoId);
}

function bindControls() {
  $("#playButton").addEventListener("click", () => {
    if (!player || !ready) return;
    isPlaying ? player.pauseVideo() : player.playVideo();
  });
  $("#nextButton").addEventListener("click", () => {
    const next = nextItem();
    if (next) loadTrack(next);
  });
  $("#prevButton").addEventListener("click", () => {
    const previous = previousItem();
    if (previous) loadTrack(previous);
  });
  $("#seekRange").addEventListener("input", (event) => {
    if (player?.seekTo) player.seekTo(Number(event.target.value), true);
  });
}

function handleStateChange(event) {
  isPlaying = event.data === YT.PlayerState.PLAYING;
  $("#playButton").textContent = isPlaying ? "Pause" : "Play";
  $("#playButton").setAttribute("aria-label", isPlaying ? "Pause" : "Play");
  if (event.data === YT.PlayerState.ENDED) {
    const { repeat } = getQueueState();
    if (repeat === "one" && activeVideoId) {
      player.loadVideoById(activeVideoId);
    } else {
      const next = nextItem();
      if (next) loadTrack(next);
    }
  }
  startProgress();
}

function startProgress() {
  clearInterval(progressTimer);
  progressTimer = setInterval(() => {
    if (!player?.getCurrentTime || !player?.getDuration) return;
    const current = player.getCurrentTime() || 0;
    const duration = player.getDuration() || 0;
    $("#seekRange").max = String(Math.max(duration, 100));
    $("#seekRange").value = String(current);
    $("#currentTime").textContent = formatDuration(current);
    $("#durationTime").textContent = formatDuration(duration);
  }, 500);
}

function waitForIframeApi() {
  if (window.YT?.Player) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const started = Date.now();
    const timer = setInterval(() => {
      if (window.YT?.Player) {
        clearInterval(timer);
        resolve();
      } else if (Date.now() - started > 12000) {
        clearInterval(timer);
        reject(new Error("YouTube IFrame API timeout."));
      }
    }, 100);
  });
}
