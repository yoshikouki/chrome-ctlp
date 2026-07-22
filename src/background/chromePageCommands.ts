import { t } from "../lib/i18n";
import type { CommandHandler } from "./commandTypes";

const openDownloads = openChromePage("chrome://downloads/");
const openHistory = openChromePage("chrome://history/");
const openBookmarks = openChromePage("chrome://bookmarks/");
const openSettings = openChromePage("chrome://settings/");
const openExtensions = openChromePage("chrome://extensions/");
const openShortcuts = openChromePage("chrome://extensions/shortcuts");

export { openBookmarks, openDownloads, openExtensions, openHistory, openSettings, openShortcuts };

function openChromePage(url: string): CommandHandler {
  return async ({ sourceTab }) => {
    const tab = await chrome.tabs.create({
      active: true,
      index: sourceTab ? sourceTab.index + 1 : undefined,
      url,
      windowId: sourceTab?.windowId,
    });
    if (tab.id === undefined) {
      throw new Error(t("errorTabCreate"));
    }
    return t("statusComplete");
  };
}
