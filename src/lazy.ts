import "./lazy.css";
import { t } from "./lib/i18n";

const host = new URLSearchParams(window.location.search).get("host") ?? t("lazyFallbackHost");
const target = parseTarget(window.location.hash);
document.documentElement.lang = chrome.i18n.getUILanguage();
const promptElement = document.querySelector<HTMLParagraphElement>("#prompt");
if (promptElement) {
  promptElement.textContent = t("lazyPrompt");
}
const hostElement = document.querySelector<HTMLHeadingElement>("#host");
if (hostElement) {
  hostElement.textContent = host;
}
document.title = t("lazyTitle", host);

let navigating = false;
activateTargetIfVisible();
document.addEventListener("visibilitychange", activateTargetIfVisible);
window.addEventListener("focus", activateTargetIfVisible);
window.addEventListener("pageshow", activateTargetIfVisible);

function activateTargetIfVisible(): void {
  if (navigating || document.visibilityState !== "visible" || !target) {
    return;
  }
  navigating = true;
  window.location.replace(target.href);
}

function parseTarget(hash: string): URL | undefined {
  try {
    const url = new URL(decodeURIComponent(hash.slice(1)));
    return url.protocol === "http:" || url.protocol === "https:" ? url : undefined;
  } catch {
    return undefined;
  }
}
