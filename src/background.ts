import { type CommandId, findFallbackTab, normalizeTarget } from "./lib/tabLogic";

interface GetStateRequest {
  type: "get-state";
}

interface ExecuteRequest {
  commandId: CommandId;
  input: string;
  type: "execute";
}

type PaletteRequest = ExecuteRequest | GetStateRequest;

interface PaletteResponse {
  error?: string;
  message?: string;
  ok: boolean;
  sleepingCount: number;
}

chrome.action.onClicked.addListener((tab) => {
  void showPalette(tab.id);
});

chrome.commands.onCommand.addListener((command, tab) => {
  if (command === "open-palette") {
    void showPalette(tab?.id);
  }
});

chrome.runtime.onMessage.addListener(
  (message: PaletteRequest, sender, sendResponse: (response: PaletteResponse) => void) => {
    void handleMessage(message, sender)
      .then(sendResponse)
      .catch((error: unknown) =>
        sendResponse({
          error: error instanceof Error ? error.message : "操作に失敗しました",
          ok: false,
          sleepingCount: 0,
        }),
      );
    return true;
  },
);

async function showPalette(tabId?: number): Promise<void> {
  if (tabId === undefined) {
    return;
  }

  try {
    await chrome.scripting.executeScript({
      files: ["assets/content.js"],
      target: { tabId },
    });
  } catch (error) {
    console.warn("chrome-ctlp cannot run on this page", error);
    await chrome.action.setBadgeBackgroundColor({ color: "#d1534f", tabId });
    await chrome.action.setBadgeText({ tabId, text: "×" });
    globalThis.setTimeout(() => {
      void chrome.action.setBadgeText({ tabId, text: "" });
    }, 1800);
  }
}

async function handleMessage(
  request: PaletteRequest,
  sender: chrome.runtime.MessageSender,
): Promise<PaletteResponse> {
  const windowId = sender.tab?.windowId;
  if (request.type === "get-state") {
    return {
      ok: true,
      sleepingCount: await countSleepingTabs(windowId),
    };
  }

  const message = await executeCommand(request, sender.tab);
  return {
    message,
    ok: true,
    sleepingCount: await countSleepingTabs(windowId),
  };
}

async function executeCommand(
  request: ExecuteRequest,
  sourceTab?: chrome.tabs.Tab,
): Promise<string> {
  if (request.commandId === "lazy-open") {
    const target = normalizeTarget(request.input);
    await createLazyTab(target, sourceTab);
    return `${target.host} を休止状態で追加しました`;
  }
  if (request.commandId === "suspend-current") {
    await suspendCurrentTab(sourceTab);
    return "現在のタブを休止しました";
  }
  if (request.commandId === "suspend-others") {
    const count = await suspendOtherTabs(sourceTab?.windowId);
    return `${count}個のタブを休止しました`;
  }

  await wakeFirstSleepingTab(sourceTab?.windowId);
  return "休止中のタブを開きました";
}

async function countSleepingTabs(windowId?: number): Promise<number> {
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
    throw new Error("タブを作成できませんでした");
  }

  await waitForTabComplete(tab.id, tab.status);
  const discardedTab = await chrome.tabs.discard(tab.id);
  if (!discardedTab?.discarded) {
    throw new Error("タブを休止状態にできませんでした");
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

async function suspendCurrentTab(sourceTab?: chrome.tabs.Tab): Promise<void> {
  const tabs = await chrome.tabs.query(
    sourceTab?.windowId === undefined ? { currentWindow: true } : { windowId: sourceTab.windowId },
  );
  const currentTab = tabs.find((tab) => tab.id === sourceTab?.id) ?? tabs.find((tab) => tab.active);
  if (currentTab?.id === undefined) {
    throw new Error("現在のタブを取得できませんでした");
  }

  const fallback = findFallbackTab(tabs, currentTab);
  if (fallback?.id !== undefined) {
    await chrome.tabs.update(fallback.id, { active: true });
  } else {
    await chrome.tabs.create({ active: true, windowId: currentTab.windowId });
  }
  await chrome.tabs.discard(currentTab.id);
}

async function suspendOtherTabs(windowId?: number): Promise<number> {
  const tabs = await chrome.tabs.query(
    windowId === undefined ? { currentWindow: true } : { windowId },
  );
  const targetIds = tabs
    .filter((tab) => !tab.active && !tab.audible && !tab.discarded && !tab.pinned)
    .flatMap((tab) => (tab.id === undefined ? [] : [tab.id]));
  const results = await Promise.allSettled(targetIds.map((tabId) => chrome.tabs.discard(tabId)));
  return results.filter((result) => result.status === "fulfilled").length;
}

async function wakeFirstSleepingTab(windowId?: number): Promise<void> {
  const tabs = await chrome.tabs.query(
    windowId === undefined ? { currentWindow: true } : { windowId },
  );
  const sleepingTab = tabs.find((tab) => tab.discarded);
  if (sleepingTab?.id === undefined) {
    throw new Error("休止中のタブはありません");
  }
  await chrome.tabs.update(sleepingTab.id, { active: true });
}
