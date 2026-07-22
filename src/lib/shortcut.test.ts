import { describe, expect, it } from "vitest";
import { findCommandShortcut, formatShortcut } from "./shortcut";

describe("command shortcuts", () => {
  it("uses the currently assigned shortcut for the palette command", () => {
    expect(
      findCommandShortcut(
        [
          { name: "another-command", shortcut: "Command+Shift+J" },
          { name: "open-palette", shortcut: "Command+K" },
        ],
        "open-palette",
      ),
    ).toBe("Command+K");
  });

  it("returns an empty string when the command is unassigned", () => {
    expect(findCommandShortcut([{ name: "open-palette", shortcut: "" }], "open-palette")).toBe("");
  });

  it("formats macOS modifiers as keyboard glyphs", () => {
    expect(formatShortcut("Command+K", "mac")).toBe("⌘K");
    expect(formatShortcut("Command+Shift+K", "mac")).toBe("⌘⇧K");
    expect(formatShortcut("MacCtrl+Option+K", "mac")).toBe("⌃⌥K");
  });

  it("keeps readable modifier names on other platforms", () => {
    expect(formatShortcut("Ctrl+Shift+K", "other")).toBe("Ctrl+Shift+K");
  });
});
