import { runSearch } from "../api/search.js";
import { $, createElement } from "../utils/dom.js";
import { emptyState, renderVideoGrid, section } from "../ui/render.js";

export async function renderSearchPage(context) {
  const query = context.searchQuery || $("#searchInput")?.value || "";
  if (!query.trim()) {
    return section("Search", emptyState("Search for songs, artists, channels, or videos."));
  }
  const data = await runSearch(query);
  return section(`Results for "${query.trim()}"`, renderVideoGrid(data.items || [], { empty: "No results found." }));
}

export function searchPrompt(onSubmit) {
  const input = createElement("input", {
    attrs: {
      type: "search",
      placeholder: "Search YouTube",
      "aria-label": "Search YouTube"
    }
  });
  const button = createElement("button", { className: "text-button", text: "Search", attrs: { type: "submit" } });
  const form = createElement("form", { className: "search-box", children: [input, button] });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    onSubmit(input.value);
  });
  return form;
}
