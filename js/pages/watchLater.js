import { listWatchLater } from "../api/youtube.js";
import { renderVideoGrid, section } from "../ui/render.js";

export async function renderWatchLater() {
  const data = await listWatchLater();
  return section("Watch Later", renderVideoGrid(data.items || [], { empty: "No Watch Later videos found." }));
}
