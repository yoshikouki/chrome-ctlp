import { executeCommand } from "./background/commandHandlers";
import { countSleepingTabs } from "./background/tabCommands";
import { userErrorMessage } from "./lib/i18n";
import type { PaletteRequest, PaletteResponse } from "./lib/paletteProtocol";
import { findCommandShortcut } from "./lib/shortcut";

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
          error: userErrorMessage(error),
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
    const [sleepingCount, commands] = await Promise.all([
      countSleepingTabs(windowId),
      chrome.commands.getAll(),
    ]);
    return {
      ok: true,
      paletteShortcut: findCommandShortcut(commands, "open-palette"),
      sleepingCount,
    };
  }

  const message = await executeCommand(request, sender.tab);
  return {
    message,
    ok: true,
    sleepingCount: await countSleepingTabs(windowId),
  };
}
