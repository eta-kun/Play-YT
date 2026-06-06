import { $$ } from "../utils/dom.js";
import { PAGE_TITLES } from "../utils/constants.js";

export function initTabs(onChange) {
  $$("#primaryTabs .nav-item").forEach((button) => {
    button.addEventListener("click", () => {
      const page = button.dataset.page;
      selectTab(page);
      onChange(page);
    });
  });
}

export function selectTab(page) {
  $$("#primaryTabs .nav-item").forEach((button) => {
    const active = button.dataset.page === page;
    button.classList.toggle("is-active", active);
    if (active) button.setAttribute("aria-current", "page");
    else button.removeAttribute("aria-current");
  });
  document.title = `${PAGE_TITLES[page] || "PulseTube"} - PulseTube Music`;
}
