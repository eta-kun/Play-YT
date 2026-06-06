import { STORAGE_KEYS } from "../utils/constants.js";
import { safeSessionGet, safeSessionSet } from "../storage/settings.js";

let queue = safeSessionGet(STORAGE_KEYS.queue) || [];
let currentIndex = queue.length ? 0 : -1;
let shuffle = false;
let repeat = "off";
const listeners = new Set();

function emit() {
  listeners.forEach((listener) => listener(getQueueState()));
  safeSessionSet(STORAGE_KEYS.queue, queue);
}

export function onQueueChange(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getQueueState() {
  return {
    items: [...queue],
    currentIndex,
    current: queue[currentIndex] || null,
    shuffle,
    repeat
  };
}

export function setQueue(items, startIndex = 0) {
  queue = items.filter((item) => item?.videoId);
  currentIndex = queue.length ? Math.max(0, Math.min(startIndex, queue.length - 1)) : -1;
  emit();
  return getQueueState().current;
}

export function playItem(item) {
  return setQueue([item], 0);
}

export function nextItem() {
  if (!queue.length) return null;
  if (shuffle) {
    currentIndex = Math.floor(Math.random() * queue.length);
  } else if (currentIndex < queue.length - 1) {
    currentIndex += 1;
  } else if (repeat === "all") {
    currentIndex = 0;
  } else {
    return null;
  }
  emit();
  return queue[currentIndex];
}

export function previousItem() {
  if (!queue.length) return null;
  currentIndex = currentIndex > 0 ? currentIndex - 1 : queue.length - 1;
  emit();
  return queue[currentIndex];
}

export function toggleShuffle() {
  shuffle = !shuffle;
  emit();
  return shuffle;
}

export function cycleRepeat() {
  repeat = repeat === "off" ? "all" : repeat === "all" ? "one" : "off";
  emit();
  return repeat;
}
