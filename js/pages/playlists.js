import { listPlaylistItems, listPlaylists } from "../api/youtube.js";
import { createElement, showNotice } from "../utils/dom.js";
import { decodeText } from "../utils/format.js";
import { emptyState, renderPlaylistGrid, renderVideoGrid, section } from "../ui/render.js";

export async function renderPlaylists() {
  const data = await listPlaylists();
  const wrapper = createElement("div", { className: "page-content" });
  const playlists = data.items || [];
  const grid = renderPlaylistGrid(playlists, async (playlist) => {
    showNotice(`Loading ${decodeText(playlist.snippet?.title || "playlist")}...`);
    try {
      const items = await listPlaylistItems(playlist.id);
      wrapper.replaceChildren(
        section(decodeText(playlist.snippet?.title || "Playlist"), renderVideoGrid(items.items || [], { empty: "This playlist is empty." })),
        backButton(() => wrapper.replaceChildren(section("Your playlists", grid)))
      );
    } catch (error) {
      showNotice(error.message, "error");
    }
  });
  wrapper.append(section("Your playlists", grid));
  return wrapper;
}

function backButton(onClick) {
  const button = createElement("button", { className: "text-button", text: "Back to playlists", attrs: { type: "button" } });
  button.addEventListener("click", onClick);
  return button;
}
