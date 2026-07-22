import { t } from "../lib/i18n";
import type { CommandHandler } from "./commandTypes";

export const openNewWindow: CommandHandler = async () => {
  const window = await chrome.windows.create({ focused: true, type: "normal" });
  if (window?.id === undefined) {
    throw new Error(t("errorWindowCreate"));
  }
  return t("statusComplete");
};

export const focusNextWindow: CommandHandler = async ({ sourceTab }) => {
  const currentWindowId = requireWindowId(sourceTab);
  const windows = (await chrome.windows.getAll({ windowTypes: ["normal"] })).filter(
    (window): window is chrome.windows.Window & { id: number } => window.id !== undefined,
  );
  if (windows.length < 2) {
    throw new Error(t("errorNoOtherWindow"));
  }
  const currentIndex = windows.findIndex((window) => window.id === currentWindowId);
  const next = windows[(Math.max(currentIndex, 0) + 1) % windows.length];
  if (next) {
    await chrome.windows.update(next.id, { focused: true });
  }
  return t("statusComplete");
};

export const minimizeCurrentWindow: CommandHandler = async ({ sourceTab }) => {
  await chrome.windows.update(requireWindowId(sourceTab), { state: "minimized" });
  return t("statusComplete");
};

export const maximizeCurrentWindow: CommandHandler = async ({ sourceTab }) => {
  await chrome.windows.update(requireWindowId(sourceTab), { state: "maximized" });
  return t("statusComplete");
};

export const toggleCurrentWindowFullscreen: CommandHandler = async ({ sourceTab }) => {
  const windowId = requireWindowId(sourceTab);
  const window = await chrome.windows.get(windowId);
  await chrome.windows.update(windowId, {
    state: window.state === "fullscreen" ? "normal" : "fullscreen",
  });
  return t("statusComplete");
};

export const closeCurrentWindow: CommandHandler = async ({ sourceTab }) => {
  await chrome.windows.remove(requireWindowId(sourceTab));
  return t("statusComplete");
};

function requireWindowId(sourceTab?: chrome.tabs.Tab): number {
  if (sourceTab?.windowId === undefined) {
    throw new Error(t("errorCurrentWindowMissing"));
  }
  return sourceTab.windowId;
}
