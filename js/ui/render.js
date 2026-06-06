import { createElement } from "../utils/dom.js";
import { bestThumbnail, compactNumber, decodeText } from "../utils/format.js";
import { setQueue } from "../player/queue.js";

export function videoFromApi(item) {
  const snippet = item.snippet || {};
  const videoId = item.id?.videoId || item.id || item.contentDetails?.videoId || snippet.resourceId?.videoId;
  return {
    videoId,
    title: decodeText(snippet.title || "Untitled"),
    channelTitle: decodeText(snippet.channelTitle || ""),
    thumbnail: bestThumbnail(snippet.thumbnails),
    description: decodeText(snippet.description || ""),
    views: item.statistics?.viewCount
  };
}

export function renderVideoGrid(items, options = {}) {
  const videos = items.map(videoFromApi).filter((item) => item.videoId);
  if (!videos.length) return emptyState(options.empty || "No videos found.");
  const grid = createElement("div", { className: "grid" });
  videos.forEach((video, index) => {
    const card = mediaCard(video, () => {
      setQueue(videos, index);
    });
    grid.append(card);
  });
  return grid;
}

export function renderPlaylistGrid(items, onOpen) {
  if (!items.length) return emptyState("No playlists found for this account.");
  const grid = createElement("div", { className: "grid" });
  items.forEach((item) => {
    const snippet = item.snippet || {};
    const card = createElement("button", {
      className: "media-card",
      attrs: { type: "button" },
      children: [
        createElement("img", {
          className: "thumb",
          attrs: { src: bestThumbnail(snippet.thumbnails), alt: "" }
        }),
        createElement("div", {
          children: [
            createElement("h3", { text: decodeText(snippet.title || "Untitled playlist") }),
            createElement("p", { text: `${item.contentDetails?.itemCount || 0} videos` })
          ]
        })
      ]
    });
    card.addEventListener("click", () => onOpen(item));
    grid.append(card);
  });
  return grid;
}

export function renderSubscriptionList(items) {
  if (!items.length) return emptyState("No subscriptions found for this account.");
  const list = createElement("div", { className: "list" });
  items.forEach((item) => {
    const snippet = item.snippet || {};
    list.append(createElement("article", {
      className: "media-row",
      children: [
        createElement("img", { className: "thumb", attrs: { src: bestThumbnail(snippet.thumbnails), alt: "" } }),
        createElement("div", {
          children: [
            createElement("h3", { text: decodeText(snippet.title || "Untitled channel") }),
            createElement("p", { text: decodeText(snippet.description || "Subscribed channel") })
          ]
        })
      ]
    }));
  });
  return list;
}

export function section(title, child, action) {
  const headChildren = [createElement("h2", { text: title })];
  if (action) headChildren.push(action);
  return createElement("section", {
    children: [
      createElement("div", { className: "section-head", children: headChildren }),
      child
    ]
  });
}

export function emptyState(text) {
  return createElement("div", { className: "empty-state", text });
}

function mediaCard(video, onPlay) {
  const views = video.views ? `${compactNumber(video.views)} views` : video.channelTitle;
  const card = createElement("button", {
    className: "media-card",
    attrs: { type: "button" },
    children: [
      createElement("img", { className: "thumb", attrs: { src: video.thumbnail, alt: "" } }),
      createElement("div", {
        children: [
          createElement("h3", { text: video.title }),
          createElement("p", { text: views || "YouTube" })
        ]
      })
    ]
  });
  card.addEventListener("click", () => {
    onPlay();
  }, { once: false });
  return card;
}
