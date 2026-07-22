import type { CommandId } from "../commands/types";
import type { ExecutePaletteCommandRequest } from "../lib/paletteProtocol";
import {
  openBookmarks,
  openDownloads,
  openExtensions,
  openHistory,
  openSettings,
  openShortcuts,
} from "./chromePageCommands";
import type { CommandHandler } from "./commandTypes";
import { reloadExtension } from "./developerCommands";
import { scrollPageDown, scrollPageUp, scrollToBottom, scrollToTop } from "./pageCommands";
import {
  activateNextTab,
  activatePreviousTab,
  closeCurrentTab,
  closeOtherTabs,
  closeTabsToRight,
  duplicateCurrentTab,
  goBack,
  goForward,
  lazyOpen,
  moveCurrentTabLeft,
  moveCurrentTabRight,
  moveCurrentTabToNewWindow,
  openNewTab,
  reloadCurrentTab,
  resetZoom,
  suspendCurrentTab,
  suspendOtherTabs,
  toggleCurrentTabMuted,
  toggleCurrentTabPinned,
  wakeFirstSleepingTab,
  zoomIn,
  zoomOut,
} from "./tabCommands";
import {
  closeCurrentWindow,
  focusNextWindow,
  maximizeCurrentWindow,
  minimizeCurrentWindow,
  openNewWindow,
  toggleCurrentWindowFullscreen,
} from "./windowCommands";

export const commandHandlers: Record<CommandId, CommandHandler> = {
  "lazy-open": lazyOpen,
  "new-tab": openNewTab,
  "duplicate-current": duplicateCurrentTab,
  "toggle-pin-current": toggleCurrentTabPinned,
  "toggle-mute-current": toggleCurrentTabMuted,
  "reload-current": reloadCurrentTab,
  "go-back": goBack,
  "go-forward": goForward,
  "previous-tab": activatePreviousTab,
  "next-tab": activateNextTab,
  "move-tab-left": moveCurrentTabLeft,
  "move-tab-right": moveCurrentTabRight,
  "move-tab-to-new-window": moveCurrentTabToNewWindow,
  "close-current": closeCurrentTab,
  "close-other-tabs": closeOtherTabs,
  "close-tabs-to-right": closeTabsToRight,
  "suspend-current": suspendCurrentTab,
  "suspend-others": suspendOtherTabs,
  "wake-first": wakeFirstSleepingTab,
  "zoom-in": zoomIn,
  "zoom-out": zoomOut,
  "zoom-reset": resetZoom,
  "new-window": openNewWindow,
  "focus-next-window": focusNextWindow,
  "minimize-window": minimizeCurrentWindow,
  "maximize-window": maximizeCurrentWindow,
  "toggle-fullscreen-window": toggleCurrentWindowFullscreen,
  "close-window": closeCurrentWindow,
  "scroll-top": scrollToTop,
  "scroll-bottom": scrollToBottom,
  "page-up": scrollPageUp,
  "page-down": scrollPageDown,
  "open-downloads": openDownloads,
  "open-history": openHistory,
  "open-bookmarks": openBookmarks,
  "open-settings": openSettings,
  "open-extensions": openExtensions,
  "open-shortcuts": openShortcuts,
  "reload-extension": reloadExtension,
};

export function executeCommand(
  request: ExecutePaletteCommandRequest,
  sourceTab?: chrome.tabs.Tab,
): Promise<string> {
  return commandHandlers[request.commandId]({ input: request.input, sourceTab });
}
