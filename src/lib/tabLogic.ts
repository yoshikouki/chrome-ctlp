export type CommandId = "lazy-open" | "suspend-current" | "suspend-others" | "wake-first";

export interface PaletteCommand {
  id: CommandId;
  label: string;
  keywords: readonly string[];
}

export const commands: readonly PaletteCommand[] = [
  {
    id: "lazy-open",
    label: "URLを遅延オープン",
    keywords: ["url", "lazy", "open", "遅延", "開く"],
  },
  {
    id: "suspend-current",
    label: "現在のタブを休止",
    keywords: ["discard", "suspend", "sleep", "現在", "休止"],
  },
  {
    id: "suspend-others",
    label: "他のタブを休止",
    keywords: ["discard", "suspend", "sleep", "他", "休止"],
  },
  {
    id: "wake-first",
    label: "休止中のタブを開く",
    keywords: ["wake", "resume", "sleep", "休止", "開く"],
  },
];

export function normalizeTarget(rawInput: string): URL {
  const input = rawInput.trim();
  if (!input) {
    throw new Error("URLを入力してください");
  }

  const candidate = /^[a-z][a-z\d+.-]*:/iu.test(input) ? input : `https://${input}`;
  let url: URL;
  try {
    url = new URL(candidate);
  } catch {
    throw new Error("有効なURLを入力してください");
  }

  if (!(["http:", "https:"] as const).includes(url.protocol as "http:" | "https:")) {
    throw new Error("http または https のURLだけを開けます");
  }
  if (url.username || url.password) {
    throw new Error("認証情報を含むURLは開けません");
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

export function filterCommands(input: string): readonly PaletteCommand[] {
  const query = input.trim().toLocaleLowerCase("ja");
  if (!query || looksLikeTarget(query)) {
    return commands;
  }

  return commands.filter((command) =>
    [command.label, ...command.keywords].some((text) =>
      text.toLocaleLowerCase("ja").includes(query),
    ),
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
