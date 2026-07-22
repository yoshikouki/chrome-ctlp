import type { CommandHandler } from "./commandTypes";

export const reloadExtension: CommandHandler = () => {
  chrome.runtime.reload();
  return Promise.resolve("");
};
