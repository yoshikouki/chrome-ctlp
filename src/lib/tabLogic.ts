export interface FilterableCommand {
  label: string;
  keywords: readonly string[];
}

export type TargetValidationErrorCode = "credentials" | "invalid" | "protocol" | "required";

export class TargetValidationError extends Error {
  readonly code: TargetValidationErrorCode;

  constructor(code: TargetValidationErrorCode) {
    super(code);
    this.name = "TargetValidationError";
    this.code = code;
  }
}

export function normalizeTarget(rawInput: string): URL {
  const input = rawInput.trim();
  if (!input) {
    throw new TargetValidationError("required");
  }

  const candidate = /^[a-z][a-z\d+.-]*:/iu.test(input) ? input : `https://${input}`;
  let url: URL;
  try {
    url = new URL(candidate);
  } catch {
    throw new TargetValidationError("invalid");
  }

  if (!(["http:", "https:"] as const).includes(url.protocol as "http:" | "https:")) {
    throw new TargetValidationError("protocol");
  }
  if (url.username || url.password) {
    throw new TargetValidationError("credentials");
  }

  return url;
}

export function looksLikeTarget(input: string): boolean {
  const value = input.trim();
  return (
    value.includes(".") ||
    value.startsWith("localhost") ||
    value.startsWith("http://") ||
    value.startsWith("https://")
  );
}

export function filterCommands<Command extends FilterableCommand>(
  input: string,
  commands: readonly Command[],
): readonly Command[] {
  const query = input.trim().toLocaleLowerCase();
  if (!query || looksLikeTarget(query)) {
    return commands;
  }

  return commands.filter((command) =>
    [command.label, ...command.keywords].some((text) => text.toLocaleLowerCase().includes(query)),
  );
}

export function findFallbackTab(
  tabs: readonly Pick<chrome.tabs.Tab, "id" | "index">[],
  currentTab: Pick<chrome.tabs.Tab, "id" | "index">,
): Pick<chrome.tabs.Tab, "id" | "index"> | undefined {
  return (
    tabs
      .filter((tab) => tab.id !== currentTab.id && tab.index > currentTab.index)
      .sort((left, right) => left.index - right.index)[0] ??
    tabs
      .filter((tab) => tab.id !== currentTab.id && tab.index < currentTab.index)
      .sort((left, right) => right.index - left.index)[0]
  );
}
