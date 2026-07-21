import { TargetValidationError, type TargetValidationErrorCode } from "./tabLogic";

export const messageKeys = [
  "extensionName",
  "extensionDescription",
  "actionOpenPalette",
  "commandOpenPaletteDescription",
  "paletteAriaLabel",
  "paletteCloseAriaLabel",
  "searchLabel",
  "searchPlaceholder",
  "clearInputAriaLabel",
  "commandsHeading",
  "commandsListAriaLabel",
  "commandLazyOpenLabel",
  "commandLazyOpenDetail",
  "commandLazyOpenScope",
  "commandSuspendCurrentLabel",
  "commandSuspendCurrentDetail",
  "commandSuspendCurrentScope",
  "commandSuspendOthersLabel",
  "commandSuspendOthersDetail",
  "commandSuspendOthersScope",
  "commandWakeFirstLabel",
  "commandWakeFirstDetail",
  "commandWakeFirstScope",
  "emptyResults",
  "footerSleepingCount",
  "footerRun",
  "footerClose",
  "statusComplete",
  "statusLazyOpened",
  "statusCurrentSuspended",
  "statusOthersSuspended",
  "statusWakeFirst",
  "errorGeneric",
  "errorUrlRequired",
  "errorUrlInvalid",
  "errorUrlProtocol",
  "errorUrlCredentials",
  "errorTabCreate",
  "errorTabDiscard",
  "errorCurrentTabMissing",
  "errorNoSleepingTab",
  "lazyPrompt",
  "lazyFallbackHost",
  "lazyTitle",
] as const;

export type MessageKey = (typeof messageKeys)[number];

const targetErrorMessageKeys: Record<TargetValidationErrorCode, MessageKey> = {
  credentials: "errorUrlCredentials",
  invalid: "errorUrlInvalid",
  protocol: "errorUrlProtocol",
  required: "errorUrlRequired",
};

export function t(key: MessageKey, substitutions?: string | string[]): string {
  const translated = chrome.i18n.getMessage(key, substitutions);
  if (!translated) {
    throw new Error(`Missing i18n message: ${key}`);
  }
  return translated;
}

export function userErrorMessage(error: unknown): string {
  if (error instanceof TargetValidationError) {
    return t(targetErrorMessageKeys[error.code]);
  }
  return error instanceof Error ? error.message : t("errorGeneric");
}
