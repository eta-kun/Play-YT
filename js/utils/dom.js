export const $ = (selector, root = document) => root.querySelector(selector);
export const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

export function createElement(tag, options = {}) {
  const el = document.createElement(tag);
  const { className, text, attrs, children } = options;
  if (className) el.className = className;
  if (text !== undefined) el.textContent = text;
  if (attrs) {
    Object.entries(attrs).forEach(([key, value]) => {
      if (value !== undefined && value !== null) el.setAttribute(key, String(value));
    });
  }
  if (children) el.append(...children.filter(Boolean));
  return el;
}

export function setBusy(node, busy) {
  node.setAttribute("aria-busy", busy ? "true" : "false");
}

export function clear(node) {
  node.replaceChildren();
}

export function showNotice(message, kind = "info", region = $("#noticeRegion")) {
  if (!region) return;
  const notice = createElement("div", {
    className: "notice",
    text: message,
    attrs: { "data-kind": kind, role: kind === "error" ? "alert" : "status" }
  });
  region.replaceChildren(notice);
}

export function clearNotice(region = $("#noticeRegion")) {
  if (region) region.replaceChildren();
}
