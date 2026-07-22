interface ExtensionCommandShortcut {
  name?: string;
  shortcut?: string;
}

export type ShortcutPlatform = "mac" | "other";

export function findCommandShortcut(
  commands: readonly ExtensionCommandShortcut[],
  commandName: string,
): string {
  return commands.find((command) => command.name === commandName)?.shortcut ?? "";
}

export function formatShortcut(shortcut: string, platform: ShortcutPlatform): string {
  if (!shortcut || platform !== "mac") {
    return shortcut;
  }

  const macKeySymbols: Readonly<Record<string, string>> = {
    Command: "⌘",
    MacCtrl: "⌃",
    Option: "⌥",
    Shift: "⇧",
  };
  return shortcut
    .split("+")
    .map((key) => macKeySymbols[key] ?? key)
    .join("");
}
