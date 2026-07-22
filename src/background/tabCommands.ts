import { t } from "../lib/i18n";
import { findFallbackTab, normalizeTarget } from "../lib/tabLogic";
import type { CommandHandler } from "./commandTypes";

export const lazyOpen: CommandHandler = async ({ input, sourceTab }) => {
  const target = normalizeTarget(input);
  await createLazyTab(target, sourceTab);
  return t("statusLazyOpened", target.host);
};

export const openNewTab: CommandHandler = async ({ sourceTab }) => {
  const tab = await chrome.tabs.create({
    active: true,
    index: sourceTab ? sourceTab.index + 1 : undefined,
    windowId: sourceTab?.windowId,
  });
  if (tab.id === undefined) {
    throw new Error(t("errorTabCreate"));
  }
  return t("statusComplete");
};

export const duplicateCurrentTab: CommandHandler = async ({ sourceTab }) => {
  const tab = await chrome.tabs.duplicate(requireTabId(sourceTab));
  if (tab?.id === undefined) {
    throw new Error(t("errorTabCreate"));
  }
  return t("statusComplete");
};

export const toggleCurrentTabPinned: CommandHandler = async ({ sourceTab }) => {
  const tabId = requireTabId(sourceTab);
  const tab = await chrome.tabs.get(tabId);
  const pinned = !tab.pinned;
  await chrome.tabs.update(tabId, { pinned });
  return t(pinned ? "statusPinned" : "statusUnpinned");
};

export const toggleCurrentTabMuted: CommandHandler = async ({ sourceTab }) => {
  const tabId = requireTabId(sourceTab);
  const tab = await chrome.tabs.get(tabId);
  const muted = !(tab.mutedInfo?.muted ?? false);
  await chrome.tabs.update(tabId, { muted });
  return t(muted ? "statusMuted" : "statusUnmuted");
};

export const reloadCurrentTab: CommandHandler = async ({ sourceTab }) => {
  await chrome.tabs.reload(requireTabId(sourceTab));
  return t("statusComplete");
};

export const goBack: CommandHandler = async ({ sourceTab }) => {
  try {
    await chrome.tabs.goBack(requireTabId(sourceTab));
  } catch {
    throw new Error(t("errorCannotGoBack"));
  }
  return t("statusComplete");
};

export const goForward: CommandHandler = async ({ sourceTab }) => {
  try {
    await chrome.tabs.goForward(requireTabId(sourceTab));
  } catch {
    throw new Error(t("errorCannotGoForward"));
  }
  return t("statusComplete");
};

export const activatePreviousTab: CommandHandler = async ({ sourceTab }) => {
  await activateAdjacentTab(requireTab(sourceTab), -1);
  return t("statusComplete");
};

export const activateNextTab: CommandHandler = async ({ sourceTab }) => {
  await activateAdjacentTab(requireTab(sourceTab), 1);
  return t("statusComplete");
};

export const moveCurrentTabLeft: CommandHandler = async ({ sourceTab }) => {
  const tab = requireTab(sourceTab);
  await chrome.tabs.move(requireTabId(tab), { index: Math.max(0, tab.index - 1) });
  return t("statusComplete");
};

export const moveCurrentTabRight: CommandHandler = async ({ sourceTab }) => {
  const tab = requireTab(sourceTab);
  await chrome.tabs.move(requireTabId(tab), { index: tab.index + 1 });
  return t("statusComplete");
};

export const moveCurrentTabToNewWindow: CommandHandler = async ({ sourceTab }) => {
  const window = await chrome.windows.create({ tabId: requireTabId(sourceTab) });
  if (window?.id === undefined) {
    throw new Error(t("errorWindowCreate"));
  }
  return t("statusComplete");
};

export const closeCurrentTab: CommandHandler = async ({ sourceTab }) => {
  await chrome.tabs.remove(requireTabId(sourceTab));
  return t("statusComplete");
};

export const closeOtherTabs: CommandHandler = async ({ sourceTab }) => {
  const current = requireTab(sourceTab);
  const tabs = await chrome.tabs.query({ windowId: current.windowId });
  const ids = tabs
    .filter((tab) => tab.id !== current.id && !tab.pinned)
    .flatMap((tab) => (tab.id === undefined ? [] : [tab.id]));
  if (ids.length > 0) {
    await chrome.tabs.remove(ids);
  }
  return t("statusTabsClosed", String(ids.length));
};

export const closeTabsToRight: CommandHandler = async ({ sourceTab }) => {
  const current = requireTab(sourceTab);
  const tabs = await chrome.tabs.query({ windowId: current.windowId });
  const ids = tabs
    .filter((tab) => tab.index > current.index && !tab.pinned)
    .flatMap((tab) => (tab.id === undefined ? [] : [tab.id]));
  if (ids.length > 0) {
    await chrome.tabs.remove(ids);
  }
  return t("statusTabsClosed", String(ids.length));
};

export const suspendCurrentTab: CommandHandler = async ({ sourceTab }) => {
  const tabs = await chrome.tabs.query(
    sourceTab?.windowId === undefined ? { currentWindow: true } : { windowId: sourceTab.windowId },
  );
  const currentTab = tabs.find((tab) => tab.id === sourceTab?.id) ?? tabs.find((tab) => tab.active);
  if (currentTab?.id === undefined) {
    throw new Error(t("errorCurrentTabMissing"));
  }

  const fallback = findFallbackTab(tabs, currentTab);
  if (fallback?.id !== undefined) {
    await chrome.tabs.update(fallback.id, { active: true });
  } else {
    await chrome.tabs.create({ active: true, windowId: currentTab.windowId });
  }
  await chrome.tabs.discard(currentTab.id);
  return t("statusCurrentSuspended");
};

export const suspendOtherTabs: CommandHandler = async ({ sourceTab }) => {
  const tabs = await chrome.tabs.query(
    sourceTab?.windowId === undefined ? { currentWindow: true } : { windowId: sourceTab.windowId },
  );
  const targetIds = tabs
    .filter((tab) => !tab.active && !tab.audible && !tab.discarded && !tab.pinned)
    .flatMap((tab) => (tab.id === undefined ? [] : [tab.id]));
  const results = await Promise.allSettled(targetIds.map((tabId) => chrome.tabs.discard(tabId)));
  const count = results.filter((result) => result.status === "fulfilled").length;
  return t("statusOthersSuspended", String(count));
};

export const wakeFirstSleepingTab: CommandHandler = async ({ sourceTab }) => {
  const tabs = await chrome.tabs.query(
    sourceTab?.windowId === undefined ? { currentWindow: true } : { windowId: sourceTab.windowId },
  );
  const sleepingTab = tabs.find((tab) => tab.discarded);
  if (sleepingTab?.id === undefined) {
    throw new Error(t("errorNoSleepingTab"));
  }
  await chrome.tabs.update(sleepingTab.id, { active: true });
  return t("statusWakeFirst");
};

export const zoomIn: CommandHandler = async ({ sourceTab }) => {
  return changeZoom(requireTabId(sourceTab), 0.1);
};

export const zoomOut: CommandHandler = async ({ sourceTab }) => {
  return changeZoom(requireTabId(sourceTab), -0.1);
};

export const resetZoom: CommandHandler = async ({ sourceTab }) => {
  const tabId = requireTabId(sourceTab);
  await chrome.tabs.setZoom(tabId, 0);
  return zoomStatus(await chrome.tabs.getZoom(tabId));
};

export async function countSleepingTabs(windowId?: number): Promise<number> {
  const tabs = await chrome.tabs.query(
    windowId === undefined ? { currentWindow: true } : { windowId },
  );
  return tabs.filter((tab) => tab.discarded).length;
}

async function createLazyTab(target: URL, sourceTab?: chrome.tabs.Tab): Promise<void> {
  const placeholder = new URL(chrome.runtime.getURL("lazy.html"));
  placeholder.searchParams.set("host", target.host);
  placeholder.hash = encodeURIComponent(target.href);
  const tab = await chrome.tabs.create({
    active: false,
    index: sourceTab ? sourceTab.index + 1 : undefined,
    url: placeholder.href,
    windowId: sourceTab?.windowId,
  });
  if (tab.id === undefined) {
    throw new Error(t("errorTabCreate"));
  }

  await waitForTabComplete(tab.id, tab.status);
  const discardedTab = await chrome.tabs.discard(tab.id);
  if (!discardedTab?.discarded) {
    throw new Error(t("errorTabDiscard"));
  }
}

async function waitForTabComplete(tabId: number, initialStatus?: string): Promise<void> {
  if (initialStatus === "complete") {
    return;
  }

  const current = await chrome.tabs.get(tabId);
  if (current.status === "complete") {
    return;
  }

  await new Promise<void>((resolve) => {
    const timeout = globalThis.setTimeout(() => {
      chrome.tabs.onUpdated.removeListener(onUpdated);
      resolve();
    }, 2000);
    const onUpdated = (updatedTabId: number, changeInfo: { status?: string }): void => {
      if (updatedTabId !== tabId || changeInfo.status !== "complete") {
        return;
      }
      globalThis.clearTimeout(timeout);
      chrome.tabs.onUpdated.removeListener(onUpdated);
      resolve();
    };
    chrome.tabs.onUpdated.addListener(onUpdated);
  });
}

async function activateAdjacentTab(current: chrome.tabs.Tab, offset: -1 | 1): Promise<void> {
  const tabs = (await chrome.tabs.query({ windowId: current.windowId })).toSorted(
    (left, right) => left.index - right.index,
  );
  const currentIndex = tabs.findIndex((tab) => tab.id === current.id);
  if (currentIndex < 0 || tabs.length < 2) {
    return;
  }
  const target = tabs[(currentIndex + offset + tabs.length) % tabs.length];
  if (target?.id !== undefined) {
    await chrome.tabs.update(target.id, { active: true });
  }
}

async function changeZoom(tabId: number, delta: number): Promise<string> {
  const current = await chrome.tabs.getZoom(tabId);
  const next = Math.min(5, Math.max(0.25, Math.round((current + delta) * 10) / 10));
  await chrome.tabs.setZoom(tabId, next);
  return zoomStatus(next);
}

function zoomStatus(factor: number): string {
  return t("statusZoomLevel", String(Math.round(factor * 100)));
}

function requireTab(sourceTab?: chrome.tabs.Tab): chrome.tabs.Tab {
  if (!sourceTab) {
    throw new Error(t("errorCurrentTabMissing"));
  }
  return sourceTab;
}

function requireTabId(sourceTab?: chrome.tabs.Tab): number {
  const tabId = sourceTab?.id;
  if (tabId === undefined) {
    throw new Error(t("errorCurrentTabMissing"));
  }
  return tabId;
}
