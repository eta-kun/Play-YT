import { listPopularVideos } from "../api/youtube.js";
import { emptyState, renderVideoGrid, section } from "../ui/render.js";
import { createElement } from "../utils/dom.js";

export async function renderHome(context) {
  const { authState } = context;
  const intro = createElement("div", {
    className: "empty-state",
    text: authState.isSignedIn
      ? "Pick something to play, or jump into your library from the side menu."
      : "Sign in to load your playlists, liked videos, Watch Later, and subscriptions."
  });

  try {
    const popular = await listPopularVideos();
    return [
      section("For now", intro),
      section("Trending videos", renderVideoGrid(popular.items || [], { empty: "Trending videos are unavailable." }))
    ];
  } catch {
    return [
      section("Welcome", intro),
      section("Offline ready", emptyState("Configure an API key to show public recommendations before sign in."))
    ];
  }
}
