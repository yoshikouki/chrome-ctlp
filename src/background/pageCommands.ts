import { t } from "../lib/i18n";
import type { CommandHandler } from "./commandTypes";

export const scrollToTop: CommandHandler = async ({ sourceTab }) => {
  await runOnPage(sourceTab, scrollPageToTop);
  return t("statusComplete");
};

export const scrollToBottom: CommandHandler = async ({ sourceTab }) => {
  await runOnPage(sourceTab, scrollPageToBottom);
  return t("statusComplete");
};

export const scrollPageUp: CommandHandler = async ({ sourceTab }) => {
  await runOnPage(sourceTab, movePageUp);
  return t("statusComplete");
};

export const scrollPageDown: CommandHandler = async ({ sourceTab }) => {
  await runOnPage(sourceTab, movePageDown);
  return t("statusComplete");
};

async function runOnPage(sourceTab: chrome.tabs.Tab | undefined, func: () => void): Promise<void> {
  if (sourceTab?.id === undefined) {
    throw new Error(t("errorCurrentTabMissing"));
  }
  await chrome.scripting.executeScript({ func, target: { tabId: sourceTab.id } });
}

function scrollPageToTop(): void {
  window.scrollTo({ behavior: "smooth", top: 0 });
}

function scrollPageToBottom(): void {
  window.scrollTo({ behavior: "smooth", top: document.documentElement.scrollHeight });
}

function movePageUp(): void {
  window.scrollBy({ behavior: "smooth", top: -window.innerHeight * 0.85 });
}

function movePageDown(): void {
  window.scrollBy({ behavior: "smooth", top: window.innerHeight * 0.85 });
}
