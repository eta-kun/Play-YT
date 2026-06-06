import { listLikedVideos } from "../api/youtube.js";
import { renderVideoGrid, section } from "../ui/render.js";

export async function renderLikes() {
  const data = await listLikedVideos();
  return section("Liked videos", renderVideoGrid(data.items || [], { empty: "No liked videos found." }));
}
